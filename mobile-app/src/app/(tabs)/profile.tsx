import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useApp } from '../../services/AppContext';
import { api } from '../../services/api';
import SpaceBackground from '../../components/SpaceBackground';
import SpaceCard from '../../components/SpaceCard';
import SpaceInput from '../../components/SpaceInput';
import SpaceButton from '../../components/SpaceButton';
import Header from '../../components/Header';
import { Shield, Key, Network, ShieldCheck, LogOut, CheckCircle2, AlertTriangle } from 'lucide-react-native';

export default function Profile() {
  const {
    urlServidor,
    tokenJwt,
    idOperador,
    nomeOperador,
    updateConfig,
    logout,
    setIsLoading,
    setGlobalError,
  } = useApp();

  const [inputUrl, setInputUrl] = useState(urlServidor);
  const [operatorCode, setOperatorCode] = useState('');
  const [operatorPass, setOperatorPass] = useState('');
  const [pingStatus, setPingStatus] = useState<'IDLE' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  // Sync inputs with context updates
  useEffect(() => {
    setInputUrl(urlServidor);
  }, [urlServidor]);

  const testConnection = async (urlToTest: string) => {
    setPingStatus('IDLE');
    setPingLatency(null);
    const start = Date.now();
    try {
      // Try Java `/api/nos` endpoint first, then C# `/api/nosatelite`
      let res;
      try {
        res = await api.get('/nos', {
          baseURL: urlToTest,
          timeout: 4000
        });
      } catch (err) {
        res = await api.get('/nosatelite', {
          baseURL: urlToTest,
          timeout: 4000
        });
      }

      const end = Date.now();
      if (res && (res.status === 200 || res.status === 201)) {
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

    // Payload supports Java (username/password), C# (Username/Password), and custom (codigo_registro/codigoRegistro)
    const payload = {
      username: codeUpper,
      Username: codeUpper,
      password: operatorPass || 'password',
      Password: operatorPass || 'password',
      codigoRegistro: codeUpper,
      codigo_registro: codeUpper,
    };

    try {
      // Try Java endpoint first `/api/auth/login`, then C# `/api/auth/token` (or `/api/Auth/token`)
      let res;
      try {
        res = await api.post('/auth/login', payload);
      } catch (err) {
        try {
          res = await api.post('/Auth/token', payload);
        } catch (err2) {
          res = await api.post('/login', payload);
        }
      }

      if (res && res.data && (res.data.token || res.data.Token)) {
        const token = res.data.token || res.data.Token;
        const operatorName = res.data.operator?.nome || res.data.operatorName || 'Operador Sincronizado';
        const operatorIdVal = res.data.operator?.codigo_registro || res.data.operatorId || codeUpper;
        await updateConfig(urlServidor, token, operatorIdVal, operatorName);
        setOperatorCode('');
        setOperatorPass('');
      } else {
        // Mock authorization for seed codes
        await new Promise((resolve) => setTimeout(resolve, 800));
        mockLocalLogin(codeUpper);
      }
    } catch (err) {
      // Mock local authorization if server fails
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
    setOperatorCode('');
    setOperatorPass('');
    Alert.alert('Operador Autorizado', `Autenticado como: ${name} (Modo de Simulação).`);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await logout();
    setIsLoading(false);
  };

  return (
    <SpaceBackground scrollable>
      <Header />

      {/* Operator Session status card */}
      {tokenJwt ? (
        <SpaceCard borderAccent="green" style={styles.sessionCard}>
          <View style={styles.cardHeader}>
            <ShieldCheck color="#00F5A0" size={24} style={{ marginRight: 10 }} />
            <View>
              <Text style={styles.operatorTitle}>Sessão de Operador Autorizada</Text>
              <Text style={styles.operatorSubtitle}>Link Integrado NASA/ESA</Text>
            </View>
          </View>

          <View style={styles.operatorDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nome do Operador:</Text>
              <Text style={styles.detailValue}>{nomeOperador}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ID de Registro:</Text>
              <Text style={styles.detailCode}>{idOperador}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status do Token:</Text>
              <View style={styles.badgeActive}>
                <Text style={styles.badgeTextActive}>JWT ATIVO</Text>
              </View>
            </View>
          </View>

          <SpaceButton
            title="Revogar Autorizações"
            variant="danger"
            onPress={handleLogout}
            style={styles.actionBtn}
          />
        </SpaceCard>
      ) : (
        <SpaceCard borderAccent="purple" style={styles.sessionCard}>
          <View style={styles.cardHeader}>
            <Shield color="#8A57FF" size={24} style={{ marginRight: 10 }} />
            <View>
              <Text style={styles.operatorTitle}>Login do Operador</Text>
              <Text style={styles.operatorSubtitle}>Insira as Credenciais Aeroespaciais</Text>
            </View>
          </View>

          <Text style={styles.helperText}>
            Para testes offline, insira um código como <Text style={styles.codeSuggest}>AETHER-LUN-01</Text>, <Text style={styles.codeSuggest}>SELENE-FIN-02</Text> ou <Text style={styles.codeSuggest}>ARTEMIS-REL-03</Text>.
          </Text>

          <SpaceInput
            label="Código de Registro"
            placeholder="Ex: AETHER-LUN-01"
            value={operatorCode}
            onChangeText={setOperatorCode}
          />

          <SpaceInput
            label="Chave de Autorização (Senha)"
            placeholder="••••••••"
            value={operatorPass}
            onChangeText={setOperatorPass}
            secureTextEntry
          />

          <SpaceButton
            title="Autenticar & Sincronizar"
            onPress={handleLogin}
            style={styles.actionBtn}
          />
        </SpaceCard>
      )}

      {/* Gateway Connection Settings card */}
      <SpaceCard borderAccent="cyan" style={styles.connectionCard}>
        <View style={styles.cardHeader}>
          <Network color="#00F2FE" size={24} style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.operatorTitle}>Gateway Interplanetário</Text>
            <Text style={styles.operatorSubtitle}>Configurar Endpoints de Destino do Nó DTN</Text>
          </View>
        </View>

        <SpaceInput
          label="URL do Endpoint do Servidor"
          placeholder="http://10.0.2.2:3000/api"
          value={inputUrl}
          onChangeText={setInputUrl}
          keyboardType="url"
        />

        {/* Diagnostic ping indicators */}
        <View style={styles.pingIndicatorRow}>
          <Text style={styles.pingLabel}>Telemetria de Conexão:</Text>
          {pingStatus === 'SUCCESS' && (
            <View style={styles.pingBadgeSuccess}>
              <CheckCircle2 color="#00F5A0" size={12} style={{ marginRight: 4 }} />
              <Text style={styles.pingTextSuccess}>ONLINE ({pingLatency}ms)</Text>
            </View>
          )}
          {pingStatus === 'FAILED' && (
            <View style={styles.pingBadgeFailed}>
              <AlertTriangle color="#FF007A" size={12} style={{ marginRight: 4 }} />
              <Text style={styles.pingTextFailed}>INACESSÍVEL</Text>
            </View>
          )}
          {pingStatus === 'IDLE' && (
            <Text style={styles.pingTextIdle}>Aguardando diagnóstico</Text>
          )}
        </View>

        <View style={styles.buttonGroup}>
          <SpaceButton
            title="Diagnóstico Ping"
            variant="outline"
            onPress={() => testConnection(inputUrl)}
            disabled={localLoading}
            style={styles.pingBtn}
          />
          <SpaceButton
            title="Salvar & Conectar"
            variant="secondary"
            onPress={handleSaveConnection}
            loading={localLoading}
            style={styles.saveBtn}
          />
        </View>
      </SpaceCard>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  sessionCard: {
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#232A46',
    paddingBottom: 12,
  },
  operatorTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  operatorSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
  },
  helperText: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 16,
  },
  codeSuggest: {
    color: '#00F2FE',
    fontFamily: 'monospace',
    fontSize: 11,
  },
  operatorDetails: {
    backgroundColor: '#0A0D1A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#181E35',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    color: '#64748B',
    fontSize: 12,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  detailCode: {
    color: '#8A57FF',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  badgeActive: {
    backgroundColor: '#05C18020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#05C18040',
  },
  badgeTextActive: {
    color: '#00F5A0',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionBtn: {
    width: '100%',
  },
  connectionCard: {
    padding: 16,
  },
  pingIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pingLabel: {
    color: '#64748B',
    fontSize: 12,
    marginRight: 8,
  },
  pingTextIdle: {
    color: '#94A3B8',
    fontSize: 12,
  },
  pingBadgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#05C18015',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pingTextSuccess: {
    color: '#00F5A0',
    fontSize: 11,
    fontWeight: '600',
  },
  pingBadgeFailed: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF007A15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pingTextFailed: {
    color: '#FF007A',
    fontSize: 11,
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pingBtn: {
    flex: 1,
    marginRight: 8,
  },
  saveBtn: {
    flex: 1,
    marginLeft: 8,
  },
});
