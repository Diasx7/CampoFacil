import axios from 'axios';

// endereco do backend
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// toda requisicao ja manda o token automaticamente se estiver salvo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;