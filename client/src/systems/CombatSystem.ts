import { API_URL } from '../services/api';

export interface Pokemon {
  id: number;
  name: string;
  current_hp: number;
  max_hp: number;
  speed: number;
  moves: Move[];
  user_id: number;
  is_alive: boolean;
  sprite_url: string;
  user_pokemon_id: number;
}

export interface Move {
  id: number;
  name: string;
  power: number;
  accuracy: number;
  type: string;
}

export interface CombatState {
  round: number;
  playerPokemon: Pokemon | null;
  opponentPokemon: Pokemon | null;
  playerTeam: Pokemon[];
  opponentTeam: Pokemon[];
  combatLog: CombatLog[];
  isPlayerTurn: boolean;
  isCombatStarted: boolean;
  isPokemonSelected: boolean;
  isOpponentPokemonSelected: boolean;
  selectionTimer: number;
  isCombatEnded: boolean;
  status: string;
}

export interface CombatLog {
  text: string;
  color: string;
}

export class CombatSystem {
  private state: CombatState;
  private matchId: string;
  private token: string;
  private onStateChange: (state: CombatState) => void;
  private selectionInterval: NodeJS.Timeout | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor(matchId: string, token: string, onStateChange: (state: CombatState) => void) {
    this.matchId = matchId;
    this.token = token;
    this.onStateChange = onStateChange;
    this.state = {
      round: 1,
      playerPokemon: null,
      opponentPokemon: null,
      playerTeam: [],
      opponentTeam: [],
      combatLog: [],
      isPlayerTurn: false,
      isCombatStarted: false,
      isPokemonSelected: false,
      isOpponentPokemonSelected: false,
      selectionTimer: 15,
      isCombatEnded: false,
      status: 'ongoing'
    };
  }

