import { Search } from "lucide-react"

export function FeedTabs({ activeTab, setTab }: { activeTab: string, setTab: (t: string) => void }) {
  return (
    <div className="flex gap-4 sm:gap-6 border-b border-zentry-border">
      {['Para ti', 'Siguiendo'].map(tab => (
        <button 
          key={tab}
          onClick={() => setTab(tab)}
          className={`pb-2.5 text-xs sm:text-sm font-bold transition-colors relative ${activeTab === tab ? 'text-zentry-text-1' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
        >
          {tab}
          {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zentry-accent rounded-t-full" />}
        </button>
      ))}
    </div>
  )
}