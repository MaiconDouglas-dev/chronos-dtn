import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Modal } from 'react-native';

interface SpaceLoaderProps {
  visible: boolean;
  message?: string;
}

export const SpaceLoader: React.FC<SpaceLoaderProps> = ({ visible, message = 'Transmitting Data via DTN...' }) => {
  const innerContent = (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#0A84FF" />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );

  return innerContent;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    width: 240,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
export default SpaceLoader;
