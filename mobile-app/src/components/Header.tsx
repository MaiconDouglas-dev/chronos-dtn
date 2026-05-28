import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useApp } from '../services/AppContext';
import { useRouter } from 'expo-router';
import { Wifi, WifiOff, User } from 'lucide-react-native';
import { ChronosLogo } from './ChronosLogo';

export const Header: React.FC = () => {
  const { tokenJwt, nomeOperador, urlServidor, colors } = useApp();
  const router = useRouter();

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={styles.textContainer}>
        <ChronosLogo layout="horizontal" iconSize={20} fontSize={16} />
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Console de Sincronização Relativística</Text>
      </View>
      <TouchableOpacity
        style={[styles.profileBadge, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
        activeOpacity={0.8}
        onPress={() => router.push('/(tabs)/profile')}
      >
        <View style={styles.statusDotWrapper}>
          {tokenJwt ? (
            <Wifi color={colors.green} size={14} /> // iOS System Green
          ) : (
            <WifiOff color={colors.red} size={14} /> // iOS System Red
          )}
        </View>
        <View style={styles.operatorDetails}>
          <Text style={[styles.operatorText, { color: colors.text }]} numberOfLines={1} minimumFontScale={0.8} adjustsFontSizeToFit>
            {nomeOperador || 'Modo Offline'}
          </Text>
          <Text style={[styles.serverText, { color: colors.textSecondary }]} numberOfLines={1} minimumFontScale={0.8} adjustsFontSizeToFit>
            {urlServidor ? urlServidor.replace('http://', '').replace('/api', '') : 'Sem Servidor'}
          </Text>
        </View>
        <User color={colors.textSecondary} size={14} style={styles.userIcon} />
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
    marginBottom: 16,
    width: '100%',
  },
  textContainer: {
    flex: 1.2,
    marginRight: 6,
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 0.1,
    marginTop: 2,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    maxWidth: 150,
  },
  statusDotWrapper: {
    marginRight: 6,
  },
  operatorDetails: {
    marginRight: 4,
    flex: 1,
  },
  operatorText: {
    fontSize: 10,
    fontWeight: '600',
  },
  serverText: {
    fontSize: 8,
  },
  userIcon: {
    marginLeft: 'auto',
  },
});
export default Header;
