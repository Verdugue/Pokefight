import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../services/api';
import { Pokemon } from '../types/pokemon';
import { TYPE_COLORS, PokemonType } from '../utils/typeColors';
import { PokemonDetailsModal } from '../components/PokemonDetailsModal';

const TeamPage: React.FC = () => {
  const { token } = useAuth();
  const [teamPokemon, setTeamPokemon] = useState<(Pokemon | null)[]>([null, null, null, null, null, null]);
  const [ownedPokemon, setOwnedPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedTeamPokemon, setSelectedTeamPokemon] = useState<Pokemon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manageMode, setManageMode] = useState(false); // false = inspection, true = gestion

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch(`${API_URL}/api/pokemon/team`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Erreur lors de la récupération de l\'équipe');
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
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch owned Pokemon');
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

  const handleSelectPokemon = async (pokemon: Pokemon, slot: number) => {
    try {
      const response = await fetch(`${API_URL}/api/pokemon/team/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pokemonId: pokemon.id, slot })
      });
      if (!response.ok) throw new Error('Failed to update team');
      const newTeam = [...teamPokemon];
      newTeam[slot] = pokemon;
      setTeamPokemon(newTeam);
      setSelectedSlot(null);
    } catch (err) {
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
      if (!response.ok) throw new Error('Erreur lors de la suppression du Pokémon de l\'équipe');
      setTeamPokemon(prevTeam => {
        const newTeam = [...prevTeam];
        newTeam[slot] = null;
        return newTeam;
      });
    } catch (err) {
      setError('Erreur lors de la suppression du Pokémon');
    }
  };

  // Pour sélectionner le slot à remplir
  const handleSlotClick = (slot: number) => {
    if (!manageMode && teamPokemon[slot]) {
      setSelectedTeamPokemon(teamPokemon[slot]);
      setIsModalOpen(true);
    } else if (manageMode) {
      setSelectedSlot(slot);
    }
  };

  // Pour ajouter/remplacer un Pokémon dans le slot sélectionné
  const handleBoxPokemonClick = (pokemon: Pokemon) => {
    if (selectedSlot !== null) {
      handleSelectPokemon(pokemon, selectedSlot);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>Chargement...</Typography>
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

  return (
    <Box sx={{ position: 'relative', minHeight: '100%', overflow: 'hidden', background: '#e3f0ff' }}>
      {/* Barre verte diagonale en fond, sous le header/navbar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '28vw',
          height: '100%',
          zIndex: 0,
          background: '#198500',
          clipPath: 'polygon(0 0, 100% 0, 60% 100%, 0% 100%)',
          opacity: 0.7,
          pointerEvents: 'none',
        }}
      />
      {/* Décor SVG en fond */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <polygon points="0,0 240,0 0,1080" fill="#3b4cca" opacity="0.18" filter="url(#blur)" />
          <polygon points="1920,1080 1680,1080 1920,0" fill="#3b4cca" opacity="0.18" filter="url(#blur)" />
          <filter id="blur">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </svg>
      </Box>
      {/* Bouton pour basculer entre inspection et gestion */}
      <Box sx={{ position: 'absolute', top: 24, right: 32, zIndex: 10 }}>
        <button
          style={{
            background: manageMode ? '#3b4cca' : '#df6d6d',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '10px 22px',
            fontWeight: 'bold',
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 8px #0002',
            transition: 'background 0.2s',
          }}
          onClick={() => setManageMode(m => !m)}
        >
          {manageMode ? 'Terminer la gestion' : "Gérer l'équipe"}
        </button>
      </Box>
      <Container maxWidth="xl" sx={{ py: 4, minHeight: '80vh', display: 'flex', alignItems: manageMode ? 'flex-start' : 'center', justifyContent: 'center' }}>
        <Box
          display="flex"
          gap={4}
          justifyContent={manageMode ? 'flex-start' : 'center'}
          alignItems={manageMode ? 'flex-start' : 'center'}
          width="100%"
          minHeight={manageMode ? undefined : '70vh'}
        >
          {/* Colonne équipe */}
          {manageMode ? (
            <Paper
              elevation={0}
              sx={{
                width: 320,
                minWidth: 280,
                backgroundColor: '#ffffffcf',
                borderRadius: 4,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                boxShadow: 'none',
                border: 'none',
              }}
              style={{ backgroundColor: 'transparent' }}
            >
              <Typography variant="h5" align="center" sx={{ mb: 2, zIndex: 5, color: '#3b4cca', fontWeight: 'bold', letterSpacing: 1 }}>
                Équipe
              </Typography>
              {teamPokemon.map((pokemon, idx) => (
                <Box
                  key={idx}
                  onClick={() => handleSlotClick(idx)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2.2,
                    p: 0,
                    borderRadius: 99,
                    cursor: (manageMode || pokemon) ? 'pointer' : 'default',
                    backgroundColor: selectedSlot === idx && manageMode ? '#df6d6d' : '#ffffffcf',
                    boxShadow: 'none',
                    border: 'none',
                    minHeight: 72,
                    maxHeight: 80,
                    transition: 'background 0.2s, box-shadow 0.2s',
                    position: 'relative',
                    width: '100%',
                  }}
                >
                  <Avatar
                    src={pokemon?.sprite_url || pokemon?.image}
                    alt={pokemon?.name}
                    sx={{ width: 54, height: 54, bgcolor: 'none', ml: 2, mr: 2 }}
                  />
                  <Box flex={1} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 54 }}>
                    {pokemon ? (
                      <>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#222', lineHeight: 1, fontSize: '1.1rem' }}>{pokemon.name}</Typography>
                      </>
                    ) : (
                      <>
                        <Typography variant="subtitle2" sx={{ color: '#bbb', fontWeight: 500 }}>Emplacement vide</Typography>
                      </>
                    )}
                  </Box>
                  {pokemon && manageMode && (
                    <Tooltip title="Retirer du slot">
                      <IconButton onClick={e => { e.stopPropagation(); handleRemoveFromTeam(idx); }} size="small" sx={{ mr: 1, color: '#e57373', opacity: 0.7 }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              ))}
            </Paper>
          ) : (
            <Paper
              elevation={6}
              sx={{
                width: 420,
                minWidth: 340,
                backgroundColor: 'white',
                borderRadius: 6,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 8px 32px #0002',
                border: 'none',
                mx: 'auto',
                transition: 'all 0.3s',
              }}
            >
              <Typography variant="h5" align="center" sx={{ mb: 4, zIndex: 5, color: '#3b4cca', fontWeight: 'bold', letterSpacing: 1 }}>
                Équipe
              </Typography>
              <Box
                display="grid"
                gridTemplateColumns="repeat(2, 1fr)"
                gap={4}
                width="100%"
                justifyItems="center"
                alignItems="center"
              >
                {teamPokemon.map((pokemon, idx) => (
                  <Box
                    key={idx}
                    onClick={() => handleSlotClick(idx)}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 2,
                      borderRadius: 4,
                      cursor: pokemon ? 'pointer' : 'default',
                      backgroundColor: '#ffffff78',
                      minHeight: 120,
                      minWidth: 120,
                      boxShadow: 'none',
                      border: 'none',
                      transition: 'background 0.2s, box-shadow 0.2s',
                    }}
                  >
                    <Avatar
                      src={pokemon?.sprite_url || pokemon?.image}
                      alt={pokemon?.name}
                      sx={{ width: 64, height: 64, bgcolor: '#fff', mb: 1, boxShadow: '0 0 0 2px #e0e0e0' }}
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#222', lineHeight: 1, fontSize: '1.2rem', textAlign: 'center' }}>
                      {pokemon ? pokemon.name : 'Emplacement vide'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}
          {/* Colonne box scrollable : affichée seulement en mode gestion */}
          {manageMode && (
            <Paper elevation={0} sx={{
              color: 'rgba(0,0,0,0.87)',
              borderRadius: 2,
              p: 2,
              border: 'none',
              backgroundColor: 'transparent',
              minHeight: 600,
              maxHeight: 700,
              overflowY: 'auto',
              flex: 1,
              boxShadow: 'none',
              transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
            }}>
              <Typography variant="h5" align="center" sx={{ mb: 2,  color: '#3b4cca', fontWeight: 'bold', letterSpacing: 1 }}>
                Boîte Pokémon
              </Typography>
              <Box
                display="grid"
                gridTemplateColumns="repeat(auto-fill, minmax(120px, 1fr))"
                gap={2}
              >
                {ownedPokemon.map((pokemon) => {
                  // Ne pas afficher les Pokémon déjà dans la team
                  if (teamPokemon.some(tp => tp?.id === pokemon.id)) return null;
                  return (
                    <Paper
                      key={pokemon.id}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: selectedSlot !== null ? 'pointer' : 'not-allowed',
                        opacity: selectedSlot !== null ? 1 : 0.6,
                        border: 'none',
                        boxShadow: 'none',
                        background: '#f4f4f470',
                        transition: 'all 0.2s',
                        '&:hover': selectedSlot !== null ? { boxShadow: 'none' } : {},
                      }}
                      onClick={() => selectedSlot !== null && handleBoxPokemonClick(pokemon)}
                    >
                      <Avatar
                        src={pokemon.sprite_url || pokemon.image}
                        alt={pokemon.name}
                        sx={{ width: 56, height: 56, mb: 1 }}
                      />
                      <Typography variant="subtitle2" sx={{  fontWeight: 'bold', color: '#3b4cca', textAlign: 'center' }}>{pokemon.name}</Typography>
                      <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}></Typography>
                      <Box display="flex" gap={0.5} mt={0.5}>
                        {(Array.isArray(pokemon.type) ? pokemon.type : pokemon.type.split(',')).map((type) => {
                          const trimmedType = type.trim() as PokemonType;
                          return (
                            <Box
                              key={type}
                              sx={{
                                bgcolor: TYPE_COLORS[trimmedType],
                                color: 'white',
                                borderRadius: 1,
                                px: 1,
                                fontSize: 12,
                                fontWeight: 'bold',
                              }}
                            >
                              {trimmedType}
                            </Box>
                          );
                        })}
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
              {selectedSlot === null && (
                <Typography align="center" sx={{ mt: 4, color: '#aaa' }}>
                  Sélectionne un slot à gauche pour ajouter/remplacer un Pokémon !
                </Typography>
              )}
            </Paper>
          )}
        </Box>
      </Container>
      {/* Modale d'inspection du Pokémon de l'équipe */}
      <PokemonDetailsModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pokemon={selectedTeamPokemon}
      />
    </Box>
  );
};

export default TeamPage; 