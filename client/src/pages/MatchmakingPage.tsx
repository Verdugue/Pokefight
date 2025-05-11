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
    <div style={{ background: '#3b4cca', minHeight: '100vh', color: '#fff', padding: 32 }}>
      <h2>Matchmaking</h2>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      {!isSearching ? (
        <button onClick={joinQueue} style={{ padding: 16, fontSize: 18, borderRadius: 8, background: '#ffde00', color: '#3b4cca', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Rechercher un match</button>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>Recherche d'un adversaire...</div>
          <button onClick={leaveQueue} style={{ padding: 12, borderRadius: 8, background: '#ffde00', color: '#3b4cca', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Annuler</button>
        </>
      )}
    </div>
  );
};

export default MatchmakingPage;



