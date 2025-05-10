export const API_URL = 'http://localhost:3000';

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  elo_rating: number;
  wins: number;
  losses: number;
}

interface ApiResponse {
  message?: string;
  token?: string;
  user?: User;
}

export const authApi = {
  register: async (data: RegisterData): Promise<ApiResponse> => {
    console.log('🚀 Tentative d\'inscription avec:', { ...data, password: '***' });
    try {
      console.log('📡 Envoi de la requête à:', `${API_URL}/api/auth/register`);
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('📥 Réponse reçue:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      const result = await response.json();
      console.log('📦 Données reçues:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de l\'inscription');
      }

      return result;
    } catch (error) {
      console.error('❌ Erreur:', error);
      throw error;
    }
  },

  login: async (data: LoginData): Promise<ApiResponse> => {
    console.log('🔑 Tentative de connexion avec:', { ...data, password: '***' });
    try {
      console.log('📡 Envoi de la requête à:', `${API_URL}/api/auth/login`);
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('📥 Réponse reçue:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      const result = await response.json();
      console.log('📦 Données reçues:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de la connexion');
      }

      return result;
    } catch (error) {
      console.error('❌ Erreur:', error);
      throw error;
    }
  },
}; 