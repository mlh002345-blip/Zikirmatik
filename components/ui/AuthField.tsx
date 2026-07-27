import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/theme';

interface AuthFieldProps extends TextInputProps {
  label: string;
}

export default function AuthField({ label, style, ...props }: AuthFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.mist}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.mist,
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(251,246,234,0.06)',
    borderWidth: 1,
    borderColor: colors.hairlineOnDark,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.cream,
  },
});
