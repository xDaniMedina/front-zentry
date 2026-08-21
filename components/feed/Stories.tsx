import { motion } from "framer-motion"

export type Story = { id: number; handle: string; isUser: boolean; avatar: string; viewed: boolean }

export function Stories({ stories, onStoryClick }: { stories: Story[], onStoryClick: (story: Story) => void }) {
  return (
    <div className="flex gap-3 sm:gap-4 overflow-x-auto hide-scrollbar touch-pan-x mb-4 sm:mb-6 pb-2 w-full">
      {stories.map((story) => (
        <div 
          key={story.id} 
          onClick={() => onStoryClick(story)}
          className="flex flex-col items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 group select-none active:scale-95 transition-transform"
        >
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 sm:p-1 transition-all ${
            story.isUser 
              ? 'bg-gradient-to-tr from-zentry-accent to-blue-500 shadow-md shadow-zentry-accent/20' 
              : story.viewed 
                ? 'bg-zentry-border' 
                : 'bg-gradient-to-tr from-green-400 to-emerald-500'
          }`}>
            <div className="w-full h-full bg-zentry-card rounded-full border-2 border-zentry-bg flex items-center justify-center text-sm sm:text-base font-bold text-zentry-text-1 group-hover:scale-95 transition-transform relative overflow-hidden">
              {story.avatar}
            </div>
          </div>
          <span className="text-[11px] sm:text-xs font-medium text-zentry-text-2 truncate w-14 sm:w-16 text-center">
            {story.handle}
          </span>
        </div>
      ))}
    </div>
  )
}

