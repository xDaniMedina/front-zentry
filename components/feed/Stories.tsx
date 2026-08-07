import { motion } from "framer-motion"

export type Story = { id: number; handle: string; isUser: boolean; avatar: string; viewed: boolean }

export function Stories({ stories, onStoryClick }: { stories: Story[], onStoryClick: (story: Story) => void }) {
  return (
    <div className="flex gap-4 overflow-x-auto hide-scrollbar px-4 sm:px-0 mb-6 pb-2">
      {stories.map((story) => (
        <div 
          key={story.id} 
          onClick={() => onStoryClick(story)}
          className="flex flex-col items-center gap-2 cursor-pointer shrink-0 group"
        >
          <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full p-1 transition-all ${
            story.isUser 
              ? 'bg-gradient-to-tr from-zentry-accent to-blue-500' 
              : story.viewed 
                ? 'bg-zentry-border' 
                : 'bg-gradient-to-tr from-green-400 to-emerald-500'
          }`}>
            <div className="w-full h-full bg-zentry-card rounded-full border-2 border-zentry-bg flex items-center justify-center text-lg font-bold text-zentry-text-1 group-hover:scale-95 transition-transform relative overflow-hidden">
              {story.avatar}
            </div>
          </div>
          <span className="text-xs font-medium text-zentry-text-2 truncate w-16 text-center">
            {story.handle}
          </span>
        </div>
      ))}
    </div>
  )
}

