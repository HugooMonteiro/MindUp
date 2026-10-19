import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Endereço da API (backend), descoberto automaticamente:
// - Navegador: usa o mesmo endereço da página (localhost no notebook, o IP no celular)
// - Expo Go no celular: usa o IP do notebook que está rodando o Expo
// - Para forçar outro endereço, crie frontend/.env com:
//   EXPO_PUBLIC_API_URL=http://SEU_ENDERECO:3000/api
function descobrirApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  if (Platform.OS === 'web') {
    const host = (typeof window !== 'undefined' && window.location.hostname) || 'localhost';
    return `http://${host}:3000/api`;
  }

  const hostUri = Constants.expoConfig && Constants.expoConfig.hostUri;
  const host = hostUri ? hostUri.split(':')[0] : null;
  if (host) return `http://${host}:3000/api`;

  // Emulador Android (sem hostUri): o notebook é 10.0.2.2
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';
}

const API_URL = descobrirApiUrl();

// ==========================================
// TOKEN (guardado só na memória enquanto o app está aberto)
// ==========================================

let authToken = null;

// Chamado no login (com o token) e no logout (com null)
export const setAuthToken = (token) => {
  authToken = token || null;
};

function headersJson() {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  return headers;
}

function headersAuth() {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

export const authAPI = {
  // Registrar
  register: async (name, email, password, age) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, age: parseInt(age) })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro no register:', error);
      return { error: 'Erro ao conectar com servidor' };
    }
  },

  // Login
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data && data.token) setAuthToken(data.token);
      return data;
    } catch (error) {
      console.error('Erro no login:', error);
      return { error: 'Erro ao conectar com servidor' };
    }
  },

  // Sair (esquece o token)
  logout: () => {
    setAuthToken(null);
  },

  // Recuperar senha
  recover: async (email) => {
    try {
      const response = await fetch(`${API_URL}/auth/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro no recover:', error);
      return { error: 'Erro ao conectar com servidor' };
    }
  }
};

// ==========================================
// DIARY API
// ==========================================

export const diaryAPI = {
  // Criar registro (o servidor descobre o dono pelo token)
  create: async (userId, text) => {
    try {
      const response = await fetch(`${API_URL}/diary`, {
        method: 'POST',
        headers: headersJson(),
        body: JSON.stringify({ text })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao criar diary:', error);
      return { error: 'Erro ao conectar com servidor' };
    }
  },

  // Listar registros do usuário
  getAll: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/diary/${userId}`, {
        headers: headersAuth()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar diaries:', error);
      return { error: 'Erro ao conectar com servidor' };
    }
  },

  // Deletar registro
  delete: async (id) => {
    try {
      const response = await fetch(`${API_URL}/diary/${id}`, {
        method: 'DELETE',
        headers: headersAuth()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao deletar diary:', error);
      return { error: 'Erro ao conectar com servidor' };
    }
  }
};

// ==========================================
// POSTS API
// ==========================================

export const postsAPI = {
  // Criar post (o servidor descobre autor e nome pelo token)
  create: async (userId, userName, text) => {
    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: headersJson(),
        body: JSON.stringify({ text })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao criar post:', error);
      return { error: 'Erro ao conectar com servidor' };
    }
  },

  // Listar todos os posts
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/posts`, {
        headers: headersAuth()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      return { error: 'Erro ao conectar com servidor' };
    }
  },

  // Curtir post
  like: async (postId, userId) => {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: headersJson(),
        body: JSON.stringify({})
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao curtir post:', error);
      return { error: 'Erro ao conectar com servidor' };
    }
  },

  // Adicionar comentário
  comment: async (postId, userId, userName, text) => {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/comment`, {
        method: 'POST',
        headers: headersJson(),
        body: JSON.stringify({ text })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao comentar:', error);
      return { error: 'Erro ao conectar com servidor' };
    }
  },

  // Deletar post
  delete: async (id) => {
    try {
      const response = await fetch(`${API_URL}/posts/${id}`, {
        method: 'DELETE',
        headers: headersAuth()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao deletar post:', error);
      return { error: 'Erro ao conectar com servidor' };
    }
  }
};
