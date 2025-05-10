import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Avatar,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../services/api';
import { Pokemon } from '../types/pokemon';
import { TYPE_COLORS, PokemonType } from '../utils/typeColors';
import { useNavigate } from 'react-router-dom';

const MatchmakingPage: React.FC = () => {
  const { token } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [matchId, setMatchId] = useState<number | null>(null);
  const [opponent, setOpponent] = useState<{ username: string; team: Pokemon[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fonction pour rejoindre la file d'attente
  const joinQueue = async () => {
    try {
      setIsSearching(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/matchmaking/queue`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la recherche d\'un match');
      }

      if (data.matchFound) {
        setMatchFound(true);
        setMatchId(data.matchId);
        setOpponent(data.opponent);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsSearching(false);
    }
  };

  // Fonction pour quitter la file d'attente
  const leaveQueue = async () => {
    try {
      const response = await fetch(`${API_URL}/api/matchmaking/queue/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sortie de la file d\'attente');
      }

      setIsSearching(false);
      setMatchFound(false);
      setMatchId(null);
      setOpponent(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  // Effet pour vérifier l'état du match toutes les 5 secondes
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (matchId) {
      intervalId = setInterval(async () => {
        try {
          const response = await fetch(`${API_URL}/api/matchmaking/match/${matchId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Erreur lors de la récupération de l\'état du match');
          }

          const data = await response.json();
          // Mettre à jour l'état du match si nécessaire
          if (data.match.status === 'finished') {
            clearInterval(intervalId);
            // Gérer la fin du match
          }
        } catch (err) {
          console.error('Erreur lors de la vérification du match:', err);
        }
      }, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [matchId, token]);

  useEffect(() => {
    if (matchFound && matchId) {
      navigate(`/combat/${matchId}`);
    }
  }, [matchFound, matchId, navigate]);

  useEffect(() => {
    if (isSearching && !matchFound) {
      const interval = setInterval(async () => {
        const response = await fetch(`${API_URL}/api/matchmaking/active`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.matchId) {
          setMatchFound(true);
          setMatchId(data.matchId);
          // Optionnel: setOpponent si tu veux afficher l'équipe adverse
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isSearching, matchFound, token]);

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
          Matchmaking
        </Typography>
        <Typography variant="h6">
          {isSearching ? 'Recherche d\'un adversaire en cours...' : 'Prêt à combattre ?'}
        </Typography>
      </Paper>

      {error && (
        <Paper sx={{ p: 2, mb: 4, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        {!isSearching ? (
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={joinQueue}
            sx={{ minWidth: 200 }}
          >
            Rechercher un match
          </Button>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={leaveQueue}
            sx={{ minWidth: 200 }}
          >
            Annuler la recherche
          </Button>
        )}
      </Box>

      {isSearching && !matchFound && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 4 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Recherche d'un adversaire...
          </Typography>
        </Box>
      )}

      {matchFound && opponent && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Match trouvé contre {opponent.username} !
          </Typography>
          <Typography variant="h6" gutterBottom>
            Équipe de l'adversaire :
          </Typography>
          <Grid container spacing={2}>
            {opponent.team.map((pokemon) => (
              <Grid item xs={12} sm={6} md={4} key={pokemon.id}>
                <Card>
                  <CardMedia
                    component="img"
                    image={pokemon.sprite_url || pokemon.image}
                    alt={pokemon.name}
                    sx={{ height: 200, objectFit: 'contain', p: 2 }}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {pokemon.name}
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {(Array.isArray(pokemon.type) ? pokemon.type : pokemon.type.split(',')).map((type: string) => {
                        const trimmedType = type.trim() as PokemonType;
                        return (
                          <Chip
                            key={type}
                            label={trimmedType}
                            size="small"
                            sx={{
                              bgcolor: TYPE_COLORS[trimmedType],
                              color: 'white',
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
        </Box>
      )}
    </Container>
  );
};

export default MatchmakingPage; 