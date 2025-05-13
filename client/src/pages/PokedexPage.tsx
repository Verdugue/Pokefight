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
  TextField,
  Paper,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../services/api';
import { Pokemon } from '../types/pokemon';
import { PokemonDetailsModal } from '../components/PokemonDetailsModal';
import { TYPE_COLORS, PokemonType } from '../utils/typeColors';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import { red } from '@mui/material/colors';

const PokedexPage: React.FC = () => {
  const { token } = useAuth();
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortCaughtFirst, setSortCaughtFirst] = useState(false);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const response = await fetch(`${API_URL}/api/pokemon/pokedex`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du Pokédex');
        }
        const data = await response.json();
        setPokemon(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPokemon();
    }
  }, [token]);

  const handlePokemonClick = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPokemon(null);
  };

  const filteredPokemon = pokemon.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedPokemon = sortCaughtFirst
    ? [...filteredPokemon].sort((a, b) => Number(b.isCaught) - Number(a.isCaught))
    : filteredPokemon;

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

  const caughtCount = pokemon.filter(p => p.isCaught).length;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          mb: 4,
          color: 'white',
          boxShadow: 'none',
        }}
      >
        
        <Box display="flex" alignItems="center" sx={{
          cursor: 'pointer',
          borderRadius: '10px',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#6bc3ff',
          width: '150px',
          height: '50px',
          transition: 'background 0.2s, box-shadow 0.2s',
          '&:hover': {
            backgroundColor: '#338fce',
            boxShadow: '0 4px 16px 0 #e5393533',
          },
        }} onClick={() => setSortCaughtFirst(v => !v)}>
          <SportsBaseballIcon sx={{ color: red[500], fontSize: 32, mr: 1 }} />
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mr: 1 }}>
            {caughtCount} / {pokemon.length}
          </Typography>
        </Box>
      </Paper>

      <TextField
        fullWidth
        label="Rechercher un Pokémon"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 4 }}
      />

      <Grid container spacing={3}>
        {displayedPokemon.map((pokemon) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={pokemon.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                opacity: pokemon.isCaught ? 1 : 0.7,
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
                <Box display="flex" gap={1} flexWrap="wrap">
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

      <PokemonDetailsModal
        open={isModalOpen}
        onClose={handleCloseModal}
        pokemon={selectedPokemon}
      />
    </Container>
  );
};

export default PokedexPage; 