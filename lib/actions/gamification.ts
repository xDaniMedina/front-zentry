'use server'

import { fetchAPI } from '@/lib/api'
import { DailyMission, AchievementItem, DAILY_MISSIONS_POOL, ACHIEVEMENTS_POOL, getTodayDateString } from '@/lib/gamification'

export async function fetchDailyMissions(): Promise<{ success: boolean; missions: DailyMission[] }> {
  try {
    // Attempt to fetch from backend
    const res = await fetchAPI('/api/core/missions');
    if (res && res.missions) {
      return { success: true, missions: res.missions };
    }
    
    // Fallback if backend doesn't return missions format expected
    return { success: true, missions: DAILY_MISSIONS_POOL.map((m, idx) => ({
      ...m,
      currentProgress: idx === 0 ? 1 : 0,
      isClaimed: false
    })) };
  } catch (error) {
    console.error('Error fetching missions:', error);
    return { success: true, missions: DAILY_MISSIONS_POOL.map((m, idx) => ({
      ...m,
      currentProgress: idx === 0 ? 1 : 0,
      isClaimed: false
    })) };
  }
}

export async function fetchAchievements(): Promise<{ success: boolean; achievements: AchievementItem[] }> {
  try {
    const res = await fetchAPI('/api/core/achievements');
    if (res && res.achievements) {
      return { success: true, achievements: res.achievements };
    }
    
    return { success: true, achievements: ACHIEVEMENTS_POOL };
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return { success: true, achievements: ACHIEVEMENTS_POOL };
  }
}

export async function claimMission(missionId: string) {
  try {
    const res = await fetchAPI(`/api/core/missions/${missionId}/claim`, {
      method: 'POST'
    });
    return { success: !!res, data: res };
  } catch (error) {
    console.error('Error claiming mission:', error);
    return { success: false };
  }
}

export async function claimAchievement(achievementId: string) {
  try {
    const res = await fetchAPI(`/api/core/achievements/${achievementId}/claim`, {
      method: 'POST'
    });
    return { success: !!res, data: res };
  } catch (error) {
    console.error('Error claiming achievement:', error);
    return { success: false };
  }
}
