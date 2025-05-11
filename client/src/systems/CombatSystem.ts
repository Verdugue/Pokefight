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
  slot?: number;
  is_active?: number;
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
  isWaitingForOpponent?: boolean;
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
      const response = await fetch(`${API_URL}/api/matchmaking/match/${this.matchId}`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      const data = await response.json();
      this.state.playerPokemon = data.playerPokemon;
      this.state.opponentPokemon = data.opponentPokemon;
      this.state.playerTeam = data.playerTeam;
      this.state.opponentTeam = data.opponentTeam;
      this.state.combatLog = data.combatLog;
      this.state.isPlayerTurn = data.isPlayerTurn;
      this.state.isCombatEnded = data.isCombatEnded;
      this.state.status = data.status;
      this.updateState();
    } catch (e) {
      console.error('Erreur lors de l\'initialisation du combat', e);
    }
  }

  public async useMove(move: Move) {
    if (!this.state.playerPokemon) return;
    try {
      const response = await fetch(`${API_URL}/api/matchmaking/match/${this.matchId}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          moveId: move.id,
          pokemonId: this.state.playerPokemon.id
        })
      });
      const data = await response.json();
      if (data.waiting) {
        // Poll toutes les 2s jusqu'à avoir le résultat du round
        const poll = async () => {
          const pollRes = await fetch(`${API_URL}/api/matchmaking/match/${this.matchId}`, {
            headers: { 'Authorization': `Bearer ${this.token}` }
          });
          const pollData = await pollRes.json();
          if (pollData && pollData.playerPokemon) {
            this.state.playerPokemon = pollData.playerPokemon;
            this.state.opponentPokemon = pollData.opponentPokemon;
            this.state.combatLog = pollData.combatLog;
            this.state.isPlayerTurn = pollData.isPlayerTurn;
            this.state.isCombatEnded = pollData.isCombatEnded;
            this.state.status = pollData.status;
            this.updateState();
            if (!pollData.isCombatEnded && !pollData.isPlayerTurn) {
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
      this.state.combatLog = data.combatLog;
      this.state.isPlayerTurn = data.isPlayerTurn;
      this.state.isCombatEnded = data.isCombatEnded;
      this.state.status = data.status;
      this.updateState();
    } catch (e) {
      console.error('Erreur lors de l\'attaque', e);
    }
  }

  private updateState() {
    this.onStateChange({ ...this.state });
  }

  public cleanup() {
    // Nettoyage éventuel (timers, etc.)
  }
}

// Utilitaire à compléter pour récupérer les attaques d'un Pokémon
export async function fetchPokedexMoves(token: string, pokemonId: number, level: number) {
  // À compléter selon ton API
  return [];
}



