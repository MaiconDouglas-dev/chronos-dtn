import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { useApp } from '../services/AppContext';

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
  const { colors } = useApp();

  const getStyles = () => {
    let btnStyle: ViewStyle = {};
    let txtStyle: TextStyle = { color: '#FFFFFF' };

    switch (variant) {
      case 'secondary':
        btnStyle = { backgroundColor: colors.inputBackground }; // iOS Secondary Button
        txtStyle = { color: colors.text, fontWeight: '600' };
        break;
      case 'danger':
        btnStyle = { backgroundColor: colors.red }; // iOS Red Button
        txtStyle = { color: '#FFFFFF', fontWeight: '600' };
        break;
      case 'outline':
        btnStyle = { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border };
        txtStyle = { color: colors.accent, fontWeight: '600' };
        break;
      case 'primary':
      default:
        btnStyle = { backgroundColor: colors.accent }; // iOS SF Blue Primary Button
        txtStyle = { color: '#FFFFFF', fontWeight: '600' };
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
        <ActivityIndicator color={variant === 'outline' ? colors.accent : '#FFFFFF'} size="small" />
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
    letterSpacing: 0.2,
  },
});
export default SpaceButton;
