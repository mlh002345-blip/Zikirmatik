import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { motifs } from '@/constants/motifs';
import { dhikrPresets, type DailyWird } from '@/constants/dhikr';

interface WeeklyPoint {
  label: string;
  count: number;
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

  // Şu an zikirmatikte hangi grubun aktif olduğu — grubun kendisi (üyeler,
  // ilerleme vb.) artık Supabase'de yaşıyor ve useGroups() hook'u ile
  // okunuyor; burada sadece seçili grubun kimliği tutuluyor.
  activeGroupId: string | null;

  incrementSession: () => void;
  resetSession: () => void;
  setSessionTarget: (n: number) => void;
  setSelectedDhikr: (id: string) => void;
  setActiveMotif: (id: string) => void;
  incrementWird: (id: string) => void;
  setActiveGroup: (groupId: string | null, dhikrId?: string) => void;
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

export const useNiyetStore = create<NiyetState>()(
  persist(
    (set) => ({
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

      activeGroupId: null,

      incrementSession: () =>
        set((state) => {
          const nextSession = state.sessionCount + 1;
          const motif = motifs.find((m) => m.id === state.activeMotifId);
          const nextMotifProgress = { ...state.motifProgress };
          if (motif) {
            nextMotifProgress[motif.id] = Math.min(motif.target, (nextMotifProgress[motif.id] ?? 0) + 1);
          }

          return {
            sessionCount: nextSession,
            totalLifetimeCount: state.totalLifetimeCount + 1,
            motifProgress: nextMotifProgress,
            gardenLevel: Math.min(100, state.gardenLevel + 0.05),
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
      setActiveGroup: (groupId, dhikrId) =>
        set({
          activeGroupId: groupId,
          ...(dhikrId ? { selectedDhikrId: dhikrId } : {}),
          sessionCount: 0,
        }),
    }),
    {
      name: 'niyet-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
