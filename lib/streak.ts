import type { UserStreakData } from '@/lib/actions/gamification'

export interface StreakView {
  days: number
  /** Encendida hoy (completó al menos una misión hoy) */
  lit: boolean
  /** Tiene racha de días anteriores pero hoy aún no la enciende: se pierde a medianoche */
  atRisk: boolean
  tooltip: string
}

/**
 * Racha estilo TikTok: suma un día por cada día con al menos una misión completada.
 * Si hoy ya se completó una misión pero el backend aún no refrescó, se cuenta el día (UI optimista).
 */
export function describeStreak(data: UserStreakData | undefined | null, completedMissionsToday: number): StreakView {
  const base = data?.currentStreak ?? 0
  const backendLit = Boolean(data?.activeToday)
  const lit = backendLit || completedMissionsToday > 0
  const days = !backendLit && lit ? base + 1 : base
  const atRisk = !lit && base > 0
  const hours = data?.hoursLeftToday

  const plural = (n: number) => `${n} ${n === 1 ? 'día' : 'días'}`
  let tooltip: string
  if (lit) {
    tooltip = `🔥 Racha encendida: ${plural(days)} seguidos. Vuelve mañana para sumar otro.`
  } else if (atRisk) {
    tooltip = `⚠️ Tu racha de ${plural(base)} se apaga${hours != null ? ` en ${hours} h` : ' hoy a medianoche'}. Completa una misión para mantenerla.`
  } else {
    tooltip = 'Completa una misión diaria para encender tu racha.'
  }
  return { days, lit, atRisk, tooltip }
}
