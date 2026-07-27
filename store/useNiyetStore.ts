import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { motifs } from '@/constants/motifs';
import { dhikrPresets, type DailyWird } from '@/constants/dhikr';

interface WeeklyPoint {
  label: string;
  count: number;
}

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

interface NiyetState {
  activeMotifId: string;
  motifProgress: Record<string, number>; // motifId -> completed count
  selectedDhikrId: string;
  sessionCount: number;
  sessionTarget: number;
  totalLifetimeCount: number;
  dailyWirds: DailyWird[];
  weeklyHistory: WeeklyPoint[];
  gardenLevel: number; // 0-100
  streakDays: number;

  groups: DhikrGroup[];
  activeGroupId: string | null;

  incrementSession: () => void;
  resetSession: () => void;
  setSessionTarget: (n: number) => void;
  setSelectedDhikr: (id: string) => void;
  setActiveMotif: (id: string) => void;
  incrementWird: (id: string) => void;

  createGroup: (name: string, dhikrId: string, target: number) => string;
  joinGroupByCode: (code: string) => { success: boolean; groupId?: string; error?: string };
  leaveGroup: (groupId: string) => void;
  setActiveGroup: (groupId: string | null) => void;
}

const initialDailyWirds: DailyWird[] = [
  { id: 'w1', dhikrId: 'subhanallah', target: 100, progress: 33 },
  { id: 'w2', dhikrId: 'estagfirullah', target: 100, progress: 100 },
  { id: 'w3', dhikrId: 'salavat', target: 100, progress: 20 },
];

const initialWeeklyHistory: WeeklyPoint[] = [
  { label: 'Pzt', count: 320 },
  { label: 'Sal', count: 410 },
  { label: 'Çar', count: 260 },
  { label: 'Per', count: 480 },
  { label: 'Cum', count: 610 },
  { label: 'Cmt', count: 390 },
  { label: 'Paz', count: 150 },
];

const initialMotifProgress: Record<string, number> = Object.fromEntries(
  motifs.map((m, i) => [m.id, i < 3 ? m.target : i < 8 ? Math.round(m.target * (0.15 + 0.1 * (i % 5))) : 0])
);

