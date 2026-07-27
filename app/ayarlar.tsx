import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@/components/ui/Screen';
import Card from '@/components/ui/Card';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

function SettingsRow({
  icon,
  label,
  right,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.row} disabled={!onPress}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIcon}>
          <Ionicons name={icon} size={18} color={colors.emerald} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      {right ?? <Ionicons name="chevron-forward" size={18} color={colors.mist} />}
    </Pressable>
  );
}

export default function AyarlarScreen() {
  const router = useRouter();
  const [dailyReminder, setDailyReminder] = useState(true);
  const [duaNotify, setDuaNotify] = useState(true);
  const [groupNotify, setGroupNotify] = useState(false);

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Ayarlar</Text>
        <View style={{ width: 36 }} />
      </View>

      <Text style={styles.groupTitle}>Bildirimler</Text>
      <Card noPadding style={styles.card}>
        <SettingsRow
          icon="notifications-outline"
          label="Günlük Zikir Hatırlatıcı"
          right={<Switch value={dailyReminder} onValueChange={setDailyReminder} trackColor={{ true: colors.gold }} />}
        />
        <View style={styles.divider} />
        <SettingsRow
          icon="heart-outline"
          label="Dua Talebi Bildirimleri"
          right={<Switch value={duaNotify} onValueChange={setDuaNotify} trackColor={{ true: colors.gold }} />}
        />
        <View style={styles.divider} />
        <SettingsRow
          icon="people-outline"
          label="Grup Zikir Bildirimleri"
          right={<Switch value={groupNotify} onValueChange={setGroupNotify} trackColor={{ true: colors.gold }} />}
        />
      </Card>

      <Text style={styles.groupTitle}>Topluluk</Text>
      <Card noPadding style={styles.card}>
        <SettingsRow icon="people-circle-outline" label="Grup Yönetimi" onPress={() => {}} />
        <View style={styles.divider} />
        <SettingsRow icon="person-add-outline" label="Arkadaş Davet Et" onPress={() => {}} />
      </Card>

      <Text style={styles.groupTitle}>Hesap</Text>
      <Card noPadding style={styles.card}>
        <SettingsRow icon="star-outline" label="Niyet Premium" onPress={() => {}} />
        <View style={styles.divider} />
        <SettingsRow icon="color-palette-outline" label="Bahçe Temaları" onPress={() => {}} />
        <View style={styles.divider} />
        <SettingsRow icon="shield-checkmark-outline" label="Gizlilik ve Güvenlik" onPress={() => {}} />
      </Card>

      <Pressable
        style={styles.logoutBtn}
        onPress={async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)/login');
        }}
      >
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </Pressable>
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
    marginBottom: spacing.md,
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
  groupTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: colors.mist,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  card: {
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: colors.hairline,
    marginLeft: spacing.md + 32 + spacing.sm,
  },
  logoutBtn: {
    marginTop: spacing.xl,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  logoutText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    color: colors.danger,
  },
});
