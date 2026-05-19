import LeftSidebar from '@/components/feed/LeftSidebar'
import RightSidebar from '@/components/feed/RightSidebar'
import FeedStories from '@/components/feed/Stories'
import FeedTabs from '@/components/feed/FeedTabs'
import FeedSearch from '@/components/feed/FeedSearch'
import FeedCard from '@/components/feed/FeedCard' // <-- ¡Importación crucial agregada!
import type { Story } from '@/components/feed/Stories'

const STORIES: Story[] = [
  { username: 'lunamuse',  initials: 'LM', color: '#1D9E75', hasNew: true,  content: 'Trabajando en mi nueva serie Raices',          time: 'hace 1h' },
  { username: 'pixelkid',  initials: 'PK', color: '#BA7517', hasNew: true,  content: 'Proceso creativo del dia — bocetos y draft',    time: 'hace 2h' },
  { username: 'novabeats', initials: 'NB', color: '#534AB7', hasNew: true,  content: 'Montando el ultimo track del EP desde casa',    time: 'hace 3h' },
  { username: 'sketchr',   initials: 'SK', color: '#B74545', hasNew: false, content: 'Inspiracion urbana para la proxima ilustracion', time: 'hace 5h' },
  { username: 'colorwav',  initials: 'CR', color: '#458AB7', hasNew: false, content: 'Paleta y moodboard para proyecto musical',      time: 'hace 6h' },
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

export default function FeedPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_240px] gap-5 max-w-7xl mx-auto px-4">

      {/* Columna Izquierda: Perfil y Stats */}
      <div className="hidden lg:block sticky top-20 h-fit">
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
      <div className="flex flex-col gap-6 pb-10">
        <FeedSearch />
        
        <FeedStories
          stories={STORIES}
          currentUser={{ username: 'danielarte', initials: 'DA', color: '#A855F7' }}
        />
        
        <FeedTabs />

        {/* --- AQUI RENDERIZAMOS LOS POSTS --- */}
        <div className="flex flex-col gap-4">
          {MOCK_POSTS.map(post => (
            <FeedCard 
              key={post.id} 
              author={post.author} 
              content={post.content} 
              isFollowing={post.isFollowing} 
            />
          ))}
        </div>
      </div>

      {/* Columna Derecha: Sugerencias/Tendencias */}
      <div className="hidden lg:block sticky top-20 h-fit">
        <RightSidebar />
      </div>

    </div>
  )
}