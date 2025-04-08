import React from 'react';
import { Container, Typography, Paper } from '@mui/material';
import MatchmakingQueue from '../components/MatchmakingQueue';

const MatchmakingPage: React.FC = () => {
  // TODO: Récupérer l'ID de l'utilisateur depuis le contexte d'authentification
  const userId = 1; // Temporaire

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mode Combat
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Affrontez d'autres dresseurs dans des combats Pokémon en temps réel !
        </Typography>
        
        <MatchmakingQueue userId={userId} />
      </Paper>
    </Container>
  );
};

export default MatchmakingPage; 