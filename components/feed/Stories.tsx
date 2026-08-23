"use client"

import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { getInitials, getImageUrl } from "@/lib/utils"

export type Story = {
  id: string | number;
  handle: string;
  name?: string;
  isUser: boolean;
  avatar: string;
  avatar_url?: string;
  viewed: boolean;
}

export function Stories({ 
  stories, 
  onStoryClick,
  onAddStory
}: { 
  stories: Story[], 
  onStoryClick: (story: Story) => void,
  onAddStory?: () => void
}) {
  return (
    <div className="flex gap-3 sm:gap-4 overflow-x-auto custom-scrollbar touch-pan-x mb-4 sm:mb-6 pb-2 w-full select-none">
      {stories.map((story) => (
        <div 
          key={story.id} 
          onClick={() => {
            if (story.isUser && onAddStory) {
              onAddStory();
            } else {
              onStoryClick(story);
            }
          }}
          className="flex flex-col items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 group select-none active:scale-95 transition-transform"
        >
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 sm:p-1 transition-all ${
            story.isUser 
              ? 'bg-gradient-to-tr from-zentry-accent via-indigo-500 to-purple-500 shadow-md shadow-zentry-accent/20' 
              : story.viewed 
                ? 'bg-zentry-border' 
                : 'bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600'
          }`}>
            <div className="w-full h-full bg-zentry-card rounded-full border-2 border-zentry-bg flex items-center justify-center text-xs sm:text-sm font-black text-zentry-text-1 group-hover:scale-95 transition-transform relative overflow-hidden">
              {story.avatar_url ? (
                <img src={getImageUrl(story.avatar_url)} alt={story.handle} className="w-full h-full object-cover rounded-full" />
              ) : (
                story.avatar || getInitials(story.name || story.handle)
              )}

              {story.isUser && (
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-zentry-accent text-white flex items-center justify-center border-2 border-zentry-bg shadow-sm">
                  <Plus className="w-3 h-3 stroke-[3]" />
                </span>
              )}
            </div>
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-zentry-text-2 truncate w-14 sm:w-16 text-center group-hover:text-zentry-text-1">
            {story.name || story.handle}
          </span>
        </div>
      ))}
    </div>
  )
}
