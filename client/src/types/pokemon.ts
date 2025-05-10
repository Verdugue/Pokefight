export interface Pokemon {
  id: number;
  name: string;
  type: string | string[];
  sprite_url?: string;
  shiny_sprite_url?: string;
  image?: string;
  level?: number;
  hp?: number;
  max_hp?: number;
  catch_rate?: number;
  rarity?: number;
  isShiny?: boolean;
  slot?: number;
}

export interface Move {
  id: number;
  name: string;
  type: string;
  power: number;
  accuracy: number;
  pp: number;
  description: string;
}

export interface PokemonMove {
  id: number;
  name: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  description: string;
}

export interface StarterPokemon {
  id: number;
  name: string;
  type: string | string[];
  image?: string;
  description?: string;
  sprite_url?: string;
  sprite_shiny_url?: string;
} 