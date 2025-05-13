import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../services/api';

type MatchmakingResponse = {
  error?: string;
  matchFound?: boolean;
  matchId?: number;
};

const MatchmakingPage: React.FC = () => {
  const { token } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const joinQueue = async () => {
    setIsSearching(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/matchmaking/queue`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      let data: MatchmakingResponse = {};
      try {
        data = await response.json();
      } catch (e) {
        setError('Erreur serveur : réponse invalide');
        setIsSearching(false);
        return;
      }
      if (!response.ok) throw new Error(data.error || 'Erreur lors de la recherche d\'un match');
      if (data.matchFound && data.matchId) {
        navigate(`/combat/${data.matchId}`);
      } else {
        // Poll toutes les 2s jusqu'à trouver un match
        const interval = setInterval(async () => {
          const res = await fetch(`${API_URL}/api/matchmaking/active`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          let d: any = {};
          try {
            d = await res.json();
          } catch (e) {
            setError('Erreur serveur : réponse invalide');
            setIsSearching(false);
            clearInterval(interval);
            return;
          }
          if (d.matchId) {
            clearInterval(interval);
            navigate(`/combat/${d.matchId}`);
          }
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message);
      setIsSearching(false);
    }
  };

  const leaveQueue = async () => {
    await fetch(`${API_URL}/api/matchmaking/queue/leave`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    setIsSearching(false);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #3b4cca 0%, #2a3aa0 100%)',
      minHeight: '100vh',
      color: '#fff',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Press Start 2P", cursive',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Effet de particules */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.2) 100%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '2rem',
        borderRadius: '1rem',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '600px',
        width: '100%'
      }}>
        <h2 style={{
          color: '#ffde00',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
          marginBottom: '2rem',
          fontSize: '2rem'
        }}>Matchmaking</h2>

        {error && (
          <div style={{
            color: '#ff6b6b',
            marginBottom: '1rem',
            padding: '1rem',
            background: 'rgba(255, 107, 107, 0.1)',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255, 107, 107, 0.3)'
          }}>
            {error}
          </div>
        )}

        {!isSearching ? (
          <button
            onClick={joinQueue}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              borderRadius: '0.5rem',
              background: 'linear-gradient(135deg, #ffde00 0%, #ffcc00 100%)',
              color: '#3b4cca',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 15px rgba(255, 222, 0, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            Rechercher un match
          </button>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              marginBottom: '1.5rem',
              fontSize: '1.2rem',
              color: '#ffde00',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
            }}>
              Recherche d'un adversaire...
              <div style={{
                marginTop: '1rem',
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  background: '#ffde00',
                  borderRadius: '50%',
                  animation: 'bounce 1s infinite'
                }} />
                <div style={{
                  width: '10px',
                  height: '10px',
                  background: '#ffde00',
                  borderRadius: '50%',
                  animation: 'bounce 1s infinite 0.2s'
                }} />
                <div style={{
                  width: '10px',
                  height: '10px',
                  background: '#ffde00',
                  borderRadius: '50%',
                  animation: 'bounce 1s infinite 0.4s'
                }} />
              </div>
            </div>
            <button
              onClick={leaveQueue}
              style={{
                padding: '0.8rem 1.5rem',
                fontSize: '1rem',
                borderRadius: '0.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontWeight: 'bold',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Annuler
            </button>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}
      </style>
    </div>
  );
};

export default MatchmakingPage;



