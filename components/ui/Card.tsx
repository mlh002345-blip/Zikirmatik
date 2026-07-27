import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, shadow, spacing } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  dark?: boolean;
  noPadding?: boolean;
}

export default function Card({ children, style, dark, noPadding }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        dark ? styles.dark : styles.light,
        noPadding ? undefined : styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    ...shadow.soft,
  },
  light: {
    backgroundColor: colors.ivory,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  dark: {
    backgroundColor: 'rgba(251,246,234,0.06)',
    borderWidth: 1,
    borderColor: colors.hairlineOnDark,
  },
  padding: {
    padding: spacing.lg,
  },
});
