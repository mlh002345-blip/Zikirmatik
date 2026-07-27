import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';

export interface GroupMember {
  id: string;
  name: string;
  initial: string;
  contribution: number;
  isYou?: boolean;
}

export interface DhikrGroup {
  id: string;
  name: string;
  dhikrId: string;
  target: number;
  progress: number;
  inviteCode: string;
  members: GroupMember[];
  createdAt: number;
}

interface GroupMemberRow {
  user_id: string;
  contribution: number;
  profiles: { full_name: string } | { full_name: string }[] | null;
}

interface GroupRow {
  id: string;
  name: string;
  dhikr_id: string;
  target: number;
  progress: number;
  invite_code: string;
  created_at: string;
  group_members: GroupMemberRow[];
}

function profileName(profiles: GroupMemberRow['profiles']): string {
  if (!profiles) return 'Bir kardeşiniz';
  const row = Array.isArray(profiles) ? profiles[0] : profiles;
  return row?.full_name?.trim() || 'Bir kardeşiniz';
}

export function useGroups() {
  const { user } = useSession();
  const userId = user?.id ?? null;
  const [groups, setGroups] = useState<DhikrGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const fetchGroups = useCallback(async () => {
    if (!userId) {
      setGroups([]);
      setLoading(false);
      return;
    }
    const { data: memberships, error: membershipError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);

    if (membershipError || !memberships || memberships.length === 0) {
      if (mounted.current) {
        setGroups([]);
        setLoading(false);
      }
      return;
    }

    const groupIds = memberships.map((m) => m.group_id);

    const { data, error } = await supabase
      .from('dhikr_groups')
      .select('id, name, dhikr_id, target, progress, invite_code, created_at, group_members(user_id, contribution, profiles(full_name))')
      .in('id', groupIds)
      .order('created_at', { ascending: false });

    if (error || !data) {
      if (mounted.current) setLoading(false);
      return;
    }

    const mapped: DhikrGroup[] = (data as unknown as GroupRow[]).map((g) => ({
      id: g.id,
      name: g.name,
      dhikrId: g.dhikr_id,
      target: g.target,
      progress: g.progress,
      inviteCode: g.invite_code,
      createdAt: new Date(g.created_at).getTime(),
      members: (g.group_members ?? []).map((m) => ({
        id: m.user_id,
        name: profileName(m.profiles),
        initial: profileName(m.profiles).charAt(0).toUpperCase(),
        contribution: m.contribution,
        isYou: m.user_id === userId,
      })),
    }));

    if (mounted.current) {
      setGroups(mapped);
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    fetchGroups();

    if (!userId) return () => {
      mounted.current = false;
    };

    const channel = supabase
      .channel(`groups-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members' }, () => fetchGroups())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dhikr_groups' }, () => fetchGroups())
      .subscribe();

    return () => {
      mounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [userId, fetchGroups]);

  const createGroup = useCallback(
    async (
      name: string,
      dhikrId: string,
      target: number
    ): Promise<{ success: boolean; groupId?: string; dhikrId?: string; error?: string }> => {
      const { data, error } = await supabase.rpc('create_dhikr_group', {
        p_name: name,
        p_dhikr_id: dhikrId,
        p_target: target,
      });
      if (error) return { success: false, error: error.message };
      await fetchGroups();
      const row = data as { id: string; dhikr_id: string };
      return { success: true, groupId: row.id, dhikrId: row.dhikr_id };
    },
    [fetchGroups]
  );

  const joinGroupByCode = useCallback(
    async (code: string): Promise<{ success: boolean; groupId?: string; dhikrId?: string; error?: string }> => {
      const { data, error } = await supabase.rpc('join_group_by_code', { p_code: code });
      if (error) return { success: false, error: error.message };
      await fetchGroups();
      const row = data as { id: string; dhikr_id: string };
      return { success: true, groupId: row.id, dhikrId: row.dhikr_id };
    },
    [fetchGroups]
  );

  const contribute = useCallback(async (groupId: string, amount = 1) => {
    const { error } = await supabase.rpc('increment_group_contribution', { p_group_id: groupId, p_amount: amount });
    if (error) console.warn('[useGroups] contribute failed:', error.message);
  }, []);

  return { groups, loading, createGroup, joinGroupByCode, contribute, refetch: fetchGroups };
}
