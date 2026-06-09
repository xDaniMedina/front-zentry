'use client'

import { useState } from 'react'
import { Edit, Share2, MapPin, Link as LinkIcon, Star, FileText } from 'lucide-react'
import { motion, AnimatePresence, Variants } from 'framer-motion'

const MOCK_PROFILE = {
  username: 'danielarte',
  displayName: 'Daniel Artesano',
  artisticName: 'DanielArte',
  bio: 'Artista visual enfocado en ilustración digital y narrativa visual. Creo mundos donde el color cuenta historias.',
  discipline: 'Ilustración',
  experienceLevel: 'Avanzado',
  location: 'Teziutlán, Puebla',
  portfolioUrl: 'danielarte.com',
  isVerified: true,
  isOwner: true,
  stats: { posts: 12, followers: 340, following: 89, coins: 85 },
  socialLinks: { instagram: '@danielarte', behance: 'danielarte' },
}

const MOCK_POSTS = [
  { id: 1, title: 'Serie Raíces', qualityScore: 4.8, likes: 142, type: 'image' },
  { id: 2, title: 'Bocetos urbanos', qualityScore: 4.5, likes: 98,  type: 'image' },
  { id: 3, title: 'Paleta 2024',    qualityScore: 4.2, likes: 67,  type: 'image' },
  { id: 4, title: 'Personajes',     qualityScore: 4.6, likes: 201, type: 'image' },
  { id: 5, title: 'Abstracto I',    qualityScore: 4.1, likes: 55,  type: 'image' },
  { id: 6, title: 'Naturaleza',     qualityScore: 4.3, likes: 88,  type: 'image' },
]

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'reaction',     initials: 'LM', color: '#1D9E75', text: '@lunamuse reaccionó a tu obra',      time: 'hace 5min', unread: true },
  { id: 2, type: 'algorithm',    initials: 'ZT', color: '#7C3AED', text: 'Obra aprobada por Algoritmo Ético', time: 'hace 1h',   unread: true },
  { id: 3, type: 'collab',       initials: 'PK', color: '#BA7517', text: '@pixelkid te invitó a colaborar',   time: 'hace 3h',   unread: true },
  { id: 4, type: 'coins',        initials: 'ZC', color: '#1D9E75', text: 'Recibiste +5 Zentry Coins',         time: 'hace 5h',   unread: true },
  { id: 5, type: 'follower',     initials: 'SK', color: '#B74545', text: '@sketchr empezó a seguirte',        time: 'hace 8h',   unread: false },
  { id: 6, type: 'comment',      initials: 'NB', color: '#534AB7', text: '@novabeats comentó tu obra',        time: 'hace 1d',   unread: false },
]

const TABS = ['Obras', 'Colaboraciones', 'Colecciones', 'Sobre mí']

