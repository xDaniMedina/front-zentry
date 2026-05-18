'use client'

import { useState } from 'react'
import { Edit, Share2, MapPin, Link as LinkIcon, Star } from 'lucide-react'

const MOCK_PROFILE = {
  username: 'danielarte',
  displayName: 'Daniel Artesano',
  artisticName: 'DanielArte',
  bio: 'Artista visual enfocado en ilustracion digital y narrativa visual. Creo mundos donde el color cuenta historias.',
  discipline: 'Ilustracion',
  experienceLevel: 'Avanzado',
  location: 'Teziutlan, Puebla',
  portfolioUrl: 'danielarte.com',
  isVerified: true,
  isOwner: true,
  stats: { posts: 12, followers: 340, following: 89, coins: 85 },
  socialLinks: { instagram: '@danielarte', behance: 'danielarte' },
}

const MOCK_POSTS = [
  { id: 1, title: 'Serie Raices', qualityScore: 4.8, likes: 142, type: 'image' },
  { id: 2, title: 'Bocetos urbanos', qualityScore: 4.5, likes: 98,  type: 'image' },
  { id: 3, title: 'Paleta 2024',    qualityScore: 4.2, likes: 67,  type: 'image' },
  { id: 4, title: 'Personajes',     qualityScore: 4.6, likes: 201, type: 'image' },
  { id: 5, title: 'Abstracto I',    qualityScore: 4.1, likes: 55,  type: 'image' },
  { id: 6, title: 'Naturaleza',     qualityScore: 4.3, likes: 88,  type: 'image' },
]

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'reaction',     initials: 'LM', color: '#1D9E75', text: '@lunamuse reacciono tu obra',        time: 'hace 5min', unread: true },
  { id: 2, type: 'algorithm',    initials: 'ZT', color: '#7C3AED', text: 'Obra aprobada por Algoritmo Etico 4.8', time: 'hace 1h',   unread: true },
  { id: 3, type: 'collab',       initials: 'PK', color: '#BA7517', text: '@pixelkid te invito a colaborar',    time: 'hace 3h',   unread: true },
  { id: 4, type: 'coins',        initials: 'ZC', color: '#1D9E75', text: 'Recibiste +5 Zentry Coins',         time: 'hace 5h',   unread: true },
  { id: 5, type: 'follower',     initials: 'SK', color: '#B74545', text: '@sketchr empezo a seguirte',        time: 'hace 8h',   unread: false },
  { id: 6, type: 'comment',      initials: 'NB', color: '#534AB7', text: '@novabeats comento tu obra',        time: 'hace 1d',   unread: false },
]

const TABS = ['Obras', 'Colaboraciones', 'Colecciones', 'Sobre mi']

