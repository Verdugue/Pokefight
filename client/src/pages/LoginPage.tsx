import React, { useState } from 'react';
import { useNavigate, Navigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  keyframes,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { styled } from '@mui/material/styles';

// Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Composants stylisés
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '2px solid #ffde00',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  animation: `${float} 6s ease-in-out infinite`,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#3b4cca',
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: '#3b4cca',
      borderWidth: '2px',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#3b4cca',
      borderWidth: '2px',
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #ffde00 30%, #ffcc00 90%)',
  color: '#3b4cca',
  padding: '12px 24px',
  fontWeight: 'bold',
  fontSize: '1.1rem',
  textTransform: 'uppercase',
  borderRadius: '8px',
  boxShadow: '0 4px 15px rgba(255, 222, 0, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #ffcc00 30%, #ffde00 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(255, 222, 0, 0.4)',
  },
  '&:active': {
    transform: 'translateY(1px)',
  },
}));

const StyledLink = styled(Link)(({ theme }) => ({
  color: '#3b4cca',
  fontWeight: 'bold',
  textDecoration: 'none',
  '&:hover': {
    color: '#ffde00',
    textDecoration: 'underline',
  },
}));

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  // Rediriger vers la page d'accueil si déjà connecté
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError('Email ou mot de passe incorrect');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #3b4cca 0%, #2a3aa0 100%)',
        padding: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Effet de particules */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.2) 100%)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="sm">
        <Typography
          variant="h1"
          sx={{
            color: '#ffde00',
            fontWeight: 'bold',
            textShadow: '3px 3px 0 #3b4cca, -3px -3px 0 #3b4cca, 3px -3px 0 #3b4cca, -3px 3px 0 #3b4cca',
            fontSize: '4rem',
            textAlign: 'center',
            marginBottom: '5rem',
            fontFamily: '"Press Start 2P", cursive',
            animation: `${pulse} 3s ease-in-out infinite`,
          }}
        >
          Pokéfight
        </Typography>
        <StyledPaper elevation={3}>
          <Typography
            variant="h4"
            component="h1"
            align="center"
            gutterBottom
            sx={{
              color: '#3b4cca',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
              animation: `${pulse} 3s ease-in-out infinite`,
            }}
          >
            Connexion
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                border: '1px solid rgba(255, 107, 107, 0.3)',
                color: '#ff6b6b',
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <StyledTextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Adresse email"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <StyledTextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mot de passe"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Se connecter
            </StyledButton>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" sx={{ color: '#3b4cca' }}>
              Pas encore de compte ?{' '}
              <Link component={RouterLink} to="/register">
                S'inscrire
              </Link>
            </Typography>
          </Box>
        </StyledPaper>
      </Container>
    </Box>
  );
};

export default LoginPage; 