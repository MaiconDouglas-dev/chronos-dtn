import React from 'react';
import { Tabs } from 'expo-router';
import { Gauge, Clock, Cpu, Database, User } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0D1A',
          borderTopColor: '#1E2540',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#00F2FE',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Gauge color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="auditor"
        options={{
          title: 'Auditor',
          tabBarIcon: ({ color, size }) => <Clock color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="nodes"
        options={{
          title: 'Nós',
          tabBarIcon: ({ color, size }) => <Cpu color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="buffer"
        options={{
          title: 'Buffer DTN',
          tabBarIcon: ({ color, size }) => <Database color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Acesso',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
