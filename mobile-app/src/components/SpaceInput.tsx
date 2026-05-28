import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, ViewStyle, TextStyle } from 'react-native';
import { useApp } from '../services/AppContext';

interface SpaceInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'url';
  style?: ViewStyle;
  inputStyle?: TextStyle;
  error?: string | null;
}

export const SpaceInput: React.FC<SpaceInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  style,
  inputStyle,
  error,
}) => {
  const { colors } = useApp();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          { 
            backgroundColor: colors.inputBackground, 
            borderColor: error ? colors.red : isFocused ? colors.accent : colors.border 
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.text }, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      {error && <Text style={[styles.errorText, { color: colors.red }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  input: {
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
export default SpaceInput;
