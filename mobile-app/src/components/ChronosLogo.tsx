import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useApp } from '../services/AppContext';

interface ChronosLogoProps {
  layout?: 'horizontal' | 'vertical';
  iconSize?: number;
  fontSize?: number;
  style?: ViewStyle;
}

export const ChronosLogo: React.FC<ChronosLogoProps> = ({
  layout = 'horizontal',
  iconSize = 24,
  fontSize = 16,
  style,
}) => {
  const { colors } = useApp();
  const isHorizontal = layout === 'horizontal';

  return (
    <View style={[isHorizontal ? styles.horizontalContainer : styles.verticalContainer, style]}>
      {/* SpaceX-style Chronos C-Orbit Logo */}
      <Svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        style={isHorizontal ? styles.marginRight : styles.marginBottom}
      >
        {/* Stylized "C" crescent body representing Chronos / Luna */}
        <Path
          d="M 68,22 A 32,32 0 1,0 68,78 A 26,26 0 1,1 68,22"
          fill={colors.text}
        />
        
        {/* Orbital DTN Swoosh (representing communication links) */}
        <Path
          d="M 12,78 C 28,75 62,54 88,22"
          fill="none"
          stroke={colors.accent}
          strokeWidth="7.5"
          strokeLinecap="round"
        />
        
        {/* Gateway Node Symbol at the end of the Swoosh */}
        <Circle cx="88" cy="22" r="5" fill={colors.accent} />
        <Circle cx="88" cy="22" r="9" stroke={colors.accent} strokeWidth="1.5" fill="none" opacity="0.4" />
      </Svg>

      {/* Brand Typography */}
      <View style={isHorizontal ? styles.horizontalText : styles.verticalText}>
        <Text style={[styles.brandText, { fontSize, color: colors.text }]}>
          CHRONOS
          <Text style={[styles.accentText, { color: colors.accent }]}> DTN</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticalContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  marginRight: {
    marginRight: 8,
  },
  marginBottom: {
    marginBottom: 12,
  },
  horizontalText: {
    flexDirection: 'row',
  },
  verticalText: {
    alignItems: 'center',
  },
  brandText: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  accentText: {
    fontWeight: '300',
  },
});

export default ChronosLogo;
