'use client' // <-- ¡Crucial! Para manejar estado en tiempo real.

import { useState, useEffect } from 'react'
import LeftSidebar from '@/components/feed/LeftSidebar'
import RightSidebar from '@/components/feed/RightSidebar'
import FeedStories from '@/components/feed/Stories'
import FeedTabs from '@/components/feed/FeedTabs'
import FeedSearch from '@/components/feed/FeedSearch'
import FeedCard from '@/components/feed/FeedCard'
import FeedLayoutControls, { type LayoutMode, type ThemeMode } from '@/components/feed/FeedLayoutControls' // <-- ¡Nuevas importaciones!
import type { Story } from '@/components/feed/Stories'

//---
import { fetchAPI } from '@/lib/api' // <-- Para futuras llamadas a la API
import type { Post } from '@/types'

// ... (Tus MOCK_DATA de STORIES y POSTS intactos aquí) ...

const STORIES: Story[] = [
  { username: 'lunamuse',  initials: 'LM', color: '#1D9E75', hasNew: true,  content: 'Trabajando en mi nueva serie Raices',          time: 'hace 1h' },
  { username: 'pixelkid',  initials: 'PK', color: '#BA7517', hasNew: true,  content: 'Proceso creativo del dia — bocetos y draft',    time: 'hace 2h' },
  { username: 'novabeats', initials: 'NB', color: '#534AB7', hasNew: true,  content: 'Montando el ultimo track del EP desde casa',    time: 'hace 3h' },
  { username: 'sketchr',   initials: 'SK', color: '#B74545', hasNew: false, content: 'Inspiracion urbana para la proxima ilustracion', time: 'hace 5h' },
  { username: 'colorwav',  initials: 'CR', color: '#458AB7', hasNew: false, content: 'Paleta y moodboard para proyecto musical',      time: 'hace 6h' },
]

// Mock de publicaciones para darle vida al feed central
const MOCK_POSTS = [
  {
    id: 1,
    author: { 
      username: '@ryulogic', 
      initials: 'RL', 
      color: '#10B981', 
      discipline: 'Frontend Dev', 
      time: 'hace 2h' 
    },
    content: { 
      text: 'Optimizando el rendimiento de la nueva app de rutas de transporte público. ¡Casi lista para producción! 🚌🚀', 
      tags: ['#AppDev', '#Frontend', '#Nextjs'], 
      qualityScore: 98, 
      likes: 142, 
      comments: 12 
    },
    isFollowing: true
  },
  {
    id: 2,
    author: { 
      username: '@luis_craft', 
      initials: 'LC', 
      color: '#F59E0B', 
      discipline: 'Server Admin', 
      time: 'hace 4h' 
    },
    content: { 
      text: 'Ayer terminamos de configurar los NPCs guardianes en la isla de cerezos de ChettoLandia. El spawn point quedó increíble. 🌸🛡️', 
      tags: ['#VoxelArt', '#WorldBuilding', '#ServerSetup'], 
      qualityScore: 85, 
      likes: 89, 
      comments: 24 
    },
    isFollowing: true
  },
  {
    id: 3,
    author: { 
      username: '@striker_fc', 
      initials: 'SF', 
      color: '#3B82F6', 
      discipline: 'Data Analyst', 
      time: 'hace 6h' 
    },
    content: { 
      text: 'Terminé de armar el Excel para trackear las stats de los jugadores. Empezamos en la tercera división inglesa, con el objetivo de llegar a la cima. ⚽📊', 
      tags: ['#DataTracking', '#Spreadsheets', '#Project'], 
      qualityScore: 92, 
      likes: 210, 
      comments: 32 
    },
    isFollowing: false
  }
]

//---

export default function FeedPage() {
  // Estado para la vista del feed y el tema (el "Bento" es tu innovación)
  const [feedLayout, setFeedLayout] = useState<LayoutMode>('bento') // Empezamos en Bento para que se vea la diferencia
  const [theme, setTheme] = useState<ThemeMode>('special') // Empezamos en Especial

  // Lógica para aplicar el tema al documento global (para que cambien los fondos y bordes globales)
  useEffect(() => {
    // Es buena práctica usar una biblioteca como next-themes para esto en producción,
    // pero para empezar, manipularemos el DOM.
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'theme-special');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'special') {
      root.classList.add('theme-special', 'dark'); // Zentry Especial es una variación oscura
    } else {
        root.classList.add('light'); // Light por defecto
    }
  }, [theme]);

  // Lógica para obtener las clases de Tailwind del contenedor del feed según la vista elegida
  const getFeedContentClasses = () => {
    switch (feedLayout) {
      case 'bento':
        return 'grid grid-cols-1 md:grid-cols-2 gap-5' // Masonry Grid (simulado con grid estándar para simplificar)
      case 'compact':
        return 'flex flex-col gap-3 max-w-3xl mx-auto' // Vista reducida, centrada y con menos espacio.
      case 'classic':
      default:
        return 'flex flex-col gap-6 max-w-3xl mx-auto' // La vista clásica que tenías, pero con max-w centrada.
    }
  }

  // Lógica para pasar props condicionales al componente FeedCard
  const getCardVariant = () => {
    if (feedLayout === 'compact') return 'compact';
    if (feedLayout === 'bento') return 'grid';
    return 'default';
  }

  return (
    // 1. El Grid ahora es fluido: 1 columna en móvil, 2 en tablet (80px para iconos), 3 en desktop.
    <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] lg:grid-cols-[230px_1fr_260px] gap-4 lg:gap-6 max-w-[1500px] mx-auto px-0 md:px-4 lg:px-6 pt-4 lg:pt-20 transition-colors duration-300 pb-20 md:pb-0">

      {/* Columna Izquierda: Maneja su propia lógica de ocultarse/mostrarse */}
      <div className="md:sticky top-[96px] md:h-[calc(100vh-120px)] md:overflow-y-auto hide-scrollbar z-50">
        <LeftSidebar
          username="danielarte"
          discipline="Ilustracion"
          posts={12}
          followers={340}
          coins={85}
          coinsToday={5}
        />
      </div>

      {/* Columna Central: Feed Principal */}
      <div className="flex flex-col gap-0 px-4 md:px-0 pb-10">
        <FeedLayoutControls 
          onLayoutChange={setFeedLayout} 
          onThemeChange={setTheme} 
          initialLayout={feedLayout}
          initialTheme={theme}
        />
        <div className="mb-6"><FeedSearch /></div>
        <div className="mb-6"><FeedStories stories={STORIES} currentUser={{ username: 'danielarte', initials: 'DA', color: '#A855F7' }} /></div>
        <div className="mb-6"><FeedTabs layoutMode={feedLayout} /></div>

        {/* Contenedor dinámico de posts */}
        <div className={getFeedContentClasses()}>
          {MOCK_POSTS.map(post => (
            <div key={post.id} className={feedLayout === 'bento' ? 'break-inside-avoid' : ''}>
              <FeedCard author={post.author} content={post.content} isFollowing={post.isFollowing} layout={feedLayout} />
            </div>
          ))}
        </div>
      </div>

      {/* Columna Derecha: Fluye hacia abajo en móvil, sube a la derecha en Desktop */}
      <div className="md:col-start-2 lg:col-start-auto lg:sticky top-[96px] h-max">
        <RightSidebar />
      </div>

    </div>
  )
}