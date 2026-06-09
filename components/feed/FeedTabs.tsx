'use client'

import { useState } from 'react'
import FeedCard from '@/components/feed/FeedCard'

// Importamos el tipo LayoutMode si lo tienes en types o en el control
type LayoutMode = 'classic' | 'bento' | 'compact'

const ALL_POSTS = [
  {
    author: { username: '@lunamuse', initials: 'LM', color: '#1D9E75', discipline: 'Ilustracion', time: 'hace 2h' },
    content: { text: 'Serie nueva: Raices — explorando la identidad a traves del color y la forma.', imageUrl: 'Serie Raices', tags: ['ilustracion', 'identidad', 'color'], qualityScore: 4.8, likes: 142, comments: 28 },
    isFollowing: false,
    tab: 'foryou',
  },
  {
    author: { username: '@pixelkid', initials: 'PK', color: '#BA7517', discipline: 'Arte Digital', time: 'hace 5h' },
    content: { text: 'El proceso creativo es mas valioso que el resultado final.', tags: ['reflexion', 'proceso'], qualityScore: 4.2, likes: 89, comments: 34 },
    isFollowing: true,
    tab: 'following',
  },
  {
    author: { username: '@novabeats', initials: 'NB', color: '#534AB7', discipline: 'Musica', time: 'hace 8h' },
    content: { text: 'Acabo de terminar mi primer EP completamente producido en casa.', tags: ['musica', 'EP', 'produccion'], qualityScore: 4.6, likes: 203, comments: 51 },
    isFollowing: false,
    tab: 'trending',
  },
  {
    author: { username: '@sketchr', initials: 'SK', color: '#B74545', discipline: 'Ilustracion', time: 'hace 10h' },
    content: { text: 'Nuevo boceto de la serie urbana. La ciudad como lienzo.', tags: ['ilustracion', 'urbano', 'boceto'], qualityScore: 4.4, likes: 67, comments: 19 },
    isFollowing: true,
    tab: 'following',
  },
]

const TABS = [
  { key: 'foryou',    label: 'Para ti' },
  { key: 'following', label: 'Siguiendo' },
  { key: 'trending',  label: 'Tendencias' },
]

export default function FeedTabs({ layoutMode = 'classic' }: { layoutMode?: LayoutMode }) {
  const [activeTab, setActiveTab] = useState('foryou')

  const filteredPosts = ALL_POSTS.filter(post => post.tab === activeTab)

  // Clases dinámicas para el contenedor de los posts dentro de las tabs
  const getContainerClasses = () => {
    switch (layoutMode) {
      case 'bento':
        return 'grid grid-cols-1 md:grid-cols-2 gap-4 p-4'
      case 'compact':
        return 'flex flex-col gap-2 p-2 bg-zentry-app' // Fondo distinto para que destaquen las cartas compactas
      case 'classic':
      default:
        return 'flex flex-col divide-y divide-zentry-border'
    }
  }

  return (
    <div className={`bg-zentry-card border border-zentry-border rounded-2xl overflow-hidden transition-all duration-300 ${layoutMode === 'compact' ? 'bg-transparent border-none' : ''}`}>

      {/* Cabecera de Tabs */}
      <div className={`flex ${layoutMode === 'compact' ? 'mb-2 bg-zentry-card border border-zentry-border rounded-xl' : 'border-b border-zentry-border'}`}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'text-zentry-accent border-b-2 border-zentry-accent'
                : 'text-zentry-text-2 hover:text-zentry-text-1'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenedor de Posts Adaptativo */}
      <div className={getContainerClasses()}>
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post, i) => (
            <div key={i} className={layoutMode === 'classic' ? 'p-3' : ''}>
              <FeedCard
                author={post.author}
                content={post.content}
                isFollowing={post.isFollowing}
                layout={layoutMode} // ¡Pasamos el layout a la tarjeta!
              />
            </div>
          ))
        ) : (
          <div className="py-12 text-center col-span-full">
            <p className="text-zentry-text-2 text-sm">
              No hay publicaciones aqui todavia
            </p>
          </div>
        )}
      </div>

    </div>
  )
}