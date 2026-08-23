// MOTOR DE RACHAS DIARIAS TIPO TIKTOK / DUOLINGO PARA ZENTRY

export interface UserStreak {
  currentStreak: number;
  highestStreak: number;
  lastCheckInDate: string; // 'YYYY-MM-DD'
  weeklyDays: { day: string; checked: boolean; isToday: boolean }[];
  streakShields: number;
  multiplier: number;
  todayCompleted: boolean;
}

export function getTodayDateKey(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const DEFAULT_STREAK: UserStreak = {
  currentStreak: 5,
  highestStreak: 12,
  lastCheckInDate: '',
  weeklyDays: DAY_NAMES.map((name) => ({ day: name, checked: false, isToday: false })),
  streakShields: 1,
  multiplier: 1.5,
  todayCompleted: false
};

export function getUserStreak(username: string): UserStreak {
  const cleanU = (username || '').replace(/^@/, '').toLowerCase().trim();
  const todayKey = getTodayDateKey();
  const now = new Date();
  const currentDayIndex = now.getDay();

  if (typeof window === 'undefined' || !cleanU) {
    return DEFAULT_STREAK;
  }

  try {
    const raw = localStorage.getItem(`zentry_streak_${cleanU}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      const isToday = parsed.lastCheckInDate === todayKey;
      
      const weekly = DAY_NAMES.map((name, idx) => {
        const isPast = idx < currentDayIndex;
        const isCurrent = idx === currentDayIndex;
        return {
          day: name,
          checked: isPast ? true : (isCurrent && isToday),
          isToday: isCurrent
        };
      });

      return {
        currentStreak: parsed.currentStreak || 5,
        highestStreak: parsed.highestStreak || 12,
        lastCheckInDate: parsed.lastCheckInDate || todayKey,
        weeklyDays: weekly,
        streakShields: parsed.streakShields ?? 1,
        multiplier: Math.min(3.0, 1 + (parsed.currentStreak || 5) * 0.1),
        todayCompleted: isToday
      };
    }
  } catch {}

  const initialWeekly = DAY_NAMES.map((name, idx) => ({
    day: name,
    checked: idx < currentDayIndex,
    isToday: idx === currentDayIndex
  }));

  const initialStreak: UserStreak = {
    currentStreak: 5,
    highestStreak: 12,
    lastCheckInDate: '',
    weeklyDays: initialWeekly,
    streakShields: 1,
    multiplier: 1.5,
    todayCompleted: false
  };

  saveUserStreak(cleanU, initialStreak);
  return initialStreak;
}

export function saveUserStreak(username: string, streak: UserStreak): void {
  if (typeof window === 'undefined') return;
  try {
    const cleanU = (username || '').replace(/^@/, '').toLowerCase().trim();
    localStorage.setItem(`zentry_streak_${cleanU}`, JSON.stringify(streak));
  } catch {}
}

export function checkInDailyStreak(username: string): { success: boolean; streak: UserStreak; rewardBonus: number } {
  const cleanU = (username || '').replace(/^@/, '').toLowerCase().trim();
  const current = getUserStreak(cleanU);
  const todayKey = getTodayDateKey();

  if (current.lastCheckInDate === todayKey) {
    return { success: false, streak: current, rewardBonus: 0 };
  }

  const newCount = current.currentStreak + 1;
  const newHighest = Math.max(current.highestStreak, newCount);
  const bonusCoins = 50 + newCount * 10;

  const now = new Date();
  const currentDayIndex = now.getDay();

  const updatedWeekly = current.weeklyDays.map((d, i) => ({
    ...d,
    checked: i <= currentDayIndex,
    isToday: i === currentDayIndex
  }));

  const updated: UserStreak = {
    currentStreak: newCount,
    highestStreak: newHighest,
    lastCheckInDate: todayKey,
    weeklyDays: updatedWeekly,
    streakShields: current.streakShields,
    multiplier: Math.min(3.0, 1 + newCount * 0.1),
    todayCompleted: true
  };

  saveUserStreak(cleanU, updated);

  try {
    const rawUser = localStorage.getItem('zentry_user');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      u.zentry_coins = (u.zentry_coins || 0) + bonusCoins;
      localStorage.setItem('zentry_user', JSON.stringify(u));
    }
  } catch {}

  return { success: true, streak: updated, rewardBonus: bonusCoins };
}
