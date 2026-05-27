import axios from 'axios';
import { getItem } from './storage';

export const api = axios.create();

let loadingCount = 0;
let loadingListeners: ((loading: boolean) => void)[] = [];
let errorListeners: ((message: string | null) => void)[] = [];
let unauthorizedListeners: (() => void)[] = [];

export function subscribeToLoading(listener: (loading: boolean) => void) {
  loadingListeners.push(listener);
  return () => {
    loadingListeners = loadingListeners.filter((l) => l !== listener);
  };
}

export function subscribeToError(listener: (message: string | null) => void) {
  errorListeners.push(listener);
  return () => {
    errorListeners = errorListeners.filter((l) => l !== listener);
  };
}

export function subscribeToUnauthorized(listener: () => void) {
  unauthorizedListeners.push(listener);
  return () => {
    unauthorizedListeners = unauthorizedListeners.filter((l) => l !== listener);
  };
}

function updateLoading(isLoading: boolean) {
  if (isLoading) {
    loadingCount++;
  } else {
    loadingCount = Math.max(0, loadingCount - 1);
  }
  const status = loadingCount > 0;
  loadingListeners.forEach((listener) => listener(status));
}

export function triggerError(msg: string | null) {
  errorListeners.forEach((listener) => listener(msg));
}

function triggerUnauthorized() {
  unauthorizedListeners.forEach((listener) => listener());
}

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const urlServidor = await getItem('urlServidor');
    if (urlServidor) {
      config.baseURL = urlServidor;
    } else {
      config.baseURL = 'http://localhost:3000/api'; // Default simulation API endpoint
    }

    const token = await getItem('tokenJwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    updateLoading(true);
    triggerError(null); // Clear previous errors
    return config;
  },
  (error) => {
    updateLoading(false);
    triggerError(error.message || 'Erro na requisição');
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    updateLoading(false);
    return response;
  },
  async (error) => {
    updateLoading(false);

    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error || `Erro ${status}: ${error.response.statusText || 'Não Autorizado / Acesso Proibido'}`;

      if (status === 401) {
        triggerUnauthorized();
        triggerError('Não autorizado - Sessão Expirada ou Token Inválido');
      } else {
        triggerError(message);
      }
    } else if (error.request) {
      triggerError('Erro de Rede - Nenhuma resposta recebida do servidor. Verifique as configurações de conexão.');
    } else {
      triggerError(error.message || 'Ocorreu um erro');
    }

    return Promise.reject(error);
  }
);
