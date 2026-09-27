"use client"

import { useEffect, useState } from "react"
import useSWR, { mutate } from "swr"
import { useAuth } from "@/context/AuthContext"
import { fetchAchievements } from "@/lib/actions/gamification"
import { AchievementItem } from "@/lib/gamification"
import AchievementCelebrationModal from "@/components/feed/AchievementCelebrationModal"

const storageKey = (userKey: string) => `zentry_seen_achievements_${userKey}`

function readSeen(userKey: string): number[] | null {
  try {
    const raw = localStorage.getItem(storageKey(userKey))
    return raw ? (JSON.parse(raw) as number[]) : null
  } catch {
    return null
  }
}

function writeSeen(userKey: string, ids: number[]) {
  try {
    localStorage.setItem(storageKey(userKey), JSON.stringify(ids))
  } catch { /* almacenamiento no disponible: la animación podría repetirse, sin más efecto */ }
}

/**
 * Vigila los logros del usuario y, cuando uno pasa a desbloqueado, muestra la animación
 * con ese logro. La primera vez solo registra los ya desbloqueados (no los celebra de golpe).
 */
export default function AchievementWatcher() {
  const { user } = useAuth()
  const userKey = user ? String(user.id ?? user.username ?? user.email ?? "") : ""

  const { data } = useSWR(userKey ? "achievementsMe" : null, fetchAchievements, {
    refreshInterval: 45000,
  })
  const [queue, setQueue] = useState<AchievementItem[]>([])

  useEffect(() => {
    if (!userKey || !data?.success) return
    const unlocked = data.achievements.filter(a => a.isUnlocked)
    const seen = readSeen(userKey)

    if (seen === null) {
      writeSeen(userKey, unlocked.map(a => a.id))
      return
    }

    const fresh = unlocked.filter(a => !seen.includes(a.id))
    if (fresh.length === 0) return
    writeSeen(userKey, [...seen, ...fresh.map(a => a.id)])
    setQueue(prev => [...prev, ...fresh.filter(a => !prev.some(p => p.id === a.id))])
    // Las monedas del logro ya se abonaron en el backend: refrescar saldo visible
    mutate("userStats")
    mutate("unreadNotifications")
  }, [data, userKey])

  const current = queue[0]
  if (!current) return null

  return (
    <AchievementCelebrationModal
      isOpen
      onClose={() => setQueue(prev => prev.slice(1))}
      achievementName={current.title}
      description={current.description}
      rewardCoins={current.rewardCoins}
      icon={current.icon || "🏆"}
    />
  )
}