  public async initializeCombat() {
    try {
      console.log('Initialisation du combat...');
      const response = await fetch(`${API_URL}/api/matchmaking/match/${this.matchId}`, {
        headers: { 
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Ajout des credentials pour les cookies
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Données du match reçues:', data);
      
      if (!data.pokemon || !Array.isArray(data.pokemon)) {
        throw new Error('Format de données invalide: pokemon manquant ou invalide');
      }

      // Initialiser les équipes
      const playerTeamRaw = data.pokemon.filter((p: Pokemon) => p.user_id === data.current_user_id);
      const opponentTeamRaw = data.pokemon.filter((p: Pokemon) => p.user_id !== data.current_user_id);

      // Charger les attaques pour chaque Pokémon
      const playerTeam = await Promise.all(playerTeamRaw.map(async (poke: any) => ({
        ...poke,
        moves: await fetchPokedexMoves(this.token, poke.pokemon_id, poke.level),
        is_alive: true,
        current_hp: poke.current_hp,
        max_hp: poke.current_hp
      })));
      const opponentTeam = await Promise.all(opponentTeamRaw.map(async (poke: any) => ({
        ...poke,
        moves: await fetchPokedexMoves(this.token, poke.pokemon_id, poke.level),
        is_alive: true,
        current_hp: poke.current_hp,
        max_hp: poke.current_hp
      })));

      // Met à jour le state
      this.state.playerTeam = playerTeam;
      this.state.opponentTeam = opponentTeam;

      if (this.state.playerTeam.length === 0 || this.state.opponentTeam.length === 0) {
        throw new Error('Équipes invalides: une ou plusieurs équipes sont vides');
      }
      
      console.log('Équipes initialisées:', {
        playerTeam: this.state.playerTeam,
        opponentTeam: this.state.opponentTeam
      });
      
      if (!this.state.isPokemonSelected) {
        this.startSelectionTimer();
      }
      
      this.updateState();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du combat:', error);
      
      // Tentative de reconnexion
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Tentative de reconnexion ${this.retryCount}/${this.maxRetries}...`);
        setTimeout(() => this.initializeCombat(), 2000); // Attendre 2 secondes avant de réessayer
      } else {
        this.addCombatLog("Erreur de connexion au serveur. Veuillez rafraîchir la page.", "#e53935");
        this.updateState();
      }
    }
  }

  private startSelectionTimer() {
    this.selectionInterval = setInterval(() => {
      if (this.state.selectionTimer > 0) {
        this.state.selectionTimer--;
        this.updateState();
      } else {
        this.handleSelectionTimeout();
      }
    }, 1000);
  }

  private handleSelectionTimeout() {
    if (this.selectionInterval) {
      clearInterval(this.selectionInterval);
    }
    
    // Si le joueur n'a pas choisi, sélectionner automatiquement le premier Pokémon
    if (!this.state.isPokemonSelected && this.state.playerTeam.length > 0) {
      this.selectPokemon(this.state.playerTeam[0]);
    }
    
    // Si l'adversaire n'a pas choisi, sélectionner automatiquement son premier Pokémon
    if (!this.state.isOpponentPokemonSelected && this.state.opponentTeam.length > 0) {
      this.selectOpponentPokemon(this.state.opponentTeam[0]);
    }
  }

  public selectPokemon(pokemon: Pokemon) {
    if (this.state.isPokemonSelected) return;
    
    this.state.playerPokemon = pokemon;
    this.state.isPokemonSelected = true;
    this.addCombatLog(`Vous avez choisi ${pokemon.name}`, "#66bb6a");
    
    if (this.state.isOpponentPokemonSelected) {
      this.startCombat();
    }
    
    this.updateState();
  }

  public selectOpponentPokemon(pokemon: Pokemon) {
    if (this.state.isOpponentPokemonSelected) return;
    
    this.state.opponentPokemon = pokemon;
    this.state.isOpponentPokemonSelected = true;
    this.addCombatLog(`L'adversaire a choisi son Pokémon`, "#e53935");
    
    if (this.state.isPokemonSelected) {
      this.startCombat();
    }
    
    this.updateState();
  }

  private startCombat() {
    if (this.selectionInterval) {
      clearInterval(this.selectionInterval);
    }
    
    this.state.isCombatStarted = true;
    this.addCombatLog(`Début du round ${this.state.round}`, "#2196F3");
    
    // Déterminer qui attaque en premier
    if (this.state.playerPokemon && this.state.opponentPokemon) {
      this.state.isPlayerTurn = this.state.playerPokemon.speed >= this.state.opponentPokemon.speed;
    }
    
    this.updateState();
  }

  public async useMove(move: Move) {
    if (!this.state.playerPokemon) {
      console.error('Aucun Pokémon sélectionné pour attaquer.');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/matchmaking/match/${this.matchId}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          moveId: move.id,
          pokemonId: this.state.playerPokemon.user_pokemon_id
        })
      });

      const data = await response.json();

      if (data.waiting) {
        // Poll toutes les 2s jusqu'à avoir le résultat du round
        const poll = async () => {
          const pollRes = await fetch(`${API_URL}/api/matchmaking/match/${this.matchId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          const pollData = await pollRes.json();
          // Si le round est résolu (combatLog ou PV changés), on met à jour l'état
          if (pollData && pollData.pokemon) {
            // On peut améliorer la logique ici pour détecter le changement de round
            this.state.playerPokemon = pollData.pokemon.find((p: any) => p.user_id === pollData.current_user_id);
            this.state.opponentPokemon = pollData.pokemon.find((p: any) => p.user_id !== pollData.current_user_id);
            // On ne touche pas au log ici, il sera mis à jour au prochain vrai tour
            this.updateState();
            // Si le combat n'est pas fini, on continue à poller
            if (pollData.match.status !== 'finished') {
              setTimeout(poll, 2000);
            }
          } else {
            setTimeout(poll, 2000);
          }
        };
        poll();
        return;
      }

      // Mettre à jour l'état du combat
      this.state.playerPokemon = data.playerPokemon;
      this.state.opponentPokemon = data.opponentPokemon;
      this.state.combatLog = [
        ...this.state.combatLog,
        ...(Array.isArray(data.combatLog) ? data.combatLog : [])
      ];
      this.state.isPlayerTurn = data.isPlayerTurn;
      this.state.isCombatEnded = data.isCombatEnded;

      // Si le combat est terminé, mettre à jour le statut
      if (this.state.isCombatEnded) {
        this.state.status = 'ended';
      }

      // Notifier les observateurs
      this.updateState();
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'attaque:', error);
    }
  }

  private addCombatLog(text: string, color: string) {
    this.state.combatLog.push({ text, color });
  }

  private updateState() {
    this.onStateChange({ ...this.state });
  }

  public cleanup() {
    if (this.selectionInterval) {
      clearInterval(this.selectionInterval);
    }
  }
}

async function fetchPokedexMoves(token: string, pokemonId: number, level: number) {
  const response = await fetch(`${API_URL}/api/pokemon/moves/${pokemonId}?maxLevel=${level}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.ok ? await response.json() : [];
} 