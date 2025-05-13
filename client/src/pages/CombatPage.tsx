import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CombatSystem, CombatState, Move, Pokemon } from '../systems/CombatSystem';
import { API_URL } from '../services/api';

const CombatPage: React.FC = () => {
  const { matchId } = useParams();
  const { token } = useAuth();
  const [combatState, setCombatState] = useState<CombatState | null>(null);
  const [displayedLogs, setDisplayedLogs] = useState<any[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const combatSystem = useRef<CombatSystem | null>(null);
  const logsTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialisation du combat
  useEffect(() => {
    if (matchId && token) {
      combatSystem.current = new CombatSystem(matchId, token, setCombatState);
      if (combatSystem.current) {
        combatSystem.current.initializeCombat();
      }
    }
    return () => {
      if (combatSystem.current) combatSystem.current.cleanup();
      if (logsTimeout.current) clearTimeout(logsTimeout.current);
    };
  }, [matchId, token]);

  // Animation progressive des logs
  useEffect(() => {
    if (!Array.isArray(combatState?.combatLog) || combatState.combatLog.length === 0) {
      return;
    }
    
    // Au lieu de réinitialiser, on ajoute les nouveaux logs
    const newLogs = combatState.combatLog.slice(displayedLogs.length);
    if (newLogs.length > 0) {
      setIsAnimating(true);
      let currentIndex = 0;
      
      const addNextLog = () => {
        if (currentIndex < newLogs.length) {
          setDisplayedLogs(prev => [...prev, newLogs[currentIndex]]);
          currentIndex++;
          setTimeout(addNextLog, 1000); // Réduit à 1 seconde pour une meilleure réactivité
        } else {
          setIsAnimating(false);
        }
      };
      
      addNextLog();
    }
  }, [combatState?.combatLog]);

  useEffect(() => {
    // Poll tant qu'on attend l'adversaire OU tant qu'on n'a pas d'adversaire affiché
    const shouldPoll =
      !combatState?.isPlayerTurn && !combatState?.isCombatEnded;

    if (shouldPoll) {
      const interval = setInterval(() => {
        if (combatSystem.current) {
          combatSystem.current.initializeCombat();
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [combatState?.isPlayerTurn, combatState?.isCombatEnded]);

  console.log('combatState', combatState);

  if (!combatState) return <div>Chargement du combat...</div>;

  if (combatState.playerPokemon && combatState.playerPokemon.current_hp <= 0) {
    return <div style={{ color: 'orange', fontSize: 28, textAlign: 'center', marginTop: 100 }}>Votre Pokémon est KO ! Veuillez en choisir un autre.</div>;
  }

  if (!combatState.playerPokemon || !combatState.playerPokemon.is_active) {
    return (
      <div style={{ background: '#3b4cca', minHeight: '100vh', color: '#fff', padding: 32 }}>
        <h2>Choisissez votre Pokémon actif</h2>
        <div style={{ display: 'flex', gap: 16 }}>
          {combatState.playerTeam.map(poke => (
            <button
              key={poke.user_pokemon_id}
              onClick={() => poke.is_alive && chooseActivePokemon(poke.user_pokemon_id)}
              style={{
                padding: 16,
                borderRadius: 8,
                background: poke.is_alive ? '#ffde00' : '#ccc',
                color: '#3b4cca',
                fontWeight: 'bold',
                border: 'none',
                cursor: poke.is_alive ? 'pointer' : 'not-allowed',
                opacity: poke.is_alive ? 1 : 0.5
              }}
              disabled={!poke.is_alive}
            >
              <img src={poke.sprite_url} alt={poke.name} style={{ width: 60, filter: poke.is_alive ? 'none' : 'grayscale(1)' }} /><br />
              {poke.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!combatState.playerPokemon || !combatState.opponentPokemon) {
    return <div style={{ color: '#fff', fontSize: 28, textAlign: 'center', marginTop: 100 }}>
      En attente que les deux joueurs choisissent leur Pokémon...
    </div>;
  }

  const isWaitingTurn = !combatState.isPlayerTurn && !combatState.isCombatEnded;

  const handleMoveSelect = (move: Move) => {
    if (combatSystem.current && !isAnimating && combatState.isPlayerTurn) {
      setIsAnimating(true); // bloque les boutons
      setTimeout(() => {
        combatSystem.current!.useMove(move);
        setDisplayedLogs([]); // reset logs pour la prochaine animation
        setIsAnimating(false);
      }, 1500); // 1.5s de délai avant d'envoyer l'action
    }
  };

  async function chooseActivePokemon(userPokemonId: number) {
    await fetch(`${API_URL}/api/matchmaking/match/${matchId}/choose-active`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ userPokemonId })
    });
    if (combatSystem.current) {
      combatSystem.current.initializeCombat();
    }
  }

  console.log('isPlayerTurn', combatState.isPlayerTurn);
  console.log('playerPokemon', combatState.playerPokemon);
  console.log('opponentPokemon', combatState.opponentPokemon);
  console.log('playerTeam', combatState.playerTeam);
  console.log('opponentTeam', combatState.opponentTeam);
  console.log('moves', combatState.playerPokemon?.moves);
  console.log('isAnimating', isAnimating);

  const emptyPokemon: Pokemon = {
    id: -1, name: 'Slot vide', current_hp: 0, max_hp: 0, speed: 0, moves: [], user_id: -1, is_alive: false, sprite_url: '', user_pokemon_id: -1
  };
  const paddedPlayerTeam = [...combatState.playerTeam];
  while (paddedPlayerTeam.length < 6) paddedPlayerTeam.push(emptyPokemon);

  return (
    <div style={{ background: '#3b4cca', minHeight: '100vh', color: '#fff', padding: 32 }}>
      <h2>Combat</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Pokémon joueur */}
        {combatState.playerPokemon && (
          <div style={{ textAlign: 'center' }}>
            <img src={combatState.playerPokemon.sprite_url} alt={combatState.playerPokemon.name} style={{ width: 120 }} />
            <div>{combatState.playerPokemon.name || '??'}</div>
            <div>PV : {combatState.playerPokemon.current_hp} / {combatState.playerPokemon.max_hp}</div>
          </div>
        )}
        {/* Pokémon adversaire */}
        {combatState.opponentPokemon && (
          <div style={{ textAlign: 'center' }}>
            <img src={combatState.opponentPokemon.sprite_url} alt={combatState.opponentPokemon.name} style={{ width: 120 }} />
            <div>{combatState.opponentPokemon.name}</div>
            <div>PV : {combatState.opponentPokemon.current_hp} / {combatState.opponentPokemon.max_hp}</div>
          </div>
        )}
      </div>
      {/* Log du combat */}
      <div style={{ 
        margin: '32px auto', 
        maxWidth: 500, 
        background: '#223', 
        borderRadius: 8, 
        padding: 16, 
        height: 200, // Hauteur fixe
        overflowY: 'auto', // Permet le défilement
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h4>Journal du combat</h4>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {displayedLogs.map((log, idx) => {
            if (!log) return null;
            if (typeof log === 'string') {
              return <div key={idx} style={{ color: '#fff', marginBottom: 8 }}>{log}</div>;
            }
            return (
              <div key={idx} style={{ color: log.color || '#fff', marginBottom: 8 }}>{log.text || String(log)}</div>
            );
          })}
        </div>
      </div>
      {/* Attaques */}
      {isWaitingTurn ? (
        <div style={{ color: '#fff', fontSize: 28, textAlign: 'center', marginTop: 100 }}>
          En attente du tour de l'adversaire...
        </div>
      ) : (
        combatState.isPlayerTurn &&
        combatState.playerPokemon &&
        Array.isArray(combatState.playerPokemon.moves) &&
        combatState.playerPokemon.moves.length > 0 &&
        !isAnimating && (
          <div style={{ marginTop: 32 }}>
            <h4>Choisissez une attaque :</h4>
            <div style={{ display: 'flex', gap: 16 }}>
              {combatState.playerPokemon.moves.map((move) => (
                <button key={move.id} onClick={() => handleMoveSelect(move)} style={{ padding: 12, fontWeight: 'bold', borderRadius: 8, background: '#ffde00', color: '#3b4cca', border: 'none', cursor: isAnimating ? 'not-allowed' : 'pointer' }} disabled={isAnimating}>{move.name}</button>
              ))}
            </div>
          </div>
        )
      )}
      {/* Bouton pour reset ou quitter */}
      <div style={{ marginTop: 48 }}>
        <button onClick={() => window.location.reload()} style={{ padding: 10, borderRadius: 8, background: '#ffde00', color: '#3b4cca', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Quitter / Recharger</button>
      </div>
    </div>
  );
};

export default CombatPage;



