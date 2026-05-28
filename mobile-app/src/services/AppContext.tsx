import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { getItem, setItem, deleteItem } from './storage';
import { subscribeToLoading, subscribeToError, subscribeToUnauthorized } from './api';
import { useRouter } from 'expo-router';

export const lightTheme = {
  background: '#F5F5F7', // Apple Soft Warm Off-White
  cardBackground: '#FFFFFF', // Apple Card Light
  inputBackground: '#F0F0F2', // Soft System Input Light
  border: 'rgba(0, 0, 0, 0.06)', // Delicate Border Light
  text: '#1C1C1E', // Apple Soft Black
  textSecondary: '#6E6E73', // Apple Secondary text
  textTertiary: '#AEAEB2', // iOS Tertiary text
  accent: '#0071E3', // Apple Premium Product Blue
  separator: '#E5E5EA',
  green: '#24A044', // Warm Green
  orange: '#E36C09', // Soft Earthy Orange
  red: '#D9383A', // Rich Red
  purple: '#862CD2', // Royal Purple
  tint: '#0071E3',
  statusBannerBg: '#E36C0912',
  statusBannerBorder: '#E36C0925',
};

export const darkTheme = {
  background: '#090B11', // Deep Space Obsidian (Rich Charcoal Blue)
  cardBackground: '#131722', // Space Card Dark
  inputBackground: '#1B2030', // Space Input Dark
  border: 'rgba(255, 255, 255, 0.06)', // Delicate Border Dark
  text: '#F5F5F7', // Soft White
  textSecondary: '#8E95A5', // Soft grayish-blue for relaxation
  textTertiary: '#4E5569', // Darker gray-blue
  accent: '#3897FF', // Glowing Space Blue
  separator: '#222736',
  green: '#30D158', // iOS Dark Green
  orange: '#FF9F0A', // iOS Dark Orange
  red: '#FF453A', // iOS Dark Red
  purple: '#BF5AF2', // iOS Dark Purple
  tint: '#3897FF',
  statusBannerBg: '#FF9F0A12',
  statusBannerBorder: '#FF9F0A25',
};

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
  carregandoStorage: boolean;
  tema: 'system' | 'light' | 'dark';
  temaAtivo: 'light' | 'dark';
  colors: typeof darkTheme;
  setTema: (tema: 'system' | 'light' | 'dark') => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [urlServidor, setUrlServidorState] = useState<string>('http://10.0.2.2:3000/api'); // Default to Android emulator local IP, or override in Profile
  const [tokenJwt, setTokenJwtState] = useState<string | null>(null);
  const [idOperador, setIdOperadorState] = useState<string | null>(null);
  const [nomeOperador, setNomeOperadorState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [carregandoStorage, setCarregandoStorage] = useState<boolean>(true);
  
  // Theme States
  const [tema, setTemaState] = useState<'system' | 'light' | 'dark'>('system');
  const systemColorScheme = useColorScheme();
  const router = useRouter();

  // Load from storage on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const storedUrl = await getItem('urlServidor');
        const storedToken = await getItem('tokenJwt');
        const storedOpId = await getItem('idOperador');
        const storedOpName = await getItem('nomeOperador');
        const storedTema = await getItem('temaSelecionado');

        if (storedUrl) setUrlServidorState(storedUrl);
        if (storedToken) setTokenJwtState(storedToken);
        if (storedOpId) setIdOperadorState(storedOpId);
        if (storedOpName) setNomeOperadorState(storedOpName);
        if (storedTema === 'light' || storedTema === 'dark' || storedTema === 'system') {
          setTemaState(storedTema);
        }
      } catch (e) {
        // Ignorar erros de leitura de storage local na inicialização
      } finally {
        setCarregandoStorage(false);
      }
    }
    loadConfig();
  }, []);

  // Active theme and color computations
  const temaAtivo = tema === 'system' ? (systemColorScheme || 'dark') : tema;
  const colors = temaAtivo === 'light' ? lightTheme : darkTheme;

  const setTema = async (novoTema: 'system' | 'light' | 'dark') => {
    setTemaState(novoTema);
    await setItem('temaSelecionado', novoTema);
  };

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
      router.replace('/login'); // Redireciona para a nova tela de login independente
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
    router.replace('/login');
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
        carregandoStorage,
        tema,
        temaAtivo,
        colors,
        setTema,
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
