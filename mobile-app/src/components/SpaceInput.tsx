import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, ViewStyle, TextStyle } from 'react-native';

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
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.focusedWrapper,
          error ? styles.errorWrapper : null,
        ]}
      >
        <TextInput
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor="#64748B"
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
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  inputWrapper: {
    backgroundColor: '#0F1322',
    borderWidth: 1,
    borderColor: '#232A46',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  focusedWrapper: {
    borderColor: '#8A57FF',
  },
  errorWrapper: {
    borderColor: '#FF007A',
  },
  input: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  errorText: {
    color: '#FF007A',
    fontSize: 12,
    marginTop: 4,
  },
});
export default SpaceInput;
