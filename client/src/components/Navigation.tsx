import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Navigation = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Button
          color="inherit"
          component={RouterLink}
          to="/"
        >
          PokéFight
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          color="inherit"
          component={RouterLink}
          to="/login"
        >
          Connexion
        </Button>
        <Button
          color="inherit"
          component={RouterLink}
          to="/register"
        >
          Inscription
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 