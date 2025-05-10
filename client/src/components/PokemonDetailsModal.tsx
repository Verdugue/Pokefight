import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Chip, Box, Typography, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Pokemon, Move } from '../types/pokemon';
import { API_URL } from '../services/api';
import { TYPE_COLORS, PokemonType } from '../utils/typeColors';
import { useAuth } from '../contexts/AuthContext';

interface PokemonDetailsModalProps {
  pokemon: Pokemon | null;
  onClose: () => void;
  open: boolean;
}

export const PokemonDetailsModal: React.FC<PokemonDetailsModalProps> = ({ pokemon, onClose, open }) => {
  const [moves, setMoves] = useState<Move[]>([]);
  const [isShiny, setIsShiny] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchMoves = async () => {
      if (!pokemon) return;
      try {
        const response = await fetch(`${API_URL}/api/pokemon/moves/${pokemon.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Impossible de charger les attaques');
        const data = await response.json();
        setMoves(data);
        setError(null);
      } catch (err) {
        setError('Impossible de charger les attaques');
        console.error('Erreur lors du chargement des attaques:', err);
      }
    };

    fetchMoves();
  }, [pokemon, token]);

  if (!pokemon) return null;

  const types = Array.isArray(pokemon.type) 
    ? pokemon.type 
    : pokemon.type.split(',').map(t => t.trim());

  const spriteUrl = isShiny && pokemon.shiny_sprite_url 
    ? pokemon.shiny_sprite_url 
    : pokemon.sprite_url || pokemon.image;

  const hasShinyVersion = Boolean(pokemon.shiny_sprite_url);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ textTransform: 'capitalize' }}>
          {pokemon.name}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {spriteUrl ? (
            <Box 
              component="img" 
              src={spriteUrl} 
              alt={pokemon.name}
              sx={{ 
                width: 200, 
                height: 200, 
                cursor: hasShinyVersion ? 'pointer' : 'default'
              }}
              onClick={() => hasShinyVersion && setIsShiny(!isShiny)}
            />
          ) : (
            <Typography>Image non disponible</Typography>
          )}

          {hasShinyVersion && (
            <Button 
              variant="contained" 
              onClick={() => setIsShiny(!isShiny)}
              sx={{ mb: 2 }}
            >
              {isShiny ? 'Version normale' : 'Version shiny'}
            </Button>
          )}

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {types.map((type, index) => (
              <Chip
                key={`${type}-${index}`}
                label={type}
                sx={{
                  bgcolor: TYPE_COLORS[type as PokemonType],
                  color: 'white',
                  fontWeight: 'bold',
                  minWidth: '80px',
                }}
              />
            ))}
          </Box>

          <Typography variant="body1" sx={{ mb: 2 }}>
            Rareté: {pokemon.rarity || 'Commune'}
          </Typography>

          <Typography variant="h6" sx={{ alignSelf: 'flex-start', mb: 1 }}>
            Attaques
          </Typography>

          {error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <Box sx={{ width: '100%' }}>
              {moves.map((move) => (
                <Box
                  key={move.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontWeight: 'bold' }}>{move.name}</Typography>
                    <Chip
                      label={move.type}
                      size="small"
                      sx={{
                        bgcolor: TYPE_COLORS[move.type as PokemonType],
                        color: 'white',
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {move.description}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}; 