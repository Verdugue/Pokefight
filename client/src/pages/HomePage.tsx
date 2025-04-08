import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      title: 'Combats en Temps Réel',
      description: 'Affrontez d\'autres dresseurs dans des duels épiques en temps réel.',
    },
    {
      title: 'Constituez Votre Équipe',
      description: 'Choisissez vos Pokémon parmi les 151 Pokémon de la première génération.',
    },
    {
      title: 'Système de Classement',
      description: 'Grimpez dans le classement et devenez le meilleur dresseur.',
    },
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          borderRadius: 2,
          color: 'white',
          mb: 6,
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Bienvenue sur PokéFight
        </Typography>
        <Typography variant="h5" component="h2" sx={{ mb: 4 }}>
          Le jeu de combat Pokémon en ligne
        </Typography>
        {!isAuthenticated && (
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ mr: 2 }}
            >
              Commencer l'aventure
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              onClick={() => navigate('/login')}
            >
              Se connecter
            </Button>
          </Box>
        )}
      </Box>

      {/* Features Section */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" component="h3" gutterBottom>
                {feature.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {feature.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Call to Action */}
      {isAuthenticated ? (
        <Box textAlign="center" sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom>
            Prêt pour le combat ?
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/matchmaking')}
          >
            Trouver un adversaire
          </Button>
        </Box>
      ) : (
        <Box textAlign="center" sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom>
            Rejoignez la communauté !
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Créez votre compte gratuitement et commencez à combattre.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/register')}
          >
            S'inscrire gratuitement
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default HomePage;