const seedGroups: DhikrGroup[] = [
  {
    id: 'g1',
    name: 'Aile Zikir Halkası',
    dhikrId: 'kelimeitevhid',
    target: 70000,
    progress: 48210,
    inviteCode: 'AILE-70K',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    members: [
      { id: 'm1', name: 'Ayşe', initial: 'A', contribution: 15200 },
      { id: 'm2', name: 'Mehmet', initial: 'M', contribution: 13400 },
      { id: 'm3', name: 'Zeynep', initial: 'Z', contribution: 11100 },
      { id: 'm4', name: 'Fatma', initial: 'F', contribution: 8510 },
    ],
  },
  {
    id: 'g2',
    name: 'Cuma Kardeşliği',
    dhikrId: 'salavat',
    target: 100000,
    progress: 62050,
    inviteCode: 'CUMA-100',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
    members: [
      { id: 'm5', name: 'Emre', initial: 'E', contribution: 22000 },
      { id: 'm6', name: 'Selim', initial: 'S', contribution: 18050 },
      { id: 'm7', name: 'Kerem', initial: 'K', contribution: 12500 },
      { id: 'm8', name: 'Büşra', initial: 'B', contribution: 9500 },
    ],
  },
  {
    id: 'g3',
    name: 'Şifa Niyetine',
    dhikrId: 'estagfirullah',
    target: 10000,
    progress: 9120,
    inviteCode: 'SIFA-10K',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    members: [
      { id: 'm9', name: 'Ayşe', initial: 'A', contribution: 3800 },
      { id: 'm10', name: 'Fatma', initial: 'F', contribution: 3200 },
      { id: 'm11', name: 'Derya', initial: 'D', contribution: 2120 },
    ],
  },
];

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generateId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export const useNiyetStore = create<NiyetState>()(
  persist(
    (set, get) => ({
      activeMotifId: motifs[3].id,
      motifProgress: initialMotifProgress,
      selectedDhikrId: dhikrPresets[0].id,
      sessionCount: 0,
      sessionTarget: 33,
      totalLifetimeCount: 48_612,
      dailyWirds: initialDailyWirds,
      weeklyHistory: initialWeeklyHistory,
      gardenLevel: 68,
      streakDays: 12,

      groups: seedGroups,
      activeGroupId: null,

      incrementSession: () =>
        set((state) => {
          const nextSession = state.sessionCount + 1;
          const motif = motifs.find((m) => m.id === state.activeMotifId);
          const nextMotifProgress = { ...state.motifProgress };
          if (motif) {
            nextMotifProgress[motif.id] = Math.min(motif.target, (nextMotifProgress[motif.id] ?? 0) + 1);
          }

          let nextGroups = state.groups;
          if (state.activeGroupId) {
            nextGroups = state.groups.map((g) => {
              if (g.id !== state.activeGroupId) return g;
              const nextMembers = g.members.map((m) =>
                m.isYou ? { ...m, contribution: m.contribution + 1 } : m
              );
              return { ...g, progress: g.progress + 1, members: nextMembers };
            });
          }

          return {
            sessionCount: nextSession,
            totalLifetimeCount: state.totalLifetimeCount + 1,
            motifProgress: nextMotifProgress,
            gardenLevel: Math.min(100, state.gardenLevel + 0.05),
            groups: nextGroups,
          };
        }),
      resetSession: () => set({ sessionCount: 0 }),
      setSessionTarget: (n) => set({ sessionTarget: n }),
      setSelectedDhikr: (id) => set({ selectedDhikrId: id, sessionCount: 0 }),
      setActiveMotif: (id) => set({ activeMotifId: id }),
      incrementWird: (id) =>
        set((state) => ({
          dailyWirds: state.dailyWirds.map((w) =>
            w.id === id ? { ...w, progress: Math.min(w.target, w.progress + 1) } : w
          ),
        })),

      createGroup: (name, dhikrId, target) => {
        const id = generateId();
        const newGroup: DhikrGroup = {
          id,
          name: name.trim() || 'Adsız Grup',
          dhikrId,
          target: Math.max(1, target),
          progress: 0,
          inviteCode: generateInviteCode(),
          createdAt: Date.now(),
          members: [{ id: 'you', name: 'Sen', initial: 'S', contribution: 0, isYou: true }],
        };
        set((state) => ({
          groups: [newGroup, ...state.groups],
          activeGroupId: id,
          selectedDhikrId: dhikrId,
          sessionCount: 0,
        }));
        return id;
      },

      joinGroupByCode: (code) => {
        const normalized = code.trim().toUpperCase();
        const group = get().groups.find((g) => g.inviteCode === normalized);
        if (!group) {
          return { success: false, error: 'Bu kodla eşleşen bir grup bulunamadı.' };
        }
        const alreadyMember = group.members.some((m) => m.isYou);
        if (!alreadyMember) {
          set((state) => ({
            groups: state.groups.map((g) =>
              g.id === group.id
                ? { ...g, members: [...g.members, { id: 'you', name: 'Sen', initial: 'S', contribution: 0, isYou: true }] }
                : g
            ),
          }));
        }
        return { success: true, groupId: group.id };
      },

      leaveGroup: (groupId) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId ? { ...g, members: g.members.filter((m) => !m.isYou) } : g
          ),
          activeGroupId: state.activeGroupId === groupId ? null : state.activeGroupId,
        })),

      setActiveGroup: (groupId) =>
        set((state) => {
          if (!groupId) return { activeGroupId: null };
          const group = state.groups.find((g) => g.id === groupId);
          if (!group) return {};
          return { activeGroupId: groupId, selectedDhikrId: group.dhikrId, sessionCount: 0 };
        }),
    }),
    {
      name: 'niyet-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
