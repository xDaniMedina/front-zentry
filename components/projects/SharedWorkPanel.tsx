"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Wand2, Loader2, ImageIcon, Video, Music, Users } from "lucide-react"
import type { ProjectType, StudioProject } from "@/types"
import { getStudioProjectById } from "@/lib/actions/studio"
import { getImageUrl } from "@/lib/utils"

/** Obra compartida del proyecto (imagen/video/audio): vista previa + acceso al editor del Estudio. */
export default function SharedWorkPanel({ studioProjectId, projectType, canEdit }: {
  studioProjectId?: number | null
  projectType: ProjectType
  canEdit: boolean
}) {
  const [work, setWork] = useState<StudioProject | null>(null)
  const [loading, setLoading] = useState(Boolean(studioProjectId))

  useEffect(() => {
    if (!studioProjectId) return
    getStudioProjectById(String(studioProjectId)).then(res => {
      setWork(res.success && res.data ? res.data : null)
      setLoading(false)
    })
  }, [studioProjectId])

  const Icon = projectType === "video" ? Video : projectType === "audio" ? Music : ImageIcon
  const media = work?.thumbnail_url ? getImageUrl(work.thumbnail_url) : null
  const label = projectType === "video" ? "video" : projectType === "audio" ? "pista de audio" : "imagen"

  if (!studioProjectId) {
    return (
      <div className="bg-zentry-card border border-zentry-border rounded-3xl p-8 text-center text-sm text-zentry-text-2">
        Este proyecto no tiene una obra compartida. Sube tus archivos al Drive del proyecto.
      </div>
    )
  }

  return (
    <div className="bg-zentry-card border border-zentry-border rounded-3xl overflow-hidden">
      <div className="aspect-video bg-black/60 flex items-center justify-center relative">
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin text-zentry-text-2" />
        ) : media && projectType === "video" ? (
          <video src={media} controls className="w-full h-full object-contain" />
        ) : media && projectType === "audio" ? (
          <div className="w-full max-w-md p-6 space-y-4 text-center">
            <Music className="w-14 h-14 mx-auto text-emerald-400" />
            <audio src={media} controls className="w-full" />
          </div>
        ) : media ? (
          // eslint-disable-next-line @next/next/no-img-element -- obra del editor (puede ser blob/base64 guardado)
          <img src={media} alt={work?.title || "Obra"} className="w-full h-full object-contain" />
        ) : (
          <div className="text-center text-zentry-text-2 space-y-2">
            <Icon className="w-12 h-12 mx-auto opacity-40" />
            <p className="text-xs">La {label} aún está vacía</p>
          </div>
        )}
      </div>
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-zentry-text-1 flex items-center gap-1.5"><Users className="w-4 h-4 text-zentry-accent" /> Obra compartida del equipo</p>
          <p className="text-[11px] text-zentry-text-2">
            {work?.lastEdited ? `Última edición: ${work.lastEdited}` : "Todos los miembros pueden editarla en el Estudio."}
          </p>
        </div>
        {canEdit ? (
          <Link href={`/studio/${studioProjectId}`}
            className="px-4 py-2.5 rounded-2xl bg-zentry-accent text-white text-xs font-black flex items-center justify-center gap-2 shrink-0">
            <Wand2 className="w-4 h-4" /> Abrir en el editor
          </Link>
        ) : (
          <span className="text-[11px] text-zentry-text-2">Solo los miembros pueden editar</span>
        )}
      </div>
    </div>
  )
}
