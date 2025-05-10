import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, Paper, Avatar, Button, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { jwtDecode } from 'jwt-decode'; // ✅ (bon)
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball'; // ou une icône de Pokéball custom
import { CombatSystem, CombatState, Pokemon, Move } from '../systems/CombatSystem';

const CombatPage: React.FC = () => {
  const { matchId } = useParams();
  const { token } = useAuth();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [combatState, setCombatState] = useState<CombatState | null>(null);
  const combatSystem = useRef<CombatSystem | null>(null);
  const [showPokemonSelection, setShowPokemonSelection] = useState(false);

  useEffect(() => {
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setCurrentUserId(decoded.id);
      } catch (e) {
        setCurrentUserId(null);
      }
    }
  }, [token]);

  useEffect(() => {
    if (matchId && token && currentUserId) {
      combatSystem.current = new CombatSystem(matchId, token, (state) => {
        setCombatState(state);
      });
      combatSystem.current.initializeCombat();
    }

    return () => {
      if (combatSystem.current) {
        combatSystem.current.cleanup();
      }
    };
  }, [matchId, token, currentUserId]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (
      combatState &&
      combatState.playerTeam &&
      combatState.playerTeam.length > 1 &&
      !combatState.isPokemonSelected &&
      !showPokemonSelection
    ) {
      setShowPokemonSelection(true);
    }
  }, [combatState, showPokemonSelection]);

  if (!combatState || !currentUserId) return <div>Chargement du combat...</div>;

  // Affichage KO ou fin de combat
  if (combatState?.isCombatEnded) {
    return <div style={{ color: 'red', fontSize: 32, textAlign: 'center', marginTop: 100 }}>Fin du combat !</div>;
  }

  if (combatState?.playerPokemon && combatState.playerPokemon.current_hp <= 0) {
    return <div style={{ color: 'orange', fontSize: 28, textAlign: 'center', marginTop: 100 }}>Votre Pokémon est KO ! Veuillez en choisir un autre.</div>;
  }

  const handlePokemonSelect = (pokemon: Pokemon) => {
    if (combatSystem.current) {
      combatSystem.current.selectPokemon(pokemon);
      setShowPokemonSelection(false);
    }
  };

  const handleMoveSelect = (move: Move) => {
    if (combatSystem.current) {
      combatSystem.current.useMove(move);
    }
  };

  // Fonction temporaire pour reset le combat
  const handleResetCombat = () => {
    // Pour les tests, on peut simplement recharger la page
    window.location.reload();
    // OU, si tu veux appeler un endpoint serveur :
    // fetch(`${API_URL}/api/matchmaking/reset`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    //   .then(() => window.location.reload());
  };

  return (
    <>
      {/* Bouton temporaire pour reset le combat */}
      <button onClick={handleResetCombat} style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, background: '#ffde00', color: '#3b4cca', border: '2px solid #3b4cca', borderRadius: 8, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer' }}>
        🔄 Recréer le combat (test)
      </button>
      <Box className="combat-root"
        sx={{
          width: '100vw',
          height: '100vh',
          background: '#3b4cca',
          m: 0,
          p: 0,
          boxSizing: 'border-box',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Pokémon adverse */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          {combatState.opponentPokemon && (
            <>
              <Avatar 
                src={combatState.opponentPokemon.sprite_url} 
                alt={combatState.opponentPokemon.name} 
                sx={{ 
                  width: 220, 
                  height: 220, 
                  mb: 1,
                  bgcolor: '#fff',
                  boxShadow: '0 0 24px 4px #ffde00, 0 2px 8px #3b4cca88',
                  border: '4px solid #3b4cca'
                }} 
              />
              <Box sx={{ width: 120 }}>
                <LinearProgress
                  variant="determinate"
                  value={combatState.opponentPokemon.current_hp / combatState.opponentPokemon.max_hp * 100}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#eee',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#66bb6a',
                    },
                  }}
                />
                <Typography variant="caption" align="center" sx={{ width: '100%', display: 'block', color: '#fff' }}>
                  {combatState.opponentPokemon.current_hp} / {combatState.opponentPokemon.max_hp} PV
                </Typography>
              </Box>
            </>
          )}
        </Box>

        {/* Pokémon joueur */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 120,
            left: 80,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          {combatState.playerPokemon && (
            <>
              <Avatar
                src={combatState.playerPokemon.sprite_url}
                alt={combatState.playerPokemon.name}
                sx={{
                  width: 180,
                  height: 180,
                  bgcolor: '#fff',
                  mb: 1,
                  boxShadow: '0 0 24px 4px #ffde00, 0 2px 8px #3b4cca88',
                  border: '4px solid #3b4cca'
                }}
              />
              <Box sx={{ width: 180 }}>
                <LinearProgress
                  variant="determinate"
                  value={combatState.playerPokemon.current_hp / combatState.playerPokemon.max_hp * 100}
                  sx={{
                    height: 14,
                    borderRadius: 5,
                    backgroundColor: '#eee',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor:
                        combatState.playerPokemon.current_hp / combatState.playerPokemon.max_hp > 0.5
                          ? '#66bb6a'
                          : combatState.playerPokemon.current_hp / combatState.playerPokemon.max_hp > 0.2
                          ? '#ffde00'
                          : '#ff0000',
                      transition: 'background 0.3s'
                    },
                  }}
                />
                <Typography variant="caption" align="center" sx={{ width: '100%', display: 'block', color: '#fff' }}>
                  {combatState.playerPokemon.current_hp} / {combatState.playerPokemon.max_hp} PV
                </Typography>
              </Box>
            </>
          )}
          {/* Pokéballs pour l'équipe */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            {Array.isArray(combatState.playerTeam) && combatState.playerTeam.map((poke, idx) => (
              <SportsBaseballIcon
                key={idx}
                sx={{
                  color: poke.is_alive ? '#ff0000' : '#808080',
                  fontSize: 32,
                  mx: 0.5,
                  filter: poke.is_alive ? 'drop-shadow(0 0 4px #ff0000)' : 'none'
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Log de combat */}
        <Box
          sx={{
            position: 'absolute',
            top: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 500,
            maxHeight: 300,
            bgcolor: '#3b4cca',
            color: '#fff',
            fontFamily: 'VT323, monospace',
            fontSize: 20,
            p: 2,
            borderRadius: 3,
            boxShadow: '0 0 16px #ffde00',
            overflowY: 'auto',
            border: '2px solid #ffde00',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography variant="h5" sx={{ color: '#ffde00', mb: 1, fontFamily: 'inherit' }}>
            Round {combatState.round}
          </Typography>
          {combatState.combatLog.map((log, idx) => (
            <Typography key={idx} sx={{ color: log.color, fontFamily: 'inherit', fontSize: 20 }}>{log.text}</Typography>
          ))}
        </Box>

        {/* Menu attaques */}
        {combatState.isCombatStarted && combatState.playerPokemon && (
          <Paper
            elevation={6}
            sx={{
              position: 'absolute',
              bottom: 120,
              right: 80,
              width: 600,
              height: 200,
              borderRadius: 6,
              bgcolor: '#cc0000',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
              boxShadow: '0 0 16px #ffde00',
              border: '2px solid #ffde00'
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, color: '#ffde00', fontFamily: 'VT323, monospace' }}>
              {combatState.isPlayerTurn ? "Votre tour" : "Tour de l'adversaire"}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 2, width: '100%', height: '100%' }}>
              {combatState.playerPokemon?.moves && combatState.playerPokemon.moves.map((move) => (
                <Paper
                  key={move.id}
                  elevation={4}
                  onClick={() => handleMoveSelect(move)}
                  sx={{
                    p: 1,
                    bgcolor: '#fff',
                    color: '#cc0000',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 50,
                    fontFamily: 'VT323, monospace',
                    fontSize: 22,
                    border: '2px solid #3b4cca',
                    cursor: 'pointer',
                    opacity: 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: '#ffde00',
                      color: '#3b4cca',
                      boxShadow: '0 0 8px #ffde00'
                    }
                  }}
                >
                  <Typography variant="body1" align="center" sx={{ fontFamily: 'inherit', fontSize: 22 }}>{move.name}</Typography>
                </Paper>
              ))}
            </Box>
          </Paper>
        )}

        {/* Dialog de sélection de Pokémon */}
        <Dialog
          open={showPokemonSelection}
          onClose={() => setShowPokemonSelection(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: '#3b4cca', color: '#ffde00', fontFamily: 'VT323, monospace' }}>
            Choisissez un Pokémon
          </DialogTitle>
          <DialogContent sx={{ bgcolor: '#3b4cca', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, p: 2 }}>
            {combatState.playerTeam.filter(p => p.is_alive).map((pokemon) => (
              <Paper
                key={pokemon.id}
                onClick={() => handlePokemonSelect(pokemon)}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  bgcolor: '#cc0000',
                  color: '#fff',
                  border: '2px solid #ffde00',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: '#ffde00',
                    color: '#3b4cca'
                  }
                }}
              >
                <Avatar
                  src={pokemon.sprite_url}
                  alt={pokemon.name}
                  sx={{ width: 100, height: 100, mb: 1 }}
                />
                <Typography variant="h6" sx={{ fontFamily: 'VT323, monospace' }}>
                  {pokemon.name}
                </Typography>
                <Typography variant="body2">
                  PV: {pokemon.current_hp}/{pokemon.max_hp}
                </Typography>
              </Paper>
            ))}
          </DialogContent>
        </Dialog>
      </Box>
    </>
  );
};

export default CombatPage;
