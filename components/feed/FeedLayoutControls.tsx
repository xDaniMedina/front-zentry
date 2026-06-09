'use client'

import { useState } from 'react'

// Definimos los tipos de datos
export type LayoutMode = 'classic' | 'bento' | 'compact'
export type ThemeMode = 'light' | 'dark' | 'special'

interface FeedLayoutControlsProps {
  onLayoutChange: (mode: LayoutMode) => void
  onThemeChange: (theme: ThemeMode) => void
  initialLayout: LayoutMode
  initialTheme: ThemeMode
}

const LAYOUTS: { id: LayoutMode; label: string; icon: string }[] = [
  { id: 'classic', label: 'Feed Clásico', icon: 'list-ul' }, // Iconos de FontAwesome (por ejemplo)
  { id: 'bento', label: 'Bento Grid', icon: 'th-large' },
  { id: 'compact', label: 'Vista Compacta', icon: 'align-justify' },
]

const THEMES: { id: ThemeMode; label: string; bgClass: string }[] = [
  { id: 'light', label: 'Claro', bgClass: 'bg-white border' },
  { id: 'dark', label: 'Oscuro', bgClass: 'bg-gray-800' },
  { id: 'special', label: 'Zentry Especial', bgClass: 'bg-gradient-to-tr from-[#050a14] to-[#0c1421] border-[#1d2b3e]' },
]

export default function FeedLayoutControls({ onLayoutChange, onThemeChange, initialLayout, initialTheme }: FeedLayoutControlsProps) {
  const [currentLayout, setCurrentLayout] = useState<LayoutMode>(initialLayout)
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(initialTheme)

  const handleLayoutClick = (mode: LayoutMode) => {
    setCurrentLayout(mode)
    onLayoutChange(mode)
  }

  const handleThemeClick = (theme: ThemeMode) => {
    setCurrentTheme(theme)
    onThemeChange(theme)
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-zentry-card p-4 sm:p-5 rounded-2xl gap-4 sm:gap-0 border border-zentry-border mb-6">
      
      {/* Selector de Layout */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-zentry-text-2">Vista del Feed:</span>
        <div className="flex items-center gap-1.5">
          {LAYOUTS.map((layout) => (
            <button
              key={layout.id}
              onClick={() => handleLayoutClick(layout.id)}
              className={`px-3 py-1.5 text-xs rounded-full transition-all duration-200 flex items-center gap-1 ${
                currentLayout === layout.id
                  ? 'bg-zentry-accent text-white font-medium shadow-md shadow-zentry-accent/20'
                  : 'text-zentry-text-2 bg-zentry-app/50 hover:bg-zentry-app hover:text-zentry-text-1'
              }`}
            >
              {layout.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selector de Tema */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-zentry-text-2">Tema:</span>
        <div className="flex items-center gap-2">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeClick(theme.id)}
              title={theme.label}
              className={`w-7 h-7 rounded-full transition-transform duration-200 flex items-center justify-center ${theme.bgClass} ${
                currentTheme === theme.id ? 'scale-125 border-2 border-zentry-accent shadow-lg shadow-zentry-accent/30' : ''
              }`}
            >
               {currentTheme === theme.id && <div className='w-2 h-2 rounded-full bg-zentry-accent'/>}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}