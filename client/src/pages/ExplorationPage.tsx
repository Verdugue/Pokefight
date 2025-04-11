import React, { useState, useEffect } from 'react';
import {
  Container,
  
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { pokemonApi } from '../services/pokemonApi';

interface WildPokemon {
  id: number;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  type: string;
  catchRate: number;
}

interface ExplorationArea {
  id: number;
  name: string;
  description: string;
  minLevel: number;
  maxLevel: number;
}

const ExplorationPage: React.FC = () => {
  const [areas, setAreas] = useState<ExplorationArea[]>([]);
  const [selectedArea, setSelectedArea] = useState<number>(0);
  const [wildPokemon, setWildPokemon] = useState<WildPokemon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catchResult, setCatchResult] = useState<string | null>(null);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await pokemonApi.getExplorationAreas();
        setAreas(response);
        if (response.length > 0) {
          setSelectedArea(response[0].id);
        }
      } catch (err) {
        setError('Failed to load exploration areas');
      }
    };

    fetchAreas();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setCatchResult(null);
    try {
      const pokemon = await pokemonApi.findWildPokemon(selectedArea);
      setWildPokemon(pokemon);
    } catch (err) {
      setError('Failed to find a wild Pokémon');
    } finally {
      setLoading(false);
    }
  };

  const handleCatch = async () => {
    if (!wildPokemon) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await pokemonApi.attemptCatch(wildPokemon.id);
      setCatchResult(result.success ? 'Pokémon caught successfully!' : 'The Pokémon escaped!');
      if (result.success) {
        setWildPokemon(null);
      }
    } catch (err) {
      setError('Failed to catch the Pokémon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Pokémon Exploration
        </Typography>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Exploration Area</InputLabel>
          <Select
            value={selectedArea}
            onChange={(e) => setSelectedArea(Number(e.target.value))}
            label="Exploration Area"
          >
            {areas.map((area) => (
              <MenuItem key={area.id} value={area.id}>
                {area.name} (Levels {area.minLevel}-{area.maxLevel})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={loading || !selectedArea}
          sx={{ mb: 3 }}
        >
          Search for Pokémon
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {catchResult && (
          <Alert severity={catchResult.includes('successfully') ? 'success' : 'error'} sx={{ mb: 2 }}>
            {catchResult}
          </Alert>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress />
          </Box>
        )}

        {wildPokemon && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" component="h2">
                {wildPokemon.name}
              </Typography>
              <Typography color="textSecondary">
                Level: {wildPokemon.level}
              </Typography>
              <Typography color="textSecondary">
                Type: {wildPokemon.type}
              </Typography>
              <Typography color="textSecondary">
                HP: {wildPokemon.hp}/{wildPokemon.maxHp}
              </Typography>
              <Typography color="textSecondary">
                Catch Rate: {wildPokemon.catchRate}%
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleCatch}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                Try to Catch
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default ExplorationPage; 