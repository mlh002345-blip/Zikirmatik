import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@/components/ui/Screen';
import Card from '@/components/ui/Card';
import MotifPattern from '@/components/MotifPattern';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useNiyetStore } from '@/store/useNiyetStore';
import { motifs } from '@/constants/motifs';

const LEVELS = ['Yolun Başı', 'Sadık Yolcu', 'Derinleşen Kalp', 'Nur Yüklü Ruh', 'Ehl-i Zikir'];

export default function ProfilScreen() {
  const router = useRouter();
  const totalLifetimeCount = useNiyetStore((s) => s.totalLifetimeCount);
  const streakDays = useNiyetStore((s) => s.streakDays);
  const motifProgress = useNiyetStore((s) => s.motifProgress);

  const completedMotifs = motifs.filter((m) => (motifProgress[m.id] ?? 0) >= m.target);
  const levelIndex = Math.min(LEVELS.length - 1, Math.floor(completedMotifs.length / 5));

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Profil</Text>
        <Pressable onPress={() => router.push('/ayarlar')} style={styles.backBtn}>
          <Ionicons name="settings-outline" size={20} color={colors.ink} />
        </Pressable>
      </View>

      <View style={styles.profileHead}>
        <View style={styles.bigAvatar}>
          <Text style={styles.bigAvatarText}>N</Text>
        </View>
        <Text style={styles.name}>Niyet Kullanıcısı</Text>
        <View style={styles.levelPill}>
          <Ionicons name="sparkles" size={13} color={colors.gold} />
          <Text style={styles.levelText}>{LEVELS[levelIndex]}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{totalLifetimeCount.toLocaleString('tr-TR')}</Text>
          <Text style={styles.statLabel}>Toplam Zikir</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{streakDays}</Text>
          <Text style={styles.statLabel}>Gün Seri</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{completedMotifs.length}</Text>
          <Text style={styles.statLabel}>Tamamlanan Motif</Text>
        </Card>
      </View>

      <Text style={styles.sectionTitle}>Manevi Galerim</Text>
      <View style={styles.grid}>
        {completedMotifs.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>Henüz tamamlanan motif yok. Zikirmatikle başla.</Text>
          </Card>
        ) : (
          completedMotifs.map((m) => (
            <Card key={m.id} style={styles.motifCard}>
              <MotifPattern pattern={m.pattern} variant={m.variant} progress={1} size={56} />
              <Text style={styles.motifName} numberOfLines={1}>
                {m.name}
              </Text>
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ivory,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  headerTitle: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.ink,
  },
  profileHead: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  bigAvatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  bigAvatarText: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.goldBright,
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.ink,
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.goldSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
  },
  levelText: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: colors.emerald,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.emerald,
  },
  statLabel: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.mist,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  motifCard: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  motifName: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: colors.ink,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  emptyCard: {
    width: '100%',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
  },
});
