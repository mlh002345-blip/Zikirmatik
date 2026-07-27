import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Screen from '@/components/ui/Screen';
import Card from '@/components/ui/Card';
import MotifPattern from '@/components/MotifPattern';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { categoryOrder, motifs, type MotifCategory } from '@/constants/motifs';
import { useNiyetStore } from '@/store/useNiyetStore';

const FILTERS: ('Tümü' | MotifCategory)[] = ['Tümü', ...categoryOrder];

export default function GaleriScreen() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Tümü');
  const motifProgress = useNiyetStore((s) => s.motifProgress);
  const activeMotifId = useNiyetStore((s) => s.activeMotifId);
  const setActiveMotif = useNiyetStore((s) => s.setActiveMotif);

  const completedCount = useMemo(
    () => motifs.filter((m) => (motifProgress[m.id] ?? 0) >= m.target).length,
    [motifProgress]
  );

  const filtered = filter === 'Tümü' ? motifs : motifs.filter((m) => m.category === filter);

  return (
    <Screen contentStyle={styles.content}>
      <Text style={styles.title}>Motif Galerisi</Text>
      <Text style={styles.subtitle}>
        {completedCount}/{motifs.length} motif tamamlandı — Selçuklu ve Osmanlı mirasından ilhamla.
      </Text>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filterChip, active && styles.filterChipActive]}>
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{f}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.grid}>
        {filtered.map((motif) => {
          const done = motifProgress[motif.id] ?? 0;
          const progress = done / motif.target;
          const isComplete = done >= motif.target;
          const isActive = motif.id === activeMotifId;
          return (
            <Pressable key={motif.id} onPress={() => setActiveMotif(motif.id)} style={styles.gridItem}>
              <Card style={[styles.motifCard, isActive && styles.motifCardActive]}>
                <MotifPattern pattern={motif.pattern} variant={motif.variant} progress={progress} size={64} />
                <Text style={styles.motifName} numberOfLines={1}>
                  {motif.name}
                </Text>
                <Text style={styles.motifCategory}>{motif.category}</Text>
                <Text style={[styles.motifStatus, isComplete && styles.motifStatusDone]}>
                  {isComplete ? 'Tamamlandı' : `${done}/${motif.target}`}
                </Text>
              </Card>
            </Pressable>
          );
        })}
      </View>
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.ivory,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  filterChipActive: {
    backgroundColor: colors.emerald,
    borderColor: colors.emerald,
  },
  filterText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.inkSoft,
  },
  filterTextActive: {
    color: colors.cream,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridItem: {
    width: '48%',
  },
  motifCard: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  motifCardActive: {
    borderColor: colors.gold,
    borderWidth: 1.5,
  },
  motifName: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: colors.ink,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  motifCategory: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.mist,
    marginTop: 2,
  },
  motifStatus: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: colors.emeraldSoft,
    marginTop: spacing.xs,
  },
  motifStatusDone: {
    color: colors.gold,
  },
});
