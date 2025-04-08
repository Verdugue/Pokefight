import { API_URL } from './api';

export interface WildPokemon {
  id: number;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  type: string;
  catchRate: number;
}

export interface ExplorationArea {
  id: number;
  name: string;
  description: string;
  minLevel: number;
  maxLevel: number;
}

export interface CatchResult {
  success: boolean;
  message: string;
}

export const pokemonApi = {
  getExplorationAreas: async (): Promise<ExplorationArea[]> => {
    const response = await fetch(`${API_URL}/api/pokemon/areas`);
    if (!response.ok) {
      throw new Error('Failed to fetch exploration areas');
    }
    return response.json();
  },

  findWildPokemon: async (areaId: number): Promise<WildPokemon> => {
    const response = await fetch(`${API_URL}/api/pokemon/explore/${areaId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to find wild Pokémon');
    }
    return response.json();
  },

  attemptCatch: async (pokemonId: number): Promise<CatchResult> => {
    const response = await fetch(`${API_URL}/api/pokemon/catch/${pokemonId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to catch Pokémon');
    }
    return response.json();
  },

  async getPokemonDetails(pokemonId: number): Promise<WildPokemon> {
    const response = await fetch(`${API_URL}/api/pokemon/${pokemonId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Pokémon details');
    }

    return response.json();
  },
}; 