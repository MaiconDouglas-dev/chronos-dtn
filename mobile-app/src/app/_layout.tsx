import React from 'react';
import { AppProvider, useApp } from '../services/AppContext';
import { Stack } from 'expo-router';
import { SpaceLoader } from '../components/SpaceLoader';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const RootLayoutContent = () => {
  const { isLoading, globalError, setGlobalError } = useApp();

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0E1B' }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
      <SpaceLoader visible={isLoading} />
      {globalError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText} numberOfLines={2}>
            {globalError}
          </Text>
          <TouchableOpacity onPress={() => setGlobalError(null)} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default function RootLayout() {
  return (
    <AppProvider>
      <RootLayoutContent />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  errorBanner: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 0, 122, 0.95)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 9999,
    shadowColor: '#FF007A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    paddingRight: 10,
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
