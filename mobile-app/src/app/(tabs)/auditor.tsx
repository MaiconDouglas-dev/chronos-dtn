import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Share, Platform } from 'react-native';
import Svg, { Circle, Line, G, Polygon, Text as SvgText, Path } from 'react-native-svg';
import { useApp } from '../../services/AppContext';
import { api } from '../../services/api';
import SpaceBackground from '../../components/SpaceBackground';
import SpaceCard from '../../components/SpaceCard';
import SpaceButton from '../../components/SpaceButton';
import Header from '../../components/Header';
import { History, Plus, ShieldCheck, Share2, AlertCircle } from 'lucide-react-native';

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
  const { colors, temaAtivo, idOperador: appOpId, setGlobalError } = useApp();
  const [audits, setAudits] = useState<AuditTransaction[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'AUDITED' | 'PENDING'>('ALL');
  const [isSimulated, setIsSimulated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Live relativist drift clock states
  const [liveLtcTime, setLiveLtcTime] = useState<string>('00:00:00.000000');
  const [liveUtcTime, setLiveUtcTime] = useState<string>('00:00:00.000000');
  const [liveDriftOffset, setLiveDriftOffset] = useState<string>('0.0000');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      
      // UTC Earth Clock
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      const milliseconds = String(now.getUTCMilliseconds()).padStart(3, '0');
      const micros = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
      const utcString = `${hours}:${minutes}:${seconds}.${milliseconds}${micros}`;
      
      // LTC Lunar Clock (runs slightly faster, offset is timezone + relativistic scale)
      const ltcHours = String((now.getUTCHours() + 1) % 24).padStart(2, '0');
      const ltcMicros = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
      const ltcString = `${ltcHours}:${minutes}:${seconds}.${milliseconds}${ltcMicros}`;
      
      // Calculate daily relativistic drift (56.02 microseconds/day)
      const msSinceUtcDayStart = (now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds()) * 1000 + now.getUTCMilliseconds();
      const pctOfDay = msSinceUtcDayStart / 86400000;
      const drift = (56.02 * pctOfDay).toFixed(4);

      setLiveUtcTime(utcString);
      setLiveLtcTime(ltcString);
      setLiveDriftOffset(drift);
    }, 200);

    return () => clearInterval(interval);
  }, []);

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

  const styles = getStyles(colors, temaAtivo);

  // Compute needle angle from the drift value with minor vibration jitter
  const driftNum = parseFloat(liveDriftOffset) || 0;
  // Map 0 - 56.02 ms drift range to 0 - 360 degrees
  const angle = ((driftNum / 56.02) * 360) % 360 + (Math.random() - 0.5) * 1.5;

  return (
    <SpaceBackground scrollable={false}>
      <Header />

      {/* Atomic Clock Display */}
      <SpaceCard style={styles.clockWidget}>
        <View style={styles.clockHeader}>
          <View style={styles.clockDotActive} />
          <Text style={styles.clockTitle}>SINCRONIZADOR DE RELÓGIO ATÔMICO LUNAR (LTC)</Text>
        </View>

        <View style={styles.clockWidgetBody}>
          {/* SVG Drift Meter (Relativistic Dial) */}
          <View style={styles.dialContainer}>
            <Svg width="110" height="110" viewBox="0 0 110 110">
              {/* Outer Scale circle */}
              <Circle cx="55" cy="55" r="48" stroke={colors.border} strokeWidth="1.5" fill="none" strokeDasharray="3, 3" />
              <Circle cx="55" cy="55" r="42" stroke={colors.textTertiary} strokeWidth="1" fill="none" />
              
              {/* Minor Tick lines */}
              {Array.from({ length: 12 }).map((_, i) => {
                const tickAngle = (i * 30 * Math.PI) / 180;
                const x1 = 55 + Math.cos(tickAngle) * 42;
                const y1 = 55 + Math.sin(tickAngle) * 42;
                const x2 = 55 + Math.cos(tickAngle) * 46;
                const y2 = 55 + Math.sin(tickAngle) * 46;
                return (
                  <Line key={i} x1={x1.toString()} y1={y1.toString()} x2={x2.toString()} y2={y2.toString()} stroke={colors.textSecondary} strokeWidth="1" />
                );
              })}

              {/* Labels on dial */}
              <SvgText x="55" y="24" fill={colors.textSecondary} fontSize="7" fontWeight="bold" textAnchor="middle">0μs</SvgText>
              <SvgText x="87" y="58" fill={colors.textSecondary} fontSize="7" fontWeight="bold" textAnchor="middle">14μs</SvgText>
              <SvgText x="55" y="93" fill={colors.textSecondary} fontSize="7" fontWeight="bold" textAnchor="middle">28μs</SvgText>
              <SvgText x="23" y="58" fill={colors.textSecondary} fontSize="7" fontWeight="bold" textAnchor="middle">42μs</SvgText>
              
              {/* Relativistic needle G group rotated */}
              <G transform={`rotate(${angle}, 55, 55)`}>
                {/* Dial Center cap */}
                <Circle cx="55" cy="55" r="4" fill={colors.accent} />
                {/* Thin Apple-style Compass Needle */}
                <Polygon points="55,16 58,55 55,59 52,55" fill={colors.accent} />
                <Polygon points="55,94 57,55 55,59 53,55" fill={colors.red} opacity="0.8" />
              </G>
            </Svg>
            <Text style={styles.dialSubText}>AGULHA DE DERIVA Δ</Text>
          </View>

          <View style={styles.clocksColGroup}>
            <View style={styles.clockRowItem}>
              <Text style={styles.clockLabel}>LUNAR STANDARD (LTC)</Text>
              <Text style={styles.clockTimeText}>{liveLtcTime}</Text>
            </View>
            
            <View style={styles.horizontalClockDivider} />

            <View style={styles.clockRowItem}>
              <Text style={styles.clockLabel}>TERRESTRE PADRÃO (UTC)</Text>
              <Text style={[styles.clockTimeText, { color: colors.textSecondary }]}>{liveUtcTime}</Text>
            </View>
          </View>
        </View>

        <View style={styles.driftMetricsBanner}>
          <Text style={styles.driftBannerTitle}>DESVIO RELATIVÍSTICO DIÁRIO ACUMULADO (Δ)</Text>
          <View style={styles.driftValRow}>
            <Text style={styles.driftBannerVal}>+{liveDriftOffset}</Text>
            <Text style={styles.driftUnitText}> μs</Text>
          </View>
          <Text style={styles.driftBannerSub}>Ajuste constante necessário devido ao potencial gravitacional lunar reduzido.</Text>
        </View>
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
          <Plus color={colors.accent} size={16} style={{ marginRight: 4 }} />
          <Text style={styles.createBtnText}>Simular</Text>
        </TouchableOpacity>
      </View>

      {/* Timeline List (Apple Wallet Style statement) */}
      <FlatList
        data={filteredAudits}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <History color={colors.textSecondary} size={48} />
            <Text style={styles.emptyText}>Nenhuma transação auditada encontrada.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isAudited = item.status === 'AUDITED';
          return (
            <SpaceCard style={styles.walletCard}>
              <View style={styles.walletHeader}>
                <View style={styles.walletLeftColumn}>
                  <Text style={styles.walletOpText}>Operador #{item.idOperador}</Text>
                  <Text style={styles.walletDateText}>Transação ID: {item.id}</Text>
                </View>
                <View style={styles.walletRightColumn}>
                  <Text style={styles.walletCredits}>
                    {item.valorCreditos.toLocaleString(undefined, { minimumFractionDigits: 2 })} <Text style={styles.walletCrText}>CRS</Text>
                  </Text>
                  <View style={styles.walletStatusRow}>
                    <View style={[styles.statusDot, { backgroundColor: isAudited ? colors.green : colors.orange }]} />
                    <Text style={[styles.walletStatusText, { color: isAudited ? colors.green : colors.orange }]}>
                      {isAudited ? 'Auditado' : 'Pendente'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.walletDivider} />

              <View style={styles.driftMetrics}>
                <View style={styles.driftColumn}>
                  <Text style={styles.driftLabel}>LTC (LUNAR)</Text>
                  <Text style={styles.driftTimeText}>{item.tempoLunarBruto}</Text>
                </View>
                <View style={styles.driftArrow}>
                  <Text style={styles.driftArrowText}>→</Text>
                </View>
                <View style={styles.driftColumn}>
                  <Text style={styles.driftLabel}>UTC (TERRA)</Text>
                  <Text style={styles.driftTimeText}>{item.tempoTerraCorrigido}</Text>
                </View>
              </View>

              <View style={styles.driftResultRow}>
                <Text style={styles.resultLabel}>Distorção Temporal Relativística (Δ):</Text>
                <Text style={styles.resultValue}>+{item.desvioMicrossegundos} μs</Text>
              </View>

              <View style={styles.hashFooter}>
                <Text style={styles.hashText} numberOfLines={1}>SHA: {item.hashTransacao}</Text>
                <TouchableOpacity onPress={() => handleShare(item)} style={styles.shareIcon}>
                  <Share2 color={colors.textSecondary} size={14} />
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
    clockWidget: {
      padding: 16,
      marginBottom: 14,
    },
    clockHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 8,
    },
    clockDotActive: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.green,
      marginRight: 8,
    },
    clockTitle: {
      color: colors.accent,
      fontSize: 9,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    clockWidgetBody: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    dialContainer: {
      width: 110,
      alignItems: 'center',
      marginRight: 16,
    },
    dialSubText: {
      fontSize: 8,
      fontWeight: 'bold',
      color: colors.textSecondary,
      marginTop: 4,
      letterSpacing: 0.5,
    },
    clocksColGroup: {
      flex: 1,
      justifyContent: 'center',
    },
    clockRowItem: {
      paddingVertical: 6,
    },
    clockLabel: {
      color: colors.textSecondary,
      fontSize: 8,
      fontWeight: 'bold',
      marginBottom: 2,
      letterSpacing: 0.5,
    },
    clockTimeText: {
      color: colors.accent,
      fontSize: 15,
      fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
      fontWeight: 'bold',
    },
    horizontalClockDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 4,
    },
    driftMetricsBanner: {
      backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.02)',
      borderRadius: 10,
      padding: 10,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    driftBannerTitle: {
      color: colors.textSecondary,
      fontSize: 8,
      fontWeight: 'bold',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    driftValRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    driftBannerVal: {
      color: colors.green,
      fontSize: 18,
      fontWeight: 'bold',
      fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    },
    driftUnitText: {
      color: colors.green,
      fontSize: 11,
      fontWeight: '600',
    },
    driftBannerSub: {
      color: colors.textSecondary,
      fontSize: 8,
      textAlign: 'center',
      marginTop: 4,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    filters: {
      flexDirection: 'row',
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      padding: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    filterBtnActive: {
      backgroundColor: isDark ? '#3A3A3C' : '#FFFFFF',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 2,
    },
    filterBtnText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '500',
    },
    filterBtnTextActive: {
      color: colors.text,
    },
    createBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${colors.accent}15`,
      borderWidth: 1,
      borderColor: colors.accent,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    createBtnText: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '600',
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 12,
    },
    walletCard: {
      padding: 16,
      marginBottom: 10,
    },
    walletHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    walletLeftColumn: {
      flex: 1,
    },
    walletOpText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    walletDateText: {
      color: colors.textSecondary,
      fontSize: 10,
      marginTop: 2,
    },
    walletRightColumn: {
      alignItems: 'flex-end',
    },
    walletCredits: {
      color: colors.text,
      fontSize: 16,
      fontWeight: 'bold',
    },
    walletCrText: {
      color: colors.green,
      fontSize: 12,
      fontWeight: 'bold',
    },
    walletStatusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 4,
    },
    walletStatusText: {
      fontSize: 10,
      fontWeight: 'bold',
    },
    walletDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 12,
    },
    driftMetrics: {
      flexDirection: 'row',
      backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.02)',
      borderRadius: 10,
      padding: 10,
      alignItems: 'center',
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    driftColumn: {
      flex: 1,
    },
    driftLabel: {
      color: colors.textSecondary,
      fontSize: 8,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    driftTimeText: {
      color: colors.text,
      fontSize: 11,
      fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    },
    driftArrow: {
      paddingHorizontal: 6,
    },
    driftArrowText: {
      color: colors.accent,
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
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '500',
    },
    resultValue: {
      color: colors.accent,
      fontSize: 13,
      fontWeight: 'bold',
    },
    hashFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 8,
      marginTop: 4,
    },
    hashText: {
      color: colors.textSecondary,
      fontSize: 9,
      fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
      flex: 1,
    },
    shareIcon: {
      paddingLeft: 10,
    },
  });
};
