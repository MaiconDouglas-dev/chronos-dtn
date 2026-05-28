import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useApp } from '../services/AppContext';

interface SpaceCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  borderAccent?: 'default' | 'purple' | 'cyan' | 'green' | 'amber' | 'magenta';
}

export const SpaceCard: React.FC<SpaceCardProps> = ({ children, style, borderAccent = 'default' }) => {
  const { colors, temaAtivo } = useApp();
  const isDark = temaAtivo === 'dark';

  const getBorderColor = () => {
    switch (borderAccent) {
      case 'purple': return colors.purple; 
      case 'cyan': return colors.accent; 
      case 'green': return colors.green; 
      case 'amber': return colors.orange; 
      case 'magenta': return colors.red; 
      default: return colors.border; 
    }
  };

  return (
    <View 
      style={[
        styles.card, 
        { 
          backgroundColor: colors.cardBackground, 
          borderColor: getBorderColor(),
          shadowOpacity: isDark ? 0.35 : 0.05,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        }, 
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    elevation: 3,
  },
});
export default SpaceCard;
