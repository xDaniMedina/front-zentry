'use client'

import { useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { getEquippedItemsAction, getStoreCatalogAction } from '@/lib/actions/shop'
import { useAuth } from '@/context/AuthContext'
import { DEFAULT_BACKGROUND, themePresetFor } from '@/lib/themes'

/**
 * Aplica el tema equipado en la tienda a toda la plataforma:
 * fondo ambiental + color de acento (botones, enlaces, badges, scrollbar).
 * Comparte las claves SWR con la tienda, así que equipar un tema se ve al instante.
 */
export default function ThemeAmbientBackground() {
  const { user } = useAuth()

  const { data: equippedRes } = useSWR(user ? 'equippedItems' : null, getEquippedItemsAction)
  const { data: catalogRes } = useSWR(user ? 'storeCatalog' : null, getStoreCatalogAction)

  const equippedThemeId = equippedRes?.equipped?.themes
  const preset = useMemo(() => {
    const item = catalogRes?.items.find(i => Number(i.id) === Number(equippedThemeId))
    return themePresetFor(item?.name)
  }, [catalogRes, equippedThemeId])

  // El acento se aplica como variable CSS en <html> y se retira al desequipar
  useEffect(() => {
    const root = document.documentElement
    if (preset) {
      root.style.setProperty('--accent', preset.accent)
    } else {
      root.style.removeProperty('--accent')
    }
    return () => { root.style.removeProperty('--accent') }
  }, [preset])

  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none z-0 transition-[background-image] duration-700 ease-in-out"
      style={{ backgroundImage: preset?.background ?? DEFAULT_BACKGROUND }}
    />
  )
}
