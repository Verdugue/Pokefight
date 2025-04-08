import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';

interface MatchmakingQueueProps {
  userId: number;
}

const MatchmakingQueue: React.FC<MatchmakingQueueProps> = ({ userId }) => {
  const [isInQueue, setIsInQueue] = useState(false);
  const [queueTime, setQueueTime] = useState(0);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isInQueue) {
      intervalId = setInterval(() => {
        setQueueTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isInQueue]);

  const connectToMatchmaking = () => {
    try {
      const ws = new WebSocket('ws://localhost:3001');

      ws.onopen = () => {
        console.log('🔌 Connecté au serveur de matchmaking');
        ws.send(JSON.stringify({
          type: 'JOIN_QUEUE',
          userId
        }));
        setIsInQueue(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'QUEUE_JOINED':
            console.log('✅ Rejoint la file d\'attente');
            break;
          
          case 'MATCH_FOUND':
            setIsInQueue(false);
            // TODO: Rediriger vers la page de combat
            console.log('🎮 Match trouvé !', data.data);
            break;
          
          case 'ERROR':
            setError(data.message);
            setIsInQueue(false);
            break;
        }
      };

      ws.onclose = () => {
        console.log('🔌 Déconnecté du serveur de matchmaking');
        setIsInQueue(false);
        setSocket(null);
      };

      ws.onerror = (error) => {
        console.error('❌ Erreur WebSocket:', error);
        setError('Erreur de connexion au serveur');
        setIsInQueue(false);
      };

      setSocket(ws);
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error);
      setError('Impossible de se connecter au serveur');
    }
  };

  const leaveQueue = () => {
    if (socket) {
      socket.send(JSON.stringify({
        type: 'LEAVE_QUEUE'
      }));
      socket.close();
      setIsInQueue(false);
      setQueueTime(0);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        p: 3,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: 1,
      }}
    >
      <Typography variant="h6" component="h2">
        Recherche de combat
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {isInQueue ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={24} />
            <Typography>
              Recherche d'un adversaire... ({formatTime(queueTime)})
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            onClick={leaveQueue}
            sx={{ mt: 2 }}
          >
            Annuler la recherche
          </Button>
        </>
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={connectToMatchmaking}
          disabled={!!error}
        >
          Rechercher un combat
        </Button>
      )}
    </Box>
  );
};

export default MatchmakingQueue; 