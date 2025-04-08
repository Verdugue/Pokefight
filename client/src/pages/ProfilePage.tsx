import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

interface ProfilePageProps {
  user: {
    username: string;
    email: string;
    elo?: number;
    wins?: number;
    losses?: number;
    pokemon_count?: number;
  };
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const winRate = user.wins && user.losses 
    ? ((user.wins / (user.wins + user.losses)) * 100).toFixed(1)
    : '0';

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* En-tête du profil */}
            <Grid item xs={12} display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                }}
              >
                {user.username[0].toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {user.username}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {user.email}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Statistiques */}
            <Grid item xs={12}>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Classement ELO"
                    secondary={user.elo || 1000}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Statistiques de combat"
                    secondary={`${user.wins || 0} victoires - ${user.losses || 0} défaites (${winRate}% de victoires)`}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Pokémon capturés"
                    secondary={`${user.pokemon_count || 0} Pokémon`}
                  />
                </ListItem>
              </List>
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12} display="flex" justifyContent="space-between">
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/pokedex')}
              >
                Voir mon Pokédex
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                onClick={handleLogout}
              >
                Se déconnecter
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProfilePage; 