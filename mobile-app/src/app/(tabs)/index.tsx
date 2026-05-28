import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, FlatList, Dimensions, Platform } from 'react-native';
import { useApp } from '../../services/AppContext';
import { api } from '../../services/api';
import SpaceBackground from '../../components/SpaceBackground';
import SpaceCard from '../../components/SpaceCard';
import Header from '../../components/Header';
import { RefreshCw, ShieldAlert, Cpu, Database, Signal, Activity } from 'lucide-react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Line } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface Node {
  id: number;
  nome: string;
  latenciaTerraMs: number;
  latenciaLuaMs: number;
  status: string;
  throughputKbps: number;
}

export default function Dashboard() {
  const { tokenJwt, setGlobalError, colors, temaAtivo } = useApp();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [dtnCount, setDtnCount] = useState(0);
  const [auditCount, setAuditCount] = useState(0);
  const [isSimulated, setIsSimulated] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const styles = getStyles(colors);

  const mockNodes: Node[] = [
    { id: 1, nome: 'LunaPath-1 (Orbital)', latenciaTerraMs: 1320, latenciaLuaMs: 8, status: 'ONLINE', throughputKbps: 25600 },
    { id: 2, nome: 'LOP-G Gateway', latenciaTerraMs: 1280, latenciaLuaMs: 5, status: 'ONLINE', throughputKbps: 102400 },
    { id: 3, nome: 'Shackleton Surface', latenciaTerraMs: 1410, latenciaLuaMs: 2, status: 'DEGRADED', throughputKbps: 512 },
    { id: 4, nome: 'LunaRelay-4 (Oculto)', latenciaTerraMs: 1550, latenciaLuaMs: 15, status: 'ONLINE', throughputKbps: 4096 },
  ];

  const normalizeNode = (data: any): Node => {
    return {
      id: data.id,
      nome: data.nome || data.name || '',
      latenciaTerraMs: data.latenciaTerraMs ?? data.latencyTerraMs ?? data.latency_terra_ms ?? 0,
      latenciaLuaMs: data.latenciaLuaMs ?? data.latencyLuaMs ?? data.latency_lua_ms ?? 0,
      status: data.status || 'OFFLINE',
      throughputKbps: data.throughputKbps ?? data.throughput_kbps ?? 0,
    };
  };

  const executeSequential = async (endpoints: string[]) => {
    for (const endpoint of endpoints) {
      try {
        const res = await api.get(endpoint);
        if (res && res.data) {
          return res;
        }
      } catch (err) {
        // continue
      }
    }
    throw new Error('Todos os endpoints falharam');
  };

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [nodesRes, bundlesRes, auditsRes] = await Promise.all([
        executeSequential(['/nos', '/nosatelite', '/nodes']).catch(() => null),
        executeSequential(['/pacotes', '/filadtn', '/dtn/queue']).catch(() => null),
        executeSequential(['/transacoes', '/transactions', '/audits']).catch(() => null),
      ]);

      if (nodesRes && nodesRes.data) {
        const rawList = Array.isArray(nodesRes.data) ? nodesRes.data : [];
        setNodes(rawList.map(normalizeNode));
        setIsSimulated(false);
      } else {
        setNodes(mockNodes);
        setIsSimulated(true);
      }

      if (bundlesRes && bundlesRes.data) {
        const rawList = Array.isArray(bundlesRes.data) ? bundlesRes.data : [];
        setDtnCount(rawList.length);
      } else {
        setDtnCount(3);
      }

      if (auditsRes && auditsRes.data) {
        const rawList = Array.isArray(auditsRes.data) ? auditsRes.data : [];
        setAuditCount(rawList.length);
      } else {
        setAuditCount(4);
      }
    } catch (err) {
      setNodes(mockNodes);
      setDtnCount(3);
      setAuditCount(4);
      setIsSimulated(true);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getSignalStrength = () => {
    const onlineCount = nodes.filter(n => n.status === 'ONLINE').length;
    if (onlineCount === 0) return { pct: 0, text: 'DESCONECTADO', color: colors.red };
    if (onlineCount === 1) return { pct: 25, text: 'CRÍTICO', color: colors.red };
    if (onlineCount === 2) return { pct: 50, text: 'FRACO', color: colors.orange };
    if (onlineCount === 3) return { pct: 75, text: 'ESTÁVEL', color: colors.accent };
    return { pct: 98, text: 'EXCELENTE', color: colors.green };
  };

  const signal = getSignalStrength();

  const avgLatency = nodes.length > 0 
    ? (nodes.reduce((acc, curr) => acc + curr.latenciaTerraMs, 0) / nodes.length)
    : 1390;

  return (
    <SpaceBackground scrollable>
      <Header />

      {isSimulated && (
        <View style={styles.simulationBanner}>
          <ShieldAlert color={colors.orange} size={14} style={{ marginRight: 6 }} />
          <Text style={styles.simulationText}>Modo Offline Simulador (Operação Local)</Text>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Métricas de Link</Text>
        <TouchableOpacity style={styles.syncBtn} onPress={fetchData} disabled={refreshing}>
          {refreshing ? <ActivityIndicator size="small" color={colors.accent} /> : <RefreshCw color={colors.textSecondary} size={14} />}
        </TouchableOpacity>
      </View>

      <View style={styles.metricsRow}>
        <SpaceCard style={styles.metricCard} borderAccent="cyan">
          <View style={styles.cardHeader}>
            <Signal color={colors.accent} size={14} />
            <Text style={styles.metricTitle}>SINAL DE REDE</Text>
          </View>
          <View style={styles.signalContainer}>
            <View style={styles.signalTextCol}>
              <Text style={[styles.metricValue, { color: signal.color }]}>{signal.pct}%</Text>
              <Text style={styles.metricSub}>{signal.text}</Text>
            </View>
            
            <View style={styles.svgSignalWrapper}>
              <Svg width={54} height={54} viewBox="0 0 80 80">
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 360) / 12;
                  const isLit = (i / 12) * 100 < signal.pct;
                  const r1 = 26;
                  const r2 = 34;
                  const rad = (angle * Math.PI) / 180;
                  const x1 = 40 + r1 * Math.cos(rad);
                  const y1 = 40 + r1 * Math.sin(rad);
                  const x2 = 40 + r2 * Math.cos(rad);
                  const y2 = 40 + r2 * Math.sin(rad);
                  return (
                    <Line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isLit ? signal.color : colors.border}
                      strokeWidth={3.5}
                      strokeLinecap="round"
                    />
                  );
                })}
                <Circle cx="40" cy="40" r="18" fill="none" stroke={colors.border} strokeWidth={1} />
                <Circle cx="40" cy="40" r="6" fill={signal.color} />
              </Svg>
            </View>
          </View>
        </SpaceCard>

        <SpaceCard style={styles.metricCard} borderAccent="purple">
          <View style={styles.cardHeader}>
            <Activity color={colors.purple} size={14} />
            <Text style={styles.metricTitle}>RTT MÉDIO (TERRA)</Text>
          </View>
          <View style={styles.latencyContainer}>
            <Text style={styles.metricValue}>{avgLatency.toFixed(0)} <Text style={styles.metricUnit}>ms</Text></Text>
            
            <View style={styles.svgWaveformWrapper}>
              <Svg width="100%" height={32} viewBox="0 0 120 40" preserveAspectRatio="none">
                <Defs>
                  <LinearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor={colors.purple} stopOpacity={0.3} />
                    <Stop offset="100%" stopColor={colors.purple} stopOpacity={0.0} />
                  </LinearGradient>
                </Defs>
                <Path
                  d="M 0 32 C 15 32, 20 8, 35 8 C 50 8, 55 24, 70 24 C 85 24, 90 4, 105 4 L 120 18 L 120 40 L 0 40 Z"
                  fill="url(#waveGrad)"
                />
                <Path
                  d="M 0 32 C 15 32, 20 8, 35 8 C 50 8, 55 24, 70 24 C 85 24, 90 4, 105 4 L 120 18"
                  fill="none"
                  stroke={colors.purple}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <Circle cx="120" cy="18" r="3" fill={colors.purple} />
                <Circle cx="120" cy="18" r="6" fill={colors.purple} opacity={0.25} />
              </Svg>
            </View>
          </View>
        </SpaceCard>
      </View>

      <SpaceCard borderAccent="amber" style={styles.bufferCard}>
        <View style={styles.bufferHeader}>
          <Database color={colors.orange} size={18} style={{ marginRight: 8 }} />
          <Text style={styles.bufferMainTitle}>Capacidade do Buffer Cislunar</Text>
        </View>
        
        <View style={styles.bufferGrid}>
          <View style={styles.bufferInfoBlock}>
            <Text style={styles.bufferValText}>{dtnCount}</Text>
            <Text style={styles.bufferLabelText}>Pacotes Retidos</Text>
          </View>
          <View style={styles.bufferDivider} />
          <View style={styles.bufferInfoBlock}>
            <Text style={styles.bufferValText}>{auditCount}</Text>
            <Text style={styles.bufferLabelText}>Auditorias Registradas</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.min((dtnCount / 20) * 100, 100)}%` }]} />
          </View>
          <Text style={styles.progressLabel}>Capacidade em uso: {dtnCount}/20 pacotes (DTN)</Text>
        </View>
      </SpaceCard>

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Cpu color={colors.accent} size={16} style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>Conectividade de Satélites</Text>
        </View>
        <Text style={styles.sectionHelper}>Arraste para o lado</Text>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={nodes}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.carouselContainer}
        snapToAlignment="start"
        snapToInterval={276}
        decelerationRate="fast"
        renderItem={({ item }) => {
          const isOnline = item.status === 'ONLINE';
          const isDegraded = item.status === 'DEGRADED';
          const statusAccent = isOnline ? 'green' : isDegraded ? 'amber' : 'magenta';
          const statusColor = isOnline ? colors.green : isDegraded ? colors.orange : colors.red;

          return (
            <SpaceCard key={item.id} borderAccent={statusAccent} style={styles.carouselCard}>
              <View style={styles.carouselCardHeader}>
                <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
                <Text style={styles.nodeName} numberOfLines={1}>{item.nome}</Text>
              </View>

              <View style={styles.carouselCardMetric}>
                <Text style={styles.carouselRateVal}>{(item.throughputKbps / 1024).toFixed(1)}</Text>
                <Text style={styles.carouselRateLabel}>Mbps Taxa Máxima</Text>
              </View>

              <View style={styles.dividerHorizontal} />

              <View style={styles.carouselLatencyRow}>
                <View style={styles.carouselLatencyCol}>
                  <Text style={styles.latencyLabel}>RTT Terra</Text>
                  <Text style={styles.latencyVal}>{item.latenciaTerraMs} ms</Text>
                </View>
                <View style={styles.dividerVertical} />
                <View style={styles.carouselLatencyCol}>
                  <Text style={styles.latencyLabel}>RTT Lua</Text>
                  <Text style={styles.latencyVal}>{item.latenciaLuaMs} ms</Text>
                </View>
              </View>
            </SpaceCard>
          );
        }}
      />
      <View style={{ height: 100 }} />
    </SpaceBackground>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  simulationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.statusBannerBg,
    borderWidth: 1,
    borderColor: colors.statusBannerBorder,
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
  },
  simulationText: {
    color: colors.orange,
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  sectionHelper: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '500',
  },
  syncBtn: {
    padding: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricCard: {
    flex: 1,
    marginHorizontal: 4,
    minHeight: 120,
    padding: 12,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricTitle: {
    color: colors.textSecondary,
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  metricValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: 'normal',
    color: colors.textSecondary,
  },
  metricSub: {
    color: colors.textSecondary,
    fontSize: 9,
    marginTop: 2,
  },
  signalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    flex: 1,
  },
  signalTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  svgSignalWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  latencyContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginTop: 4,
    flex: 1,
  },
  svgWaveformWrapper: {
    marginTop: 8,
    height: 32,
    width: '100%',
  },
  bufferCard: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
  },
  bufferHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10,
  },
  bufferMainTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  bufferGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 4,
  },
  bufferInfoBlock: {
    alignItems: 'center',
  },
  bufferValText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: 'bold',
  },
  bufferLabelText: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  bufferDivider: {
    height: 32,
    width: 1,
    backgroundColor: colors.border,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.inputBackground,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  progressLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    textAlign: 'right',
  },
  carouselContainer: {
    paddingLeft: 4,
    paddingRight: 16,
    paddingBottom: 16,
  },
  carouselCard: {
    width: 260,
    marginRight: 16,
    padding: 14,
    borderRadius: 20,
    minHeight: 160,
    borderWidth: 1,
  },
  carouselCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  nodeName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
  },
  carouselCardMetric: {
    marginBottom: 12,
  },
  carouselRateVal: {
    color: colors.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  carouselRateLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  dividerHorizontal: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  carouselLatencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  carouselLatencyCol: {
    alignItems: 'center',
    flex: 1,
  },
  latencyLabel: {
    color: colors.textSecondary,
    fontSize: 8,
    marginBottom: 2,
  },
  latencyVal: {
    color: colors.text,
    fontSize: 11,
    fontWeight: 'bold',
  },
  dividerVertical: {
    width: 1,
    height: 18,
    backgroundColor: colors.border,
  },
});
