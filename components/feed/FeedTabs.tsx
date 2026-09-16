'use client'

import { Sparkles, Image as ImageIcon, Video, Music, FileText, Users, Radio } from "lucide-react"

export const FEED_TABS = [
  { id: 'Para ti', label: 'Para ti', icon: Sparkles },
  { id: 'en_vivo', label: 'En Vivo', icon: Radio, isComingSoon: true },
  { id: 'image', label: 'Imágenes', icon: ImageIcon },
  { id: 'video', label: 'Videos', icon: Video },
  { id: 'audio', label: 'Música & Audio', icon: Music },
  { id: 'text', label: 'Artículos', icon: FileText },
  { id: 'Siguiendo', label: 'Siguiendo', icon: Users },
];

export function FeedTabs({ activeTab, setTab }: { activeTab: string, setTab: (t: string) => void }) {
  return (
    <div className="flex gap-2 sm:gap-3 border-b border-zentry-border overflow-x-auto custom-scrollbar pb-1">
      {FEED_TABS.map(tab => {
        const IconComp = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button 
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={`pb-2 px-2.5 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-1.5 shrink-0 cursor-pointer ${
              isActive 
                ? 'text-zentry-text-1 font-black' 
                : 'text-zentry-text-2 hover:text-zentry-text-1'
            }`}
          >
            {tab.id === 'en_vivo' ? (
              <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            ) : null}
            <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-zentry-accent' : tab.id === 'en_vivo' ? 'text-red-400' : ''}`} />
            <span>{tab.label}</span>
            {tab.isComingSoon && (
              <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                Próximamente
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zentry-accent rounded-t-full shadow-sm shadow-zentry-accent" />
            )}
          </button>
        );
      })}
    </div>
  )
}
