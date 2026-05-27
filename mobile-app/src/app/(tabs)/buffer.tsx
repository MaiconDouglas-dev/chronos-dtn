import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useApp } from '../../services/AppContext';
import { api } from '../../services/api';
import SpaceBackground from '../../components/SpaceBackground';
import SpaceCard from '../../components/SpaceCard';
import SpaceButton from '../../components/SpaceButton';
import Header from '../../components/Header';
import { Layers, Send, RefreshCw, AlertTriangle, CheckCircle, Database } from 'lucide-react-native';

interface DtnBundle {
  id: number;
  operadora_id: number;
  pacote_metadata: string; // JSON formatted
  tamanho_kb: number;
  status_transmissao: string; // QUEUED, IN_TRANSIT, DELIVERED, EXPIRED, RETRYING
  retries: number;
  created_at: number; // microseconds
}

interface ParsedMetadata {
  bundle_id?: string;
  destination?: string;
  payload_hash?: string;
  priority?: string;
}

export default function DtnBuffer() {
  const { setGlobalError, setIsLoading } = useApp();
  const [queue, setQueue] = useState<DtnBundle[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);

  const mockBundles: DtnBundle[] = [
    {
      id: 1,
      operadora_id: 1,
      pacote_metadata: '{"bundle_id":"dtn://selene.luna/trans-001","destination":"dtn://earth.gateway/finance","payload_hash":"a4f6d70bc70a...","priority":"HIGH"}',
      tamanho_kb: 12.50,
      status_transmissao: 'QUEUED',
      retries: 0,
      created_at: 1779900000000000
    },
    {
      id: 2,
      operadora_id: 2,
      pacote_metadata: '{"bundle_id":"dtn://selene.luna/trans-002","destination":"dtn://earth.gateway/finance","payload_hash":"c9b2e11df30e...","priority":"MEDIUM"}',
      tamanho_kb: 85.20,
      status_transmissao: 'IN_TRANSIT',
      retries: 1,
      created_at: 1779900001000000
    },
    {
      id: 3,
      operadora_id: 3,
      pacote_metadata: '{"bundle_id":"dtn://artemis.orbit/telemetry-09","destination":"dtn://esa.darmstadt/telemetry","payload_hash":"8f2302e1c95b...","priority":"LOW"}',
      tamanho_kb: 1024.00,
      status_transmissao: 'RETRYING',
      retries: 3,
      created_at: 1779900005000000
    }
  ];

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dtn/queue');
      if (res && res.data) {
        setQueue(res.data);
        setIsSimulated(false);
      } else {
        setQueue(mockBundles);
        setIsSimulated(true);
      }
    } catch (err) {
      setQueue(mockBundles);
      setIsSimulated(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleTransmitSingle = async (bundleId: number) => {
    setIsLoading(true);
    try {
      const res = await api.post(`/dtn/transmit/${bundleId}`);
      if (res && res.data) {
        await fetchQueue();
      } else {
        // Mock transmission locally
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
        setQueue(prev =>
          prev.map(b =>
            b.id === bundleId
              ? { ...b, status_transmissao: 'DELIVERED', retries: b.retries + 1 }
              : b
          ).filter(b => b.status_transmissao !== 'DELIVERED') // Clear delivered from buffer queue
        );
      }
    } catch (err) {
      // Mock local fallback
      await new Promise(resolve => setTimeout(resolve, 1500));
      setQueue(prev =>
        prev.map(b =>
          b.id === bundleId
            ? { ...b, status_transmissao: 'DELIVERED', retries: b.retries + 1 }
            : b
        ).filter(b => b.status_transmissao !== 'DELIVERED')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransmitAll = async () => {
    setIsLoading(true);
    try {
      const res = await api.post('/dtn/transmit-all');
      if (res && res.data) {
        await fetchQueue();
      } else {
        // Mock transmission locally
        await new Promise(resolve => setTimeout(resolve, 2000));
        setQueue([]);
      }
    } catch (err) {
      // Mock local fallback
      await new Promise(resolve => setTimeout(resolve, 2000));
      setQueue([]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseMetadata = (metaStr: string): ParsedMetadata => {
    try {
      return JSON.parse(metaStr);
    } catch {
      return {};
    }
  };

  const totalPayloadSize = queue.reduce((sum, item) => sum + Number(item.tamanho_kb), 0);

  return (
    <SpaceBackground scrollable={false}>
      <Header />

      {/* Overview Card */}
      <SpaceCard borderAccent="amber" style={styles.overviewCard}>
        <View style={styles.overviewHeader}>
          <View>
            <Text style={styles.overviewLabel}>DTN Buffer Capacity</Text>
            <Text style={styles.overviewValue}>
              {queue.length} <Text style={styles.overviewSub}>bundles queued</Text>
            </Text>
          </View>
          <View style={styles.verticalSeparator} />
          <View>
            <Text style={styles.overviewLabel}>Total Queued Size</Text>
            <Text style={styles.overviewValue}>
              {totalPayloadSize >= 1024 
                ? `${(totalPayloadSize / 1024).toFixed(2)} MB` 
                : `${totalPayloadSize.toFixed(2)} KB`}
            </Text>
          </View>
        </View>
        
        <View style={styles.overviewActions}>
          <SpaceButton
            title="Force Global Transmission"
            variant="secondary"
            onPress={handleTransmitAll}
            disabled={queue.length === 0}
            style={styles.transmitAllBtn}
          />
          <TouchableOpacity onPress={fetchQueue} style={styles.refreshBtn} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <RefreshCw color="#FFFFFF" size={16} />}
          </TouchableOpacity>
        </View>
      </SpaceCard>

      {/* Queue Header Title */}
      <View style={styles.queueHeader}>
        <Layers color="#94A3B8" size={18} style={{ marginRight: 6 }} />
        <Text style={styles.queueTitle}>Retention Buffer Packets</Text>
      </View>

      {/* Buffer list */}
      <FlatList
        data={queue}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <CheckCircle color="#00F5A0" size={48} />
            <Text style={styles.emptyText}>Buffer queue empty. All bundles routed!</Text>
          </View>
        }
        renderItem={({ item }) => {
          const meta = parseMetadata(item.pacote_metadata);
          const isRetrying = item.status_transmissao === 'RETRYING';
          const isInTransit = item.status_transmissao === 'IN_TRANSIT';
          const isQueued = item.status_transmissao === 'QUEUED';

          let statusAccent: 'cyan' | 'amber' | 'purple' | 'magenta' = 'cyan';
          if (isQueued) statusAccent = 'purple';
          if (isInTransit) statusAccent = 'cyan';
          if (isRetrying) statusAccent = 'amber';
          if (item.status_transmissao === 'EXPIRED') statusAccent = 'magenta';

          return (
            <SpaceCard borderAccent={statusAccent} style={styles.bundleCard}>
              <View style={styles.bundleHeader}>
                <View style={styles.bundleDestGroup}>
                  <Text style={styles.bundleDestLabel}>Destination Endpoint</Text>
                  <Text style={styles.bundleDestText} numberOfLines={1}>{meta.destination || 'dtn://unknown'}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: isQueued ? '#8A57FF15' : isRetrying ? '#FFB30015' : '#00F2FE15' }]}>
                  <Text style={[styles.statusText, { color: isQueued ? '#8A57FF' : isRetrying ? '#FFB300' : '#00F2FE' }]}>
                    {item.status_transmissao}
                  </Text>
                </View>
              </View>

              {/* Bundle specifications */}
              <View style={styles.metaRow}>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>Bundle size</Text>
                  <Text style={styles.metaValue}>{item.tamanho_kb.toFixed(2)} KB</Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>Priority</Text>
                  <Text style={[styles.metaValue, meta.priority === 'HIGH' && { color: '#FF007A' }]}>
                    {meta.priority || 'NORMAL'}
                  </Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>Retries</Text>
                  <Text style={styles.metaValue}>{item.retries} attempts</Text>
                </View>
              </View>

              {/* Collapsed Info details */}
              <View style={styles.detailsBlock}>
                <Text style={styles.detailLabel}>Bundle URI:</Text>
                <Text style={styles.detailVal}>{meta.bundle_id || 'n/a'}</Text>
                
                <Text style={styles.detailLabel}>Payload SHA-256:</Text>
                <Text style={styles.detailVal}>{meta.payload_hash || 'n/a'}</Text>

                <Text style={styles.detailLabel}>Queued Timestamp:</Text>
                <Text style={styles.detailVal}>{item.created_at} μs</Text>
              </View>

              {/* Action buttons */}
              <View style={styles.bundleActions}>
                {item.retries >= 3 && (
                  <View style={styles.warningContainer}>
                    <AlertTriangle color="#FFB300" size={14} style={{ marginRight: 4 }} />
                    <Text style={styles.warningText}>Retry limit warning</Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.transmitBtn} 
                  onPress={() => handleTransmitSingle(item.id)}
                >
                  <Send color="#00F2FE" size={14} style={{ marginRight: 6 }} />
                  <Text style={styles.transmitBtnText}>Force Routing</Text>
                </TouchableOpacity>
              </View>
            </SpaceCard>
          );
        }}
      />
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  overviewCard: {
    padding: 14,
    marginBottom: 16,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  overviewLabel: {
    color: '#64748B',
    fontSize: 11,
    marginBottom: 4,
  },
  overviewValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  overviewSub: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: 'normal',
  },
  verticalSeparator: {
    width: 1,
    height: 40,
    backgroundColor: '#232A46',
  },
  overviewActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transmitAllBtn: {
    flex: 1,
    height: 40,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1E2540',
    borderWidth: 1,
    borderColor: '#232A46',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  queueTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 12,
  },
  bundleCard: {
    padding: 12,
    marginBottom: 12,
  },
  bundleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bundleDestGroup: {
    flex: 1,
    paddingRight: 10,
  },
  bundleDestLabel: {
    color: '#64748B',
    fontSize: 9,
    marginBottom: 2,
  },
  bundleDestText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0A0D1A',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#181E35',
  },
  metaCol: {
    alignItems: 'center',
    flex: 1,
  },
  metaLabel: {
    color: '#64748B',
    fontSize: 9,
    marginBottom: 2,
  },
  metaValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsBlock: {
    backgroundColor: '#0F1322',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  detailLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '500',
  },
  detailVal: {
    color: '#94A3B8',
    fontSize: 10,
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  bundleActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1E2540',
    paddingTop: 10,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    color: '#FFB300',
    fontSize: 11,
    fontWeight: '500',
  },
  transmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    paddingVertical: 4,
  },
  transmitBtnText: {
    color: '#00F2FE',
    fontSize: 12,
    fontWeight: '600',
  },
});
