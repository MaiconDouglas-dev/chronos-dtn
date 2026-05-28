import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../services/AppContext';
import SpaceBackground from '../components/SpaceBackground';

export default function IndexRedirect() {
  const { tokenJwt, carregandoStorage } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!carregandoStorage) {
      if (tokenJwt) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    }
  }, [carregandoStorage, tokenJwt]);

  return (
    <SpaceBackground scrollable={false}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0A84FF" />
        <Text style={styles.title}>INICIALIZANDO SISTEMAS</Text>
        <Text style={styles.subtitle}>Sincronizando link cósmico cislunar...</Text>
      </View>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 24,
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 8,
  },
});
