import React, { useEffect, useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
} from '@mui/material';
import { API_URL } from '../services/api';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../contexts/AuthContext';

interface ProfilePageProps {
  user: {
    username: string;
    email: string;
    elo?: number;
    wins?: number;
    losses?: number;
    pokemon_count?: number;
    avatar?: string;
  };
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { updateAvatar } = useAuth();
  const [ownedPokemon, setOwnedPokemon] = useState<any[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSelected, setTempSelected] = useState<string | null>(null);

  useEffect(() => {
    // Fetch owned Pokémon for avatar selection
    const fetchOwned = async () => {
      try {
        const response = await fetch(`${API_URL}/api/pokemon/owned`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setOwnedPokemon(data);
      } catch (err) {
        setOwnedPokemon([]);
      }
    };
    fetchOwned();
  }, []);

  const handleAvatarChange = async (sprite: string) => {
    try {
      const response = await fetch(`${API_URL}/api/pokemon/avatar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ avatarUrl: sprite })
      });

      if (!response.ok) {
        throw new Error('Failed to update avatar');
      }

      setSelectedAvatar(sprite);
      setAvatarDialogOpen(false);
      updateAvatar(sprite);
    } catch (error) {
      console.error('Error updating avatar:', error);
      alert('Failed to update avatar');
    }
  };

  const handleOpenAvatarDialog = () => {
    setTempSelected(selectedAvatar);
    setAvatarDialogOpen(true);
  };

  const handleCloseAvatarDialog = () => {
    setAvatarDialogOpen(false);
    setSearchTerm('');
  };

  const filteredPokemon = ownedPokemon.filter((poke) =>
    poke.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const winRate = user.wins && user.losses 
    ? ((user.wins / (user.wins + user.losses)) * 100).toFixed(1)
    : '0';

  // Calcul du nombre d'espèces uniques de Pokémon capturés
  const pokemonCount = new Set(ownedPokemon.map(p => p.id)).size;

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
                  bgcolor: 'white',
                  fontSize: '2rem',
                }}
                src={selectedAvatar || user.avatar || undefined}
              >
                {!selectedAvatar && !user.avatar && user.username[0].toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {user.username}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {user.email}
                </Typography>
                <Button
                  variant="outlined"
                  sx={{ mt: 1 }}
                  onClick={handleOpenAvatarDialog}
                >
                  Changer la photo de profil
                </Button>
              </Box>
            </Grid>

            {/* Dialog de sélection d'avatar */}
            <Dialog open={avatarDialogOpen} onClose={handleCloseAvatarDialog} maxWidth="sm" fullWidth>
              <DialogTitle>
                Choisir un sprite de Pokémon
                <IconButton
                  aria-label="close"
                  onClick={handleCloseAvatarDialog}
                  sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Rechercher un Pokémon..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, maxHeight: 300, overflowY: 'auto' }}>
                  {filteredPokemon.map((poke) => (
                    <Avatar
                      key={poke.id + (poke.isShiny ? '-shiny' : '')}
                      src={poke.image}
                      alt={poke.name}
                      sx={{
                        width: 56,
                        height: 56,
                        border: tempSelected === poke.image ? '3px solid #FFCB05' : '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'border 0.2s',
                      }}
                      onClick={() => setTempSelected(poke.image)}
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!tempSelected}
                    onClick={() => tempSelected && handleAvatarChange(tempSelected)}
                  >
                    Choisir
                  </Button>
                </Box>
              </DialogContent>
            </Dialog>

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
                    secondary={`${pokemonCount} Pokémon`}
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