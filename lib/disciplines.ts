// Catálogo compartido de disciplinas/especialidades artísticas (onboarding + editar perfil)
export const DISCIPLINES = [
  { value: 'ilustracion', label: 'Ilustración Digital', emoji: '🎨' },
  { value: '3d_design', label: 'Diseño 3D & VFX', emoji: '🎬' },
  { value: 'ui_ux', label: 'UI/UX & Product Design', emoji: '📱' },
  { value: 'animation', label: 'Animación 2D/3D', emoji: '✨' },
  { value: 'music_audio', label: 'Música & Producción Audio', emoji: '🎵' },
  { value: 'game_dev', label: 'Desarrollo de Videojuegos', emoji: '🎮' },
  { value: 'software_dev', label: 'Desarrollo Web & Código', emoji: '💻' },
  { value: 'photography', label: 'Fotografía & Arte Visual', emoji: '📷' },
]

// 'ilastracion' es el slug con errata que guardaban versiones anteriores del onboarding
const LEGACY_SLUGS: Record<string, string> = { ilastracion: 'ilustracion' }

/** Convierte el slug guardado en backend (ej. "3d_design") en su etiqueta legible. */
export function disciplineLabel(value?: string | null): string {
  if (!value) return ''
  const slug = LEGACY_SLUGS[value] ?? value
  return DISCIPLINES.find(d => d.value === slug)?.label ?? value
}

export function disciplineEmoji(label: string): string | undefined {
  return DISCIPLINES.find(d => d.label === label)?.emoji
}

/** El backend guarda las especialidades como texto separado por comas. */
export function parseSpecialties(raw?: string | null): string[] {
  if (!raw) return []
  return Array.from(new Set(raw.split(',').map(s => s.trim()).filter(Boolean)))
}

export function joinSpecialties(list: string[]): string {
  return list.join(', ')
}
