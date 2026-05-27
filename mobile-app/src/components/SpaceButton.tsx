import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, ViewStyle, TextStyle, StyleProp } from 'react-native';

interface SpaceButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const SpaceButton: React.FC<SpaceButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getStyles = () => {
    let btnStyle: ViewStyle = {};
    let txtStyle: TextStyle = { color: '#FFFFFF' };

    switch (variant) {
      case 'secondary':
        btnStyle = { backgroundColor: '#00F2FE' };
        txtStyle = { color: '#0B0E1B', fontWeight: 'bold' };
        break;
      case 'danger':
        btnStyle = { backgroundColor: '#FF007A' };
        txtStyle = { color: '#FFFFFF', fontWeight: 'bold' };
        break;
      case 'outline':
        btnStyle = { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#8A57FF' };
        txtStyle = { color: '#8A57FF', fontWeight: 'bold' };
        break;
      case 'primary':
      default:
        btnStyle = { backgroundColor: '#8A57FF' };
        txtStyle = { color: '#FFFFFF', fontWeight: 'bold' };
        break;
    }

    if (disabled || loading) {
      btnStyle = { ...btnStyle, opacity: 0.5 };
    }

    return { btnStyle, txtStyle };
  };

  const { btnStyle, txtStyle } = getStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.button, btnStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#0B0E1B' : '#FFFFFF'} size="small" />
      ) : (
        <Text style={[styles.text, txtStyle, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  text: {
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
export default SpaceButton;