// Variantes tipadas para evitar errores de TypeScript
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export default function ProfilePage() {
  const [activeTab, setActiveTab]   = useState('Obras')
  const [isFollowing, setIsFollowing] = useState(false)
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

  const unreadCount = notifications.filter(n => n.unread).length

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })))
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      // En móvil quitamos el padding para que toque los bordes, en desktop lo centramos con max-w-6xl
      className="max-w-6xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-8 space-y-4 sm:space-y-6 transition-colors duration-300 overflow-hidden pb-20 sm:pb-8"
    >
      
      {/* ========================================== */}
      {/* 1. BANNER E INFO DEL PERFIL                */}
      {/* ========================================== */}
      <motion.div variants={fadeInUp} className="bg-zentry-card border-y sm:border border-zentry-border rounded-none sm:rounded-3xl overflow-hidden transition-colors duration-300">
        
        {/* Banner Fotográfico */}
        <div className="relative">
          <div className="h-32 sm:h-52 bg-gradient-to-br from-zentry-accent/80 via-blue-600/80 to-purple-500/80 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
          </div>

          {/* Avatar */}
          <div className="absolute -bottom-10 sm:-bottom-14 left-4 sm:left-8 w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-zentry-accent border-4 border-zentry-card flex items-center justify-center text-2xl sm:text-4xl font-bold text-white shadow-xl transition-all">
            DA
          </div>

          {/* Acciones Rápidas Flotantes */}
          <div className="absolute top-3 right-3 flex gap-2">
            {MOCK_PROFILE.isOwner ? (
              <button className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors hover:bg-black/60 shadow-lg">
                <Edit className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Editar perfil</span>
              </button>
            ) : (
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`text-xs font-medium px-4 py-1.5 rounded-full transition-colors shadow-lg ${
                  isFollowing
                    ? 'bg-zentry-bg text-zentry-text-2 hover:text-zentry-text-1 border border-zentry-border'
                    : 'bg-zentry-accent hover:opacity-90 text-white'
                }`}
              >
                {isFollowing ? 'Siguiendo' : 'Seguir'}
              </button>
            )}
            <button className="flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs font-medium rounded-full transition-colors hover:bg-black/60 shadow-lg">
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline ml-1.5">Compartir</span>
            </button>
          </div>
        </div>

        {/* Información Detallada */}
        <div className="px-4 sm:px-8 pt-14 sm:pt-20 pb-6">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-zentry-text-1">
                  {MOCK_PROFILE.displayName}
                </h1>
                {MOCK_PROFILE.isVerified && (
                  <span className="text-[10px] bg-zentry-accent/10 text-zentry-accent border border-zentry-accent/30 px-2 py-0.5 rounded-full font-medium">
                    Verificado
                  </span>
                )}
              </div>
              <p className="text-zentry-text-2 font-medium mb-3 text-sm">
                @{MOCK_PROFILE.username}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs bg-zentry-bg border border-zentry-border text-zentry-text-2 px-3 py-1 rounded-full">
                  {MOCK_PROFILE.discipline}
                </span>
                <span className="text-xs bg-zentry-bg border border-zentry-border text-zentry-text-2 px-3 py-1 rounded-full">
                  {MOCK_PROFILE.experienceLevel}
                </span>
              </div>
              
              <p className="text-sm text-zentry-text-1/90 leading-relaxed max-w-xl mb-4">
                {MOCK_PROFILE.bio}
              </p>
              
              <div className="flex flex-wrap gap-4 text-xs text-zentry-text-2">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {MOCK_PROFILE.location}
                </span>
                <span className="flex items-center gap-1.5 hover:text-zentry-accent cursor-pointer transition-colors">
                  <LinkIcon className="w-3.5 h-3.5" />
                  {MOCK_PROFILE.portfolioUrl}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 sm:gap-6 text-center items-start pt-4 md:pt-0 border-t md:border-t-0 border-zentry-border w-full md:w-auto">
              <div className="flex-1 md:flex-none">
                <p className="text-lg sm:text-xl font-bold text-zentry-text-1">{MOCK_PROFILE.stats.posts}</p>
                <p className="text-[10px] sm:text-xs text-zentry-text-2">obras</p>
              </div>
              <div className="flex-1 md:flex-none">
                <p className="text-lg sm:text-xl font-bold text-zentry-text-1">{MOCK_PROFILE.stats.followers}</p>
                <p className="text-[10px] sm:text-xs text-zentry-text-2">segs</p>
              </div>
              <div className="flex-1 md:flex-none">
                <p className="text-lg sm:text-xl font-bold text-zentry-text-1">{MOCK_PROFILE.stats.following}</p>
                <p className="text-[10px] sm:text-xs text-zentry-text-2">siguiendo</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ========================================== */}
      {/* 2. GRID PRINCIPAL (Contenido + Sidebar)      */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 sm:gap-6">

        {/* Columna Izquierda: Tabs y Portafolio */}
        <motion.div variants={fadeInUp} className="bg-zentry-card border-y sm:border border-zentry-border rounded-none sm:rounded-3xl overflow-hidden transition-colors duration-300">
          
          {/* Navegación de Tabs */}
          <div className="flex overflow-x-auto hide-scrollbar border-b border-zentry-border relative">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[120px] py-4 text-xs sm:text-sm font-medium transition-all relative ${
                  activeTab === tab
                    ? 'text-zentry-accent'
                    : 'text-zentry-text-2 hover:text-zentry-text-1'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTabProfile"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-zentry-accent"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Contenido Dinámico de las Tabs */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              
              {activeTab === 'Obras' && (
                <motion.div 
                  key="obras"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-1 p-1"
                >
                  {MOCK_POSTS.map(post => (
                    <div
                      key={post.id}
                      className="relative aspect-square bg-zentry-bg overflow-hidden group cursor-pointer border border-zentry-border/50 rounded-lg sm:rounded-xl"
                    >
                      <div className="w-full h-full flex items-center justify-center text-zentry-text-2 text-xs">
                        {post.title}
                      </div>
                      <div className="absolute inset-0 bg-zentry-card/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 backdrop-blur-sm">
                        <div className="flex items-center gap-1 bg-zentry-accent self-start px-2 py-1 rounded-lg shadow-md">
                          <Star className="w-3 h-3 text-white" />
                          <span className="text-xs text-white font-bold">{post.qualityScore}</span>
                        </div>
                        <div className="text-zentry-text-1 text-sm font-bold truncate">{post.title}</div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'Colaboraciones' && (
                <motion.div key="collabs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-12 text-center flex flex-col items-center justify-center h-full gap-3">
                  <div className="w-12 h-12 bg-zentry-bg rounded-full flex items-center justify-center border border-zentry-border"><FileText className="w-5 h-5 text-zentry-text-2" /></div>
                  <p className="text-zentry-text-2 text-sm">Aún no hay colaboraciones publicadas.</p>
                </motion.div>
              )}

              {activeTab === 'Colecciones' && (
                <motion.div key="collections" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-12 text-center flex flex-col items-center justify-center h-full gap-3">
                  <div className="w-12 h-12 bg-zentry-bg rounded-full flex items-center justify-center border border-zentry-border"><FileText className="w-5 h-5 text-zentry-text-2" /></div>
                  <p className="text-zentry-text-2 text-sm">Aún no hay colecciones creadas.</p>
                </motion.div>
              )}

              {activeTab === 'Sobre mí' && (
                <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 sm:p-8 space-y-6">
                  <div>
                    <p className="text-xs text-zentry-text-2 uppercase tracking-wider mb-2 font-semibold">Disciplina Principal</p>
                    <p className="text-sm text-zentry-text-1 bg-zentry-bg px-4 py-3 rounded-xl border border-zentry-border">{MOCK_PROFILE.discipline}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zentry-text-2 uppercase tracking-wider mb-2 font-semibold">Nivel de Experiencia</p>
                    <p className="text-sm text-zentry-text-1 bg-zentry-bg px-4 py-3 rounded-xl border border-zentry-border">{MOCK_PROFILE.experienceLevel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zentry-text-2 uppercase tracking-wider mb-2 font-semibold">Redes Sociales</p>
                    <div className="flex flex-col gap-2 bg-zentry-bg p-4 rounded-xl border border-zentry-border">
                      <a href="#" className="text-sm text-zentry-accent hover:underline w-fit flex items-center gap-2">
                        <span className="text-zentry-text-2">Instagram:</span> {MOCK_PROFILE.socialLinks.instagram}
                      </a>
                      <a href="#" className="text-sm text-zentry-accent hover:underline w-fit flex items-center gap-2">
                        <span className="text-zentry-text-2">Behance:</span> {MOCK_PROFILE.socialLinks.behance}
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Columna Derecha: Widgets */}
        <div className="flex flex-col gap-4 sm:gap-6">

          {/* Zentry Coins Widget */}
          <motion.div variants={fadeInUp} className="bg-zentry-accent rounded-none sm:rounded-3xl p-5 sm:p-6 shadow-lg shadow-zentry-accent/10 transition-colors duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            
            <p className="text-xs text-white/80 uppercase tracking-wider mb-2 font-semibold relative z-10">
              Zentry Coins
            </p>
            <p className="text-4xl font-bold text-white mb-1 relative z-10">
              {MOCK_PROFILE.stats.coins} <span className="text-xl opacity-80">ZC</span>
            </p>
            <p className="text-xs text-white/90 mb-5 relative z-10 font-medium">
              +5 ZC ganados esta semana
            </p>
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 space-y-3 relative z-10 border border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/80">Por publicar</span>
                <span className="text-xs text-white font-bold bg-white/10 px-2 py-0.5 rounded-lg">+50 ZC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/80">Por colaborar</span>
                <span className="text-xs text-white font-bold bg-white/10 px-2 py-0.5 rounded-lg">+25 ZC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/80">Por votos</span>
                <span className="text-xs text-white font-bold bg-white/10 px-2 py-0.5 rounded-lg">+10 ZC</span>
              </div>
            </div>
          </motion.div>

          {/* Notificaciones Widget */}
          <motion.div variants={fadeInUp} className="bg-zentry-card border-y sm:border border-zentry-border rounded-none sm:rounded-3xl p-5 transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-zentry-text-2 uppercase tracking-wider">
                Notificaciones
              </p>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <span className="bg-zentry-accent/10 text-zentry-accent border border-zentry-accent/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-zentry-text-2 hover:text-zentry-accent transition-colors"
                  >
                    Marcar leídas
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1 max-h-[320px] overflow-y-auto hide-scrollbar pr-1">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`flex gap-3 items-start p-3 rounded-2xl transition-colors ${
                    n.unread ? 'bg-zentry-bg border border-zentry-border/50' : 'hover:bg-zentry-bg/40'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: n.color + '25', color: n.color }}
                  >
                    {n.initials}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className={`text-xs leading-relaxed ${n.unread ? 'text-zentry-text-1 font-medium' : 'text-zentry-text-2'}`}>
                      {n.text}
                    </p>
                    <p className="text-[10px] text-zentry-text-2/70 mt-1 font-medium">{n.time}</p>
                  </div>
                  {n.unread && (
                    <div className="w-2 h-2 rounded-full bg-zentry-accent shrink-0 mt-2 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  )
}