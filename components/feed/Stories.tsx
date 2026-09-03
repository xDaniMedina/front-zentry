"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { getInitials, getImageUrl, cn } from "@/lib/utils"
import { UserStoryGroup } from "@/types/stories"

interface StoriesProps {
  stories: UserStoryGroup[];
  currentUserId?: string;
  onStoryClick: (storyGroup: UserStoryGroup, initialItemIndex?: number) => void;
  onAddStory: () => void;
}

export function Stories({ 
  stories, 
  onStoryClick,
  onAddStory
}: StoriesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/stories w-full mb-6 select-none">
      {/* Botón de Scroll Izquierdo (Desktop) */}
      <button 
        onClick={() => scroll('left')}
        aria-label="Historias anteriores"
        className="hidden md:flex absolute -left-3 top-7 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-zentry-card/90 border border-zentry-border shadow-lg shadow-black/20 items-center justify-center text-zentry-text-2 hover:text-zentry-text-1 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/stories:opacity-100 backdrop-blur-md"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Contenedor con Scroll Horizontal */}
      <div 
        ref={scrollRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto custom-scrollbar touch-pan-x py-1 px-1 w-full scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {stories.map((story) => {
          const hasStories = story.items && story.items.length > 0;
          const isUser = story.isUser;

          return (
            <div 
              key={story.id} 
              className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group select-none relative"
            >
              {/* Anillo de Gradiente estilo Instagram / Zentry */}
              <div 
                onClick={() => {
                  if (isUser && !hasStories) {
                    onAddStory();
                  } else {
                    onStoryClick(story, 0);
                  }
                }}
                className={cn(
                  "w-[66px] h-[66px] sm:w-[72px] sm:h-[72px] rounded-full p-[2.5px] sm:p-[3px] transition-transform duration-200 group-hover:scale-105 active:scale-95 relative",
                  isUser
                    ? hasStories
                      ? "bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-500 shadow-md shadow-indigo-500/20"
                      : "border-2 border-dashed border-zentry-border hover:border-zentry-accent"
                    : story.hasUnseen
                      ? "bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-md shadow-rose-500/20 animate-pulse-slow"
                      : "bg-zentry-border/70"
                )}
              >
                {/* Avatar Interior */}
                <div className="w-full h-full bg-zentry-bg rounded-full p-[2px]">
                  <div className="w-full h-full bg-zentry-card rounded-full flex items-center justify-center text-xs sm:text-sm font-black text-zentry-text-1 relative overflow-hidden">
                    {story.avatar_url ? (
                      <img 
                        src={getImageUrl(story.avatar_url)} 
                        alt={story.name || story.username} 
                        className="w-full h-full object-cover rounded-full" 
                        loading="lazy"
                      />
                    ) : (
                      <span>{story.avatar || getInitials(story.name || story.username)}</span>
                    )}
                  </div>
                </div>

                {/* Botón '+' en la Historia del Usuario */}
                {isUser && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddStory();
                    }}
                    title="Añadir a tu historia"
                    className="absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-zentry-accent hover:bg-zentry-accent/90 text-white flex items-center justify-center border-2 border-zentry-bg shadow-md hover:scale-110 active:scale-90 transition-transform z-10"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                )}
              </div>

              {/* Nombre / Handle */}
              <span className={cn(
                "text-[11px] font-medium tracking-tight truncate w-16 sm:w-18 text-center transition-colors",
                isUser 
                  ? "text-zentry-text-1 font-semibold" 
                  : story.hasUnseen 
                    ? "text-zentry-text-1 font-semibold" 
                    : "text-zentry-text-2 group-hover:text-zentry-text-1"
              )}>
                {isUser ? "Tu historia" : (story.name?.split(' ')[0] || story.username)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Botón de Scroll Derecho (Desktop) */}
      <button 
        onClick={() => scroll('right')}
        aria-label="Historias siguientes"
        className="hidden md:flex absolute -right-3 top-7 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-zentry-card/90 border border-zentry-border shadow-lg shadow-black/20 items-center justify-center text-zentry-text-2 hover:text-zentry-text-1 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/stories:opacity-100 backdrop-blur-md"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
