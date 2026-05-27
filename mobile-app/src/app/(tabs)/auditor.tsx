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
  operadora_id: number;
  vl_creditos: number;
  tm_lunar_bruto: number;
  tm_terra_corrigido: number;
  desvio_microssegundos: number;
  status: string;
  hash_transacao: string;
}

export default function Auditor() {
  const { jwtToken, setGlobalError } = useApp();
  const [audits, setAudits] = useState<AuditTransaction[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'AUDITED' | 'PENDING'>('ALL');
  const [isSimulated, setIsSimulated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock initial transactions
  const mockAudits: AuditTransaction[] = [
    {
      id: 1,
      operadora_id: 1,
      vl_creditos: 15000.0000,
      tm_lunar_bruto: 1779986400000056,
      tm_terra_corrigido: 1779986400000000,
      desvio_microssegundos: 56,
      status: 'AUDITED',
      hash_transacao: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
    },
    {
      id: 2,
      operadora_id: 2,
      vl_creditos: 450.2500,
      tm_lunar_bruto: 1780764000000560,
      tm_terra_corrigido: 1780764000000000,
      desvio_microssegundos: 560,
      status: 'AUDITED',
      hash_transacao: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    },
    {
      id: 3,
      operadora_id: 3,
      vl_creditos: 23500.8000,
      tm_lunar_bruto: 1781200000000840,
      tm_terra_corrigido: 1781200000000000,
      desvio_microssegundos: 840,
      status: 'PENDING',
      hash_transacao: '5c0e4871e9a3b68c4d168537612f00a6e0339d1b6192131d2ba510ff3d91789c'
    }
  ];

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audits');
      if (res && res.data) {
        setAudits(res.data);
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
    const operatorId = mockOperators[Math.floor(Math.random() * mockOperators.length)];
    const credits = parseFloat((Math.random() * 5000 + 100).toFixed(2));
    
    // Relativistic drift grows over time (let's say 56μs drift incremented)
    const baseOffset = 1781200000000000;
    const daysOffset = audits.length * 24 * 60 * 60 * 1000000; // microsec per day
    const earthTime = baseOffset + daysOffset;
    const drift = audits.length * 56 + 56; // 56 μs per iteration
    const lunarTime = earthTime + drift;
    
    const hexChars = '0123456789abcdef';
    let randomHash = '';
    for (let i = 0; i < 64; i++) {
      randomHash += hexChars[Math.floor(Math.random() * 16)];
    }

    const payload = {
      operadora_id: operatorId,
      vl_creditos: credits,
      tm_lunar_bruto: lunarTime,
      tm_terra_corrigido: earthTime,
      desvio_microssegundos: drift,
      status: 'PENDING',
      hash_transacao: randomHash
    };

    try {
      const res = await api.post('/audits', payload);
      if (res && res.data) {
        await fetchAudits();
      } else {
        // Local state simulate
        const newAudit: AuditTransaction = {
          id: audits.length + 1,
          ...payload
        };
        setAudits([newAudit, ...audits]);
      }
    } catch (err) {
      // Local state simulate
      const newAudit: AuditTransaction = {
        id: audits.length + 1,
        ...payload
      };
      setAudits([newAudit, ...audits]);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (tx: AuditTransaction) => {
    try {
      await Share.share({
        message: `Relativistic Time Audit - Chronos DTN\nTX Hash: ${tx.hash_transacao}\nCredits: ${tx.vl_creditos.toFixed(2)} CRS\nRelativistic Drift: +${tx.desvio_microssegundos} μs\nLTC (Lunar): ${tx.tm_lunar_bruto}\nUTC (Earth): ${tx.tm_terra_corrigido}`,
      });
    } catch (error) {
      setGlobalError('Could not share audit details');
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
          <Text style={styles.infoTitle}>Relativistic Compensation (Einstein's Relativity)</Text>
        </View>
        <Text style={styles.infoBody}>
          Clocks in Lunar gravity (LTC) tick faster than Earth clocks (UTC) by approximately <Text style={styles.highlightText}>56.02 microseconds per day</Text>. This console measures raw transactional timestamps and audits relativistic drift (<Text style={styles.highlightCyan}>Δμs</Text>) to maintain ledger consensus.
        </Text>
      </SpaceCard>

      {/* Action / Filter Bar */}
      <View style={styles.actionRow}>
        <View style={styles.filters}>
          <TouchableOpacity 
            style={[styles.filterBtn, filter === 'ALL' && styles.filterBtnActive]} 
            onPress={() => setFilter('ALL')}
          >
            <Text style={[styles.filterBtnText, filter === 'ALL' && styles.filterBtnTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterBtn, filter === 'AUDITED' && styles.filterBtnActive]} 
            onPress={() => setFilter('AUDITED')}
          >
            <Text style={[styles.filterBtnText, filter === 'AUDITED' && styles.filterBtnTextActive]}>Audited</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterBtn, filter === 'PENDING' && styles.filterBtnActive]} 
            onPress={() => setFilter('PENDING')}
          >
            <Text style={[styles.filterBtnText, filter === 'PENDING' && styles.filterBtnTextActive]}>Pending</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.createBtn} onPress={simulateNewAudit} disabled={loading}>
          <Plus color="#00F2FE" size={16} style={{ marginRight: 4 }} />
          <Text style={styles.createBtnText}>Simulate</Text>
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
            <Text style={styles.emptyText}>No audited transactions found.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isAudited = item.status === 'AUDITED';
          return (
            <SpaceCard borderAccent={isAudited ? 'green' : 'amber'} style={styles.auditCard}>
              <View style={styles.auditHeader}>
                <View style={styles.opGroup}>
                  <Text style={styles.opLabel}>Operator #{item.operadora_id}</Text>
                  <Text style={styles.creditsText}>{item.vl_creditos.toLocaleString(undefined, { minimumFractionDigits: 2 })} <Text style={styles.crLabel}>CRS</Text></Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: isAudited ? '#05C18020' : '#FFB30020' }]}>
                  <ShieldCheck color={isAudited ? '#00F5A0' : '#FFB300'} size={14} style={{ marginRight: 4 }} />
                  <Text style={[styles.statusText, { color: isAudited ? '#00F5A0' : '#FFB300' }]}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.driftMetrics}>
                <View style={styles.driftColumn}>
                  <Text style={styles.driftLabel}>Lunar Local (LTC)</Text>
                  <Text style={styles.driftTimeText}>{item.tm_lunar_bruto}</Text>
                </View>
                <View style={styles.driftArrow}>
                  <Text style={styles.driftArrowText}>→</Text>
                </View>
                <View style={styles.driftColumn}>
                  <Text style={styles.driftLabel}>Earth Corrected (UTC)</Text>
                  <Text style={styles.driftTimeText}>{item.tm_terra_corrigido}</Text>
                </View>
              </View>

              <View style={styles.driftResultRow}>
                <Text style={styles.resultLabel}>Relativistic Drift (Δ):</Text>
                <Text style={styles.resultValue}>+{item.desvio_microssegundos} μs</Text>
              </View>

              <View style={styles.hashFooter}>
                <Text style={styles.hashText} numberOfLines={1}>SHA: {item.hash_transacao}</Text>
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
