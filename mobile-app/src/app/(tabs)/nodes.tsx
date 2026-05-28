import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, Modal, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useApp } from '../../services/AppContext';
import { api } from '../../services/api';
import SpaceBackground from '../../components/SpaceBackground';
import SpaceCard from '../../components/SpaceCard';
import SpaceInput from '../../components/SpaceInput';
import SpaceButton from '../../components/SpaceButton';
import Header from '../../components/Header';
import { Plus, Edit2, Trash2, X, Satellite, Cpu } from 'lucide-react-native';
import Svg, { Circle, Line, Text as SvgText, Defs, RadialGradient, Stop } from 'react-native-svg';

interface Node {
  id: number;
  nome: string;
  latenciaTerraMs: number;
  latenciaLuaMs: number;
  status: string;
  throughputKbps: number;
}

export default function NodesManager() {
  const { setGlobalError, colors, temaAtivo } = useApp();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const styles = getStyles(colors);

  // Form fields
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [latenciaTerra, setLatenciaTerra] = useState('1280');
  const [latenciaLua, setLatenciaLua] = useState('10');
  const [status, setStatus] = useState('ONLINE');
  const [throughput, setThroughput] = useState('10240');

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

  const executeRequest = async (method: 'get' | 'post' | 'put' | 'delete', path: string, payload?: any) => {
    const cSharpPath = path.replace('/nos', '/nosatelite');
    if (method === 'get') {
      try {
        return await api.get(path);
      } catch {
        return await api.get(cSharpPath);
      }
    } else if (method === 'post') {
      try {
        return await api.post(path, payload);
      } catch {
        return await api.post(cSharpPath, payload);
      }
    } else if (method === 'put') {
      try {
        return await api.put(path, payload);
      } catch {
        return await api.put(cSharpPath, payload);
      }
    } else {
      try {
        return await api.delete(path);
      } catch {
        return await api.delete(cSharpPath);
      }
    }
  };

  const fetchNodes = async () => {
    setLoading(true);
    try {
      const res = await executeRequest('get', '/nos');
      if (res && res.data) {
        const rawList = Array.isArray(res.data) ? res.data : [];
        setNodes(rawList.map(normalizeNode));
      } else {
        setNodes(mockNodes);
      }
    } catch (err) {
      setNodes(mockNodes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setNome('');
    setLatenciaTerra('1280');
    setLatenciaLua('10');
    setStatus('ONLINE');
    setThroughput('10240');
    setShowForm(false);
  };

  const handleEdit = (node: Node) => {
    setEditingId(node.id);
    setNome(node.nome);
    setLatenciaTerra(node.latenciaTerraMs.toString());
    setLatenciaLua(node.latenciaLuaMs.toString());
    setStatus(node.status);
    setThroughput(node.throughputKbps.toString());
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza de que deseja descomissionar este nó de conectividade?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Descomissionar', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const res = await executeRequest('delete', `/nos/${id}`);
              if (res && (res.status === 200 || res.status === 204)) {
                await fetchNodes();
              } else {
                setNodes(nodes.filter(n => n.id !== id));
              }
            } catch (err) {
              setNodes(nodes.filter(n => n.id !== id));
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      setGlobalError('O nome do nó é obrigatório');
      return;
    }

    const latT = parseInt(latenciaTerra);
    const latL = parseInt(latenciaLua);
    const th = parseInt(throughput);

    if (isNaN(latT) || isNaN(latL) || isNaN(th)) {
      setGlobalError('As latências e o throughput devem ser inteiros válidos');
      return;
    }

    setLoading(true);
    const payload = {
      nome,
      latenciaTerraMs: latT,
      latencyTerraMs: latT,
      latency_terra_ms: latT,
      latenciaLuaMs: latL,
      latencyLuaMs: latL,
      latency_lua_ms: latL,
      status,
      throughputKbps: th,
      throughput_kbps: th,
    };

    try {
      if (editingId) {
        const res = await executeRequest('put', `/nos/${editingId}`, payload);
        if (res && res.data) {
          await fetchNodes();
        } else {
          setNodes(nodes.map(n => n.id === editingId ? { ...n, ...normalizeNode(payload) } : n));
        }
      } else {
        const res = await executeRequest('post', '/nos', payload);
        if (res && res.data) {
          await fetchNodes();
        } else {
          const newNode = normalizeNode(payload);
          newNode.id = Date.now();
          setNodes([...nodes, newNode]);
        }
      }
      resetForm();
    } catch (err) {
      if (editingId) {
        setNodes(nodes.map(n => n.id === editingId ? { ...n, ...normalizeNode(payload) } : n));
      } else {
        const newNode = normalizeNode(payload);
        newNode.id = Date.now();
        setNodes([...nodes, newNode]);
      }
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SpaceBackground scrollable={false}>
      <Header />

      {/* Title / Action bar */}
      <View style={styles.titleRow}>
        <View style={styles.mainTitleContainer}>
          <Satellite color={colors.accent} size={20} style={{ marginRight: 8 }} />
          <Text style={styles.title}>Nós Satélites</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Plus color="#FFFFFF" size={16} style={{ marginRight: 4 }} />
          <Text style={styles.addBtnText}>Ativar Nó</Text>
        </TouchableOpacity>
      </View>

      {/* Visualizador Orbital Lunar em SVG */}
      {nodes.length > 0 && (
        <SpaceCard style={styles.radarCard} borderAccent="default">
          <Text style={styles.radarLabel}>MAPA DE COBERTURA ORBITAL LUNAR</Text>
          <View style={styles.radarWrapper}>
            <Svg width="100%" height={120} viewBox="0 0 300 120">
              <Defs>
                <RadialGradient id="moonGrad" cx="50%" cy="50%" rx="50%" ry="50%">
                  <Stop offset="0%" stopColor={temaAtivo === 'light' ? '#E5E5EA' : '#8E8E93'} />
                  <Stop offset="80%" stopColor={temaAtivo === 'light' ? '#AEAEB2' : '#3A3A3C'} />
                  <Stop offset="100%" stopColor={temaAtivo === 'light' ? '#8E8E93' : '#1C1C1E'} />
                </RadialGradient>
              </Defs>
              
              {/* Órbitas Concéntricas */}
              <Circle cx="150" cy="60" r="32" stroke={colors.border} strokeWidth={1} strokeDasharray="3,3" fill="none" />
              <Circle cx="150" cy="60" r="50" stroke={colors.border} strokeWidth={1} strokeDasharray="4,4" fill="none" />
              
              {/* Centro: A Lua */}
              <Circle cx="150" cy="60" r="16" fill="url(#moonGrad)" />
              
              {/* Nodes plotados dinamicamente */}
              {nodes.slice(0, 5).map((item, index) => {
                const isOnline = item.status === 'ONLINE';
                const isDegraded = item.status === 'DEGRADED';
                const statusColor = isOnline ? colors.green : isDegraded ? colors.orange : colors.red;
                
                // Distribuir ângulos
                const angle = (index * (360 / Math.min(nodes.length, 5)) - 45) * Math.PI / 180;
                const radius = (index % 2 === 0) ? 32 : 50;
                
                const sx = 150 + radius * Math.cos(angle);
                const sy = 60 + radius * Math.sin(angle);
                
                // Linhas de comunicação
                return (
                  <React.Fragment key={item.id}>
                    <Line 
                      x1={sx} 
                      y1={sy} 
                      x2={150} 
                      y2={60} 
                      stroke={statusColor} 
                      strokeWidth={1} 
                      strokeDasharray="2,2" 
                      opacity={isOnline ? 0.6 : isDegraded ? 0.3 : 0.1} 
                    />
                    
                    {/* Ripple effect se estiver online */}
                    {isOnline && (
                      <Circle cx={sx} cy={sy} r={8} stroke={statusColor} strokeWidth={0.5} opacity={0.3} fill="none" />
                    )}
                    
                    {/* Ponto do Satélite */}
                    <Circle cx={sx} cy={sy} r={4.5} fill={statusColor} />
                    
                    {/* Nome Abreviado */}
                    <SvgText 
                      x={sx + (sx > 150 ? 7 : -7)} 
                      y={sy + 3} 
                      fill={colors.textSecondary} 
                      fontSize={7} 
                      fontWeight="bold"
                      textAnchor={sx > 150 ? 'start' : 'end'}
                    >
                      {item.nome.split(' ')[0]}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          </View>
        </SpaceCard>
      )}

      <FlatList
        data={nodes}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Cpu color={colors.textSecondary} size={48} />
            <Text style={styles.emptyText}>Nenhum nó de relay ativo. Clique em Ativar Nó.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isOnline = item.status === 'ONLINE';
          const isDegraded = item.status === 'DEGRADED';
          const statusAccent = isOnline ? 'green' : isDegraded ? 'amber' : 'magenta';
          const statusLabel = isOnline ? 'ONLINE' : isDegraded ? 'DEGRADADO' : 'OFFLINE';
          const statusColor = isOnline ? colors.green : isDegraded ? colors.orange : colors.red;

          return (
            <SpaceCard borderAccent={statusAccent} style={styles.nodeItem}>
              <View style={styles.nodeHeader}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.nodeName}>{item.nome}</Text>
                  <Text style={styles.nodeRate}>Throughput: {(item.throughputKbps / 1024).toFixed(2)} Mbps</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {statusLabel}
                  </Text>
                </View>
              </View>

              {/* Latency split row */}
              <View style={styles.infoRow}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Atraso nominal Terra</Text>
                  <Text style={styles.infoVal}>{item.latenciaTerraMs} ms</Text>
                </View>
                <View style={styles.dividerVertical} />
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Atraso nominal Órbita Lua</Text>
                  <Text style={styles.infoVal}>{item.latenciaLuaMs} ms</Text>
                </View>
              </View>

              {/* Actions bottom row */}
              <View style={styles.nodeActions}>
                <TouchableOpacity style={styles.nodeActionBtn} onPress={() => handleEdit(item)}>
                  <Edit2 color={colors.accent} size={14} style={{ marginRight: 6 }} />
                  <Text style={styles.nodeActionTxt}>Configurar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nodeActionBtn} onPress={() => handleDelete(item.id)}>
                  <Trash2 color={colors.red} size={14} style={{ marginRight: 6 }} />
                  <Text style={[styles.nodeActionTxt, { color: colors.red }]}>Descomissionar</Text>
                </TouchableOpacity>
              </View>
            </SpaceCard>
          );
        }}
      />

      {/* Slide-up Form Sheet (Apple-style Modal) */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={resetForm}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}
            >
              <View style={styles.modalContent}>
                <View style={styles.dragHandle} />

                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>
                    {editingId ? `Configurar Nó #${editingId}` : 'Ativar Novo Nó'}
                  </Text>
                  <TouchableOpacity onPress={resetForm}>
                    <X color={colors.textSecondary} size={20} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                  <SpaceInput
                    label="Nome do Nó (Ex: Lunar Pathfinder)"
                    placeholder="Identificador do nó satélite"
                    value={nome}
                    onChangeText={setNome}
                  />

                  <View style={styles.formGrid}>
                    <View style={styles.gridHalf}>
                      <SpaceInput
                        label="Latência Terra (ms)"
                        keyboardType="numeric"
                        value={latenciaTerra}
                        onChangeText={setLatenciaTerra}
                      />
                    </View>
                    <View style={styles.gridHalf}>
                      <SpaceInput
                        label="Latência Lua (ms)"
                        keyboardType="numeric"
                        value={latenciaLua}
                        onChangeText={setLatenciaLua}
                      />
                    </View>
                  </View>

                  <SpaceInput
                    label="Throughput (kbps)"
                    keyboardType="numeric"
                    value={throughput}
                    onChangeText={setThroughput}
                  />

                  <Text style={styles.radioLabel}>Status Operacional</Text>
                  <View style={styles.radioGroup}>
                    {['ONLINE', 'DEGRADED', 'OFFLINE'].map((st) => {
                      const isActive = status === st;
                      const accentColor = st === 'ONLINE' ? colors.green : st === 'DEGRADED' ? colors.orange : colors.red;
                      const stLabel = st === 'ONLINE' ? 'ONLINE' : st === 'DEGRADED' ? 'DEGRADADO' : 'OFFLINE';
                      return (
                        <TouchableOpacity
                          key={st}
                          style={[
                            styles.radioBtn,
                            isActive && { borderColor: accentColor, backgroundColor: accentColor + '10' }
                          ]}
                          onPress={() => setStatus(st)}
                        >
                          <Text style={[styles.radioText, isActive && { color: accentColor, fontWeight: 'bold' }]}>
                            {stLabel}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.formActions}>
                    <SpaceButton
                      title="Cancelar"
                      variant="outline"
                      onPress={resetForm}
                      style={styles.actionBtn}
                    />
                    <SpaceButton
                      title="Ativar & Sincronizar"
                      onPress={handleSave}
                      style={[styles.actionBtn, { marginLeft: 12 }]}
                      loading={loading}
                    />
                  </View>
                  <View style={{ height: 40 }} />
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SpaceBackground>
  );
}

const getStyles = (colors: typeof import('../../services/AppContext').darkTheme) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  dragHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.textSecondary + '30',
    alignSelf: 'center',
    marginBottom: 15,
  },
  modalScroll: {
    width: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
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
  },
  formContainer: {
    padding: 16,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10,
  },
  formTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: 'bold',
  },
  formGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridHalf: {
    width: '48%',
  },
  radioLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  radioBtn: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  radioText: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
  },
  nodeItem: {
    padding: 12,
    marginBottom: 12,
  },
  nodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nodeName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  nodeRate: {
    color: colors.textSecondary,
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
  },
  infoRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoCol: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    marginBottom: 2,
  },
  infoVal: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  dividerVertical: {
    width: 1,
    height: 25,
    backgroundColor: colors.border,
  },
  nodeActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginTop: 4,
  },
  nodeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 18,
    paddingVertical: 4,
  },
  nodeActionTxt: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  radarCard: {
    padding: 12,
    marginBottom: 16,
    borderRadius: 16,
  },
  radarLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  radarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
