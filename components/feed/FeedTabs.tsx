import { Search } from "lucide-react"

export function FeedTabs({ activeTab, setTab }: { activeTab: string, setTab: (t: string) => void }) {
  return (
    <div className="flex gap-6 border-b border-zentry-border mb-6 px-4 sm:px-0">
      {['Para ti', 'Siguiendo'].map(tab => (
        <button 
          key={tab}
          onClick={() => setTab(tab)}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-zentry-text-1' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
        >
          {tab}
          {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zentry-text-1 rounded-t-full" />}
        </button>
      ))}
    </div>
  )
}