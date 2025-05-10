import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  useTheme,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Toolbar>
        {/* Logo et titre */}
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 0,
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <img src="/pokeball.svg" alt="PokéFight" style={{ height: 24 }} />
          PokéFight
        </Typography>

        {/* Navigation principale */}
        <Box sx={{ flexGrow: 1, ml: 4 }}>
          {isAuthenticated && (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/matchmaking"
                sx={{ mr: 2 }}
              >
                Combats
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/pokedex"
                sx={{ mr: 2 }}
              >
                Pokédex
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/team"
                sx={{ mr: 2 }}
              >
                Mon Équipe
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/roulette"
                sx={{ mr: 2 }}
              >
                Pokéroulette
              </Button>
            </>
          )}
        </Box>

        {/* Menu de profil */}
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              {user?.username}
            </Typography>
            <IconButton
              onClick={handleMenu}
              sx={{
                p: 0,
                border: `2px solid white`,
              }}
            >
              <Avatar
                alt={user?.username}
                src={user?.avatar}
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: 'white'
                }}
              >
                {!user?.avatar && user?.username?.[0].toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem
                component={RouterLink}
                to="/profile"
                onClick={handleClose}
              >
                Mon Profil
              </MenuItem>
              <MenuItem onClick={handleLogout}>Se déconnecter</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box>
            <Button
              color="inherit"
              component={RouterLink}
              to="/login"
              sx={{ mr: 1 }}
            >
              Connexion
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              component={RouterLink}
              to="/register"
            >
              Inscription
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header; 