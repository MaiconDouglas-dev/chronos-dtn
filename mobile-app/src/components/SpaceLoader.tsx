import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Modal } from 'react-native';

interface SpaceLoaderProps {
  visible: boolean;
  message?: string;
}

export const SpaceLoader: React.FC<SpaceLoaderProps> = ({ visible, message = 'Transmitting Data via DTN...' }) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#00F2FE" />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 16, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#161B30',
    borderWidth: 1,
    borderColor: '#8A57FF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: 240,
    shadowColor: '#8A57FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
export default SpaceLoader;
