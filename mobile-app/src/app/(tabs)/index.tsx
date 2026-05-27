import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useApp } from '../../services/AppContext';
import { api } from '../../services/api';
import SpaceBackground from '../../components/SpaceBackground';
import SpaceCard from '../../components/SpaceCard';
import Header from '../../components/Header';
import { RefreshCw, Radio, ShieldAlert, Cpu, Database, Compass } from 'lucide-react-native';

interface Node {
  id: number;
  nome: string;
  latenciaTerraMs: number;
  latenciaLuaMs: number;
  status: string;
  throughputKbps: number;
}

export default function Dashboard() {
  const { tokenJwt, setGlobalError } = useApp();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [dtnCount, setDtnCount] = useState(0);
  const [auditCount, setAuditCount] = useState(0);
  const [isSimulated, setIsSimulated] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data fallbacks
  const mockNodes: Node[] = [
    { id: 1, nome: 'LunaPath-1 (Relay Orbital)', latenciaTerraMs: 1320, latenciaLuaMs: 8, status: 'ONLINE', throughputKbps: 25600 },
    { id: 2, nome: 'LOP-G Gateway Comms', latenciaTerraMs: 1280, latenciaLuaMs: 5, status: 'ONLINE', throughputKbps: 102400 },
    { id: 3, nome: 'Shackleton Surface Base', latenciaTerraMs: 1410, latenciaLuaMs: 2, status: 'DEGRADED', throughputKbps: 512 },
    { id: 4, nome: 'LunaRelay-4 (Lado Oculto)', latenciaTerraMs: 1550, latenciaLuaMs: 15, status: 'ONLINE', throughputKbps: 4096 },
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
        // continue trying next
      }
    }
    throw new Error('Todos os endpoints falharam');
  };

  const fetchData = async () => {
    setRefreshing(true);
    try {
      // Attempt to load from real backend APIs sequentially
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
        setDtnCount(3); // Mock initial state
      }

      if (auditsRes && auditsRes.data) {
        const rawList = Array.isArray(auditsRes.data) ? auditsRes.data : [];
        setAuditCount(rawList.length);
      } else {
        setAuditCount(4); // Mock initial state
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
    if (onlineCount === 0) return { pct: 0, text: 'DESCONECTADO', color: '#FF007A' };
    if (onlineCount === 1) return { pct: 25, text: 'CRÍTICO', color: '#FF007A' };
    if (onlineCount === 2) return { pct: 50, text: 'FRACO', color: '#FFB300' };
    if (onlineCount === 3) return { pct: 75, text: 'ESTÁVEL', color: '#00F2FE' };
    return { pct: 98, text: 'EXCELENTE', color: '#00F5A0' };
  };

  const signal = getSignalStrength();

  return (
    <SpaceBackground scrollable>
      <Header />

      {/* Mode Indicator */}
      {isSimulated && (
        <View style={styles.simulationBanner}>
          <ShieldAlert color="#FFB300" size={16} style={{ marginRight: 6 }} />
          <Text style={styles.simulationText}>Modo de Telemetria Simulada (Cache Local Offline)</Text>
        </View>
      )}

      {/* Header telemetry values */}
      <View style={styles.metricsRow}>
        <SpaceCard style={styles.metricCard} borderAccent="cyan">
          <View style={styles.cardHeader}>
            <Radio color="#00F2FE" size={20} />
            <Text style={styles.metricTitle}>Sinal</Text>
          </View>
          <Text style={[styles.metricValue, { color: signal.color }]}>{signal.pct}%</Text>
          <Text style={styles.metricSub}>{signal.text}</Text>
        </SpaceCard>

        <SpaceCard style={styles.metricCard} borderAccent="purple">
          <View style={styles.cardHeader}>
            <Compass color="#8A57FF" size={20} />
            <Text style={styles.metricTitle}>Desvio Rel.</Text>
          </View>
          <Text style={styles.metricValue}>+56.2</Text>
          <Text style={styles.metricSub}>μs/dia (LTC vs UTC)</Text>
        </SpaceCard>
      </View>

      {/* DTN Queue State */}
      <SpaceCard borderAccent="amber" style={styles.bufferCard}>
        <View style={styles.bufferHeader}>
          <View style={styles.bufferTitleContainer}>
            <Database color="#FFB300" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.bufferMainTitle}>Buffer Interplanetário DTN</Text>
          </View>
          <TouchableOpacity onPress={fetchData} disabled={refreshing}>
            {refreshing ? (
              <ActivityIndicator size="small" color="#FFB300" />
            ) : (
              <RefreshCw color="#94A3B8" size={16} />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.bufferBody}>
          <View style={styles.bufferInfoBlock}>
            <Text style={styles.bufferValText}>{dtnCount}</Text>
            <Text style={styles.bufferLabelText}>Pacotes Retidos</Text>
          </View>
          <View style={styles.bufferDivider} />
          <View style={styles.bufferInfoBlock}>
            <Text style={styles.bufferValText}>{auditCount}</Text>
            <Text style={styles.bufferLabelText}>Transações Auditadas</Text>
          </View>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.min((dtnCount / 20) * 100, 100)}%` }]} />
          </View>
          <Text style={styles.progressLabel}>Capacidade do buffer: {dtnCount}/20 pacotes</Text>
        </View>
      </SpaceCard>

      {/* Satellite Connectivity Nodes list */}
      <View style={styles.sectionHeader}>
        <Cpu color="#94A3B8" size={18} style={{ marginRight: 6 }} />
        <Text style={styles.sectionTitle}>Relés de Conectividade ({nodes.length})</Text>
      </View>

      {nodes.map((node) => {
        const isOnline = node.status === 'ONLINE';
        const isDegraded = node.status === 'DEGRADED';
        const statusAccent = isOnline ? 'green' : isDegraded ? 'amber' : 'magenta';
        const statusLabel = isOnline ? 'ONLINE' : isDegraded ? 'DEGRADADO' : 'OFFLINE';

        return (
          <SpaceCard key={node.id} borderAccent={statusAccent} style={styles.nodeItem}>
            <View style={styles.nodeMainRow}>
              <View>
                <Text style={styles.nodeName}>{node.nome}</Text>
                <Text style={styles.nodeThroughput}>{(node.throughputKbps / 1024).toFixed(1)} Mbps Taxa Máx</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: isOnline ? '#05C18020' : isDegraded ? '#FFB30020' : '#FF007A20' }]}>
                <Text style={[styles.statusText, { color: isOnline ? '#00F5A0' : isDegraded ? '#FFB300' : '#FF007A' }]}>{statusLabel}</Text>
              </View>
            </View>
            <View style={styles.latencySplit}>
              <View style={styles.latencyItem}>
                <Text style={styles.latencyLabel}>Atraso RTT Terra</Text>
                <Text style={styles.latencyValue}>{node.latenciaTerraMs} ms</Text>
              </View>
              <View style={styles.verticalSplitLine} />
              <View style={styles.latencyItem}>
                <Text style={styles.latencyLabel}>Atraso RTT Órbita Lua</Text>
                <Text style={styles.latencyValue}>{node.latenciaLuaMs} ms</Text>
              </View>
            </View>
          </SpaceCard>
        );
      })}
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  simulationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB30015',
    borderWidth: 1,
    borderColor: '#FFB30040',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  simulationText: {
    color: '#FFB300',
    fontSize: 12,
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricCard: {
    flex: 1,
    marginHorizontal: 4,
    minHeight: 110,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  metricSub: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  bufferCard: {
    marginBottom: 20,
  },
  bufferHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  bufferTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bufferMainTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  bufferBody: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  bufferInfoBlock: {
    alignItems: 'center',
  },
  bufferValText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  bufferLabelText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },
  bufferDivider: {
    height: 30,
    width: 1,
    backgroundColor: '#232A46',
  },
  progressContainer: {
    marginTop: 14,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#0F1322',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFB300',
    borderRadius: 3,
  },
  progressLabel: {
    color: '#64748B',
    fontSize: 10,
    textAlign: 'right',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  nodeItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  nodeMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nodeName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  nodeThroughput: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  latencySplit: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1A213B',
    paddingTop: 10,
  },
  latencyItem: {
    flex: 1,
    alignItems: 'center',
  },
  latencyLabel: {
    color: '#64748B',
    fontSize: 10,
    marginBottom: 2,
  },
  latencyValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  verticalSplitLine: {
    width: 1,
    backgroundColor: '#1A213B',
  },
});
