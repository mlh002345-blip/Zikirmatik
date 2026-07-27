import React, { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Screen from '@/components/ui/Screen';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import GroupFormModal from '@/components/GroupFormModal';
import JoinGroupModal from '@/components/JoinGroupModal';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { duaRequests as initialRequests } from '@/constants/community';
import { dhikrPresets } from '@/constants/dhikr';
import { useNiyetStore } from '@/store/useNiyetStore';

type Tab = 'dualar' | 'gruplar';

export default function DuaScreen() {
  const router = useRouter();
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>(tabParam === 'gruplar' ? 'gruplar' : 'dualar');
  const [requests, setRequests] = useState(initialRequests);
  const [createVisible, setCreateVisible] = useState(false);
  const [joinVisible, setJoinVisible] = useState(false);

  const groups = useNiyetStore((s) => s.groups);
  const setActiveGroup = useNiyetStore((s) => s.setActiveGroup);

  const toggleJoin = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, joined: !r.joined, duaCount: r.duaCount + (r.joined ? -1 : 1) } : r))
    );
  };

  const openGroupZikir = (groupId: string) => {
    setActiveGroup(groupId);
    router.push('/(tabs)/zikirmatik');
  };

  const shareInvite = (groupName: string, code: string) => {
    Share.share({
      message: `Niyet uygulamasında "${groupName}" grubuma katıl, beraber zikir çekelim. Davet kodu: ${code}`,
    }).catch(() => {});
  };

  return (
    <Screen contentStyle={styles.content}>
      <Text style={styles.title}>Dua Kardeşliği</Text>
      <Text style={styles.subtitle}>Rekabetsiz, yardımlaşma üzerine kurulu bir topluluk.</Text>

      <View style={styles.tabRow}>
        <Pressable onPress={() => setTab('gruplar')} style={[styles.tabBtn, tab === 'gruplar' && styles.tabBtnActive]}>
          <Text style={[styles.tabText, tab === 'gruplar' && styles.tabTextActive]}>Aile ve Grup Zikri</Text>
        </Pressable>
        <Pressable onPress={() => setTab('dualar')} style={[styles.tabBtn, tab === 'dualar' && styles.tabBtnActive]}>
          <Text style={[styles.tabText, tab === 'dualar' && styles.tabTextActive]}>Dua Talepleri</Text>
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
          <View style={styles.groupActionsRow}>
            <Button label="Yeni Grup Oluştur" onPress={() => setCreateVisible(true)} style={{ flex: 1 }} />
            <Button label="Gruba Katıl" onPress={() => setJoinVisible(true)} variant="secondary" style={{ flex: 1 }} />
          </View>

          {groups.map((g) => {
            const progress = g.progress / g.target;
            const dhikr = dhikrPresets.find((d) => d.id === g.dhikrId);
            const isMember = g.members.some((m) => m.isYou);
            const topMembers = [...g.members].sort((a, b) => b.contribution - a.contribution).slice(0, 4);

            return (
              <Card key={g.id} style={styles.groupCard}>
                <View style={styles.groupHeaderRow}>
                  <Text style={styles.groupName}>{g.name}</Text>
                  <Text style={styles.groupMembers}>{g.members.length} kişi</Text>
                </View>
                <Text style={styles.groupTarget}>
                  {g.target.toLocaleString('tr-TR')} {dhikr?.transliteration ?? ''}
                </Text>
                <ProgressBar progress={progress} />
                <View style={styles.groupFooterRow}>
                  <Text style={styles.groupCount}>
                    {g.progress.toLocaleString('tr-TR')} / {g.target.toLocaleString('tr-TR')}
                  </Text>
                  <View style={styles.avatarStack}>
                    {topMembers.map((m, i) => (
                      <View key={m.id} style={[styles.miniAvatar, { marginLeft: i === 0 ? 0 : -8 }, m.isYou && styles.miniAvatarYou]}>
                        <Text style={styles.miniAvatarText}>{m.initial}</Text>
                      </View>
                    ))}
                    {g.members.length > topMembers.length ? (
                      <View style={[styles.miniAvatar, { marginLeft: -8 }]}>
                        <Text style={styles.miniAvatarText}>+{g.members.length - topMembers.length}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                <View style={styles.contributorsRow}>
                  {topMembers.map((m) => (
                    <Text key={m.id} style={styles.contributorText}>
                      {m.isYou ? 'Sen' : m.name} · {m.contribution.toLocaleString('tr-TR')}
                    </Text>
                  ))}
                </View>

                <View style={styles.groupCardActions}>
                  {isMember ? (
                    <>
                      <Button label="Zikir Çek" onPress={() => openGroupZikir(g.id)} style={{ flex: 1 }} />
                      <Pressable onPress={() => shareInvite(g.name, g.inviteCode)} style={styles.codeBtn}>
                        <Ionicons name="share-social-outline" size={14} color={colors.emeraldSoft} />
                        <Text style={styles.codeBtnText}>{g.inviteCode}</Text>
                      </Pressable>
                    </>
                  ) : (
                    <Button label="Katılmak için kodu gir" onPress={() => setJoinVisible(true)} variant="ghost" style={{ flex: 1 }} />
                  )}
                </View>
              </Card>
            );
          })}
        </>
      )}

      <GroupFormModal visible={createVisible} onClose={() => setCreateVisible(false)} />
      <JoinGroupModal visible={joinVisible} onClose={() => setJoinVisible(false)} />
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
  groupActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
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
  miniAvatarYou: {
    backgroundColor: colors.gold,
  },
  miniAvatarText: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    color: colors.goldBright,
  },
  contributorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  contributorText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.mist,
  },
  groupCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  codeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.creamDeep,
  },
  codeBtnText: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: colors.emeraldSoft,
    letterSpacing: 0.5,
  },
});
