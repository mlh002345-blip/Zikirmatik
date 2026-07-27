import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radius, spacing } from '@/constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export default function Button({ label, onPress, variant = 'primary', style, disabled }: ButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  if (variant === 'primary') {
    return (
      <Pressable onPress={handlePress} disabled={disabled} style={({ pressed }) => [{ opacity: pressed ? 0.85 : disabled ? 0.5 : 1 }, style]}>
        <LinearGradient colors={[colors.goldBright, colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primary}>
          <Text style={styles.primaryLabel}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  if (variant === 'secondary') {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={({ pressed }) => [styles.secondary, { opacity: pressed ? 0.7 : disabled ? 0.5 : 1 }, style]}
      >
        <Text style={styles.secondaryLabel}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={handlePress} disabled={disabled} style={({ pressed }) => [{ opacity: pressed ? 0.6 : disabled ? 0.5 : 1 }, style]}>
      <Text style={styles.ghostLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 16,
    color: colors.emeraldDeep,
  },
  secondary: {
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  secondaryLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 16,
    color: colors.gold,
  },
  ghostLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    color: colors.emeraldSoft,
    textAlign: 'center',
  },
});
