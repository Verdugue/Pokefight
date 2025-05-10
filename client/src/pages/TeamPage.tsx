import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../services/api';
import { Pokemon } from '../types/pokemon';
import { PokemonDetailsModal } from '../components/PokemonDetailsModal';
import { TYPE_COLORS, PokemonType } from '../utils/typeColors';

const TeamPage: React.FC = () => {
  const { token } = useAuth();
  const [teamPokemon, setTeamPokemon] = useState<(Pokemon | null)[]>([null, null, null, null, null, null]);
  const [ownedPokemon, setOwnedPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPokemonSelector, setShowPokemonSelector] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch(`${API_URL}/api/pokemon/team`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération de l\'équipe');
        }
        const data = await response.json();
        setTeamPokemon(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        setLoading(false);
      }
    };

    const fetchOwnedPokemon = async () => {
      try {
        const response = await fetch(`${API_URL}/api/pokemon/owned`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch owned Pokemon');
        }

        const data = await response.json();
        setOwnedPokemon(data);
      } catch (err) {
        console.error('Error loading owned Pokemon:', err);
      }
    };

    if (token) {
      fetchTeam();
      fetchOwnedPokemon();
    }
  }, [token]);

  const handleOpenPokemonSelector = (slot: number) => {
    setSelectedSlot(slot);
    setShowPokemonSelector(true);
  };

  const handleClosePokemonSelector = () => {
    setSelectedSlot(null);
    setShowPokemonSelector(false);
  };

  const handleSelectPokemon = async (pokemon: Pokemon) => {
    if (selectedSlot === null) return;

    try {
      const response = await fetch(`${API_URL}/api/pokemon/team/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pokemonId: pokemon.id,
          slot: selectedSlot
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update team');
      }

      const newTeam = [...teamPokemon];
      newTeam[selectedSlot] = pokemon;
      setTeamPokemon(newTeam);
      handleClosePokemonSelector();
    } catch (err) {
      console.error('Error updating team:', err);
      setError('Failed to update team');
    }
  };

  const handleRemoveFromTeam = async (slot: number) => {
    try {
      const response = await fetch(`${API_URL}/api/pokemon/team/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ slot }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du Pokémon de l\'équipe');
      }

      setTeamPokemon(prevTeam => {
        const newTeam = [...prevTeam];
        newTeam[slot] = null;
        return newTeam;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handlePokemonClick = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPokemon(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const filledSlots = teamPokemon.filter(p => p !== null).length;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Mon Équipe
        </Typography>
        <Typography variant="h6">
          Pokémon dans l'équipe : {filledSlots}/6
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {teamPokemon.map((pokemon, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            {pokemon ? (
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
                onClick={() => handlePokemonClick(pokemon)}
              >
                <CardMedia
                  component="img"
                  image={pokemon.sprite_url || pokemon.image}
                  alt={pokemon.name}
                  sx={{
                    height: 200,
                    objectFit: 'contain',
                    p: 2,
                    bgcolor: 'background.paper',
                  }}
                />
                <CardContent>
                  <Typography variant="h6" component="div" gutterBottom>
                    {pokemon.name}
                  </Typography>
                  <Box display="flex" gap={1} mb={2}>
                    {(Array.isArray(pokemon.type) ? pokemon.type : pokemon.type.split(',')).map((type) => {
                      const trimmedType = type.trim() as PokemonType;
                      return (
                        <Chip
                          key={type}
                          label={trimmedType}
                          size="small"
                          sx={{
                            bgcolor: TYPE_COLORS[trimmedType],
                            color: 'white',
                            '&:hover': {
                              bgcolor: TYPE_COLORS[trimmedType],
                              filter: 'brightness(0.9)',
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Niveau {pokemon.level}
                    </Typography>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromTeam(index);
                      }}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 4,
                  cursor: 'pointer',
                  bgcolor: 'action.hover',
                  '&:hover': {
                    bgcolor: 'action.selected',
                  },
                }}
                onClick={() => handleOpenPokemonSelector(index)}
              >
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Emplacement vide
                </Typography>
                <Button variant="outlined" color="primary">
                  Ajouter un Pokémon
                </Button>
              </Card>
            )}
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={showPokemonSelector}
        onClose={handleClosePokemonSelector}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Choisir un Pokémon</Typography>
            <IconButton onClick={handleClosePokemonSelector}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {ownedPokemon
              .filter(p => !teamPokemon.some(tp => tp?.id === p.id))
              .map((pokemon) => (
                <Grid item xs={12} sm={6} md={4} key={pokemon.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        transform: 'scale(1.02)',
                      },
                      transition: 'transform 0.2s',
                    }}
                    onClick={() => handleSelectPokemon(pokemon)}
                  >
                    <CardMedia
                      component="img"
                      image={pokemon.sprite_url || pokemon.image}
                      alt={pokemon.name}
                      sx={{
                        height: 140,
                        objectFit: 'contain',
                        p: 2,
                      }}
                    />
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {pokemon.name}
                      </Typography>
                      <Box display="flex" gap={1}>
                        {(Array.isArray(pokemon.type) ? pokemon.type : pokemon.type.split(',')).map((type) => {
                          const trimmedType = type.trim() as PokemonType;
                          return (
                            <Chip
                              key={type}
                              label={trimmedType}
                              size="small"
                              sx={{
                                bgcolor: TYPE_COLORS[trimmedType],
                                color: 'white',
                                '&:hover': {
                                  bgcolor: TYPE_COLORS[trimmedType],
                                  filter: 'brightness(0.9)',
                                },
                              }}
                            />
                          );
                        })}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </DialogContent>
      </Dialog>

      <PokemonDetailsModal
        open={isModalOpen}
        onClose={handleCloseModal}
        pokemon={selectedPokemon}
      />
    </Container>
  );
};

export default TeamPage; 