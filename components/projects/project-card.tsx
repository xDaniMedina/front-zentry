import { Heart, MessageSquare, Share2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Project } from "@/types/project"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition-all hover:border-violet-500/50 hover:bg-zinc-900/80">
      
      {/* Header: Autor y Opciones */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600/20 border border-violet-500/30">
            <span className="text-violet-400 font-bold text-sm">
              {project.authorName.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-zinc-200">{project.authorName}</h4>
            <p className="text-xs text-zinc-500">Hace 2 horas</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
          <Sparkles className="h-4 w-4" />
        </Button>
      </div>

      {/* Cuerpo del Proyecto */}
      <div className="mb-6 flex-1">
        <h3 className="mb-2 text-lg font-bold text-white tracking-tight group-hover:text-violet-400 transition-colors">
          {project.title}
        </h3>
        <p className="text-sm text-zinc-400 line-clamp-3">
          {project.description}
        </p>
        
        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center rounded-md bg-zinc-800/50 px-2 py-1 text-xs font-medium text-zinc-300 ring-1 ring-inset ring-zinc-700">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer: Interacciones */}
      <div className="flex items-center gap-4 border-t border-zinc-800/50 pt-4">
        <button className="flex items-center gap-1.5 text-zinc-400 hover:text-rose-400 transition-colors text-sm font-medium">
          <Heart className="h-4 w-4" />
          <span>{project.likes}</span>
        </button>
        <button className="flex items-center gap-1.5 text-zinc-400 hover:text-blue-400 transition-colors text-sm font-medium">
          <MessageSquare className="h-4 w-4" />
          <span>{project.commentsCount}</span>
        </button>
        <div className="flex-1" />
        <button className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors">
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}