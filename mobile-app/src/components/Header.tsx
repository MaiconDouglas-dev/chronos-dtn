import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useApp } from '../services/AppContext';
import { useRouter } from 'expo-router';
import { Wifi, WifiOff, User } from 'lucide-react-native';

export const Header: React.FC = () => {
  const { jwtToken, operatorName, serverUrl } = useApp();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>CHRONOS DTN</Text>
        <Text style={styles.subtitle}>Relativistic Sync Console</Text>
      </View>
      <TouchableOpacity
        style={styles.profileBadge}
        activeOpacity={0.8}
        onPress={() => router.push('/(tabs)/profile')}
      >
        <View style={styles.statusDotWrapper}>
          {jwtToken ? (
            <Wifi color="#00F5A0" size={16} />
          ) : (
            <WifiOff color="#FF007A" size={16} />
          )}
        </View>
        <View style={styles.operatorDetails}>
          <Text style={styles.operatorText} numberOfLines={1}>
            {operatorName || 'Offline Mode'}
          </Text>
          <Text style={styles.serverText} numberOfLines={1}>
            {serverUrl ? serverUrl.replace('http://', '').replace('/api', '') : 'No Server'}
          </Text>
        </View>
        <User color="#94A3B8" size={18} style={styles.userIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#232A46',
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  subtitle: {
    color: '#00F2FE',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B30',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#232A46',
    maxWidth: 200,
  },
  statusDotWrapper: {
    marginRight: 6,
  },
  operatorDetails: {
    marginRight: 8,
    flex: 1,
  },
  operatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  serverText: {
    color: '#94A3B8',
    fontSize: 10,
  },
  userIcon: {
    marginLeft: 'auto',
  },
});
export default Header;
