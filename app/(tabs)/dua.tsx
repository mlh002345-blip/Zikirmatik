import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Screen from '@/components/ui/Screen';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { duaRequests as initialRequests, dhikrGroups } from '@/constants/community';

type Tab = 'dualar' | 'gruplar';

export default function DuaScreen() {
  const [tab, setTab] = useState<Tab>('dualar');
  const [requests, setRequests] = useState(initialRequests);

  const toggleJoin = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, joined: !r.joined, duaCount: r.duaCount + (r.joined ? -1 : 1) } : r))
    );
  };

  return (
    <Screen contentStyle={styles.content}>
      <Text style={styles.title}>Dua Kardeşliği</Text>
      <Text style={styles.subtitle}>Rekabetsiz, yardımlaşma üzerine kurulu bir topluluk.</Text>

      <View style={styles.tabRow}>
        <Pressable onPress={() => setTab('dualar')} style={[styles.tabBtn, tab === 'dualar' && styles.tabBtnActive]}>
          <Text style={[styles.tabText, tab === 'dualar' && styles.tabTextActive]}>Dua Talepleri</Text>
        </Pressable>
        <Pressable onPress={() => setTab('gruplar')} style={[styles.tabBtn, tab === 'gruplar' && styles.tabBtnActive]}>
          <Text style={[styles.tabText, tab === 'gruplar' && styles.tabTextActive]}>Grup Zikirleri</Text>
        </Pressable>
      </View>

      {tab === 'dualar' ? (
        <>
          <Button label="Dua Talebi Oluştur" onPress={() => {}} style={{ marginBottom: spacing.md }} />
          {requests.map((r) => (
            <Card key={r.id} style={styles.duaCard}>
              <View style={styles.duaHeader}>
                <View style={styles.duaAvatar}>
                  <Text style={styles.duaAvatarText}>{r.authorInitial}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.duaAuthor}>{r.authorName}</Text>
                  <Text style={styles.duaMeta}>
                    {r.category} · {r.timeAgo}
                  </Text>
                </View>
              </View>
              <Text style={styles.duaText}>{r.text}</Text>
              <View style={styles.duaFooter}>
                <Text style={styles.duaCount}>{r.duaCount} kişi dua etti</Text>
                <Pressable
                  onPress={() => toggleJoin(r.id)}
                  style={[styles.joinBtn, r.joined && styles.joinBtnActive]}
                >
                  <Ionicons
                    name={r.joined ? 'heart' : 'heart-outline'}
                    size={16}
                    color={r.joined ? colors.emeraldDeep : colors.emeraldSoft}
                  />
                  <Text style={[styles.joinText, r.joined && styles.joinTextActive]}>
                    {r.joined ? 'Amin dedim' : 'Amin de'}
                  </Text>
                </Pressable>
              </View>
            </Card>
          ))}
        </>
      ) : (
        <>
          <Button label="Yeni Grup Oluştur" onPress={() => {}} style={{ marginBottom: spacing.md }} />
          {dhikrGroups.map((g) => {
            const progress = g.targetProgress / g.targetTotal;
            return (
              <Card key={g.id} style={styles.groupCard}>
                <View style={styles.groupHeaderRow}>
                  <Text style={styles.groupName}>{g.name}</Text>
                  <Text style={styles.groupMembers}>{g.memberCount} kişi</Text>
                </View>
                <Text style={styles.groupTarget}>{g.targetLabel}</Text>
                <ProgressBar progress={progress} />
                <View style={styles.groupFooterRow}>
                  <Text style={styles.groupCount}>
                    {g.targetProgress.toLocaleString('tr-TR')} / {g.targetTotal.toLocaleString('tr-TR')}
                  </Text>
                  <View style={styles.avatarStack}>
                    {g.avatarInitials.map((a, i) => (
                      <View key={i} style={[styles.miniAvatar, { marginLeft: i === 0 ? 0 : -8 }]}>
                        <Text style={styles.miniAvatarText}>{a}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </Card>
            );
          })}
        </>
      )}
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
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.creamDeep,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: colors.ivory,
    shadowColor: colors.emerald,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.inkSoft,
  },
  tabTextActive: {
    color: colors.emerald,
  },
  duaCard: {
    marginBottom: spacing.sm,
  },
  duaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duaAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  duaAvatarText: {
    fontFamily: fonts.serif,
    fontSize: 15,
    color: colors.goldBright,
  },
  duaAuthor: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: colors.ink,
  },
  duaMeta: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.mist,
    marginTop: 1,
  },
  duaText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  duaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  duaCount: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkSoft,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.emeraldSoft,
  },
  joinBtnActive: {
    backgroundColor: colors.goldBright,
    borderColor: colors.goldBright,
  },
  joinText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.emeraldSoft,
  },
  joinTextActive: {
    color: colors.emeraldDeep,
  },
  groupCard: {
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  groupName: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: colors.ink,
  },
  groupMembers: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.mist,
  },
  groupTarget: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.emeraldSoft,
    marginBottom: 4,
  },
  groupFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  groupCount: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.inkSoft,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.ivory,
  },
  miniAvatarText: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    color: colors.goldBright,
  },
});
