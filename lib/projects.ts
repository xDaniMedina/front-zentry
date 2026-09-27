import { BookOpen, FolderKanban, Image as ImageIcon, Music, Video, type LucideIcon } from "lucide-react"
import type { ProjectType } from "@/types"

export const PROJECT_TYPES: { id: ProjectType; label: string; desc: string; icon: LucideIcon; color: string }[] = [
  { id: "general", label: "Proyecto general", desc: "Drive de archivos, tareas y chat del equipo", icon: FolderKanban, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30" },
  { id: "book", label: "Libro / Historia", desc: "Escribe por capítulos en equipo, estilo Wattpad", icon: BookOpen, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  { id: "image", label: "Imagen colaborativa", desc: "Una obra compartida en el editor de imágenes", icon: ImageIcon, color: "text-pink-400 bg-pink-500/10 border-pink-500/30" },
  { id: "video", label: "Video", desc: "Montaje compartido en el editor de video", icon: Video, color: "text-sky-400 bg-sky-500/10 border-sky-500/30" },
  { id: "audio", label: "Audio / Música", desc: "Pista compartida en el editor de audio", icon: Music, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
]

export function projectTypeInfo(type?: ProjectType | null) {
  return PROJECT_TYPES.find(t => t.id === type) ?? PROJECT_TYPES[0]
}

export const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active: { label: "En progreso", className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  paused: { label: "En pausa", className: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  completed: { label: "Completado", className: "text-purple-300 bg-purple-500/10 border-purple-500/20" },
}
