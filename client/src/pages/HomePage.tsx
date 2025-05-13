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
      icon: '⚔️',
      color: '#ff6b6b'
    },
    {
      title: 'Constituez Votre Équipe',
      description: 'Choisissez vos Pokémon parmi les 151 Pokémon de la première génération.',
      icon: '🎮',
      color: '#4ecdc4'
    },
    {
      title: 'Système de Classement',
      description: 'Grimpez dans le classement et devenez le meilleur dresseur.',
      icon: '🏆',
      color: '#ffd93d'
    },
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f0ff 0%, #f5f5f5 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Décor SVG en fond */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <polygon points="0,0 240,0 0,1080" fill="#3b4cca" opacity="0.08" filter="url(#blur)" />
          <polygon points="1920,1080 1680,1080 1920,0" fill="#3b4cca" opacity="0.08" filter="url(#blur)" />
          <filter id="blur">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </svg>
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 6, md: 10 },
            px: { xs: 2, md: 4 },
            background: 'linear-gradient(135deg, #3b4cca 0%, #1a237e 100%)',
            borderRadius: 4,
            color: 'white',
            mb: 8,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
              zIndex: 1
            }
          }}
        >
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              letterSpacing: 1
            }}
          >
            Bienvenue sur PokéFight
          </Typography>
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              mb: 4,
              opacity: 0.9,
              fontWeight: 500,
              fontSize: { xs: '1.2rem', md: '1.5rem' }
            }}
          >
            Le jeu de combat Pokémon en ligne
          </Typography>
          {!isAuthenticated && (
            <Box sx={{ mt: 4, position: 'relative', zIndex: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{ 
                  mr: 2,
                  mb: { xs: 2, sm: 0 },
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  backgroundColor: '#ff6b6b',
                  borderRadius: 50,
                  boxShadow: '0 4px 20px rgba(255,107,107,0.3)',
                  '&:hover': {
                    backgroundColor: '#ff5252',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px rgba(255,107,107,0.4)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Commencer l'aventure
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  borderColor: 'white',
                  color: 'white',
                  borderRadius: 50,
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Se connecter
              </Button>
            </Box>
          )}
        </Box>

        {/* Features Section */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  background: 'white',
                  borderRadius: 4,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    background: feature.color,
                    fontSize: '2.5rem',
                    boxShadow: `0 4px 20px ${feature.color}40`
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography 
                  variant="h5" 
                  component="h3" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 'bold',
                    color: '#2d3436',
                    mb: 2
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: '1.1rem',
                    lineHeight: 1.6
                  }}
                >
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action */}
        {isAuthenticated ? (
          <Box 
            textAlign="center" 
            sx={{ 
              mb: 8,
              p: 6,
              background: 'white',
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}
          >
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                color: '#2d3436',
                mb: 3
              }}
            >
              Prêt pour le combat ?
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/matchmaking')}
              sx={{ 
                px: 6,
                py: 1.5,
                fontSize: '1.2rem',
                backgroundColor: '#3b4cca',
                borderRadius: 50,
                boxShadow: '0 4px 20px rgba(59,76,202,0.3)',
                '&:hover': {
                  backgroundColor: '#1a237e',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 25px rgba(59,76,202,0.4)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Trouver un adversaire
            </Button>
          </Box>
        ) : (
          <Box 
            textAlign="center" 
            sx={{ 
              mb: 8,
              p: 6,
              background: 'white',
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}
          >
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                color: '#2d3436',
                mb: 2
              }}
            >
              Rejoignez la communauté !
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 4,
                fontSize: '1.1rem',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Créez votre compte gratuitement et commencez à combattre.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ 
                px: 6,
                py: 1.5,
                fontSize: '1.2rem',
                backgroundColor: '#3b4cca',
                borderRadius: 50,
                boxShadow: '0 4px 20px rgba(59,76,202,0.3)',
                '&:hover': {
                  backgroundColor: '#1a237e',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 25px rgba(59,76,202,0.4)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              S'inscrire gratuitement
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;