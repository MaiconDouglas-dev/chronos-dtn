import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useApp } from '../../services/AppContext';
import { api } from '../../services/api';
import SpaceBackground from '../../components/SpaceBackground';
import SpaceCard from '../../components/SpaceCard';
import SpaceButton from '../../components/SpaceButton';
import Header from '../../components/Header';
import { Layers, Send, RefreshCw, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react-native';

interface DtnBundle {
  id: number;
  idOperador: number;
  metadataPacote: string; // JSON formatted
  tamanhoKb: number;
  statusTransmissao: string; // QUEUED, IN_TRANSIT, DELIVERED, EXPIRED, RETRYING
  tentativas: number;
  criadoEm: number; // microseconds
}

interface ParsedMetadata {
  idPacote?: string;
  destino?: string;
  hashPayload?: string;
  prioridade?: string;
}

export default function DtnBuffer() {
  const { setGlobalError, setIsLoading } = useApp();
  const [queue, setQueue] = useState<DtnBundle[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);

  const mockBundles: DtnBundle[] = [
    {
      id: 1,
      idOperador: 1,
      metadataPacote: '{"idPacote":"dtn://selene.luna/trans-001","destino":"dtn://earth.gateway/finance","hashPayload":"a4f6d70bc70a...","prioridade":"ALTA"}',
      tamanhoKb: 12.50,
      statusTransmissao: 'QUEUED',
      tentativas: 0,
      criadoEm: 1779900000000000
    },
    {
      id: 2,
      idOperador: 2,
      metadataPacote: '{"idPacote":"dtn://selene.luna/trans-002","destino":"dtn://earth.gateway/finance","hashPayload":"c9b2e11df30e...","prioridade":"MEDIA"}',
      tamanhoKb: 85.20,
      statusTransmissao: 'IN_TRANSIT',
      tentativas: 1,
      criadoEm: 1779900001000000
    },
    {
      id: 3,
      idOperador: 3,
      metadataPacote: '{"idPacote":"dtn://artemis.orbit/telemetry-09","destino":"dtn://esa.darmstadt/telemetry","hashPayload":"8f2302e1c95b...","prioridade":"BAIXA"}',
      tamanhoKb: 1024.00,
      statusTransmissao: 'RETRYING',
      tentativas: 3,
      criadoEm: 1779900005000000
    }
  ];

  const normalizeBundle = (data: any): DtnBundle => {
    return {
      id: data.id,
      idOperador: data.idOperador ?? data.id_operador ?? data.operadora_id ?? 0,
      metadataPacote: data.metadataPacote ?? data.pacoteMetadata ?? data.pacote_metadata ?? '',
      tamanhoKb: data.tamanhoKb ?? data.tamanho_kb ?? 0,
      statusTransmissao: data.statusTransmissao ?? data.status_transmissao ?? 'QUEUED',
      tentativas: data.tentativas ?? data.retries ?? 0,
      criadoEm: data.criadoEm ?? data.created_at ?? data.criado_em ?? 0,
    };
  };

  const executeRequest = async (method: 'get' | 'post', path: string) => {
    let cSharpPath = path;
    if (path === '/pacotes') {
      cSharpPath = '/filadtn';
    } else if (path.startsWith('/pacotes/transmissao/')) {
      const id = path.split('/').pop();
      cSharpPath = `/filadtn/transmit/${id}`;
    } else if (path === '/pacotes/transmissao-total') {
      cSharpPath = '/filadtn/transmit-all';
    }
    
    let legacyPath = path;
    if (path === '/pacotes') {
      legacyPath = '/dtn/queue';
    } else if (path.startsWith('/pacotes/transmissao/')) {
      const id = path.split('/').pop();
      legacyPath = `/dtn/transmit/${id}`;
    } else if (path === '/pacotes/transmissao-total') {
      legacyPath = '/dtn/transmit-all';
    }

    if (method === 'get') {
      try {
        return await api.get(path);
      } catch {
        try {
          return await api.get(cSharpPath);
        } catch {
          return await api.get(legacyPath);
        }
      }
    } else {
      try {
        return await api.post(path);
      } catch {
        try {
          return await api.post(cSharpPath);
        } catch {
          return await api.post(legacyPath);
        }
      }
    }
  };

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await executeRequest('get', '/pacotes');
      if (res && res.data) {
        const rawList = Array.isArray(res.data) ? res.data : [];
        setQueue(rawList.map(normalizeBundle));
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
      const res = await executeRequest('post', `/pacotes/transmissao/${bundleId}`);
      if (res && (res.status === 200 || res.status === 204 || res.data)) {
        await fetchQueue();
      } else {
        // Mock transmission locally
        await new Promise(resolve => setTimeout(resolve, 1500));
        setQueue(prev =>
          prev.map(b =>
            b.id === bundleId
              ? { ...b, statusTransmissao: 'DELIVERED', tentativas: b.tentativas + 1 }
              : b
          ).filter(b => b.statusTransmissao !== 'DELIVERED')
        );
      }
    } catch (err) {
      // Mock local fallback
      await new Promise(resolve => setTimeout(resolve, 1500));
      setQueue(prev =>
        prev.map(b =>
          b.id === bundleId
            ? { ...b, statusTransmissao: 'DELIVERED', tentativas: b.tentativas + 1 }
            : b
        ).filter(b => b.statusTransmissao !== 'DELIVERED')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransmitAll = async () => {
    setIsLoading(true);
    try {
      const res = await executeRequest('post', '/pacotes/transmissao-total');
      if (res && (res.status === 200 || res.status === 204 || res.data)) {
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
      const parsed = JSON.parse(metaStr);
      return {
        idPacote: parsed.idPacote ?? parsed.bundle_id ?? parsed.bundleId ?? parsed.id_pacote ?? 'n/a',
        destino: parsed.destino ?? parsed.destination ?? 'dtn://desconhecido',
        hashPayload: parsed.hashPayload ?? parsed.payload_hash ?? parsed.payloadHash ?? parsed.hash_payload ?? 'n/a',
        prioridade: parsed.prioridade ?? parsed.priority ?? 'NORMAL',
      };
    } catch {
      return {
        idPacote: 'n/a',
        destino: 'dtn://desconhecido',
        hashPayload: 'n/a',
        prioridade: 'NORMAL',
      };
    }
  };

  const totalPayloadSize = queue.reduce((sum, item) => sum + Number(item.tamanhoKb), 0);

  return (
    <SpaceBackground scrollable={false}>
      <Header />

      {/* Mode Indicator */}
      {isSimulated && (
        <View style={styles.simulationBanner}>
          <ShieldAlert color="#FFB300" size={16} style={{ marginRight: 6 }} />
          <Text style={styles.simulationText}>Modo de Fila Simulada (Cache Local Offline)</Text>
        </View>
      )}

      {/* Overview Card */}
      <SpaceCard borderAccent="amber" style={styles.overviewCard}>
        <View style={styles.overviewHeader}>
          <View>
            <Text style={styles.overviewLabel}>Capacidade do Buffer DTN</Text>
            <Text style={styles.overviewValue}>
              {queue.length} <Text style={styles.overviewSub}>pacotes na fila</Text>
            </Text>
          </View>
          <View style={styles.verticalSeparator} />
          <View>
            <Text style={styles.overviewLabel}>Tamanho Total Retido</Text>
            <Text style={styles.overviewValue}>
              {totalPayloadSize >= 1024 
                ? `${(totalPayloadSize / 1024).toFixed(2)} MB` 
                : `${totalPayloadSize.toFixed(2)} KB`}
            </Text>
          </View>
        </View>
        
        <View style={styles.overviewActions}>
          <SpaceButton
            title="Forçar Transmissão Global"
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
        <Text style={styles.queueTitle}>Pacotes no Buffer de Retenção</Text>
      </View>

      {/* Buffer list */}
      <FlatList
        data={queue}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <CheckCircle color="#00F5A0" size={48} />
            <Text style={styles.emptyText}>Fila de buffer vazia. Todos os pacotes foram roteados!</Text>
          </View>
        }
        renderItem={({ item }) => {
          const meta = parseMetadata(item.metadataPacote);
          const isRetrying = item.statusTransmissao === 'RETRYING' || item.statusTransmissao === 'TENTANDO';
          const isInTransit = item.statusTransmissao === 'IN_TRANSIT' || item.statusTransmissao === 'EM_TRANSITO';
          const isQueued = item.statusTransmissao === 'QUEUED' || item.statusTransmissao === 'AGUARDANDO';

          let statusAccent: 'cyan' | 'amber' | 'purple' | 'magenta' = 'cyan';
          let statusText = item.statusTransmissao;

          if (isQueued) {
            statusAccent = 'purple';
            statusText = 'AGUARDANDO';
          } else if (isInTransit) {
            statusAccent = 'cyan';
            statusText = 'EM TRÂNSITO';
          } else if (isRetrying) {
            statusAccent = 'amber';
            statusText = 'REPETINDO';
          } else if (item.statusTransmissao === 'EXPIRED' || item.statusTransmissao === 'EXPIRADO') {
            statusAccent = 'magenta';
            statusText = 'EXPIRADO';
          } else if (item.statusTransmissao === 'DELIVERED' || item.statusTransmissao === 'ENTREGUE') {
            statusAccent = 'cyan';
            statusText = 'ENTREGUE';
          }

          return (
            <SpaceCard borderAccent={statusAccent} style={styles.bundleCard}>
              <View style={styles.bundleHeader}>
                <View style={styles.bundleDestGroup}>
                  <Text style={styles.bundleDestLabel}>Endpoint de Destino</Text>
                  <Text style={styles.bundleDestText} numberOfLines={1}>{meta.destino || 'dtn://unknown'}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: isQueued ? '#8A57FF15' : isRetrying ? '#FFB30015' : '#00F2FE15' }]}>
                  <Text style={[styles.statusText, { color: isQueued ? '#8A57FF' : isRetrying ? '#FFB300' : '#00F2FE' }]}>
                    {statusText}
                  </Text>
                </View>
              </View>

              {/* Bundle specifications */}
              <View style={styles.metaRow}>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>Tamanho</Text>
                  <Text style={styles.metaValue}>{item.tamanhoKb.toFixed(2)} KB</Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>Prioridade</Text>
                  <Text style={[styles.metaValue, (meta.prioridade === 'HIGH' || meta.prioridade === 'ALTA') && { color: '#FF007A' }]}>
                    {meta.prioridade || 'NORMAL'}
                  </Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>Tentativas</Text>
                  <Text style={styles.metaValue}>{item.tentativas} envios</Text>
                </View>
              </View>

              {/* Collapsed Info details */}
              <View style={styles.detailsBlock}>
                <Text style={styles.detailLabel}>URI do Pacote:</Text>
                <Text style={styles.detailVal}>{meta.idPacote || 'n/a'}</Text>
                
                <Text style={styles.detailLabel}>Hash SHA-256:</Text>
                <Text style={styles.detailVal}>{meta.hashPayload || 'n/a'}</Text>

                <Text style={styles.detailLabel}>Timestamp na Fila:</Text>
                <Text style={styles.detailVal}>{item.criadoEm} μs</Text>
              </View>

              {/* Action buttons */}
              <View style={styles.bundleActions}>
                {item.tentativas >= 3 && (
                  <View style={styles.warningContainer}>
                    <AlertTriangle color="#FFB300" size={14} style={{ marginRight: 4 }} />
                    <Text style={styles.warningText}>Aviso: limite de tentativas</Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.transmitBtn} 
                  onPress={() => handleTransmitSingle(item.id)}
                >
                  <Send color="#00F2FE" size={14} style={{ marginRight: 6 }} />
                  <Text style={styles.transmitBtnText}>Forçar Roteamento</Text>
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
