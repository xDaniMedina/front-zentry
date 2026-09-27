// Mismo catálogo que el backend (ReactionTypes.java): obras e historias
export const REACTIONS = [
  { type: 'like', emoji: '❤️', label: 'Me encanta' },
  { type: 'fire', emoji: '🔥', label: 'Fuego' },
  { type: 'clap', emoji: '👏', label: 'Aplausos' },
  { type: 'wow', emoji: '😮', label: 'Asombroso' },
  { type: 'laugh', emoji: '😂', label: 'Divertido' },
  { type: 'idea', emoji: '💡', label: 'Inspirador' },
] as const

export type ReactionType = typeof REACTIONS[number]['type']

export function reactionEmoji(type?: string | null): string {
  return REACTIONS.find(r => r.type === type)?.emoji ?? '❤️'
}

/** Las reacciones más usadas primero (para el resumen bajo la obra). */
export function topReactions(counts?: Record<string, number>, max = 3): string[] {
  if (!counts) return []
  return Object.entries(counts)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([type]) => type)
}

export function reactionLabel(type?: string | null): string {
  return REACTIONS.find(r => r.type === type)?.label ?? 'Me gusta'
}

/** Color del texto del botón según la reacción (como Facebook: cada reacción tiene su color). */
export function reactionColorClass(type?: string | null): string {
  switch (type) {
    case 'like': return 'text-rose-500'
    case 'fire': return 'text-orange-500'
    case 'clap': return 'text-amber-400'
    case 'wow': return 'text-yellow-400'
    case 'laugh': return 'text-yellow-400'
    case 'idea': return 'text-sky-400'
    default: return 'text-zentry-text-2'
  }
}

type Reactable = { myReaction?: string | null; reactionCounts?: Record<string, number>; likes: number; liked?: boolean }

/**
 * Aplica una reacción localmente (UI optimista) con las mismas reglas que el backend:
 * type = null  → quitar la reacción actual (o poner ❤️ si no había)
 * misma que la actual → quitarla; otra → reemplazarla.
 */
export function applyReactionLocally<T extends Reactable>(item: T, type: string | null): T {
  const current = item.myReaction ?? (item.liked ? 'like' : null)
  const next = type === null ? (current ? null : 'like') : (current === type ? null : type)

  const counts = { ...(item.reactionCounts || {}) }
  if (current) counts[current] = Math.max(0, (counts[current] || 1) - 1)
  if (next) counts[next] = (counts[next] || 0) + 1
  Object.keys(counts).forEach(k => { if (!counts[k]) delete counts[k] })

  const likes = Math.max(0, item.likes + (next && !current ? 1 : !next && current ? -1 : 0))
  return { ...item, myReaction: next, liked: Boolean(next), reactionCounts: counts, likes }
}
