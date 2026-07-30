import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';

function nameFromUser(user: { user_metadata?: { full_name?: string }; email?: string | null } | null): string {
  const fullName = user?.user_metadata?.full_name;
  if (typeof fullName === 'string' && fullName.trim()) return fullName.trim();
  return user?.email?.split('@')[0] ?? 'Bir kardeşiniz';
}

export interface DuaRequest {
  id: string;
  authorName: string;
  authorInitial: string;
  category: string;
  text: string;
  duaCount: number;
  timeAgo: string;
  joined: boolean;
}

interface RequestRow {
  id: string;
  user_id: string;
  author_name: string;
  category: string;
  body: string;
  created_at: string;
}

interface AminRow {
  request_id: string;
  user_id: string;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60000));
  if (minutes < 60) return `${minutes} dk`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} sa`;
  const days = Math.round(hours / 24);
  return `${days} g`;
}

export function useDuaRequests() {
  const { user } = useSession();
  const userId = user?.id ?? null;
  const [requests, setRequests] = useState<DuaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);
  // Bu ekran ve arka planda yüklü kalan modaller aynı anda bu hook'u
  // çağırabiliyor; her çağrı kendi benzersiz kanal adını kullanmalı, yoksa
  // Supabase Realtime "cannot add callbacks after subscribe()" hatası verir.
  const instanceId = useId();

  const fetchRequests = useCallback(async () => {
    const { data: requestRows, error } = await supabase
      .from('dua_requests')
      .select('id, user_id, author_name, category, body, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !requestRows) {
      if (mounted.current) setLoading(false);
      return;
    }

    const ids = requestRows.map((r) => r.id);
    const { data: aminRows } = ids.length
      ? await supabase.from('dua_amins').select('request_id, user_id').in('request_id', ids)
      : { data: [] as AminRow[] };

    const countByRequest = new Map<string, number>();
    const joinedByRequest = new Set<string>();
    (aminRows ?? []).forEach((a) => {
      countByRequest.set(a.request_id, (countByRequest.get(a.request_id) ?? 0) + 1);
      if (a.user_id === userId) joinedByRequest.add(a.request_id);
    });

    const mapped: DuaRequest[] = (requestRows as RequestRow[]).map((r) => ({
      id: r.id,
      authorName: r.author_name,
      authorInitial: r.author_name.charAt(0).toUpperCase(),
      category: r.category,
      text: r.body,
      duaCount: countByRequest.get(r.id) ?? 0,
      timeAgo: timeAgo(r.created_at),
      joined: joinedByRequest.has(r.id),
    }));

    if (mounted.current) {
      setRequests(mapped);
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    fetchRequests();

    const channel = supabase
      .channel(`dua-requests-changes-${instanceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dua_requests' }, () => fetchRequests())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dua_amins' }, () => fetchRequests())
      .subscribe();

    return () => {
      mounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [fetchRequests]);

  const createRequest = useCallback(
    async (category: string, text: string): Promise<{ success: boolean; error?: string }> => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) return { success: false, error: 'Giriş yapmalısın.' };

      const { error } = await supabase.from('dua_requests').insert({
        user_id: currentUser.id,
        author_name: nameFromUser(currentUser),
        category,
        body: text.trim(),
      });
      if (error) return { success: false, error: error.message };
      await fetchRequests();
      return { success: true };
    },
    [fetchRequests]
  );

  const toggleAmin = useCallback(
    async (requestId: string, currentlyJoined: boolean) => {
      if (!userId) return;
      // İyimser (optimistic) güncelleme — realtime zaten arkadan doğrulayacak.
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, joined: !currentlyJoined, duaCount: r.duaCount + (currentlyJoined ? -1 : 1) } : r
        )
      );
      if (currentlyJoined) {
        await supabase.from('dua_amins').delete().eq('request_id', requestId).eq('user_id', userId);
      } else {
        await supabase.from('dua_amins').insert({ request_id: requestId, user_id: userId });
      }
    },
    [userId]
  );

  return { requests, loading, createRequest, toggleAmin };
}
