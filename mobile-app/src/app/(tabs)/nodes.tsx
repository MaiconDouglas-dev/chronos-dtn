import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useApp } from '../../services/AppContext';
import { api } from '../../services/api';
import SpaceBackground from '../../components/SpaceBackground';
import SpaceCard from '../../components/SpaceCard';
import SpaceInput from '../../components/SpaceInput';
import SpaceButton from '../../components/SpaceButton';
import Header from '../../components/Header';
import { Plus, Edit2, Trash2, X, Satellite, Cpu } from 'lucide-react-native';

interface Node {
  id: number;
  nome: string;
  latency_terra_ms: number;
  latency_lua_ms: number;
  status: string;
  throughput_kbps: number;
}

export default function NodesManager() {
  const { setGlobalError } = useApp();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form fields
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [latencyTerra, setLatencyTerra] = useState('1280');
  const [latencyLua, setLatencyLua] = useState('10');
  const [status, setStatus] = useState('ONLINE');
  const [throughput, setThroughput] = useState('10240');

  const mockNodes: Node[] = [
    { id: 1, nome: 'LunaPath-1 (Orbital Relay)', latency_terra_ms: 1320, latency_lua_ms: 8, status: 'ONLINE', throughput_kbps: 25600 },
    { id: 2, nome: 'LOP-G Gateway Comms', latency_terra_ms: 1280, latency_lua_ms: 5, status: 'ONLINE', throughput_kbps: 102400 },
    { id: 3, nome: 'Shackleton Surface Base', latency_terra_ms: 1410, latency_lua_ms: 2, status: 'DEGRADED', throughput_kbps: 512 },
    { id: 4, nome: 'LunaRelay-4 (Far Side)', latency_terra_ms: 1550, latency_lua_ms: 15, status: 'ONLINE', throughput_kbps: 4096 },
  ];

  const fetchNodes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/nodes');
      if (res && res.data) {
        setNodes(res.data);
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
    setLatencyTerra('1280');
    setLatencyLua('10');
    setStatus('ONLINE');
    setThroughput('10240');
    setShowForm(false);
  };

  const handleEdit = (node: Node) => {
    setEditingId(node.id);
    setNome(node.nome);
    setLatencyTerra(node.latency_terra_ms.toString());
    setLatencyLua(node.latency_lua_ms.toString());
    setStatus(node.status);
    setThroughput(node.throughput_kbps.toString());
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to decommission this connectivity node?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Decommission', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const res = await api.delete(`/nodes/${id}`);
              if (res && res.data) {
                await fetchNodes();
              } else {
                // local fallback
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
      setGlobalError('Node name is required');
      return;
    }

    const latT = parseInt(latencyTerra);
    const latL = parseInt(latencyLua);
    const th = parseInt(throughput);

    if (isNaN(latT) || isNaN(latL) || isNaN(th)) {
      setGlobalError('Latencies and Throughput must be valid integers');
      return;
    }

    setLoading(true);
    const payload = {
      nome,
      latency_terra_ms: latT,
      latency_lua_ms: latL,
      status,
      throughput_kbps: th,
    };

    try {
      if (editingId) {
        // Edit Mode
        const res = await api.put(`/nodes/${editingId}`, payload);
        if (res && res.data) {
          await fetchNodes();
        } else {
          // local fallback
          setNodes(nodes.map(n => n.id === editingId ? { ...n, ...payload } : n));
        }
      } else {
        // Create Mode
        const res = await api.post('/nodes', payload);
        if (res && res.data) {
          await fetchNodes();
        } else {
          // local fallback
          const newNode: Node = {
            id: Date.now(),
            ...payload,
          };
          setNodes([...nodes, newNode]);
        }
      }
      resetForm();
    } catch (err) {
      // Local updates in simulation mode
      if (editingId) {
        setNodes(nodes.map(n => n.id === editingId ? { ...n, ...payload } : n));
      } else {
        const newNode: Node = {
          id: Date.now(),
          ...payload,
        };
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
          <Satellite color="#00F2FE" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.title}>Satellite Nodes</Text>
        </View>
        {!showForm && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
            <Plus color="#FFFFFF" size={16} style={{ marginRight: 4 }} />
            <Text style={styles.addBtnText}>Deploy Node</Text>
          </TouchableOpacity>
        )}
      </View>

      {showForm ? (
        <SpaceCard borderAccent="purple" style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>{editingId ? `Configure Node #${editingId}` : 'Deploy New Node'}</Text>
            <TouchableOpacity onPress={resetForm}>
              <X color="#94A3B8" size={20} />
            </TouchableOpacity>
          </View>

          <SpaceInput
            label="Node Name (e.g. Lunar Pathfinder)"
            placeholder="Enter node identifier"
            value={nome}
            onChangeText={setNome}
          />

          <View style={styles.formGrid}>
            <View style={styles.gridHalf}>
              <SpaceInput
                label="Earth Latency (ms)"
                keyboardType="numeric"
                value={latencyTerra}
                onChangeText={setLatencyTerra}
              />
            </View>
            <View style={styles.gridHalf}>
              <SpaceInput
                label="Lunar Latency (ms)"
                keyboardType="numeric"
                value={latencyLua}
                onChangeText={setLatencyLua}
              />
            </View>
          </View>

          <SpaceInput
            label="Throughput (kbps)"
            keyboardType="numeric"
            value={throughput}
            onChangeText={setThroughput}
          />

          {/* Status buttons */}
          <Text style={styles.radioLabel}>Operational Status</Text>
          <View style={styles.radioGroup}>
            {['ONLINE', 'DEGRADED', 'OFFLINE'].map((st) => {
              const isActive = status === st;
              const accentColor = st === 'ONLINE' ? '#00F5A0' : st === 'DEGRADED' ? '#FFB300' : '#FF007A';
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
                    {st}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.formActions}>
            <SpaceButton
              title="Cancel"
              variant="outline"
              onPress={resetForm}
              style={styles.actionBtn}
            />
            <SpaceButton
              title="Deploy & Synchronize"
              onPress={handleSave}
              style={[styles.actionBtn, { marginLeft: 12 }]}
              loading={loading}
            />
          </View>
        </SpaceCard>
      ) : (
        <FlatList
          data={nodes}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Cpu color="#64748B" size={48} />
              <Text style={styles.emptyText}>No active relays. Click deploy to start.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isOnline = item.status === 'ONLINE';
            const isDegraded = item.status === 'DEGRADED';
            const statusAccent = isOnline ? 'green' : isDegraded ? 'amber' : 'magenta';

            return (
              <SpaceCard borderAccent={statusAccent} style={styles.nodeItem}>
                <View style={styles.nodeHeader}>
                  <View>
                    <Text style={styles.nodeName}>{item.nome}</Text>
                    <Text style={styles.nodeRate}>Throughput: {(item.throughput_kbps / 1024).toFixed(2)} Mbps</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: isOnline ? '#05C18015' : isDegraded ? '#FFB30015' : '#FF007A15' }]}>
                    <Text style={[styles.statusText, { color: isOnline ? '#00F5A0' : isDegraded ? '#FFB300' : '#FF007A' }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                {/* Latency split row */}
                <View style={styles.infoRow}>
                  <View style={styles.infoCol}>
                    <Text style={styles.infoLabel}>Earth-Moon nominal delay</Text>
                    <Text style={styles.infoVal}>{item.latency_terra_ms} ms</Text>
                  </View>
                  <View style={styles.dividerVertical} />
                  <View style={styles.infoCol}>
                    <Text style={styles.infoLabel}>Surface-Orbit nominal delay</Text>
                    <Text style={styles.infoVal}>{item.latency_lua_ms} ms</Text>
                  </View>
                </View>

                {/* Actions bottom row */}
                <View style={styles.nodeActions}>
                  <TouchableOpacity style={styles.nodeActionBtn} onPress={() => handleEdit(item)}>
                    <Edit2 color="#00F2FE" size={14} style={{ marginRight: 6 }} />
                    <Text style={styles.nodeActionTxt}>Configure</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.nodeActionBtn} onPress={() => handleDelete(item.id)}>
                    <Trash2 color="#FF007A" size={14} style={{ marginRight: 6 }} />
                    <Text style={[styles.nodeActionTxt, { color: '#FF007A' }]}>Decommission</Text>
                  </TouchableOpacity>
                </View>
              </SpaceCard>
            );
          }}
        />
      )}
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8A57FF',
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
    color: '#64748B',
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
    borderBottomColor: '#232A46',
    paddingBottom: 10,
  },
  formTitle: {
    color: '#FFFFFF',
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
    color: '#94A3B8',
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
    borderColor: '#232A46',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  radioText: {
    color: '#64748B',
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
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  nodeRate: {
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
  },
  infoRow: {
    flexDirection: 'row',
    backgroundColor: '#0A0D1A',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#181E35',
  },
  infoCol: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    color: '#64748B',
    fontSize: 9,
    marginBottom: 2,
  },
  infoVal: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dividerVertical: {
    width: 1,
    height: 25,
    backgroundColor: '#181E35',
  },
  nodeActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#1E2540',
    paddingTop: 10,
  },
  nodeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 18,
    paddingVertical: 4,
  },
  nodeActionTxt: {
    color: '#00F2FE',
    fontSize: 12,
    fontWeight: '600',
  },
});
