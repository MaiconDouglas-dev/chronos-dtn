import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { useApp } from '../../services/AppContext';
import { api } from '../../services/api';
import SpaceBackground from '../../components/SpaceBackground';
import SpaceCard from '../../components/SpaceCard';
import SpaceInput from '../../components/SpaceInput';
import SpaceButton from '../../components/SpaceButton';
import Header from '../../components/Header';
import { Shield, Key, Network, ShieldCheck, LogOut, CheckCircle2, AlertTriangle, Moon, Orbit, Sun, Monitor } from 'lucide-react-native';

export default function Profile() {
  const {
    colors,
    tema,
    temaAtivo,
    setTema,
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

  useEffect(() => {
    setInputUrl(urlServidor);
  }, [urlServidor]);

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
        const operatorName = res.data.operator?.nome || res.data.operatorName || 'Operador Sincronizado';
        const operatorIdVal = res.data.operator?.codigo_registro || res.data.operatorId || codeUpper;
        await updateConfig(urlServidor, token, operatorIdVal, operatorName);
        setOperatorCode('');
        setOperatorPass('');
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

  const styles = getStyles(colors, temaAtivo);

  return (
    <SpaceBackground scrollable>
      <Header />

      {/* Operator Session status card */}
      {tokenJwt ? (
        <SpaceCard style={styles.badgeContainer}>
          <View style={styles.badgeHeader}>
            <Orbit color={colors.accent} size={16} style={{ marginRight: 6 }} />
            <Text style={styles.badgeOrgText}>CISLUNAR COMMERCE CONSORTIUM</Text>
          </View>

          <View style={styles.badgeBody}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarRingOuter}>
                <View style={styles.avatarRingInner}>
                  <Moon color={colors.accent} size={32} />
                </View>
              </View>
              <View style={styles.clearanceBadge}>
                <Text style={styles.clearanceText}>ALFA-01</Text>
              </View>
            </View>

            <View style={styles.badgeInfoCol}>
              <View style={styles.infoField}>
                <Text style={styles.infoFieldLabel}>OPERADOR AUTORIZADO</Text>
                <Text style={styles.infoFieldValName}>{nomeOperador}</Text>
              </View>

              <View style={styles.infoFieldRow}>
                <View style={styles.infoFieldHalf}>
                  <Text style={styles.infoFieldLabel}>CÓDIGO ID</Text>
                  <Text style={styles.infoFieldValCode}>{idOperador}</Text>
                </View>
                <View style={styles.infoFieldHalf}>
                  <Text style={styles.infoFieldLabel}>LINK GATEWAY</Text>
                  <Text style={styles.infoFieldVal} numberOfLines={1}>{urlServidor ? urlServidor.replace('http://', '').replace('/api', '') : 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.infoFieldRow}>
                <View style={styles.infoFieldHalf}>
                  <Text style={styles.infoFieldLabel}>SETOR DE MISSÃO</Text>
                  <Text style={styles.infoFieldVal}>ROTEAMENTO DTN</Text>
                </View>
                <View style={styles.infoFieldHalf}>
                  <Text style={styles.infoFieldLabel}>SECURITY HASH</Text>
                  <Text style={styles.infoFieldValHash}>
                    {tokenJwt ? tokenJwt.substring(0, 10).toUpperCase() : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.badgeFooter}>
            <View style={styles.badgeStatusPill}>
              <ShieldCheck color={colors.green} size={12} style={{ marginRight: 4 }} />
              <Text style={styles.badgeStatusText}>CONEXÃO ATIVA</Text>
            </View>
            
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <LogOut color={colors.red} size={14} style={{ marginRight: 6 }} />
              <Text style={styles.logoutBtnText}>Encerrar Turno</Text>
            </TouchableOpacity>
          </View>
        </SpaceCard>
      ) : (
        <SpaceCard style={styles.sessionCard}>
          <View style={styles.cardHeader}>
            <Shield color={colors.accent} size={24} style={{ marginRight: 10 }} />
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

      {/* APARÊNCIA / SELETOR DE TEMA SEGMENTADO (Apple Settings Style) */}
      <SpaceCard style={styles.appearanceCard}>
        <View style={styles.cardHeader}>
          <Moon color={colors.accent} size={24} style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.operatorTitle}>Tema Visual</Text>
            <Text style={styles.operatorSubtitle}>Personalizar a Aparência do Aplicativo</Text>
          </View>
        </View>

        <View style={styles.segmentedContainer}>
          <TouchableOpacity 
            style={[styles.segmentBtn, tema === 'light' && styles.segmentBtnActive]} 
            onPress={() => setTema('light')}
          >
            <Sun color={tema === 'light' ? colors.accent : colors.textSecondary} size={16} style={{ marginBottom: 4 }} />
            <Text style={[styles.segmentText, tema === 'light' && styles.segmentTextActive]}>Claro</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.segmentBtn, tema === 'dark' && styles.segmentBtnActive]} 
            onPress={() => setTema('dark')}
          >
            <Moon color={tema === 'dark' ? colors.accent : colors.textSecondary} size={16} style={{ marginBottom: 4 }} />
            <Text style={[styles.segmentText, tema === 'dark' && styles.segmentTextActive]}>Escuro</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.segmentBtn, tema === 'system' && styles.segmentBtnActive]} 
            onPress={() => setTema('system')}
          >
            <Monitor color={tema === 'system' ? colors.accent : colors.textSecondary} size={16} style={{ marginBottom: 4 }} />
            <Text style={[styles.segmentText, tema === 'system' && styles.segmentTextActive]}>Auto</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.themeInfoText}>
          {tema === 'system' 
            ? 'O aplicativo está seguindo a aparência do sistema operacional.' 
            : `Aparência definida manualmente para modo ${tema === 'light' ? 'Claro' : 'Escuro'}.`}
        </Text>
      </SpaceCard>

      {/* Gateway Connection Settings card */}
      <SpaceCard style={styles.connectionCard}>
        <View style={styles.cardHeader}>
          <Network color={colors.accent} size={24} style={{ marginRight: 10 }} />
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

        <View style={styles.pingIndicatorRow}>
          <Text style={styles.pingLabel}>Telemetria de Conexão:</Text>
          {pingStatus === 'SUCCESS' && (
            <View style={styles.pingBadgeSuccess}>
              <CheckCircle2 color={colors.green} size={12} style={{ marginRight: 4 }} />
              <Text style={styles.pingTextSuccess}>ONLINE ({pingLatency}ms)</Text>
            </View>
          )}
          {pingStatus === 'FAILED' && (
            <View style={styles.pingBadgeFailed}>
              <AlertTriangle color={colors.red} size={12} style={{ marginRight: 4 }} />
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
      
      {/* Footer spacer to clear bottom tabbar */}
      <View style={{ height: 100 }} />
    </SpaceBackground>
  );
}

