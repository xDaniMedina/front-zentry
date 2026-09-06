// TIPOS DE MISIONES Y LOGROS — los datos reales vienen del backend (lib/actions/gamification.ts)

export type MissionCategory = 'social' | 'creation' | 'community' | 'exploration' | 'streak';

export interface DailyMission {
  id: number;
  title: string;
  description: string;
  category: MissionCategory | string;
  rewardCoins: number;
  currentProgress: number;
  targetProgress: number;
  isClaimed: boolean;
  iconName?: string;
}

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mysterious';

export interface AchievementItem {
  id: number;
  title: string;
  description: string;
  rewardCoins: number;
  icon: string;
  rarity: AchievementRarity;
  category: 'creation' | 'social' | 'community' | 'reputation' | 'mastery' | 'mystery' | string;
  isUnlocked: boolean;
  unlockedDate?: string;
  isSecret?: boolean;
  secretHint?: string;
}

export function getTodayDateString(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}
