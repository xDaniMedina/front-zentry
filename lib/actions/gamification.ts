'use server'

import { fetchAPI, ApiError } from '@/lib/api'
import { DailyMission, AchievementItem } from '@/lib/gamification'

type BackendMission = {
  id: number
  title: string
  description: string
  rewardCoins: number
  requirementType: string
  requirementValue: number
  category: string | null
  iconName: string | null
  progress: number
  completed: boolean
}

type BackendAchievement = {
  id: number
  title: string
  description: string
  rewardCoins: number
  iconUrl: string | null
  requirementType: string
  requirementValue: number
  rarity: string | null
  category: string | null
  isSecret: boolean | null
  secretHint: string | null
  unlocked: boolean
  unlockedAt: string | null
}

function toDailyMission(m: BackendMission): DailyMission {
  return {
    id: m.id,
    title: m.title,
    description: m.description,
    category: m.category || 'social',
    rewardCoins: m.rewardCoins,
    currentProgress: m.progress,
    targetProgress: m.requirementValue,
    isClaimed: m.completed,
    iconName: m.iconName || undefined,
  }
}

function toAchievementItem(a: BackendAchievement): AchievementItem {
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    rewardCoins: a.rewardCoins,
    icon: a.iconUrl || '🏆',
    rarity: (a.rarity?.toLowerCase() || 'common') as AchievementItem['rarity'],
    category: a.category || 'mastery',
    isUnlocked: a.unlocked,
    unlockedDate: a.unlockedAt ? new Date(a.unlockedAt).toLocaleDateString() : undefined,
    isSecret: Boolean(a.isSecret),
    secretHint: a.secretHint || undefined,
  }
}

export async function fetchDailyMissions(): Promise<{ success: boolean; missions: DailyMission[] }> {
  try {
    const res: BackendMission[] | null = await fetchAPI('/api/core/missions')
    return { success: true, missions: (res || []).map(toDailyMission) }
  } catch (error) {
    console.error('Error fetching missions:', error)
    return { success: false, missions: [] }
  }
}

export async function fetchAchievements(): Promise<{ success: boolean; achievements: AchievementItem[] }> {
  try {
    const res: BackendAchievement[] | null = await fetchAPI('/api/core/achievements/me')
    return { success: true, achievements: (res || []).map(toAchievementItem) }
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return { success: false, achievements: [] }
  }
}

export async function claimMission(missionId: number): Promise<{ success: boolean; data?: DailyMission; error?: string }> {
  try {
    const res: BackendMission | null = await fetchAPI(`/api/core/missions/${missionId}/claim`, { method: 'POST' })
    if (!res) {
      return { success: false, error: 'No se pudo reclamar la misión' }
    }
    return { success: true, data: toDailyMission(res) }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo reclamar la misión'
    console.error('Error claiming mission:', error)
    return { success: false, error: message }
  }
}
