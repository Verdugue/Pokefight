import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { API_URL } from '../services/api';
import OnboardingTutorial from '../components/OnboardingTutorial';
import { StarterPokemon } from '../types/pokemon';

interface User {
  id: number;
  username: string;
  email: string;
  elo_rating: number;
  wins: number;
  losses: number;
  starter_pokemon?: StarterPokemon;
  avatar?: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<void>;
  updateAvatar: (avatarUrl: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
  login: async () => {},
  logout: () => {},
  register: async () => {},
  updateAvatar: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchUserInfo(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const fetchUserInfo = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        // Ne pas afficher le tutoriel lors de la connexion normale
        setShowOnboarding(false);
      } else {
        // Si la requête échoue, on déconnecte l'utilisateur
        logout();
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des informations utilisateur:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async (selectedStarter: StarterPokemon) => {
    try {
      console.log('Starter reçu:', JSON.stringify(selectedStarter, null, 2));
      
      const requestData = {
        pokemon_id: selectedStarter.id,
        isStarter: true
      };

      console.log('Données envoyées à l\'API:', JSON.stringify(requestData, null, 2));
      
      const response = await fetch(`${API_URL}/api/pokemon/starter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('Réponse brute du serveur:', JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        data
      }, null, 2));

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erreur lors de la sélection du starter');
      }

      // Mettre à jour les informations de l'utilisateur avec le starter
      if (user) {
        const updatedUser = {
          ...user,
          starter_pokemon: {
            ...selectedStarter,
            sprite_url: selectedStarter.image || selectedStarter.sprite_url,
            type: Array.isArray(selectedStarter.type) ? selectedStarter.type.join(',') : selectedStarter.type,
            level: data.pokemon?.level || 5,
            hp: data.pokemon?.hp || 50,
            max_hp: data.pokemon?.max_hp || 50
          }
        };
        console.log('Mise à jour de l\'utilisateur avec:', JSON.stringify(updatedUser, null, 2));
        setUser(updatedUser);
      }

      setShowOnboarding(false);
      navigate('/team');
    } catch (error) {
      console.error('Erreur détaillée lors de la sélection du starter:', error);
      if (error instanceof Error) {
        alert(`Erreur: ${error.message}`);
      } else {
        alert('Une erreur est survenue lors de la sélection du starter. Veuillez réessayer.');
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Identifiants invalides');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
      navigate('/team'); // Rediriger directement vers l'équipe après la connexion
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'inscription');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setShowOnboarding(true); // Afficher le tutoriel uniquement après l'inscription
      navigate('/'); // La redirection vers l'équipe se fera après la sélection du starter
    } catch (error) {
      throw error;
    }
  };

  const updateAvatar = (avatarUrl: string) => {
    if (user) {
      setUser({ ...user, avatar: avatarUrl });
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    token,
    login,
    logout,
    register,
    updateAvatar,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <OnboardingTutorial
        open={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </AuthContext.Provider>
  );
};

export default AuthContext; 