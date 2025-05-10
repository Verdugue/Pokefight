import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  Fade,
  Paper,
} from '@mui/material';
import { API_URL } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface RoulettePokemon {
  id: number;
  name: string;
  type: string[];
  image: string;
  isShiny: boolean;
  rarity: number;
}

const getRarityLabel = (rarity: number, isShiny: boolean) => {
  if (isShiny) return { label: 'Légendaire', color: '#FFD700' };
  switch (rarity) {
    case 1:
      return { label: 'Commun', color: '#808080' };
    case 2:
      return { label: 'Peu commun', color: '#32CD32' };
    case 3:
      return { label: 'Rare', color: '#4169E1' };
    case 4:
      return { label: 'Épique', color: '#fff' };
    default:
      return { label: 'Inconnu', color: '#000000' };
  }
};

const PokeRoulettePage: React.FC = () => {
  const { user } = useAuth();
  const [timeUntilNextRoll, setTimeUntilNextRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<RoulettePokemon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [rollingPhase, setRollingPhase] = useState<'idle' | 'accelerate' | 'fast' | 'decelerate' | 'done'>('idle');
  const requestRef = useRef<number>();
  const speedRef = useRef(0);

  useEffect(() => {
    const checkRouletteCooldown = async () => {
      try {
        const response = await fetch(`${API_URL}/api/pokemon/roulette/cooldown`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to check roulette cooldown');
        }

        const data = await response.json();
        setTimeUntilNextRoll(data.timeUntilNextRoll);
      } catch (err) {
        console.error('Error checking roulette cooldown:', err);
        setError('Failed to check roulette cooldown');
      }
    };

    checkRouletteCooldown();
    const interval = setInterval(checkRouletteCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const hours = Math.floor(ms / 1000 / 60 / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Animation de la roulette
  useEffect(() => {
    if (!isRolling) return;
    let phase = 'accelerate';
    let speed = 2; // degrés par frame
    let frame = 0;
    let maxSpeed = 30;
    let decelStart = 90; // frame to start decelerating
    let decelFrames = 60;
    let totalFrames = 150;

    function animate() {
      frame++;
      if (phase === 'accelerate') {
        speed += 0.7;
        if (speed >= maxSpeed) {
          speed = maxSpeed;
          phase = 'fast';
        }
      } else if (phase === 'fast') {
        if (frame > decelStart) {
          phase = 'decelerate';
        }
      } else if (phase === 'decelerate') {
        speed -= (maxSpeed / decelFrames);
        if (speed < 2) speed = 2;
        if (frame > totalFrames) {
          phase = 'done';
        }
      }
      setRotation(prev => prev + speed);
      speedRef.current = speed;
      setRollingPhase(phase as any);
      if (phase !== 'done') {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          setIsRolling(false);
          setShowResult(true);
        }, 300);
      }
    }
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRolling]);

  const handleRoll = async () => {
    try {
      setIsRolling(true);
      setShowResult(false);
      setResult(null);
      setRotation(0);
      setRollingPhase('accelerate');

      const response = await fetch(`${API_URL}/api/pokemon/roulette/roll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to roll');
      }

      const data = await response.json();
      // On attend la fin de l'animation pour afficher le résultat
      setTimeout(() => {
        setResult(data);
        setTimeUntilNextRoll(7200000); // 2 heures en millisecondes
      }, 1800);
    } catch (err) {
      console.error('Error rolling:', err);
      setError('Failed to roll');
      setIsRolling(false);
    }
  };

  const handleAcceptPokemon = () => {
    setShowResult(false);
    setResult(null);
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        Pokéroulette
      </Typography>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mt: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
          color: 'white'
        }}
      >
        {timeUntilNextRoll !== null && timeUntilNextRoll > 0 ? (
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom>
              Prochain tirage disponible dans :
            </Typography>
            <Typography variant="h4">
              {formatTime(timeUntilNextRoll)}
            </Typography>
          </Box>
        ) : (
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleRoll}
            disabled={isRolling}
            sx={{
              fontSize: '1.5rem',
              py: 2,
              px: 4,
              backgroundColor: 'white',
              color: '#FF5722',
              '&:hover': {
                backgroundColor: '#FFE0B2',
              }
            }}
          >
            {isRolling ? 'Tirage en cours...' : 'Lancer la roulette !'}
          </Button>
        )}
      </Paper>

      <Dialog
        open={isRolling || showResult}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'transparent',
            boxShadow: 'none',
          }
        }}
      >
        <DialogContent>
          {isRolling ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              sx={{ height: 320 }}
            >
              <img
                src="/roulette.png"
                alt="Roulette"
                style={{
                  width: 220,
                  height: 220,
                  transform: `rotate(${rotation}deg)`,
                  transition: rollingPhase === 'done' ? 'transform 0.3s cubic-bezier(.17,.67,.83,.67)' : 'none',
                }}
              />
            </Box>
          ) : result && (
            <Fade in={showResult}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  background: result.isShiny
                    ? 'linear-gradient(45deg, #FFD700 30%, #FFA500 90%)'
                    : result.rarity === 4
                    ? 'linear-gradient(45deg, #9C27B0 30%, #673AB7 90%)'
                    : 'white',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Typography variant="h5" gutterBottom>
                  Félicitations !
                </Typography>
                <Box
                  component="img"
                  src={result.image}
                  alt={result.name}
                  sx={{
                    width: 200,
                    height: 200,
                    objectFit: 'contain',
                    animation: 'bounce 0.5s ease-in-out',
                    '@keyframes bounce': {
                      '0%': {
                        transform: 'scale(0)',
                      },
                      '50%': {
                        transform: 'scale(1.2)',
                      },
                      '100%': {
                        transform: 'scale(1)',
                      },
                    },
                  }}
                />
                <Typography variant="h6" gutterBottom>
                  {result.name}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                  {result.type.map((type) => (
                    <Typography
                      key={type}
                      variant="body2"
                      sx={{
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {type}
                    </Typography>
                  ))}
                </Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: getRarityLabel(result.rarity, result.isShiny).color,
                    fontWeight: 'bold',
                  }}
                >
                  {getRarityLabel(result.rarity, result.isShiny).label}
                </Typography>
                <DialogActions sx={{ justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAcceptPokemon}
                    sx={{ minWidth: 200 }}
                  >
                    Accepter
                  </Button>
                </DialogActions>
              </Paper>
            </Fade>
          )}
        </DialogContent>
      </Dialog>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Container>
  );
};

export default PokeRoulettePage; 