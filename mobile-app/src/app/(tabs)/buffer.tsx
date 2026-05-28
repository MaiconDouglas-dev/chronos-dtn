import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useApp } from '../../services/AppContext';
import { api } from '../../services/api';
import SpaceBackground from '../../components/SpaceBackground';
import SpaceCard from '../../components/SpaceCard';
import SpaceButton from '../../components/SpaceButton';
import Header from '../../components/Header';
import { Layers, Send, RefreshCw, AlertTriangle, CheckCircle, ShieldAlert, Cpu } from 'lucide-react-native';

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
  const { colors, temaAtivo, setGlobalError, setIsLoading } = useApp();
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
        await new Promise(resolve => setTimeout(resolve, 1200));
        setQueue(prev =>
          prev.map(b =>
            b.id === bundleId
              ? { ...b, statusTransmissao: 'DELIVERED', tentativas: b.tentativas + 1 }
              : b
          ).filter(b => b.statusTransmissao !== 'DELIVERED')
        );
      }
    } catch (err) {
      await new Promise(resolve => setTimeout(resolve, 1200));
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
        await new Promise(resolve => setTimeout(resolve, 1500));
        setQueue([]);
      }
    } catch (err) {
      await new Promise(resolve => setTimeout(resolve, 1500));
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
  const styles = getStyles(colors, temaAtivo);

  return (
    <SpaceBackground scrollable={false}>
      <Header />

      {/* Mode Indicator */}
      {isSimulated && (
        <View style={styles.simulationBanner}>
          <ShieldAlert color={colors.orange} size={16} style={{ marginRight: 6 }} />
          <Text style={styles.simulationText}>Modo de Fila Simulada (Cache Local Offline)</Text>
        </View>
      )}

      {/* Overview Card */}
      <SpaceCard style={styles.overviewCard}>
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

        {/* MAPA DE ALOCAÇÃO DE MEMÓRIA (Grid de 20 slots) */}
        <View style={styles.bufferGridSection}>
          <View style={styles.gridHeaderRow}>
            <Cpu color={colors.textSecondary} size={12} style={{ marginRight: 4 }} />
            <Text style={styles.gridTitle}>MAPA FÍSICO DE ALOCAÇÃO DE BUFFER (20 SLOTS)</Text>
          </View>
          
          <View style={styles.gridContainer}>
            {Array.from({ length: 20 }).map((_, index) => {
              const packet = queue[index];
              let cellBg = colors.inputBackground;
              let isOccupied = !!packet;
              
              if (packet) {
                const meta = parseMetadata(packet.metadataPacote);
                const isRetrying = packet.statusTransmissao === 'RETRYING' || packet.statusTransmissao === 'TENTANDO';
                const isInTransit = packet.statusTransmissao === 'IN_TRANSIT' || packet.statusTransmissao === 'EM_TRANSITO';
                const isHigh = meta.prioridade === 'HIGH' || meta.prioridade === 'ALTA';
                
                if (isHigh) {
                  cellBg = colors.red;
                } else if (isRetrying) {
                  cellBg = colors.orange;
                } else if (isInTransit) {
                  cellBg = colors.accent;
                } else {
                  cellBg = colors.purple;
                }
              }
              
              return (
                <View 
                  key={index} 
                  style={[
                    styles.gridCell, 
                    isOccupied ? { backgroundColor: cellBg, borderColor: cellBg } : { backgroundColor: colors.inputBackground }
                  ]}
                >
                  <Text style={[styles.gridCellText, isOccupied && styles.gridCellTextOccupied]}>
                    {isOccupied ? `${packet.id}` : ''}
                  </Text>
                </View>
              );
            })}
          </View>
          
          {/* Legenda do Mapa */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendIndicator, { backgroundColor: colors.purple }]} />
              <Text style={styles.legendText}>Fila</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIndicator, { backgroundColor: colors.accent }]} />
              <Text style={styles.legendText}>Transito</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIndicator, { backgroundColor: colors.orange }]} />
              <Text style={styles.legendText}>Reenvio</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIndicator, { backgroundColor: colors.red }]} />
              <Text style={styles.legendText}>Crítico</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIndicator, { backgroundColor: colors.inputBackground }]} />
              <Text style={styles.legendText}>Livre</Text>
            </View>
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
            {loading ? <ActivityIndicator size="small" color={colors.text} /> : <RefreshCw color={colors.text} size={16} />}
          </TouchableOpacity>
        </View>
      </SpaceCard>

      {/* Queue Header Title */}
      <View style={styles.queueHeader}>
        <Layers color={colors.textSecondary} size={18} style={{ marginRight: 6 }} />
        <Text style={styles.queueTitle}>Pacotes no Buffer de Retenção</Text>
      </View>

      {/* Buffer list */}
      <FlatList
        data={queue}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <CheckCircle color={colors.green} size={48} />
            <Text style={styles.emptyText}>Fila de buffer vazia. Todos os pacotes foram roteados!</Text>
          </View>
        }
        renderItem={({ item }) => {
          const meta = parseMetadata(item.metadataPacote);
          const isRetrying = item.statusTransmissao === 'RETRYING' || item.statusTransmissao === 'TENTANDO';
          const isInTransit = item.statusTransmissao === 'IN_TRANSIT' || item.statusTransmissao === 'EM_TRANSITO';
          const isQueued = item.statusTransmissao === 'QUEUED' || item.statusTransmissao === 'AGUARDANDO';

          let statusAccent = colors.accent;
          let statusText = item.statusTransmissao;
          let badgeBg = `${colors.accent}15`;

          if (isQueued) {
            statusAccent = colors.purple;
            statusText = 'AGUARDANDO';
            badgeBg = `${colors.purple}15`;
          } else if (isInTransit) {
            statusAccent = colors.accent;
            statusText = 'EM TRÂNSITO';
            badgeBg = `${colors.accent}15`;
          } else if (isRetrying) {
            statusAccent = colors.orange;
            statusText = 'REPETINDO';
            badgeBg = `${colors.orange}15`;
          } else if (item.statusTransmissao === 'EXPIRED' || item.statusTransmissao === 'EXPIRADO') {
            statusAccent = colors.red;
            statusText = 'EXPIRADO';
            badgeBg = `${colors.red}15`;
          } else if (item.statusTransmissao === 'DELIVERED' || item.statusTransmissao === 'ENTREGUE') {
            statusAccent = colors.green;
            statusText = 'ENTREGUE';
            badgeBg = `${colors.green}15`;
          }

          return (
            <SpaceCard style={styles.bundleCard}>
              <View style={styles.bundleHeader}>
                <View style={styles.bundleDestGroup}>
                  <Text style={styles.bundleDestLabel}>Endpoint de Destino</Text>
                  <Text style={styles.bundleDestText} numberOfLines={1}>{meta.destino || 'dtn://unknown'}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
                  <Text style={[styles.statusText, { color: statusAccent }]}>
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
                  <Text style={[styles.metaValue, (meta.prioridade === 'HIGH' || meta.prioridade === 'ALTA') && { color: colors.red }]}>
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
                    <AlertTriangle color={colors.orange} size={14} style={{ marginRight: 4 }} />
                    <Text style={styles.warningText}>Limite de tentativas atingido</Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.transmitBtn} 
                  onPress={() => handleTransmitSingle(item.id)}
                >
                  <Send color={colors.accent} size={14} style={{ marginRight: 6 }} />
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

const getStyles = (colors: any, temaAtivo: 'light' | 'dark') => {
  const isDark = temaAtivo === 'dark';
  return StyleSheet.create({
    simulationBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${colors.orange}15`,
      borderWidth: 1,
      borderColor: `${colors.orange}30`,
      borderRadius: 10,
      padding: 10,
      marginBottom: 16,
    },
    simulationText: {
      color: colors.orange,
      fontSize: 12,
      fontWeight: '500',
    },
    overviewCard: {
      padding: 16,
      marginBottom: 16,
    },
    overviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    overviewLabel: {
      color: colors.textSecondary,
      fontSize: 11,
      marginBottom: 4,
    },
    overviewValue: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
    },
    overviewSub: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: 'normal',
    },
    verticalSeparator: {
      width: 1,
      height: 40,
      backgroundColor: colors.border,
    },
    bufferGridSection: {
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
    },
    gridHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    gridTitle: {
      color: colors.textSecondary,
      fontSize: 9,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    gridCell: {
      width: '8%', // fits 10 cells nicely with spacing
      height: 24,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
    },
    gridCellText: {
      fontSize: 7,
      color: colors.textSecondary,
    },
    gridCellTextOccupied: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 8,
    },
    legendContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 8,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    legendIndicator: {
      width: 8,
      height: 8,
      borderRadius: 2,
      marginRight: 4,
    },
    legendText: {
      color: colors.textSecondary,
      fontSize: 8,
      fontWeight: '500',
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
      borderRadius: 10,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: 'bold',
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: 100,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 12,
      textAlign: 'center',
      paddingHorizontal: 24,
    },
    bundleCard: {
      padding: 14,
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
      color: colors.textSecondary,
      fontSize: 9,
      marginBottom: 2,
    },
    bundleDestText: {
      color: colors.text,
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
      backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)',
      borderRadius: 10,
      padding: 8,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    metaCol: {
      alignItems: 'center',
      flex: 1,
    },
    metaLabel: {
      color: colors.textSecondary,
      fontSize: 9,
      marginBottom: 2,
    },
    metaValue: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
    },
    detailsBlock: {
      backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)',
      borderRadius: 10,
      padding: 8,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    detailLabel: {
      color: colors.textSecondary,
      fontSize: 9,
      fontWeight: '500',
    },
    detailVal: {
      color: colors.textSecondary,
      fontSize: 10,
      fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
      marginBottom: 6,
    },
    bundleActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 10,
    },
    warningContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    warningText: {
      color: colors.orange,
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
      color: colors.accent,
      fontSize: 12,
      fontWeight: '600',
    },
  });
};
