'use client'

import { useState } from 'react'
import FeedCard from '@/components/feed/FeedCard'

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

export default function FeedTabs() {
  const [activeTab, setActiveTab] = useState('foryou')

  const filteredPosts = ALL_POSTS.filter(post => post.tab === activeTab)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

      <div className="flex border-b border-zinc-800">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'text-violet-400 border-b-2 border-violet-500'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col divide-y divide-zinc-800">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post, i) => (
            <div key={i} className="p-3">
              <FeedCard
                author={post.author}
                content={post.content}
                isFollowing={post.isFollowing}
              />
            </div>
          ))
        ) : (
          <div className="py-12 text-center">
            <p className="text-zinc-500 text-sm">
              No hay publicaciones aqui todavia
            </p>
          </div>
        )}
      </div>

    </div>
  )
}   