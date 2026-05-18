import LeftSidebar from '@/components/feed/LeftSidebar'
import RightSidebar from '@/components/feed/RightSidebar'
import FeedStories from '@/components/feed/Stories'
import FeedTabs from '@/components/feed/FeedTabs'
import FeedSearch from '@/components/feed/FeedSearch'
import type { Story } from '@/components/feed/Stories'

const STORIES: Story[] = [
  { username: 'lunamuse',  initials: 'LM', color: '#1D9E75', hasNew: true,  content: 'Trabajando en mi nueva serie Raices',           time: 'hace 1h' },
  { username: 'pixelkid',  initials: 'PK', color: '#BA7517', hasNew: true,  content: 'Proceso creativo del dia — bocetos y draft',    time: 'hace 2h' },
  { username: 'novabeats', initials: 'NB', color: '#534AB7', hasNew: true,  content: 'Montando el ultimo track del EP desde casa',    time: 'hace 3h' },
  { username: 'sketchr',   initials: 'SK', color: '#B74545', hasNew: false, content: 'Inspiracion urbana para la proxima ilustracion', time: 'hace 5h' },
  { username: 'colorwav',  initials: 'CR', color: '#458AB7', hasNew: false, content: 'Paleta y moodboard para proyecto musical',      time: 'hace 6h' },
]

export default function FeedPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_240px] gap-5">

      <div className="hidden lg:block">
        <LeftSidebar
          username="danielarte"
          discipline="Ilustracion"
          posts={12}
          followers={340}
          coins={85}
          coinsToday={5}
        />
      </div>

      <div className="flex flex-col gap-4">
        <FeedSearch />
        <FeedStories
          stories={STORIES}
          currentUser={{ username: 'danielarte', initials: 'DA', color: '#A855F7' }}
        />
        <FeedTabs />
      </div>

      <div className="hidden lg:block">
        <RightSidebar />
      </div>

    </div>
  )
}