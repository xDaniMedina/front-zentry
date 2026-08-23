"use client"

import { Sparkles, Image as ImageIcon, Video, Music, FileText, Users } from "lucide-react"

export const FEED_TABS = [
  { id: 'Para ti', label: 'Para ti', icon: Sparkles },
  { id: 'image', label: 'Imágenes', icon: ImageIcon },
  { id: 'video', label: 'Videos', icon: Video },
  { id: 'audio', label: 'Música & Audio', icon: Music },
  { id: 'text', label: 'Artículos', icon: FileText },
  { id: 'Siguiendo', label: 'Siguiendo', icon: Users },
];

export function FeedTabs({ activeTab, setTab }: { activeTab: string, setTab: (t: string) => void }) {
  return (
    <div className="flex gap-2 sm:gap-4 border-b border-zentry-border overflow-x-auto custom-scrollbar pb-1">
      {FEED_TABS.map(tab => {
        const IconComp = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button 
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={`pb-2 px-1 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-1.5 shrink-0 cursor-pointer ${
              isActive 
                ? 'text-zentry-text-1 font-black' 
                : 'text-zentry-text-2 hover:text-zentry-text-1'
            }`}
          >
            <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-zentry-accent' : ''}`} />
            <span>{tab.label}</span>
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zentry-accent rounded-t-full shadow-sm shadow-zentry-accent" />
            )}
          </button>
        );
      })}
    </div>
  )
}