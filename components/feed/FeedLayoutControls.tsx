import { LayoutGrid, List } from "lucide-react"

export function FeedLayoutControls({ layout, setLayout }: { layout: 'grid' | 'list', setLayout: (l: 'grid'|'list') => void }) {
  return (
    <div className="flex items-center justify-between sm:justify-end gap-3">
      <span className="text-xs font-bold text-zentry-text-2 sm:hidden">Vista</span>
      <div className="flex bg-zentry-card border border-zentry-border rounded-xl p-0.5">
        <button 
          onClick={() => setLayout('grid')}
          className={`p-1.5 rounded-lg transition-colors ${layout === 'grid' ? 'bg-zentry-bg text-zentry-accent shadow-sm' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
          title="Vista Cuadrícula"
        >
          <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button 
          onClick={() => setLayout('list')}
          className={`p-1.5 rounded-lg transition-colors ${layout === 'list' ? 'bg-zentry-bg text-zentry-accent shadow-sm' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
          title="Vista Lista"
        >
          <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  )
}

