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
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          mt: 4,
          textAlign: 'center',
          color: '#3b4cca',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
          letterSpacing: 1
        }}
      >
        Pokéroulette
      </Typography>

      <Paper 
        elevation={6} 
        sx={{ 
          p: 4, 
          mt: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
          color: 'white',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden',
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
        {timeUntilNextRoll !== null && timeUntilNextRoll > 0 ? (
          <Box textAlign="center" sx={{ position: 'relative', zIndex: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
              Prochain tirage disponible dans :
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                  '100%': { transform: 'scale(1)' }
                }
              }}
            >
              {formatTime(timeUntilNextRoll)}
            </Typography>
          </Box>
        ) : (
          <Button
            variant="contained"
            size="large"
            onClick={handleRoll}
            disabled={isRolling}
            sx={{
              position: 'relative',
              zIndex: 2,
              fontSize: '1.5rem',
              py: 2.5,
              px: 6,
              backgroundColor: 'white',
              color: '#FF5722',
              borderRadius: 50,
              fontWeight: 'bold',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#FFE0B2',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 25px rgba(0,0,0,0.25)',
              },
              '&:active': {
                transform: 'translateY(1px)',
                boxShadow: '0 2px 15px rgba(0,0,0,0.2)',
              },
              '&.Mui-disabled': {
                backgroundColor: '#f5f5f5',
                color: '#bdbdbd',
              }
            }}
          >
            {isRolling ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={24} color="inherit" />
                <span>Tirage en cours...</span>
              </Box>
            ) : (
              'Lancer la roulette !'
            )}
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
            overflow: 'hidden'
          }
        }}
      >
        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          {isRolling ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              sx={{ 
                height: 320,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <img
                src="/roulette.png"
                alt="Roulette"
                style={{
                  width: 280,
                  height: 280,
                  transform: `rotate(${rotation}deg)`,
                  transition: rollingPhase === 'done' ? 'transform 0.5s cubic-bezier(.17,.67,.83,.67)' : 'none',
                  filter: 'drop-shadow(0 0 20px rgba(255,152,0,0.5))',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                }}
              />
            </Box>
          ) : result && (
            <Fade in={showResult}>
              <Paper
                elevation={6}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  background: result.isShiny
                    ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                    : result.rarity === 4
                    ? 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)'
                    : 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
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
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold',
                    color: result.isShiny ? '#B8860B' : 'inherit',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                    position: 'relative',
                    zIndex: 2
                  }}
                >
                  Félicitations !
                </Typography>
                <Box
                  component="img"
                  src={result.image}
                  alt={result.name}
                  sx={{
                    width: 240,
                    height: 240,
                    objectFit: 'contain',
                    animation: 'bounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                    '@keyframes bounce': {
                      '0%': { transform: 'scale(0)', opacity: 0 },
                      '50%': { transform: 'scale(1.2)', opacity: 1 },
                      '100%': { transform: 'scale(1)', opacity: 1 }
                    },
                    filter: result.isShiny ? 'drop-shadow(0 0 20px rgba(255,215,0,0.5))' : 'none',
                    position: 'relative',
                    zIndex: 2
                  }}
                />
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 'bold',
                    color: result.isShiny ? '#B8860B' : 'inherit',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                    position: 'relative',
                    zIndex: 2
                  }}
                >
                  {result.name}
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: 1, 
                    mb: 2,
                    position: 'relative',
                    zIndex: 2
                  }}
                >
                  {result.type.map((type) => (
                    <Typography
                      key={type}
                      variant="body2"
                      sx={{
                        px: 2,
                        py: 0.5,
                        borderRadius: 2,
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        fontWeight: 'bold',
                        backdropFilter: 'blur(4px)',
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
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                    position: 'relative',
                    zIndex: 2
                  }}
                >
                  {getRarityLabel(result.rarity, result.isShiny).label}
                </Typography>
                <DialogActions sx={{ justifyContent: 'center', mt: 3, position: 'relative', zIndex: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleAcceptPokemon}
                    sx={{ 
                      minWidth: 200,
                      py: 1.5,
                      borderRadius: 50,
                      fontWeight: 'bold',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 25px rgba(0,0,0,0.25)',
                      },
                      '&:active': {
                        transform: 'translateY(1px)',
                        boxShadow: '0 2px 15px rgba(0,0,0,0.2)',
                      }
                    }}
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
        <Typography 
          color="error" 
          sx={{ 
            mt: 2,
            textAlign: 'center',
            fontWeight: 'bold',
            animation: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
            '@keyframes shake': {
              '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
              '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
              '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
              '40%, 60%': { transform: 'translate3d(4px, 0, 0)' }
            }
          }}
        >
          {error}
        </Typography>
      )}
    </Container>
  );
};

export default PokeRoulettePage; 