const getStyles = (colors: any, temaAtivo: 'light' | 'dark') => {
  const isDark = temaAtivo === 'dark';
  return StyleSheet.create({
    badgeContainer: {
      padding: 16,
      marginBottom: 16,
    },
    badgeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 10,
    },
    badgeOrgText: {
      color: colors.accent,
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    badgeBody: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    avatarContainer: {
      alignItems: 'center',
      marginRight: 16,
    },
    avatarRingOuter: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 1.5,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarRingInner: {
      width: 52,
      height: 52,
      borderRadius: 26,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    clearanceBadge: {
      position: 'absolute',
      bottom: -6,
      backgroundColor: colors.border,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderWidth: 1,
      borderColor: colors.cardBackground,
    },
    clearanceText: {
      color: colors.text,
      fontSize: 7,
      fontWeight: 'bold',
    },
    badgeInfoCol: {
      flex: 1,
    },
    infoField: {
      marginBottom: 8,
    },
    infoFieldRow: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    infoFieldHalf: {
      flex: 1,
      paddingRight: 4,
    },
    infoFieldLabel: {
      color: colors.textSecondary,
      fontSize: 8,
      fontWeight: 'bold',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    infoFieldValName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: 'bold',
    },
    infoFieldValCode: {
      color: colors.accent,
      fontSize: 11,
      fontWeight: 'bold',
      fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    },
    infoFieldVal: {
      color: colors.text,
      fontSize: 11,
      fontWeight: '600',
    },
    infoFieldValHash: {
      color: colors.accent,
      fontSize: 10,
      fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
      fontWeight: 'bold',
    },
    badgeFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
    },
    badgeStatusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${colors.green}15`,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: `${colors.green}30`,
    },
    badgeStatusText: {
      color: colors.green,
      fontSize: 8,
      fontWeight: 'bold',
    },
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
    },
    logoutBtnText: {
      color: colors.red,
      fontSize: 12,
      fontWeight: 'bold',
    },
    sessionCard: {
      padding: 16,
      marginBottom: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 12,
    },
    operatorTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: 'bold',
    },
    operatorSubtitle: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    helperText: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 16,
      marginBottom: 16,
    },
    codeSuggest: {
      color: colors.accent,
      fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
      fontSize: 11,
    },
    actionBtn: {
      width: '100%',
    },
    appearanceCard: {
      padding: 16,
      marginBottom: 16,
    },
    segmentedContainer: {
      flexDirection: 'row',
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      padding: 3,
      marginBottom: 12,
    },
    segmentBtn: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
    },
    segmentBtnActive: {
      backgroundColor: isDark ? '#3A3A3C' : '#FFFFFF',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    segmentText: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '500',
    },
    segmentTextActive: {
      color: colors.text,
      fontWeight: '600',
    },
    themeInfoText: {
      color: colors.textSecondary,
      fontSize: 11,
      fontStyle: 'italic',
      paddingHorizontal: 4,
    },
    connectionCard: {
      padding: 16,
      marginBottom: 16,
    },
    pingIndicatorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    pingLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      marginRight: 8,
    },
    pingTextIdle: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    pingBadgeSuccess: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${colors.green}15`,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    pingTextSuccess: {
      color: colors.green,
      fontSize: 11,
      fontWeight: '600',
    },
    pingBadgeFailed: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${colors.red}15`,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    pingTextFailed: {
      color: colors.red,
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
};
