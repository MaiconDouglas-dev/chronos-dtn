import React, { createContext, useContext, useState, useEffect } from 'react';
import { getItem, setItem, deleteItem } from './storage';
import { subscribeToLoading, subscribeToError, subscribeToUnauthorized } from './api';
import { useRouter } from 'expo-router';

interface AppContextProps {
  serverUrl: string;
  jwtToken: string | null;
  operatorId: string | null;
  operatorName: string | null;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  globalError: string | null;
  setGlobalError: (val: string | null) => void;
  updateConfig: (serverUrl: string, jwtToken: string | null, operatorId: string | null, operatorName: string | null) => Promise<void>;
  logout: () => Promise<void>;
  isConfigured: boolean;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [serverUrl, setServerUrlState] = useState<string>('http://10.0.2.2:3000/api'); // Default to Android emulator local IP, or override in Profile
  const [jwtToken, setJwtTokenState] = useState<string | null>(null);
  const [operatorId, setOperatorIdState] = useState<string | null>(null);
  const [operatorName, setOperatorNameState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const router = useRouter();

  // Load from storage on mount
  useEffect(() => {
    async function loadConfig() {
      const storedUrl = await getItem('serverUrl');
      const storedToken = await getItem('jwtToken');
      const storedOpId = await getItem('operatorId');
      const storedOpName = await getItem('operatorName');

      if (storedUrl) setServerUrlState(storedUrl);
      if (storedToken) setJwtTokenState(storedToken);
      if (storedOpId) setOperatorIdState(storedOpId);
      if (storedOpName) setOperatorNameState(storedOpName);
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
    setServerUrlState(newUrl);
    setJwtTokenState(newToken);
    setOperatorIdState(newOpId);
    setOperatorNameState(newOpName);

    await setItem('serverUrl', newUrl);
    if (newToken) {
      await setItem('jwtToken', newToken);
    } else {
      await deleteItem('jwtToken');
    }
    if (newOpId) {
      await setItem('operatorId', newOpId);
    } else {
      await deleteItem('operatorId');
    }
    if (newOpName) {
      await setItem('operatorName', newOpName);
    } else {
      await deleteItem('operatorName');
    }
  };

  const logout = async () => {
    setJwtTokenState(null);
    setOperatorIdState(null);
    setOperatorNameState(null);
    await deleteItem('jwtToken');
    await deleteItem('operatorId');
    await deleteItem('operatorName');
  };

  const isConfigured = !!serverUrl;

  return (
    <AppContext.Provider
      value={{
        serverUrl,
        jwtToken,
        operatorId,
        operatorName,
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
