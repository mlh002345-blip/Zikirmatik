import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { motifs } from '@/constants/motifs';
import { dhikrPresets, type DailyWird } from '@/constants/dhikr';

interface WeeklyPoint {
  label: string;
  count: number;
}

// Manevi bahçenin gerçek zikir sayısından ne hızda büyüdüğünü belirleyen
// tek sabit — rastgele/elle artış yok, her yerde bu değer kullanılır.
const PROGRESSION = {
  ZIKIR_PER_GARDEN_PERCENT: 20, // her 20 zikirde bahçe %1 canlanır
} as const;

// Günlük virdler — kimlik/hedef sabit, ilerleme (progress) her zaman
// dailyLog akışından beslenir, elle set edilmez.
const WIRD_DEFS: Omit<DailyWird, 'progress'>[] = [
  { id: 'w1', dhikrId: 'subhanallah', target: 100 },
  { id: 'w2', dhikrId: 'estagfirullah', target: 100 },
  { id: 'w3', dhikrId: 'salavat', target: 100 },
];

const WEEKDAY_LABELS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']; // index = Date.getDay()

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function totalFromLog(dailyLog: Record<string, number>): number {
  return Object.values(dailyLog).reduce((sum, n) => sum + n, 0);
}

function computeWeeklyHistory(dailyLog: Record<string, number>): WeeklyPoint[] {
  const points: WeeklyPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    points.push({ label: WEEKDAY_LABELS[d.getDay()], count: dailyLog[dateKey(d)] ?? 0 });
  }
  return points;
}

function computeStreakDays(dailyLog: Record<string, number>): number {
  const cursor = new Date();
  if (!dailyLog[dateKey(cursor)]) {
    // Bugün henüz zikir çekilmediyse, seriyi bozmadan dünden geriye say.
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while ((dailyLog[dateKey(cursor)] ?? 0) > 0) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function computeGardenLevel(totalLifetimeCount: number): number {
  return Math.min(100, totalLifetimeCount / PROGRESSION.ZIKIR_PER_GARDEN_PERCENT);
}

interface NiyetState {
  activeMotifId: string;
  motifProgress: Record<string, number>; // motifId -> completed count
  selectedDhikrId: string;
  sessionCount: number;
  sessionTarget: number;
  dailyLog: Record<string, number>; // 'YYYY-MM-DD' -> o günkü toplam zikir sayısı
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

const initialMotifProgress: Record<string, number> = Object.fromEntries(motifs.map((m) => [m.id, 0]));

export const useNiyetStore = create<NiyetState>()(
  persist(
    (set, get) => ({
      activeMotifId: motifs[3].id,
      motifProgress: initialMotifProgress,
      selectedDhikrId: dhikrPresets[0].id,
      sessionCount: 0,
      sessionTarget: 33,
      dailyLog: {},
      totalLifetimeCount: 0,
      dailyWirds: WIRD_DEFS.map((w) => ({ ...w, progress: 0 })),
      weeklyHistory: computeWeeklyHistory({}),
      gardenLevel: 0,
      streakDays: 0,

      activeGroupId: null,

      incrementSession: () => {
        set((state) => {
          const nextSession = state.sessionCount + 1;
          const motif = motifs.find((m) => m.id === state.activeMotifId);
          const nextMotifProgress = { ...state.motifProgress };
          if (motif) {
            nextMotifProgress[motif.id] = Math.min(motif.target, (nextMotifProgress[motif.id] ?? 0) + 1);
          }

          const key = dateKey(new Date());
          const nextDailyLog = { ...state.dailyLog, [key]: (state.dailyLog[key] ?? 0) + 1 };
          const totalLifetimeCount = totalFromLog(nextDailyLog);

          return {
            sessionCount: nextSession,
            motifProgress: nextMotifProgress,
            dailyLog: nextDailyLog,
            totalLifetimeCount,
            streakDays: computeStreakDays(nextDailyLog),
            weeklyHistory: computeWeeklyHistory(nextDailyLog),
            gardenLevel: computeGardenLevel(totalLifetimeCount),
          };
        });

        const { selectedDhikrId, dailyWirds, incrementWird } = get();
        const matchedWird = dailyWirds.find((w) => w.dhikrId === selectedDhikrId);
        if (matchedWird) {
          incrementWird(matchedWird.id);
        }
      },
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
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const total = totalFromLog(state.dailyLog);
        useNiyetStore.setState({
          totalLifetimeCount: total,
          streakDays: computeStreakDays(state.dailyLog),
          weeklyHistory: computeWeeklyHistory(state.dailyLog),
          gardenLevel: computeGardenLevel(total),
        });
      },
    }
  )
);
