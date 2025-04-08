import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  elo_rating: number;
  wins: number;
  losses: number;
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
  const [shouldRedirectToTutorial, setShouldRedirectToTutorial] = useState(false);
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

  // Effet pour gérer la redirection vers le tutoriel
  useEffect(() => {
    if (user && shouldRedirectToTutorial) {
      console.log('Redirection vers le tutoriel après inscription');
      setShouldRedirectToTutorial(false);
      navigate('/tutorial');
    }
  }, [user, shouldRedirectToTutorial, navigate]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
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
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await authApi.register({ username, email, password });
      console.log('Réponse d\'inscription:', response);
      
      if (response.token && response.user) {
        console.log('Inscription réussie, stockage du token et mise à jour de l\'utilisateur');
        localStorage.setItem('token', response.token);
        setUser(response.user);
        setShouldRedirectToTutorial(true);
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
    </AuthContext.Provider>
  );
};

export default AuthContext; 