import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
  dark?: boolean;
}

export default function SectionHeader({ title, subtitle, action, onAction, dark }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: dark ? colors.cream : colors.ink }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: dark ? colors.mist : colors.inkSoft }]}>{subtitle}</Text>
        ) : null}
      </View>
      {action ? (
        <Text style={styles.action} onPress={onAction}>
          {action}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 21,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 13,
    marginTop: 2,
  },
  action: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.gold,
  },
});
