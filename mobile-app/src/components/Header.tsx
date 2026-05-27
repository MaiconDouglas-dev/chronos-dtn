import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useApp } from '../services/AppContext';
import { useRouter } from 'expo-router';
import { Wifi, WifiOff, User } from 'lucide-react-native';

export const Header: React.FC = () => {
  const { tokenJwt, nomeOperador, urlServidor } = useApp();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1} minimumFontScale={0.8} adjustsFontSizeToFit>CHRONOS DTN</Text>
        <Text style={styles.subtitle} numberOfLines={1} minimumFontScale={0.8} adjustsFontSizeToFit>Console de Sincronização Relativística</Text>
      </View>
      <TouchableOpacity
        style={styles.profileBadge}
        activeOpacity={0.8}
        onPress={() => router.push('/(tabs)/profile')}
      >
        <View style={styles.statusDotWrapper}>
          {tokenJwt ? (
            <Wifi color="#00F5A0" size={14} />
          ) : (
            <WifiOff color="#FF007A" size={14} />
          )}
        </View>
        <View style={styles.operatorDetails}>
          <Text style={styles.operatorText} numberOfLines={1} minimumFontScale={0.8} adjustsFontSizeToFit>
            {nomeOperador || 'Modo Offline'}
          </Text>
          <Text style={styles.serverText} numberOfLines={1} minimumFontScale={0.8} adjustsFontSizeToFit>
            {urlServidor ? urlServidor.replace('http://', '').replace('/api', '') : 'Sem Servidor'}
          </Text>
        </View>
        <User color="#94A3B8" size={14} style={styles.userIcon} />
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
    width: '100%',
  },
  textContainer: {
    flex: 1.2,
    marginRight: 6,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#00F2FE',
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B30',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#232A46',
    flex: 1,
    maxWidth: 150,
  },
  statusDotWrapper: {
    marginRight: 4,
  },
  operatorDetails: {
    marginRight: 4,
    flex: 1,
  },
  operatorText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  serverText: {
    color: '#94A3B8',
    fontSize: 8,
  },
  userIcon: {
    marginLeft: 'auto',
  },
});
export default Header;
