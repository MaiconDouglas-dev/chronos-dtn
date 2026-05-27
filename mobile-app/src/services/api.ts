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
    const serverUrl = await getItem('serverUrl');
    if (serverUrl) {
      config.baseURL = serverUrl;
    } else {
      config.baseURL = 'http://localhost:3000/api'; // Default simulation API endpoint
    }

    const token = await getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    updateLoading(true);
    triggerError(null); // Clear previous errors
    return config;
  },
  (error) => {
    updateLoading(false);
    triggerError(error.message || 'Request Error');
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
      const message = error.response.data?.message || error.response.data?.error || `Error ${status}: ${error.response.statusText}`;

      if (status === 401) {
        triggerUnauthorized();
        triggerError('Unauthorized - Session Expired or Invalid Token');
      } else {
        triggerError(message);
      }
    } else if (error.request) {
      triggerError('Network Error - No response received from server. Verify connection settings.');
    } else {
      triggerError(error.message || 'Error occurred');
    }

    return Promise.reject(error);
  }
);
