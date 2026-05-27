import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface SpaceCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  borderAccent?: 'default' | 'purple' | 'cyan' | 'green' | 'amber' | 'magenta';
}

export const SpaceCard: React.FC<SpaceCardProps> = ({ children, style, borderAccent = 'default' }) => {
  const getBorderColor = () => {
    switch (borderAccent) {
      case 'purple': return '#8A57FF';
      case 'cyan': return '#00F2FE';
      case 'green': return '#00F5A0';
      case 'amber': return '#FFB300';
      case 'magenta': return '#FF007A';
      default: return '#232A46';
    }
  };

  return (
    <View style={[styles.card, { borderColor: getBorderColor() }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(18, 22, 40, 0.85)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
});
export default SpaceCard;
