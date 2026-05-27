import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Share } from 'react-native';
import { useApp } from '../../services/AppContext';
import { api } from '../../services/api';
import SpaceBackground from '../../components/SpaceBackground';
import SpaceCard from '../../components/SpaceCard';
import SpaceButton from '../../components/SpaceButton';
import Header from '../../components/Header';
import { History, Plus, AlertCircle, ShieldCheck, Share2 } from 'lucide-react-native';

interface AuditTransaction {
  id: number;
  idOperador: number;
  valorCreditos: number;
  tempoLunarBruto: number;
  tempoTerraCorrigido: number;
  desvioMicrossegundos: number;
  status: string;
  hashTransacao: string;
}

export default function Auditor() {
  const { idOperador: appOpId, setGlobalError } = useApp();
  const [audits, setAudits] = useState<AuditTransaction[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'AUDITED' | 'PENDING'>('ALL');
  const [isSimulated, setIsSimulated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock initial transactions
  const mockAudits: AuditTransaction[] = [
    {
      id: 1,
      idOperador: 1,
      valorCreditos: 15000.0000,
      tempoLunarBruto: 1779986400000056,
      tempoTerraCorrigido: 1779986400000000,
      desvioMicrossegundos: 56,
      status: 'AUDITED',
      hashTransacao: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
    },
    {
      id: 2,
      idOperador: 2,
      valorCreditos: 450.2500,
      tempoLunarBruto: 1780764000000560,
      tempoTerraCorrigido: 1780764000000000,
      desvioMicrossegundos: 560,
      status: 'AUDITED',
      hashTransacao: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    },
    {
      id: 3,
      idOperador: 3,
      valorCreditos: 23500.8000,
      tempoLunarBruto: 1781200000000840,
      tempoTerraCorrigido: 1781200000000000,
      desvioMicrossegundos: 840,
      status: 'PENDING',
      hashTransacao: '5c0e4871e9a3b68c4d168537612f00a6e0339d1b6192131d2ba510ff3d91789c'
    }
  ];

  const parseAudit = (data: any): AuditTransaction => {
    // Standardize backend response fields to local state
    const op = data.operator ? data.operator.id : null;
    return {
      id: data.id,
      idOperador: data.idOperador ?? data.operadoraId ?? data.operadora_id ?? op ?? 1,
      valorCreditos: data.valorCreditos ?? data.vlCreditos ?? data.vl_creditos ?? 0,
      tempoLunarBruto: data.tempoLunarBruto ?? data.tmLunarBruto ?? data.tm_lunar_bruto ?? 0,
      tempoTerraCorrigido: data.tempoTerraCorrigido ?? data.tmTerraCorrigido ?? data.tm_terra_corrigido ?? 0,
      desvioMicrossegundos: data.desvioMicrossegundos ?? data.desvio_microssegundos ?? 0,
      status: data.status || 'PENDING',
      hashTransacao: data.hashTransacao ?? data.hash_transacao ?? '',
    };
  };

  const fetchAudits = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await api.get('/transacoes');
      } catch {
        res = await api.get('/transactions');
      }

      if (res && res.data) {
        // HATEOAS or array parsing
        const rawList = Array.isArray(res.data) 
          ? res.data 
          : (res.data._embedded?.auditedTransactionList || res.data._embedded?.auditedTransactions || []);
        setAudits(rawList.map(parseAudit));
        setIsSimulated(false);
      } else {
        setAudits(mockAudits);
        setIsSimulated(true);
      }
    } catch (err) {
      setAudits(mockAudits);
      setIsSimulated(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const simulateNewAudit = async () => {
    setLoading(true);
    const mockOperators = [1, 2, 3];
    const opId = appOpId ? parseInt(appOpId.replace(/[^0-9]/g, '')) || 1 : mockOperators[Math.floor(Math.random() * mockOperators.length)];
    const credits = parseFloat((Math.random() * 5000 + 100).toFixed(2));
    
    // Relativistic drift grows over time (56μs drift incremented)
    const baseOffset = 1781200000000000;
    const daysOffset = audits.length * 24 * 60 * 60 * 1000000;
    const earthTime = baseOffset + daysOffset;
    const drift = audits.length * 56 + 56;
    const lunarTime = earthTime + drift;
    
    const hexChars = '0123456789abcdef';
    let randomHash = '';
    for (let i = 0; i < 64; i++) {
      randomHash += hexChars[Math.floor(Math.random() * 16)];
    }

    const payload = {
      operadoraId: opId,
      idOperador: opId,
      vlCreditos: credits,
      valorCreditos: credits,
      tmLunarBruto: lunarTime,
      tempoLunarBruto: lunarTime,
      hashTransacao: randomHash,
      status: 'PENDING'
    };

    try {
      let res;
      try {
        res = await api.post('/transacoes', payload);
      } catch {
        res = await api.post('/transactions', payload);
      }

      if (res && res.data) {
        await fetchAudits();
      } else {
        const newAudit: AuditTransaction = {
          id: audits.length + 1,
          idOperador: opId,
          valorCreditos: credits,
          tempoLunarBruto: lunarTime,
          tempoTerraCorrigido: earthTime,
          desvioMicrossegundos: drift,
          status: 'PENDING',
          hashTransacao: randomHash
        };
        setAudits([newAudit, ...audits]);
      }
    } catch (err) {
      const newAudit: AuditTransaction = {
        id: audits.length + 1,
        idOperador: opId,
        valorCreditos: credits,
        tempoLunarBruto: lunarTime,
        tempoTerraCorrigido: earthTime,
        desvioMicrossegundos: drift,
        status: 'PENDING',
        hashTransacao: randomHash
      };
      setAudits([newAudit, ...audits]);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (tx: AuditTransaction) => {
    try {
      await Share.share({
        message: `Auditoria Temporal Relativística - Chronos DTN\nTX Hash: ${tx.hashTransacao}\nCréditos: ${tx.valorCreditos.toFixed(2)} CRS\nDesvio Relativístico: +${tx.desvioMicrossegundos} μs\nLTC (Lunar): ${tx.tempoLunarBruto}\nUTC (Terra): ${tx.tempoTerraCorrigido}`,
      });
    } catch (error) {
      setGlobalError('Não foi possível compartilhar os detalhes da auditoria');
    }
  };

  const filteredAudits = audits.filter(a => {
    if (filter === 'AUDITED') return a.status === 'AUDITED';
    if (filter === 'PENDING') return a.status === 'PENDING';
    return true;
  });

  return (
    <SpaceBackground scrollable={false}>
      <Header />

      {/* Physics Card Context */}
      <SpaceCard borderAccent="purple" style={styles.infoCard}>
        <View style={styles.infoTitleRow}>
          <AlertCircle color="#8A57FF" size={18} style={{ marginRight: 6 }} />
          <Text style={styles.infoTitle}>Compensação Relativística (Relatividade de Einstein)</Text>
        </View>
        <Text style={styles.infoBody}>
          Relógios sob gravidade lunar (LTC) correm mais rápido do que na Terra (UTC) em cerca de <Text style={styles.highlightText}>56,02 microssegundos por dia</Text>. Este console mede carimbos de data/hora brutos e audita o desvio relativístico (<Text style={styles.highlightCyan}>Δμs</Text>) para manter o consenso.
        </Text>
      </SpaceCard>

      {/* Action / Filter Bar */}
      <View style={styles.actionRow}>
        <View style={styles.filters}>
          <TouchableOpacity 
            style={[styles.filterBtn, filter === 'ALL' && styles.filterBtnActive]} 
            onPress={() => setFilter('ALL')}
          >
            <Text style={[styles.filterBtnText, filter === 'ALL' && styles.filterBtnTextActive]}>Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterBtn, filter === 'AUDITED' && styles.filterBtnActive]} 
            onPress={() => setFilter('AUDITED')}
          >
            <Text style={[styles.filterBtnText, filter === 'AUDITED' && styles.filterBtnTextActive]}>Auditados</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterBtn, filter === 'PENDING' && styles.filterBtnActive]} 
            onPress={() => setFilter('PENDING')}
          >
            <Text style={[styles.filterBtnText, filter === 'PENDING' && styles.filterBtnTextActive]}>Pendentes</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.createBtn} onPress={simulateNewAudit} disabled={loading}>
          <Plus color="#00F2FE" size={16} style={{ marginRight: 4 }} />
          <Text style={styles.createBtnText}>Simular</Text>
        </TouchableOpacity>
      </View>

      {/* Timeline List */}
      <FlatList
        data={filteredAudits}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <History color="#64748B" size={48} />
            <Text style={styles.emptyText}>Nenhuma transação auditada encontrada.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isAudited = item.status === 'AUDITED';
          return (
            <SpaceCard borderAccent={isAudited ? 'green' : 'amber'} style={styles.auditCard}>
              <View style={styles.auditHeader}>
                <View style={styles.opGroup}>
                  <Text style={styles.opLabel}>Operador #{item.idOperador}</Text>
                  <Text style={styles.creditsText}>{item.valorCreditos.toLocaleString(undefined, { minimumFractionDigits: 2 })} <Text style={styles.crLabel}>CRS</Text></Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: isAudited ? '#05C18020' : '#FFB30020' }]}>
                  <ShieldCheck color={isAudited ? '#00F5A0' : '#FFB300'} size={14} style={{ marginRight: 4 }} />
                  <Text style={[styles.statusText, { color: isAudited ? '#00F5A0' : '#FFB300' }]}>{isAudited ? 'AUDITADO' : 'PENDENTE'}</Text>
                </View>
              </View>

              <View style={styles.driftMetrics}>
                <View style={styles.driftColumn}>
                  <Text style={styles.driftLabel}>Local Lunar (LTC)</Text>
                  <Text style={styles.driftTimeText}>{item.tempoLunarBruto}</Text>
                </View>
                <View style={styles.driftArrow}>
                  <Text style={styles.driftArrowText}>→</Text>
                </View>
                <View style={styles.driftColumn}>
                  <Text style={styles.driftLabel}>Corrigido Terra (UTC)</Text>
                  <Text style={styles.driftTimeText}>{item.tempoTerraCorrigido}</Text>
                </View>
              </View>

              <View style={styles.driftResultRow}>
                <Text style={styles.resultLabel}>Desvio Relativístico (Δ):</Text>
                <Text style={styles.resultValue}>+{item.desvioMicrossegundos} μs</Text>
              </View>

              <View style={styles.hashFooter}>
                <Text style={styles.hashText} numberOfLines={1}>SHA: {item.hashTransacao}</Text>
                <TouchableOpacity onPress={() => handleShare(item)} style={styles.shareIcon}>
                  <Share2 color="#94A3B8" size={14} />
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
  infoCard: {
    padding: 12,
    marginBottom: 14,
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  infoBody: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
  },
  highlightText: {
    color: '#8A57FF',
    fontWeight: '600',
  },
  highlightCyan: {
    color: '#00F2FE',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filters: {
    flexDirection: 'row',
    backgroundColor: '#0F1322',
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: '#232A46',
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  filterBtnActive: {
    backgroundColor: '#1E2540',
  },
  filterBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  filterBtnTextActive: {
    color: '#FFFFFF',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    borderWidth: 1,
    borderColor: '#00F2FE',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  createBtnText: {
    color: '#00F2FE',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 12,
  },
  auditCard: {
    padding: 12,
    marginBottom: 10,
  },
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  opGroup: {
    flex: 1,
  },
  opLabel: {
    color: '#64748B',
    fontSize: 10,
    marginBottom: 2,
  },
  creditsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  crLabel: {
    color: '#00F5A0',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  driftMetrics: {
    flexDirection: 'row',
    backgroundColor: '#0A0D1A',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#181E35',
  },
  driftColumn: {
    flex: 1,
  },
  driftLabel: {
    color: '#64748B',
    fontSize: 9,
    marginBottom: 2,
  },
  driftTimeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  driftArrow: {
    paddingHorizontal: 6,
  },
  driftArrowText: {
    color: '#8A57FF',
    fontSize: 16,
  },
  driftResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  resultLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  resultValue: {
    color: '#00F2FE',
    fontSize: 14,
    fontWeight: 'bold',
  },
  hashFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1A213B',
    paddingTop: 8,
    marginTop: 4,
  },
  hashText: {
    color: '#64748B',
    fontSize: 9,
    fontFamily: 'monospace',
    flex: 1,
  },
  shareIcon: {
    paddingLeft: 10,
  },
});
