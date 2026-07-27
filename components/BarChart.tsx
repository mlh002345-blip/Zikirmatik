import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/theme';

interface BarChartProps {
  data: { label: string; count: number }[];
  height?: number;
}

export default function BarChart({ data, height = 140 }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <View style={[styles.row, { height }]}>
      {data.map((d) => {
        const barHeight = Math.max(6, (d.count / max) * (height - 28));
        return (
          <View key={d.label} style={styles.col}>
            <Text style={styles.value}>{d.count}</Text>
            <View style={styles.trackWrap}>
              <View style={[styles.bar, { height: barHeight }]} />
            </View>
            <Text style={styles.label}>{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  col: {
    flex: 1,
    alignItems: 'center',
  },
  value: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10,
    color: colors.inkSoft,
    marginBottom: 4,
  },
  trackWrap: {
    width: 18,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 18,
    borderRadius: radius.sm,
    backgroundColor: colors.gold,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.mist,
    marginTop: spacing.xs,
  },
});
