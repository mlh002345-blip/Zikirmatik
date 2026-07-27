import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@/components/ui/Screen';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import GardenScene from '@/components/GardenScene';
import Button from '@/components/ui/Button';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useNiyetStore } from '@/store/useNiyetStore';
import { dhikrPresets } from '@/constants/dhikr';
import { useSession, displayName } from '@/hooks/useSession';
import { useGroups } from '@/hooks/useGroups';

export default function HomeScreen() {
  const router = useRouter();
  const { session } = useSession();
  const name = displayName(session);
  const gardenLevel = useNiyetStore((s) => s.gardenLevel);
  const streakDays = useNiyetStore((s) => s.streakDays);
  const dailyWirds = useNiyetStore((s) => s.dailyWirds);
  const totalLifetimeCount = useNiyetStore((s) => s.totalLifetimeCount);
  const setActiveGroup = useNiyetStore((s) => s.setActiveGroup);
  const { groups } = useGroups();

  const completedWirds = dailyWirds.filter((w) => w.progress >= w.target).length;
  const featuredGroup = groups[0] ?? null;

  const goToGroupZikir = (groupId: string, dhikrId: string) => {
    setActiveGroup(groupId, dhikrId);
    router.push('/(tabs)/zikirmatik');
  };

  return (
    <Screen dark edges={['top']} contentStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greetingSmall}>Esselamu aleyküm</Text>
          <Text style={styles.greetingName}>Kalbin bugün de zikirle huzur bulsun.</Text>
        </View>
        <Pressable onPress={() => router.push('/profil')} style={styles.avatar}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </Pressable>
      </View>

      <Card dark noPadding style={styles.gardenCard}>
        <GardenScene level={gardenLevel} />
        <View style={styles.gardenFooter}>
          <View>
            <Text style={styles.gardenLabel}>Manevi Bahçen</Text>
            <Text style={styles.gardenSub}>Bahçen %{Math.round(gardenLevel)} canlı</Text>
          </View>
          <View style={styles.streakPill}>
            <Ionicons name="flame" size={14} color={colors.goldBright} />
            <Text style={styles.streakText}>{streakDays} gün</Text>
          </View>
        </View>
      </Card>

      <View style={styles.statsRow}>
        <Card dark style={styles.statCard}>
          <Text style={styles.statNumber}>{totalLifetimeCount.toLocaleString('tr-TR')}</Text>
          <Text style={styles.statLabel}>Toplam Zikir</Text>
        </Card>
        <Card dark style={styles.statCard}>
          <Text style={styles.statNumber}>
            {completedWirds}/{dailyWirds.length}
          </Text>
          <Text style={styles.statLabel}>Bugünkü Zikir</Text>
        </Card>
      </View>

      <Card dark style={styles.familyCard}>
        <View style={styles.familyHeaderRow}>
          <Ionicons name="people" size={18} color={colors.goldBright} />
          <Text style={styles.familyTitle}>Birlikte Zikir</Text>
        </View>
        {featuredGroup ? (
          <>
            <Text style={styles.familySub}>
              {featuredGroup.name} · {featuredGroup.members.length} kişi
            </Text>
            <ProgressBar progress={featuredGroup.progress / featuredGroup.target} trackColor="rgba(251,246,234,0.1)" />
            <Text style={styles.familyCount}>
              {featuredGroup.progress.toLocaleString('tr-TR')} / {featuredGroup.target.toLocaleString('tr-TR')}
            </Text>
            <Button
              label="Ailenle Zikir Çek"
              onPress={() => goToGroupZikir(featuredGroup.id, featuredGroup.dhikrId)}
              style={{ marginTop: spacing.sm }}
            />
          </>
        ) : (
          <>
            <Text style={styles.familySub}>
              Ailen veya arkadaşlarınla ortak bir niyete yürü; her zikrin hep beraber Rabbine yükselsin.
            </Text>
            <Button
              label="Aile Grubu Kur"
              onPress={() => router.push({ pathname: '/(tabs)/dua', params: { tab: 'gruplar' } })}
              variant="secondary"
              style={{ marginTop: spacing.sm }}
            />
          </>
        )}
      </Card>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Bugünkü Zikirlerin</Text>
        <Text style={styles.sectionAction} onPress={() => router.push('/(tabs)/analiz')}>
          Tümü
        </Text>
      </View>

      {dailyWirds.map((wird) => {
        const dhikr = dhikrPresets.find((d) => d.id === wird.dhikrId);
        const progress = wird.progress / wird.target;
        const done = wird.progress >= wird.target;
        return (
          <Card dark key={wird.id} style={styles.wirdCard}>
            <View style={styles.wirdRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.wirdArabic}>{dhikr?.arabic}</Text>
                <Text style={styles.wirdName}>{dhikr?.transliteration}</Text>
              </View>
              <View style={styles.wirdRight}>
                {done ? (
                  <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                ) : (
                  <Text style={styles.wirdCount}>
                    {wird.progress}/{wird.target}
                  </Text>
                )}
              </View>
            </View>
            <ProgressBar progress={progress} trackColor="rgba(251,246,234,0.08)" />
          </Card>
        );
      })}

      <Button
        label="Zikirmatiği Aç"
        onPress={() => router.push('/(tabs)/zikirmatik')}
        style={{ marginTop: spacing.md }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  greetingSmall: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.mist,
  },
  greetingName: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.cream,
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.emeraldSoft,
    borderWidth: 1,
    borderColor: colors.hairlineOnDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.goldBright,
  },
  gardenCard: {
    overflow: 'hidden',
  },
  gardenFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  gardenLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: colors.cream,
  },
  gardenSub: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.mist,
    marginTop: 2,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(232,201,122,0.14)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  streakText: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: colors.goldBright,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.goldBright,
  },
  statLabel: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.mist,
    marginTop: 4,
  },
  familyCard: {
    gap: spacing.xs,
  },
  familyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  familyTitle: {
    fontFamily: fonts.serif,
    fontSize: 17,
    color: colors.cream,
  },
  familySub: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.mist,
    lineHeight: 19,
    marginBottom: 2,
  },
  familyCount: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.mist,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: 19,
    color: colors.cream,
  },
  sectionAction: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.gold,
  },
  wirdCard: {
    gap: spacing.sm,
  },
  wirdRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wirdArabic: {
    fontSize: 18,
    color: colors.goldBright,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  wirdName: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.mist,
    marginTop: 2,
  },
  wirdRight: {
    marginLeft: spacing.sm,
  },
  wirdCount: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: colors.cream,
  },
});
