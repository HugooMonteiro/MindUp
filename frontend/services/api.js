// IMPORTANTE: Mude este endereço conforme seu caso:
// - Testando no navegador: use 'http://localhost:3000/api'
// - Testando no celular físico: use 'http://SEU_IP:3000/api' (ex: http://192.168.1.5:3000/api)
// - Testando no emulador Android: use 'http://10.0.2.2:3000/api'
const API_URL = 'http://localhost:3000/api';

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
      return data;
    } catch (error) {
      console.error('Erro no login:', error);
      return { error: 'Erro ao conectar com servidor' };
    }
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
  // Criar registro
  create: async (userId, text) => {
    try {
      const response = await fetch(`${API_URL}/diary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, text })
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
      const response = await fetch(`${API_URL}/diary/${userId}`);
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
        method: 'DELETE'
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
  // Criar post
  create: async (userId, userName, text) => {
    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userName, text })
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
      const response = await fetch(`${API_URL}/posts`);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userName, text })
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
        method: 'DELETE'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao deletar post:', error);
      return { error: 'Erro ao conectar com servidor' };
    }
  }
};