export default function ProfilePage() {
  const [activeTab, setActiveTab]   = useState('Obras')
  const [isFollowing, setIsFollowing] = useState(false)
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

  const unreadCount = notifications.filter(n => n.unread).length

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">

      {/* Banner */}
      <div className="relative">
        <div className="h-44 rounded-2xl bg-gradient-to-br from-indigo-800 via-violet-700 to-violet-500" />

        {/* Avatar */}
        <div className="absolute -bottom-10 left-6 w-20 h-20 rounded-full bg-violet-600 border-4 border-zinc-950 flex items-center justify-center text-2xl font-bold text-white">
          DA
        </div>

        {/* Acciones */}
        <div className="absolute top-3 right-3 flex gap-2">
          {MOCK_PROFILE.isOwner ? (
            <button className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-xl transition-colors hover:bg-black/60">
              <Edit className="w-3.5 h-3.5" />
              Editar perfil
            </button>
          ) : (
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`text-xs font-medium px-4 py-1.5 rounded-xl transition-colors ${
                isFollowing
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-violet-600 hover:bg-violet-500 text-white'
              }`}
            >
              {isFollowing ? 'Siguiendo' : 'Seguir'}
            </button>
          )}
          <button className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium px-3 py-1.5 rounded-xl transition-colors">
            <Share2 className="w-3.5 h-3.5" />
            Compartir
          </button>
        </div>
      </div>

      {/* Info del perfil */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-6 pt-14 pb-5">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-white">
                {MOCK_PROFILE.displayName}
              </h1>
              {MOCK_PROFILE.isVerified && (
                <span className="text-xs bg-violet-500/20 text-violet-400 border border-violet-500/30 px-2 py-0.5 rounded-full">
                  Verificado
                </span>
              )}
            </div>
            <p className="text-violet-400 text-sm font-medium mb-3">
              @{MOCK_PROFILE.username}
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs bg-zinc-800 text-zinc-400 px-3 py-1 rounded-lg">
                {MOCK_PROFILE.discipline}
              </span>
              <span className="text-xs bg-zinc-800 text-zinc-400 px-3 py-1 rounded-lg">
                {MOCK_PROFILE.experienceLevel}
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-lg mb-3">
              {MOCK_PROFILE.bio}
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {MOCK_PROFILE.location}
              </span>
              <span className="flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5" />
                {MOCK_PROFILE.portfolioUrl}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-center items-start">
            <div>
              <p className="text-xl font-bold text-white">{MOCK_PROFILE.stats.posts}</p>
              <p className="text-xs text-zinc-500">obras</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">{MOCK_PROFILE.stats.followers}</p>
              <p className="text-xs text-zinc-500">seguidores</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">{MOCK_PROFILE.stats.following}</p>
              <p className="text-xs text-zinc-500">siguiendo</p>
            </div>
            <div className="border-l border-zinc-800 pl-6">
              <p className="text-xl font-bold text-violet-400">{MOCK_PROFILE.stats.coins}</p>
              <p className="text-xs text-zinc-500">ZC</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">

        {/* Tabs y portafolio */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="flex border-b border-zinc-800">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-medium transition-all ${
                  activeTab === tab
                    ? 'text-violet-400 border-b-2 border-violet-500'
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab: Obras */}
          {activeTab === 'Obras' && (
            <div className="grid grid-cols-3 gap-1 p-1">
              {MOCK_POSTS.map(post => (
                <div
                  key={post.id}
                  className="relative aspect-square bg-zinc-800 rounded-xl overflow-hidden group cursor-pointer"
                >
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                    {post.title}
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                    <div className="flex items-center gap-1 bg-violet-600 self-start px-2 py-0.5 rounded-lg">
                      <Star className="w-3 h-3 text-white" />
                      <span className="text-xs text-white font-medium">{post.qualityScore}</span>
                    </div>
                    <div className="text-white text-xs font-medium truncate">{post.title}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Colaboraciones */}
          {activeTab === 'Colaboraciones' && (
            <div className="p-8 text-center">
              <p className="text-zinc-500 text-sm">Aun no hay colaboraciones</p>
            </div>
          )}

          {/* Tab: Colecciones */}
          {activeTab === 'Colecciones' && (
            <div className="p-8 text-center">
              <p className="text-zinc-500 text-sm">Aun no hay colecciones</p>
            </div>
          )}

          {/* Tab: Sobre mi */}
          {activeTab === 'Sobre mi' && (
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Disciplina</p>
                <p className="text-sm text-white">{MOCK_PROFILE.discipline}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Nivel</p>
                <p className="text-sm text-white">{MOCK_PROFILE.experienceLevel}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Redes sociales</p>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-violet-400">Instagram: {MOCK_PROFILE.socialLinks.instagram}</p>
                  <p className="text-sm text-violet-400">Behance: {MOCK_PROFILE.socialLinks.behance}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Columna lateral */}
        <div className="flex flex-col gap-4">

          {/* Zentry Coins */}
          <div className="bg-gradient-to-br from-indigo-800 to-violet-700 rounded-2xl p-4">
            <p className="text-xs text-violet-300 uppercase tracking-wider mb-1">
              Zentry Coins
            </p>
            <p className="text-3xl font-bold text-white mb-1">
              {MOCK_PROFILE.stats.coins} ZC
            </p>
            <p className="text-xs text-violet-300 mb-4">
              +5 ZC ganados esta semana
            </p>
            <div className="bg-black/20 rounded-xl p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-violet-300">Por publicar</span>
                <span className="text-xs text-white font-medium">+50 ZC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-violet-300">Por colaborar</span>
                <span className="text-xs text-white font-medium">+25 ZC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-violet-300">Por votos</span>
                <span className="text-xs text-white font-medium">+10 ZC</span>
              </div>
            </div>
          </div>

          {/* Notificaciones */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Notificaciones
              </p>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <span className="bg-violet-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-zinc-500 hover:text-violet-400 transition-colors"
                  >
                    Marcar leidas
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`flex gap-2.5 items-start p-2.5 rounded-xl transition-colors ${
                    n.unread ? 'bg-zinc-800' : ''
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{ background: n.color + '30', color: n.color }}
                  >
                    {n.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-relaxed ${n.unread ? 'text-white' : 'text-zinc-400'}`}>
                      {n.text}
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5">{n.time}</p>
                  </div>
                  {n.unread && (
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}