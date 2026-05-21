import React, { forwardRef, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { colors, radius } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  secureToggle?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, secureToggle, secureTextEntry, ...props }, ref) => {
    const [isSecure, setIsSecure] = useState(secureTextEntry ?? false);
    const [focused, setFocused] = useState(false);

    return (
      <View style={styles.wrapper}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View
          style={[
            styles.inputRow,
            focused && styles.inputFocused,
            !!error && styles.inputError,
          ]}
        >
          <TextInput
            ref={ref}
            {...props}
            secureTextEntry={isSecure}
            style={styles.input}
            placeholderTextColor={colors.textLight}
            onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          />
          {secureToggle && (
            <TouchableOpacity onPress={() => setIsSecure((v) => !v)} style={styles.eyeBtn}>
              <Text style={styles.eyeIcon}>{isSecure ? '👁' : '🙈'}</Text>
            </TouchableOpacity>
          )}
        </View>
        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: '#FDFBFF',
  },
  inputError: { borderColor: colors.error },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
  },
  eyeBtn: { padding: 4 },
  eyeIcon: { fontSize: 16 },
  errorText: { fontSize: 12, color: colors.error, marginTop: 4 },
});
