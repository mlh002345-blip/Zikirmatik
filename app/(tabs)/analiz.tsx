import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '@/components/ui/Screen';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import BarChart from '@/components/BarChart';
import { colors, fonts, spacing } from '@/constants/theme';
import { useNiyetStore } from '@/store/useNiyetStore';
import { categoryOrder, motifs } from '@/constants/motifs';
import { dhikrPresets } from '@/constants/dhikr';

export default function AnalizScreen() {
  const weeklyHistory = useNiyetStore((s) => s.weeklyHistory);
  const dailyWirds = useNiyetStore((s) => s.dailyWirds);
  const motifProgress = useNiyetStore((s) => s.motifProgress);
  const streakDays = useNiyetStore((s) => s.streakDays);
  const totalLifetimeCount = useNiyetStore((s) => s.totalLifetimeCount);

  const weeklyTotal = weeklyHistory.reduce((sum, d) => sum + d.count, 0);
  const weeklyAvg = Math.round(weeklyTotal / weeklyHistory.length);

  const categoryStats = useMemo(
    () =>
      categoryOrder.map((cat) => {
        const items = motifs.filter((m) => m.category === cat);
        const done = items.reduce((s, m) => s + Math.min(m.target, motifProgress[m.id] ?? 0), 0);
        const total = items.reduce((s, m) => s + m.target, 0);
        return { category: cat, progress: total ? done / total : 0 };
      }),
    [motifProgress]
  );

  return (
    <Screen contentStyle={styles.content}>
      <Text style={styles.title}>Manevi Check-up</Text>
      <Text style={styles.subtitle}>Gelişimini gör, dengeyi koru.</Text>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{streakDays}</Text>
          <Text style={styles.statLabel}>Gün seri</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{weeklyAvg}</Text>
          <Text style={styles.statLabel}>Günlük ortalama</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{(totalLifetimeCount / 1000).toFixed(1)}k</Text>
          <Text style={styles.statLabel}>Toplam</Text>
        </Card>
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Bu Hafta</Text>
        <BarChart data={weeklyHistory} />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Bugünkü Zikirler</Text>
        {dailyWirds.map((w) => {
          const dhikr = dhikrPresets.find((d) => d.id === w.dhikrId);
          return (
            <View key={w.id} style={styles.wirdRow}>
              <Text style={styles.wirdLabel}>{dhikr?.transliteration}</Text>
              <View style={{ flex: 1, marginHorizontal: spacing.sm }}>
                <ProgressBar progress={w.progress / w.target} height={6} />
              </View>
              <Text style={styles.wirdCount}>
                {w.progress}/{w.target}
              </Text>
            </View>
          );
        })}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Manevi Dengeler</Text>
        {categoryStats.map((c) => (
          <View key={c.category} style={styles.wirdRow}>
            <Text style={[styles.wirdLabel, { width: 90 }]}>{c.category}</Text>
            <View style={{ flex: 1, marginHorizontal: spacing.sm }}>
              <ProgressBar progress={c.progress} height={6} />
            </View>
            <Text style={styles.wirdCount}>{Math.round(c.progress * 100)}%</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 26,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statNumber: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.emerald,
  },
  statLabel: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.mist,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  wirdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  wirdLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.inkSoft,
    width: 100,
  },
  wirdCount: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.ink,
    width: 50,
    textAlign: 'right',
  },
});
