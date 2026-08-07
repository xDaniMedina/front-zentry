import { LayoutGrid, List } from "lucide-react"

export function FeedLayoutControls({ layout, setLayout }: { layout: 'grid' | 'list', setLayout: (l: 'grid'|'list') => void }) {
  return (
    <div className="flex items-center justify-between mb-4 px-4 sm:px-0">
      <h2 className="text-sm font-bold text-zentry-text-1">Publicaciones Recientes</h2>
      <div className="flex bg-zentry-card border border-zentry-border rounded-lg p-1">
        <button 
          onClick={() => setLayout('grid')}
          className={`p-1.5 rounded-md transition-colors ${layout === 'grid' ? 'bg-zentry-bg text-zentry-text-1 shadow-sm' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setLayout('list')}
          className={`p-1.5 rounded-md transition-colors ${layout === 'list' ? 'bg-zentry-bg text-zentry-text-1 shadow-sm' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
        >
          <List className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

