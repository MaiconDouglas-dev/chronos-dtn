import React from 'react';
import { Tabs } from 'expo-router';
import { Gauge, Clock, Cpu, Database, User } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useApp } from '../../services/AppContext';

export default function TabsLayout() {
  const { colors, temaAtivo } = useApp();
  const isDark = temaAtivo === 'dark';
  const tabBg = isDark ? 'rgba(28, 28, 30, 0.94)' : 'rgba(255, 255, 255, 0.94)';
  const tabBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 16,
          right: 16,
          backgroundColor: tabBg,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: tabBorder,
          borderRadius: 24,
          height: 64,
          paddingBottom: Platform.OS === 'ios' ? 4 : 10,
          paddingTop: 8,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.25 : 0.08,
          shadowRadius: 10,
          elevation: 6,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Telemetria',
          tabBarIcon: ({ color, size }) => <Gauge color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="auditor"
        options={{
          title: 'Relógio LTC',
          tabBarIcon: ({ color, size }) => <Clock color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="nodes"
        options={{
          title: 'Satélites',
          tabBarIcon: ({ color, size }) => <Cpu color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="buffer"
        options={{
          title: 'Fila DTN',
          tabBarIcon: ({ color, size }) => <Database color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Operador',
          tabBarIcon: ({ color, size }) => <User color={color} size={20} />,
        }}
      />
    </Tabs>
  );
}
