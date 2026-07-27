import React, { useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useNiyetStore } from '@/store/useNiyetStore';
import { dhikrPresets } from '@/constants/dhikr';
import { motifs } from '@/constants/motifs';
import MotifPattern from '@/components/MotifPattern';
import SheetModal from '@/components/ui/SheetModal';
import { useGroups } from '@/hooks/useGroups';

const TARGET_OPTIONS = [33, 100, 1000];

export default function ZikirmatikScreen() {
  const sessionCount = useNiyetStore((s) => s.sessionCount);
  const sessionTarget = useNiyetStore((s) => s.sessionTarget);
  const selectedDhikrId = useNiyetStore((s) => s.selectedDhikrId);
  const activeMotifId = useNiyetStore((s) => s.activeMotifId);
  const motifProgress = useNiyetStore((s) => s.motifProgress);
  const incrementSession = useNiyetStore((s) => s.incrementSession);
  const resetSession = useNiyetStore((s) => s.resetSession);
  const setSelectedDhikr = useNiyetStore((s) => s.setSelectedDhikr);
  const setSessionTarget = useNiyetStore((s) => s.setSessionTarget);
  const activeGroupId = useNiyetStore((s) => s.activeGroupId);
  const setActiveGroup = useNiyetStore((s) => s.setActiveGroup);
  const { groups, contribute } = useGroups();

  const scale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const [groupPickerVisible, setGroupPickerVisible] = React.useState(false);

  const dhikr = dhikrPresets.find((d) => d.id === selectedDhikrId) ?? dhikrPresets[0];
  const activeMotif = motifs.find((m) => m.id === activeMotifId) ?? motifs[0];
  const motifDone = motifProgress[activeMotif.id] ?? 0;
  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? null;

  const handleTap = () => {
    const cycleComplete = sessionCount > 0 && sessionCount % sessionTarget === 0;
    if (cycleComplete) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    incrementSession();
    if (activeGroupId) {
      contribute(activeGroupId, 1);
    }

    scale.setValue(0.94);
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4, tension: 80 }).start();

    ringOpacity.setValue(0.6);
    Animated.timing(ringOpacity, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  };

  const displayCount = sessionCount % sessionTarget === 0 && sessionCount > 0 ? sessionTarget : sessionCount % sessionTarget;
  const progress = sessionTarget > 0 ? displayCount / sessionTarget : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={[colors.emeraldDeep, colors.emerald]} style={StyleSheet.absoluteFill} />

      <View style={styles.headerRow}>
        <View style={styles.motifBadge}>
          <MotifPattern pattern={activeMotif.pattern} variant={activeMotif.variant} progress={motifDone / activeMotif.target} size={40} />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={styles.motifName}>{activeMotif.name}</Text>
          <Text style={styles.motifSub}>
            {motifDone}/{activeMotif.target}
          </Text>
        </View>
        <Pressable onPress={() => setGroupPickerVisible(true)} style={styles.groupBtn}>
          <Ionicons name="people" size={18} color={activeGroup ? colors.goldBright : colors.mist} />
        </Pressable>
        <Pressable onPress={resetSession} style={styles.resetBtn}>
          <Ionicons name="refresh" size={18} color={colors.mist} />
        </Pressable>
      </View>

      {activeGroup ? (
        <View style={styles.groupBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.groupBannerLabel}>Grup zikri: {activeGroup.name}</Text>
            <Text style={styles.groupBannerSub}>
              Grup toplamı {activeGroup.progress.toLocaleString('tr-TR')} / {activeGroup.target.toLocaleString('tr-TR')}
            </Text>
          </View>
          <Pressable onPress={() => setActiveGroup(null)} style={styles.groupBannerClose}>
            <Ionicons name="close" size={16} color={colors.mist} />
          </Pressable>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={{ flexGrow: 0 }}
        >
          {dhikrPresets.map((d) => {
            const active = d.id === selectedDhikrId;
            return (
              <Pressable
                key={d.id}
                onPress={() => setSelectedDhikr(d.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{d.transliteration}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.center}>
        <Text style={styles.arabic}>{dhikr.arabic}</Text>
        <Text style={styles.meaning}>{dhikr.meaning}</Text>

        <Pressable onPress={handleTap} style={styles.counterWrap}>
          <Animated.View
            style={[
              styles.ring,
              { opacity: ringOpacity, transform: [{ scale: ringOpacity.interpolate({ inputRange: [0, 0.6], outputRange: [1, 1.25] }) }] },
            ]}
          />
          <Animated.View style={{ transform: [{ scale }] }}>
            <LinearGradient colors={[colors.emeraldSoft, colors.emerald]} style={styles.dial}>
              <View style={styles.dialInnerBorder}>
                <Text style={styles.count}>{displayCount}</Text>
                <Text style={styles.countTarget}>/ {sessionTarget}</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </Pressable>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(1, progress) * 100}%` }]} />
        </View>

        <Text style={styles.hint}>"Kalpler ancak Allah'ı anmakla mutmain olur." — Ra'd, 28</Text>
      </View>

      <View style={styles.targetRow}>
        {TARGET_OPTIONS.map((t) => (
          <Pressable
            key={t}
            onPress={() => setSessionTarget(t)}
            style={[styles.targetChip, sessionTarget === t && styles.targetChipActive]}
          >
            <Text style={[styles.targetChipText, sessionTarget === t && styles.targetChipTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <SheetModal visible={groupPickerVisible} onClose={() => setGroupPickerVisible(false)} title="Grup Seç">
        <Pressable
          onPress={() => {
            setActiveGroup(null);
            setGroupPickerVisible(false);
          }}
          style={[styles.groupOption, !activeGroupId && styles.groupOptionActive]}
        >
          <Ionicons name="person-outline" size={18} color={!activeGroupId ? colors.emerald : colors.inkSoft} />
          <Text style={[styles.groupOptionText, !activeGroupId && styles.groupOptionTextActive]}>Bireysel</Text>
        </Pressable>
        {groups.length === 0 ? (
          <Text style={styles.groupEmptyText}>
            Henüz katıldığın bir grup yok. Dua Kardeşliği sekmesinden bir grup oluştur veya davet koduyla katıl.
          </Text>
        ) : (
          groups.map((g) => {
            const active = g.id === activeGroupId;
            return (
              <Pressable
                key={g.id}
                onPress={() => {
                  setActiveGroup(g.id, g.dhikrId);
                  setGroupPickerVisible(false);
                }}
                style={[styles.groupOption, active && styles.groupOptionActive]}
              >
                <Ionicons name="people-outline" size={18} color={active ? colors.emerald : colors.inkSoft} />
                <Text style={[styles.groupOptionText, active && styles.groupOptionTextActive]}>{g.name}</Text>
              </Pressable>
            );
          })
        )}
      </SheetModal>
    </SafeAreaView>
  );
}

const DIAL_SIZE = 240;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  motifBadge: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: 'rgba(251,246,234,0.06)',
    borderWidth: 1,
    borderColor: colors.hairlineOnDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motifName: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: colors.cream,
  },
  motifSub: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.mist,
    marginTop: 2,
  },
  resetBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251,246,234,0.06)',
  },
  groupBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251,246,234,0.06)',
    marginRight: spacing.xs,
  },
  groupBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(232,201,122,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(232,201,122,0.3)',
  },
  groupBannerLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: colors.goldBright,
  },
  groupBannerSub: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.mist,
    marginTop: 2,
  },
  groupBannerClose: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251,246,234,0.08)',
  },
  groupOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  groupOptionActive: {
    backgroundColor: colors.goldSoft,
  },
  groupOptionText: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.inkSoft,
  },
  groupOptionTextActive: {
    color: colors.emerald,
    fontFamily: fonts.sansBold,
  },
  groupEmptyText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkSoft,
    lineHeight: 20,
    paddingVertical: spacing.sm,
  },
  chipRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairlineOnDark,
    marginRight: spacing.xs,
  },
  chipActive: {
    backgroundColor: 'rgba(232,201,122,0.16)',
    borderColor: colors.gold,
  },
  chipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.mist,
  },
  chipTextActive: {
    color: colors.goldBright,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  arabic: {
    fontSize: 30,
    color: colors.goldBright,
  },
  meaning: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.mist,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  counterWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    borderRadius: DIAL_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.goldBright,
  },
  dial: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    borderRadius: DIAL_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gold,
    shadowOpacity: 0.3,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  dialInnerBorder: {
    width: DIAL_SIZE - 14,
    height: DIAL_SIZE - 14,
    borderRadius: (DIAL_SIZE - 14) / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(232,201,122,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontFamily: fonts.serif,
    fontSize: 64,
    color: colors.cream,
  },
  countTarget: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.mist,
    marginTop: 4,
  },
  progressTrack: {
    width: DIAL_SIZE,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(251,246,234,0.1)',
    marginTop: spacing.xl,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.goldBright,
  },
  hint: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.mist,
    marginTop: spacing.md,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  targetChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(251,246,234,0.05)',
  },
  targetChipActive: {
    backgroundColor: colors.goldBright,
  },
  targetChipText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.mist,
  },
  targetChipTextActive: {
    color: colors.emeraldDeep,
  },
});
