import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import OnboardingTutorial from '../components/OnboardingTutorial';

interface StarterPokemon {
  id: number;
  name: string;
  type: string[];
}

interface User {
  id: number;
  username: string;
  email: string;
  elo_rating: number;
  wins: number;
  losses: number;
  starter_pokemon?: StarterPokemon;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier le token au chargement
    const token = localStorage.getItem('token');
    if (token) {
      // TODO: Implémenter la vérification du token
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleOnboardingComplete = async (selectedStarter: StarterPokemon) => {
    if (user) {
      try {
        // TODO: Appeler l'API pour sauvegarder le starter choisi
        setUser({ ...user, starter_pokemon: selectedStarter });
        setShowOnboarding(false);
        navigate('/');
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du starter:', error);
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password }) as AuthResponse;
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        if (!response.user.starter_pokemon) {
          setShowOnboarding(true);
        }
      } else {
        throw new Error('Réponse de connexion invalide');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setShowOnboarding(false);
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await authApi.register({ username, email, password }) as AuthResponse;
      console.log('Réponse d\'inscription:', response);
      
      if (response.token && response.user) {
        console.log('Inscription réussie, stockage du token et mise à jour de l\'utilisateur');
        localStorage.setItem('token', response.token);
        setUser(response.user);
        setShowOnboarding(true);
      } else {
        console.error('Réponse d\'inscription invalide:', response);
        throw new Error('Réponse d\'inscription invalide');
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
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