import React, { createContext, useContext, useState, useEffect } from 'react';
import { getItem, setItem, deleteItem } from './storage';
import { subscribeToLoading, subscribeToError, subscribeToUnauthorized } from './api';
import { useRouter } from 'expo-router';

interface AppContextProps {
  urlServidor: string;
  tokenJwt: string | null;
  idOperador: string | null;
  nomeOperador: string | null;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  globalError: string | null;
  setGlobalError: (val: string | null) => void;
  updateConfig: (urlServidor: string, tokenJwt: string | null, idOperador: string | null, nomeOperador: string | null) => Promise<void>;
  logout: () => Promise<void>;
  isConfigured: boolean;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [urlServidor, setUrlServidorState] = useState<string>('http://10.0.2.2:3000/api'); // Default to Android emulator local IP, or override in Profile
  const [tokenJwt, setTokenJwtState] = useState<string | null>(null);
  const [idOperador, setIdOperadorState] = useState<string | null>(null);
  const [nomeOperador, setNomeOperadorState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const router = useRouter();

  // Load from storage on mount
  useEffect(() => {
    async function loadConfig() {
      const storedUrl = await getItem('urlServidor');
      const storedToken = await getItem('tokenJwt');
      const storedOpId = await getItem('idOperador');
      const storedOpName = await getItem('nomeOperador');

      if (storedUrl) setUrlServidorState(storedUrl);
      if (storedToken) setTokenJwtState(storedToken);
      if (storedOpId) setIdOperadorState(storedOpId);
      if (storedOpName) setNomeOperadorState(storedOpName);
    }
    loadConfig();
  }, []);

  // Subscribe to Axios interceptors
  useEffect(() => {
    const unsubLoading = subscribeToLoading((loading) => {
      setIsLoading(loading);
    });

    const unsubError = subscribeToError((error) => {
      setGlobalError(error);
    });

    const unsubUnauthorized = () => {
      logout();
      router.push('/(tabs)/profile');
    };

    const unsubAuth = subscribeToUnauthorized(unsubUnauthorized);

    return () => {
      unsubLoading();
      unsubError();
      unsubAuth();
    };
  }, [router]);

  const updateConfig = async (
    newUrl: string,
    newToken: string | null,
    newOpId: string | null,
    newOpName: string | null
  ) => {
    setUrlServidorState(newUrl);
    setTokenJwtState(newToken);
    setIdOperadorState(newOpId);
    setNomeOperadorState(newOpName);

    await setItem('urlServidor', newUrl);
    if (newToken) {
      await setItem('tokenJwt', newToken);
    } else {
      await deleteItem('tokenJwt');
    }
    if (newOpId) {
      await setItem('idOperador', newOpId);
    } else {
      await deleteItem('idOperador');
    }
    if (newOpName) {
      await setItem('nomeOperador', newOpName);
    } else {
      await deleteItem('nomeOperador');
    }
  };

  const logout = async () => {
    setTokenJwtState(null);
    setIdOperadorState(null);
    setNomeOperadorState(null);
    await deleteItem('tokenJwt');
    await deleteItem('idOperador');
    await deleteItem('nomeOperador');
  };

  const isConfigured = !!urlServidor;

  return (
    <AppContext.Provider
      value={{
        urlServidor,
        tokenJwt,
        idOperador,
        nomeOperador,
        isLoading,
        setIsLoading,
        globalError,
        setGlobalError,
        updateConfig,
        logout,
        isConfigured,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
