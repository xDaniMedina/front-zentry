// Temas de la tienda (categoría "themes"): al equiparlos cambian el acento y el fondo de toda la plataforma.
// Las claves coinciden con los nombres del catálogo del backend (StoreService.seedStoreItems).

export interface ThemePreset {
  accent: string
  background: string
}

const DEFAULT_BACKGROUND =
  'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.12), transparent 70%), radial-gradient(ellipse 60% 50% at 50% 120%, rgba(76, 29, 149, 0.1), transparent 70%)'

export const THEME_PRESETS: Record<string, ThemePreset> = {
  'Tema Cyberpunk Neón': {
    accent: '#22d3ee',
    background: 'radial-gradient(ellipse 80% 50% at 15% -10%, rgba(6, 182, 212, 0.26), transparent 70%), radial-gradient(ellipse 80% 55% at 90% 95%, rgba(236, 72, 153, 0.24), transparent 70%)',
  },
  'Tema Eclipse Solar': {
    accent: '#f59e0b',
    background: 'radial-gradient(circle at 50% -15%, rgba(0, 0, 0, 0.9) 18%, rgba(245, 158, 11, 0.28) 24%, transparent 48%), radial-gradient(ellipse 70% 40% at 50% 115%, rgba(180, 83, 9, 0.16), transparent 70%)',
  },
  'Tema Bosque Esmeralda': {
    accent: '#10b981',
    background: 'radial-gradient(ellipse 90% 55% at 50% -20%, rgba(16, 185, 129, 0.22), transparent 75%), radial-gradient(ellipse 60% 45% at 10% 90%, rgba(120, 83, 34, 0.18), transparent 70%)',
  },
  'Tema Oro Imperial': {
    accent: '#eab308',
    background: 'radial-gradient(ellipse 90% 55% at 50% -20%, rgba(234, 179, 8, 0.24), transparent 75%), radial-gradient(ellipse 60% 45% at 85% 90%, rgba(203, 213, 225, 0.12), transparent 70%)',
  },
  'Tema Galaxia Violeta': {
    accent: '#8b5cf6',
    background: 'radial-gradient(ellipse 90% 60% at 50% -20%, rgba(139, 92, 246, 0.28), transparent 75%), radial-gradient(ellipse 70% 50% at 85% 85%, rgba(109, 40, 217, 0.22), transparent 70%), radial-gradient(ellipse 60% 40% at 15% 45%, rgba(76, 29, 149, 0.2), transparent 70%)',
  },
  'Tema Luna de Sangre': {
    accent: '#e11d48',
    background: 'radial-gradient(ellipse 90% 60% at 50% -20%, rgba(225, 29, 72, 0.26), transparent 75%), radial-gradient(ellipse 70% 50% at 80% 80%, rgba(159, 18, 57, 0.2), transparent 70%)',
  },
  'Tema Aurora Boreal': {
    accent: '#14b8a6',
    background: 'radial-gradient(ellipse 90% 60% at 30% -20%, rgba(16, 185, 129, 0.24), transparent 75%), radial-gradient(ellipse 70% 50% at 85% 20%, rgba(56, 189, 248, 0.18), transparent 70%), radial-gradient(ellipse 50% 40% at 15% 90%, rgba(20, 184, 166, 0.16), transparent 70%)',
  },
  'Tema Blanco Puro Minimal': {
    accent: '#64748b',
    background: 'radial-gradient(ellipse 90% 60% at 50% -20%, rgba(255, 255, 255, 0.10), transparent 75%), radial-gradient(ellipse 60% 40% at 50% 110%, rgba(255, 255, 255, 0.06), transparent 70%)',
  },
}

export function themePresetFor(itemName?: string | null): ThemePreset | null {
  if (!itemName) return null
  return THEME_PRESETS[itemName] ?? null
}

export { DEFAULT_BACKGROUND }
