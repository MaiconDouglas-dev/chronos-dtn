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
    serverUrl,
    jwtToken,
    operatorId,
    operatorName,
    updateConfig,
    logout,
    setIsLoading,
    setGlobalError,
  } = useApp();

  const [inputUrl, setInputUrl] = useState(serverUrl);
  const [operatorCode, setOperatorCode] = useState('');
  const [operatorPass, setOperatorPass] = useState('');
  const [pingStatus, setPingStatus] = useState<'IDLE' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  // Sync inputs with context updates
  useEffect(() => {
    setInputUrl(serverUrl);
  }, [serverUrl]);

  const testConnection = async (urlToTest: string) => {
    setPingStatus('IDLE');
    setPingLatency(null);
    const start = Date.now();
    try {
      // Direct call bypassing default config to test custom url
      const res = await api.get('/nodes', {
        baseURL: urlToTest,
        timeout: 5000
      });
      const end = Date.now();
      if (res.status === 200) {
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
      setGlobalError('Server URL is required');
      return;
    }
    setLocalLoading(true);
    const isOnline = await testConnection(inputUrl);
    await updateConfig(inputUrl, jwtToken, operatorId, operatorName);
    setLocalLoading(false);
    
    if (isOnline) {
      Alert.alert('Configuration Saved', 'Connected to the interplanetary gateway successfully.');
    } else {
      Alert.alert(
        'Server Unreachable',
        'Saved the URL, but the server is offline. Application will fall back to simulated telemetry.',
        [{ text: 'Acknowledge' }]
      );
    }
  };

  const handleLogin = async () => {
    if (!operatorCode.trim()) {
      setGlobalError('Operator registration code is required');
      return;
    }

    setIsLoading(true);
    const payload = {
      codigo_registro: operatorCode.trim().toUpperCase(),
    };

    try {
      const res = await api.post('/login', payload);
      if (res && res.data && res.data.token) {
        const { token, operator } = res.data;
        await updateConfig(serverUrl, token, operator.codigo_registro, operator.nome);
        setOperatorCode('');
        setOperatorPass('');
      } else {
        // Mock authorization for seed codes
        await new Promise((resolve) => setTimeout(resolve, 800));
        mockLocalLogin(payload.codigo_registro);
      }
    } catch (err) {
      // Mock local authorization if server fails
      await new Promise((resolve) => setTimeout(resolve, 800));
      mockLocalLogin(payload.codigo_registro);
    } finally {
      setIsLoading(false);
    }
  };

  const mockLocalLogin = async (code: string) => {
    let name = 'Relay Consortium Operator';
    if (code === 'AETHER-LUN-01') name = 'Aether Lunar Logistics';
    if (code === 'SELENE-FIN-02') name = 'Selene Financial Corp';
    if (code === 'ARTEMIS-REL-03') name = 'Artemis Relay Consortium';

    const mockToken = 'mock_jwt_' + Math.random().toString(36).substring(7);
    await updateConfig(serverUrl, mockToken, code, name);
    setOperatorCode('');
    setOperatorPass('');
    Alert.alert('Operator Authorized', `Logged in as: ${name} (Simulation Mode).`);
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
      {jwtToken ? (
        <SpaceCard borderAccent="green" style={styles.sessionCard}>
          <View style={styles.cardHeader}>
            <ShieldCheck color="#00F5A0" size={24} style={{ marginRight: 10 }} />
            <View>
              <Text style={styles.operatorTitle}>Authorized Operator Session</Text>
              <Text style={styles.operatorSubtitle}>NASA/ESA Integrated Link</Text>
            </View>
          </View>

          <View style={styles.operatorDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Operator Name:</Text>
              <Text style={styles.detailValue}>{operatorName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Registration ID:</Text>
              <Text style={styles.detailCode}>{operatorId}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Token Status:</Text>
              <View style={styles.badgeActive}>
                <Text style={styles.badgeTextActive}>ACTIVE JWT</Text>
              </View>
            </View>
          </View>

          <SpaceButton
            title="Revoke Authorizations"
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
              <Text style={styles.operatorTitle}>Operator Login</Text>
              <Text style={styles.operatorSubtitle}>Input Aerospace Credentials</Text>
            </View>
          </View>

          <Text style={styles.helperText}>
            For offline testing, enter a code like <Text style={styles.codeSuggest}>AETHER-LUN-01</Text>, <Text style={styles.codeSuggest}>SELENE-FIN-02</Text> or <Text style={styles.codeSuggest}>ARTEMIS-REL-03</Text>.
          </Text>

          <SpaceInput
            label="Registration Code"
            placeholder="e.g. AETHER-LUN-01"
            value={operatorCode}
            onChangeText={setOperatorCode}
          />

          <SpaceInput
            label="Authorization Key (Password)"
            placeholder="••••••••"
            value={operatorPass}
            onChangeText={setOperatorPass}
            secureTextEntry
          />

          <SpaceButton
            title="Authenticate & Synchronize"
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
            <Text style={styles.operatorTitle}>Interplanetary Gateway</Text>
            <Text style={styles.operatorSubtitle}>Configure DTN Node Target Endpoints</Text>
          </View>
        </View>

        <SpaceInput
          label="Server Endpoint URL"
          placeholder="http://10.0.2.2:3000/api"
          value={inputUrl}
          onChangeText={setInputUrl}
          keyboardType="url"
        />

        {/* Diagnostic ping indicators */}
        <View style={styles.pingIndicatorRow}>
          <Text style={styles.pingLabel}>Link Telemetry Status:</Text>
          {pingStatus === 'SUCCESS' && (
            <View style={styles.pingBadgeSuccess}>
              <CheckCircle2 color="#00F5A0" size={12} style={{ marginRight: 4 }} />
              <Text style={styles.pingTextSuccess}>ONLINE ({pingLatency}ms)</Text>
            </View>
          )}
          {pingStatus === 'FAILED' && (
            <View style={styles.pingBadgeFailed}>
              <AlertTriangle color="#FF007A" size={12} style={{ marginRight: 4 }} />
              <Text style={styles.pingTextFailed}>UNREACHABLE</Text>
            </View>
          )}
          {pingStatus === 'IDLE' && (
            <Text style={styles.pingTextIdle}>Pending diagnostic check</Text>
          )}
        </View>

        <View style={styles.buttonGroup}>
          <SpaceButton
            title="Ping Diagnostic"
            variant="outline"
            onPress={() => testConnection(inputUrl)}
            disabled={localLoading}
            style={styles.pingBtn}
          />
          <SpaceButton
            title="Save & Connect"
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
