import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useApp } from '../services/AppContext';
import { api } from '../services/api';
import SpaceBackground from '../components/SpaceBackground';
import SpaceCard from '../components/SpaceCard';
import SpaceInput from '../components/SpaceInput';
import SpaceButton from '../components/SpaceButton';
import { Shield, Key, Network, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { ChronosLogo } from '../components/ChronosLogo';
import { useRouter } from 'expo-router';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LoginScreen() {
  const {
    colors,
    urlServidor,
    tokenJwt,
    idOperador,
    nomeOperador,
    updateConfig,
    setIsLoading,
    setGlobalError,
  } = useApp();

  const router = useRouter();

  const [inputUrl, setInputUrl] = useState(urlServidor);
  const [operatorCode, setOperatorCode] = useState('');
  const [operatorPass, setOperatorPass] = useState('');
  const [pingStatus, setPingStatus] = useState<'IDLE' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Redirect to tabs if already authenticated
  useEffect(() => {
    if (tokenJwt) {
      router.replace('/(tabs)');
    }
  }, [tokenJwt]);

  useEffect(() => {
    setInputUrl(urlServidor);
  }, [urlServidor]);

  const toggleAdvanced = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAdvanced(!showAdvanced);
  };

  const testConnection = async (urlToTest: string) => {
    setPingStatus('IDLE');
    setPingLatency(null);
    const start = Date.now();
    try {
      let res;
      try {
        res = await api.get('/nos', {
          baseURL: urlToTest,
          timeout: 4000
        });
      } catch (err: any) {
        if (err.response) {
          res = err.response;
        } else {
          try {
            res = await api.get('/nosatelite', {
              baseURL: urlToTest,
              timeout: 4000
            });
          } catch (err2: any) {
            if (err2.response) {
              res = err2.response;
            } else {
              throw err2;
            }
          }
        }
      }

      const end = Date.now();
      if (res && (res.status === 200 || res.status === 201 || res.status === 401 || res.status === 403 || res.status === 405)) {
        setPingStatus('SUCCESS');
        setPingLatency(end - start);
        return true;
      }
      setPingStatus('FAILED');
      return false;
    } catch {
      setPingStatus('FAILED');
      return false;
    }
  };

  const handleSaveConnection = async () => {
    if (!inputUrl.trim()) {
      setGlobalError('A URL do servidor é obrigatória');
      return;
    }
    setLocalLoading(true);
    const isOnline = await testConnection(inputUrl);
    await updateConfig(inputUrl, tokenJwt, idOperador, nomeOperador);
    setLocalLoading(false);
    
    if (isOnline) {
      Alert.alert('Configuração Salva', 'Conectado ao gateway interplanetário com sucesso.');
    } else {
      Alert.alert(
        'Servidor Inacessível',
        'A URL foi salva, mas o servidor está offline. O aplicativo usará telemetria simulada.',
        [{ text: 'Entendido' }]
      );
    }
  };

  const handleLogin = async () => {
    if (!operatorCode.trim()) {
      setGlobalError('O código de registro do operador é obrigatório');
      return;
    }

    setIsLoading(true);
    const codeUpper = operatorCode.trim().toUpperCase();

    const payload = {
      username: codeUpper,
      Username: codeUpper,
      usuario: codeUpper,
      Usuario: codeUpper,
      password: operatorPass || 'password',
      Password: operatorPass || 'password',
      senha: operatorPass || 'password',
      Senha: operatorPass || 'password',
      codigoRegistro: codeUpper,
      codigo_registro: codeUpper,
    };

    try {
      let res;
      try {
        res = await api.post('/autenticacao/login', payload);
      } catch (err) {
        try {
          res = await api.post('/autenticacao/token', payload);
        } catch (err2) {
          try {
            res = await api.post('/auth/login', payload);
          } catch (err3) {
            try {
              res = await api.post('/Auth/token', payload);
            } catch (err4) {
              res = await api.post('/login', payload);
            }
          }
        }
      }

      if (res && res.data && (res.data.token || res.data.Token)) {
        const token = res.data.token || res.data.Token;
        const opName = res.data.operator?.nome || res.data.operatorName || 'Operador Sincronizado';
        const opIdVal = res.data.operator?.codigo_registro || res.data.operatorId || codeUpper;
        await updateConfig(urlServidor, token, opIdVal, opName);
        router.replace('/(tabs)');
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
        mockLocalLogin(codeUpper);
      }
    } catch (err) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      mockLocalLogin(codeUpper);
    } finally {
      setIsLoading(false);
    }
  };

  const mockLocalLogin = async (code: string) => {
    let name = 'Operador do Consórcio de Relays';
    if (code === 'AETHER-LUN-01') name = 'Aether Lunar Logistics';
    if (code === 'SELENE-FIN-02') name = 'Selene Financial Corp';
    if (code === 'ARTEMIS-REL-03') name = 'Artemis Relay Consortium';

    const mockToken = 'mock_jwt_' + Math.random().toString(36).substring(7);
    await updateConfig(urlServidor, mockToken, code, name);
    Alert.alert('Operador Autorizado', `Autenticado como: ${name} (Modo de Simulação).`);
    router.replace('/(tabs)');
  };

  return (
    <SpaceBackground scrollable>
      <View style={styles.headerSpacer} />
      
      {/* Brand Section */}
      <View style={styles.brandContainer}>
        <ChronosLogo layout="vertical" iconSize={64} fontSize={28} />
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Operações de Gateway Cislunar & Rede Tolerante a Falhas
        </Text>
      </View>

      {/* Main Login Card */}
      <SpaceCard borderAccent="default" style={styles.loginCard}>
        <View style={[styles.cardTitleRow, { borderBottomColor: colors.border }]}>
          <Shield color={colors.accent} size={20} style={{ marginRight: 8 }} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Autenticação de Operador</Text>
        </View>

        <Text style={[styles.helperText, { color: colors.textSecondary }]}>
          Código de acesso orbital (ex: <Text style={[styles.codeSuggest, { color: colors.accent }]}>AETHER-LUN-01</Text>, <Text style={[styles.codeSuggest, { color: colors.accent }]}>SELENE-FIN-02</Text>).
        </Text>

        <SpaceInput
          label="Código do Operador"
          placeholder="Ex: AETHER-LUN-01"
          value={operatorCode}
          onChangeText={setOperatorCode}
        />

        <SpaceInput
          label="Chave de Acesso (Senha)"
          placeholder="••••••••"
          value={operatorPass}
          onChangeText={setOperatorPass}
          secureTextEntry
        />

        <SpaceButton
          title="Autenticar & Sincronizar"
          onPress={handleLogin}
          style={styles.loginBtn}
        />
      </SpaceCard>

      {/* Advanced Connection Accordion (Apple Store Style) */}
      <SpaceCard borderAccent="default" style={styles.advancedCard}>
        <TouchableOpacity style={styles.accordionHeader} onPress={toggleAdvanced} activeOpacity={0.7}>
          <Network color={colors.accent} size={18} style={{ marginRight: 8 }} />
          <Text style={[styles.accordionTitle, { color: colors.text }]}>Configuração do Gateway (Avançado)</Text>
          {showAdvanced ? <ChevronUp color={colors.textSecondary} size={18} /> : <ChevronDown color={colors.textSecondary} size={18} />}
        </TouchableOpacity>

        {showAdvanced && (
          <View style={[styles.accordionBody, { borderTopColor: colors.border }]}>
            <SpaceInput
              label="URL do Endpoint do Servidor"
              placeholder="http://10.0.2.2:3000/api"
              value={inputUrl}
              onChangeText={setInputUrl}
              keyboardType="url"
            />

            <View style={styles.pingRow}>
              <Text style={[styles.pingLabel, { color: colors.textSecondary }]}>Status da Telemetria:</Text>
              {pingStatus === 'SUCCESS' && (
                <View style={[styles.pingBadgeSuccess, { backgroundColor: colors.green + '15' }]}>
                  <CheckCircle2 color={colors.green} size={12} style={{ marginRight: 4 }} />
                  <Text style={[styles.pingTextSuccess, { color: colors.green }]}>ONLINE ({pingLatency}ms)</Text>
                </View>
              )}
              {pingStatus === 'FAILED' && (
                <View style={[styles.pingBadgeFailed, { backgroundColor: colors.red + '15' }]}>
                  <AlertTriangle color={colors.red} size={12} style={{ marginRight: 4 }} />
                  <Text style={[styles.pingTextFailed, { color: colors.red }]}>INACESSÍVEL</Text>
                </View>
              )}
              {pingStatus === 'IDLE' && (
                <Text style={[styles.pingTextIdle, { color: colors.textSecondary }]}>Aguardando diagnóstico</Text>
              )}
            </View>

            <View style={styles.buttonGroup}>
              <SpaceButton
                title="Diagnóstico Ping"
                variant="outline"
                onPress={() => testConnection(inputUrl)}
                disabled={localLoading}
                style={styles.actionBtn}
              />
              <SpaceButton
                title="Salvar URL"
                variant="secondary"
                onPress={handleSaveConnection}
                loading={localLoading}
                style={[styles.actionBtn, { marginLeft: 12 }]}
              />
            </View>
          </View>
        )}
      </SpaceCard>
      
      <View style={styles.footerContainer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Iniciativa Lunar da NASA • Especificações DTN RFC 5050 / 9171
        </Text>
      </View>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  headerSpacer: {
    height: 48,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
    maxWidth: 280,
  },
  loginCard: {
    padding: 20,
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  helperText: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 16,
  },
  codeSuggest: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
  },
  loginBtn: {
    marginTop: 8,
  },
  advancedCard: {
    padding: 14,
    marginBottom: 32,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  accordionTitle: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  accordionBody: {
    marginTop: 16,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  pingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pingLabel: {
    fontSize: 12,
    marginRight: 8,
  },
  pingTextIdle: {
    fontSize: 12,
  },
  pingBadgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pingTextSuccess: {
    fontSize: 11,
    fontWeight: '600',
  },
  pingBadgeFailed: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pingTextFailed: {
    fontSize: 11,
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
  },
  actionBtn: {
    flex: 1,
  },
  footerContainer: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 10,
    textAlign: 'center',
  },
});
