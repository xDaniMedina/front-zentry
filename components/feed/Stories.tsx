'use client'

import { useState } from 'react'
import { X, Plus, ChevronLeft, ChevronRight } from 'lucide-react'

export interface Story {
  username: string
  initials: string
  color: string
  hasNew: boolean
  content: string
  time: string
}

interface UserProfile {
  username: string
  initials: string
  color: string
}

interface FeedStoriesProps {
  stories: Story[]
  currentUser?: UserProfile
}

export default function FeedStories({ stories: initialStories, currentUser }: FeedStoriesProps) {
  const [stories, setStories] = useState<Story[]>(initialStories)
  const [activeStory, setActiveStory] = useState<number | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newStory, setNewStory] = useState('')

  // Color morado por defecto, pero podrías pasarlo dinámicamente según el tema si quisieras
  const currentProfile = currentUser ?? { username: 'tu_historia', initials: 'TU', color: '#A855F7' }

  const openStory = (index: number) => setActiveStory(index)
  const closeStory = () => setActiveStory(null)

  const prevStory = () => {
    if (activeStory !== null && activeStory > 0) {
      setActiveStory(activeStory - 1)
    }
  }

  const nextStory = () => {
    if (activeStory !== null && activeStory < stories.length - 1) {
      setActiveStory(activeStory + 1)
    } else {
      closeStory()
    }
  }

  return (
    <>
      <div className="bg-zentry-card border border-zentry-border rounded-2xl p-4 transition-colors duration-300">
        <p className="text-xs font-medium text-zentry-text-2 uppercase tracking-wider mb-3">
          Historias
        </p>
        <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar">

          {/* Botón crear historia */}
          <button
            onClick={() => setShowCreate(true)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
          >
            <div className="w-12 h-12 rounded-full bg-zentry-bg border-2 border-dashed border-zentry-border flex items-center justify-center group-hover:border-zentry-accent transition-colors duration-300">
              <Plus className="w-5 h-5 text-zentry-text-2 group-hover:text-zentry-accent transition-colors" />
            </div>
            <span className="text-xs text-zentry-text-2 group-hover:text-zentry-text-1 transition-colors">
              Tu historia
            </span>
          </button>

          {/* Historias de otros */}
          {stories.map((story, index) => (
            <button
              key={story.username}
              onClick={() => openStory(index)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
            >
              <div className={`p-0.5 rounded-full transition-all duration-300 ${
                story.hasNew
                  ? 'bg-gradient-to-tr from-zentry-accent to-blue-400'
                  : 'bg-zentry-border'
              }`}>
                {/* El borde interno se adapta al fondo de la tarjeta actual */}
                <div className="bg-zentry-card p-0.5 rounded-full transition-colors duration-300">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{ background: story.color + '30', color: story.color }}
                  >
                    {story.initials}
                  </div>
                </div>
              </div>
              <span className="text-xs text-zentry-text-2 group-hover:text-zentry-text-1 transition-colors max-w-[56px] truncate">
                @{story.username}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Modal ver historia (Mantiene UI oscura para resaltar el contenido) */}
      {activeStory !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm">

            {/* Barra de progreso */}
            <div className="flex gap-1 mb-3">
              {stories.map((_, i) => (
                <div
                  key={i}
                  className={`h-0.5 flex-1 rounded-full transition-colors ${
                    i <= activeStory ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>

            {/* Contenido de la historia */}
            <div
              className="rounded-2xl p-8 min-h-96 flex flex-col justify-between"
              style={{ background: stories[activeStory].color + '20', border: `1px solid ${stories[activeStory].color}40` }}
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                  style={{ background: stories[activeStory].color + '40', color: stories[activeStory].color }}
                >
                  {stories[activeStory].initials}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    @{stories[activeStory].username}
                  </p>
                  <p className="text-white/60 text-xs">
                    {stories[activeStory].time}
                  </p>
                </div>
                <button
                  onClick={closeStory}
                  className="ml-auto text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenido */}
              <div className="text-center py-8">
                <p className="text-white text-lg font-medium leading-relaxed">
                  {stories[activeStory].content}
                </p>
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Responder historia..."
                  className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm rounded-xl px-4 py-2 outline-none focus:border-white/40"
                />
                <button className="bg-zentry-accent hover:opacity-80 text-white text-sm px-4 py-2 rounded-xl transition-colors">
                  Enviar
                </button>
              </div>
            </div>

            {/* Navegación */}
            <div className="flex justify-between mt-3">
              <button
                onClick={prevStory}
                disabled={activeStory === 0}
                className="flex items-center gap-1 text-white/60 hover:text-white disabled:opacity-30 transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              <button
                onClick={nextStory}
                className="flex items-center gap-1 text-white/60 hover:text-white transition-colors text-sm"
              >
                {activeStory === stories.length - 1 ? 'Cerrar' : 'Siguiente'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear historia (Se adapta al tema activo) */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zentry-card border border-zentry-border rounded-2xl p-6 w-full max-w-md transition-colors duration-300 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-zentry-text-1 font-semibold">Crear historia</h3>
              <button
                onClick={() => setShowCreate(false)}
                className="text-zentry-text-2 hover:text-zentry-text-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              value={newStory}
              onChange={e => setNewStory(e.target.value)}
              placeholder="Comparte algo con tu comunidad, un proceso creativo, una reflexion, una obra en progreso."
              rows={4}
              className="w-full bg-zentry-bg border border-zentry-border text-zentry-text-1 placeholder:text-zentry-text-2 text-sm rounded-xl px-4 py-3 outline-none focus:border-zentry-accent resize-none mb-4 transition-colors"
            />

            <div className="flex justify-between items-center">
              <span className="text-xs text-zentry-text-2">
                {newStory.length}/200 caracteres
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-sm text-zentry-text-2 hover:text-zentry-text-1 px-4 py-2 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setStories([
                      ...stories,
                      {
                        username: currentProfile.username,
                        initials: currentProfile.initials,
                        color: currentProfile.color,
                        hasNew: true,
                        content: newStory.trim(),
                        time: 'Ahora',
                      },
                    ])
                    setShowCreate(false)
                    setNewStory('')
                  }}
                  disabled={!newStory.trim()}
                  className="text-sm bg-zentry-accent hover:opacity-80 disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  Publicar historia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}