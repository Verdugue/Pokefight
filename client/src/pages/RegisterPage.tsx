import React, { useState } from 'react';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  CircularProgress,
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
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#3b4cca',
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

const RegisterPage: React.FC = () => {
  const { register, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Rediriger vers la page d'accueil si déjà connecté
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Tous les champs sont requis');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    if (!formData.email.includes('@')) {
      setError('Adresse email invalide');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.username, formData.email, formData.password);
      // La redirection est maintenant gérée par AuthContext
    } catch (err) {
      setError('Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
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
            component="h1"
            variant="h4"
            gutterBottom
            sx={{
              color: '#3b4cca',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
              animation: `${pulse} 3s ease-in-out infinite`,
              textAlign: 'center',
            }}
          >
            Inscription
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

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <StyledTextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Nom d'utilisateur"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
            />

            <StyledTextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Adresse email"
              name="email"
              autoComplete="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />

            <StyledTextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mot de passe"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              helperText="Le mot de passe doit contenir au moins 6 caractères"
            />

            <StyledTextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirmer le mot de passe"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
            />

            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: '#3b4cca' }} />
              ) : (
                "S'inscrire"
              )}
            </StyledButton>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#3b4cca' }}>
                Déjà inscrit ?{' '}
                <Link component={RouterLink} to="/login" sx={{ 
                  color: '#3b4cca',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#ffde00',
                    textDecoration: 'underline',
                  }
                }}>
                  Se connecter
                </Link>
              </Typography>
            </Box>
          </Box>
        </StyledPaper>
      </Container>
    </Box>
  );
};

export default RegisterPage; 