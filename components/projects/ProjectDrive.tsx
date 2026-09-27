"use client"

import { useMemo, useRef, useState } from "react"
import {
  Folder, FolderPlus, Upload, Link2, ChevronRight, Home, FileText, FileImage, FileVideo, FileAudio,
  FileArchive, File, MoreVertical, Pencil, Trash2, MoveRight, Download, Loader2, ExternalLink, X,
} from "lucide-react"
import { toast } from "sonner"
import type { DriveItem } from "@/types"
import {
  uploadDriveFilesAction, createDriveFolderAction, addDriveLinkAction, updateDriveItemAction, deleteDriveItemAction,
} from "@/lib/actions/projects"
import { cn, getImageUrl, timeAgo } from "@/lib/utils"

const MAX_MB = 150

function iconFor(item: DriveItem) {
  if (item.isFolder) return Folder
  const mime = item.mimeType || ""
  const t = item.type.toUpperCase()
  if (mime.startsWith("image/") || ["PNG", "JPG", "JPEG", "GIF", "WEBP", "SVG"].includes(t)) return FileImage
  if (mime.startsWith("video/") || ["MP4", "MOV", "WEBM", "MKV"].includes(t)) return FileVideo
  if (mime.startsWith("audio/") || ["MP3", "WAV", "OGG", "M4A", "FLAC"].includes(t)) return FileAudio
  if (["ZIP", "RAR", "7Z"].includes(t)) return FileArchive
  if (["PDF", "DOC", "DOCX", "TXT", "MD"].includes(t)) return FileText
  if (t === "LINK") return Link2
  return File
}

function childPath(folder: DriveItem) {
  return (folder.folder === "/" ? "" : folder.folder) + "/" + folder.name
}

/** Drive del proyecto: carpetas, subida múltiple (arrastrar y soltar), enlaces, renombrar, mover y eliminar. */
export default function ProjectDrive({ projectId, items, canEdit, onChange }: {
  projectId: string
  items: DriveItem[]
  canEdit: boolean
  onChange: (items: DriveItem[]) => void
}) {
  const [path, setPath] = useState("/")
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const [preview, setPreview] = useState<DriveItem | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const here = useMemo(() => items
    .filter(i => (i.folder || "/") === path)
    .sort((a, b) => (a.isFolder === b.isFolder ? a.name.localeCompare(b.name) : a.isFolder ? -1 : 1)), [items, path])

  const folders = useMemo(() => ["/", ...items.filter(i => i.isFolder).map(childPath)], [items])
  const crumbs = path === "/" ? [] : path.slice(1).split("/")

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files)
    if (list.length === 0) return
    const tooBig = list.find(f => f.size > MAX_MB * 1024 * 1024)
    if (tooBig) { toast.error(`"${tooBig.name}" supera ${MAX_MB} MB`); return }
    const fd = new FormData()
    list.forEach(f => fd.append("files", f, f.name))
    fd.set("folder", path)
    setUploading(true)
    const res = await uploadDriveFilesAction(projectId, fd)
    setUploading(false)
    if (!res.success || !res.data) { toast.error(res.error || "No se pudieron subir los archivos"); return }
    onChange([...items, ...res.data])
    toast.success(res.data.length === 1 ? `Subido: ${res.data[0].name}` : `${res.data.length} archivos subidos`)
  }

  const newFolder = async () => {
    const name = window.prompt("Nombre de la carpeta")?.trim()
    if (!name) return
    if (name.includes("/")) { toast.error("El nombre no puede contener /"); return }
    const res = await createDriveFolderAction(projectId, name, path)
    if (!res.success || !res.data) { toast.error(res.error); return }
    onChange([...items, res.data])
  }

  const newLink = async () => {
    const url = window.prompt("Pega el enlace (Figma, Drive, YouTube...)")?.trim()
    if (!url) return
    if (!/^https?:\/\//i.test(url)) { toast.error("El enlace debe empezar por http:// o https://"); return }
    const name = window.prompt("Nombre para el enlace", url.replace(/^https?:\/\//, "").slice(0, 40))?.trim() || url
    const res = await addDriveLinkAction(projectId, name, url, path)
    if (!res.success || !res.data) { toast.error(res.error); return }
    onChange([...items, res.data])
  }

  const rename = async (item: DriveItem) => {
    setMenuFor(null)
    const name = window.prompt("Nuevo nombre", item.name)?.trim()
    if (!name || name === item.name) return
    const res = await updateDriveItemAction(projectId, item.id, { name })
    if (!res.success) { toast.error(res.error); return }
    if (item.isFolder) {
      // Mover también las rutas de su contenido en el estado local
      const oldPath = childPath(item)
      const newPath = childPath({ ...item, name })
      onChange(items.map(i => i.id === item.id ? { ...i, name }
        : i.folder === oldPath || i.folder.startsWith(oldPath + "/") ? { ...i, folder: newPath + i.folder.slice(oldPath.length) } : i))
    } else {
      onChange(items.map(i => i.id === item.id ? { ...i, name } : i))
    }
  }

  const move = async (item: DriveItem) => {
    setMenuFor(null)
    const options = folders.filter(f => !item.isFolder || (f !== childPath(item) && !f.startsWith(childPath(item) + "/")))
    const target = window.prompt(`Mover a carpeta:\n${options.join("\n")}`, "/")?.trim()
    if (!target || !options.includes(target)) { if (target) toast.error("Esa carpeta no existe"); return }
    const res = await updateDriveItemAction(projectId, item.id, { folder: target })
    if (!res.success) { toast.error(res.error); return }
    onChange(items.map(i => i.id === item.id ? { ...i, folder: target } : i))
  }

  const remove = async (item: DriveItem) => {
    setMenuFor(null)
    if (!window.confirm(item.isFolder ? `¿Eliminar la carpeta "${item.name}" y todo su contenido?` : `¿Eliminar "${item.name}"?`)) return
    const res = await deleteDriveItemAction(projectId, item.id)
    if (!res.success) { toast.error(res.error); return }
    const p = item.isFolder ? childPath(item) : null
    onChange(items.filter(i => i.id !== item.id && !(p && (i.folder === p || i.folder.startsWith(p + "/")))))
    toast.success("Eliminado")
  }

  const open = (item: DriveItem) => {
    if (item.isFolder) { setPath(childPath(item)); return }
    if (item.type === "LINK" && item.url) { window.open(item.url, "_blank", "noopener"); return }
    setPreview(item)
  }

  return (
    <div
      className={cn("bg-zentry-card border rounded-3xl p-4 sm:p-5 space-y-4 transition", dragOver ? "border-zentry-accent bg-zentry-accent/5" : "border-zentry-border")}
      onDragOver={e => { if (canEdit) { e.preventDefault(); setDragOver(true) } }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); if (canEdit) upload(e.dataTransfer.files) }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <nav className="flex items-center gap-1 text-xs font-bold text-zentry-text-2 overflow-x-auto" aria-label="Ruta">
          <button onClick={() => setPath("/")} className="flex items-center gap-1 hover:text-zentry-text-1 cursor-pointer shrink-0"><Home className="w-3.5 h-3.5" /> Drive</button>
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1 shrink-0">
              <ChevronRight className="w-3 h-3" />
              <button onClick={() => setPath("/" + crumbs.slice(0, i + 1).join("/"))} className="hover:text-zentry-text-1 cursor-pointer">{c}</button>
            </span>
          ))}
        </nav>
        {canEdit && (
          <div className="flex gap-2 shrink-0">
            <button onClick={newFolder} className="px-3 py-2 rounded-xl text-xs font-bold bg-zentry-bg border border-zentry-border text-zentry-text-1 flex items-center gap-1.5 cursor-pointer"><FolderPlus className="w-3.5 h-3.5" /> Carpeta</button>
            <button onClick={newLink} className="px-3 py-2 rounded-xl text-xs font-bold bg-zentry-bg border border-zentry-border text-zentry-text-1 flex items-center gap-1.5 cursor-pointer"><Link2 className="w-3.5 h-3.5" /> Enlace</button>
            <button onClick={() => inputRef.current?.click()} disabled={uploading} className="px-3 py-2 rounded-xl text-xs font-black bg-zentry-accent text-white flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Subir
            </button>
            <input ref={inputRef} type="file" multiple hidden onChange={e => { if (e.target.files) upload(e.target.files); e.target.value = "" }} />
          </div>
        )}
      </div>

      {here.length === 0 ? (
        <div className="py-12 text-center text-zentry-text-2 border border-dashed border-zentry-border rounded-2xl">
          <Folder className="w-10 h-10 mx-auto opacity-40" />
          <p className="text-xs mt-2">{canEdit ? "Arrastra archivos aquí o usa “Subir”" : "Esta carpeta está vacía"}</p>
        </div>
      ) : (
        <ul className="divide-y divide-zentry-border/60 border border-zentry-border rounded-2xl overflow-visible">
          {here.map(item => {
            const Icon = iconFor(item)
            return (
              <li key={item.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-zentry-bg/60 relative">
                <button onClick={() => open(item)} className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer">
                  <Icon className={cn("w-5 h-5 shrink-0", item.isFolder ? "text-amber-400" : "text-zentry-accent")} />
                  <span className="min-w-0">
                    <span className="block text-xs font-bold text-zentry-text-1 truncate">{item.name}</span>
                    <span className="block text-[10px] text-zentry-text-2 truncate">
                      {item.isFolder ? "Carpeta" : `${item.type} · ${item.size}`} · @{item.uploadedBy} · {timeAgo(item.date)}
                    </span>
                  </span>
                </button>
                {!item.isFolder && item.url && item.type !== "LINK" && (
                  <a href={getImageUrl(item.url)} download={item.name} target="_blank" rel="noreferrer" aria-label={`Descargar ${item.name}`}
                    className="p-1.5 rounded-lg text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg"><Download className="w-4 h-4" /></a>
                )}
                {canEdit && (
                  <div className="relative">
                    <button onClick={() => setMenuFor(menuFor === item.id ? null : item.id)} aria-label="Opciones"
                      className="p-1.5 rounded-lg text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg cursor-pointer"><MoreVertical className="w-4 h-4" /></button>
                    {menuFor === item.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setMenuFor(null)} />
                        <div className="absolute right-0 top-8 z-50 w-40 bg-zentry-card border border-zentry-border rounded-xl shadow-2xl py-1 text-xs">
                          <button onClick={() => rename(item)} className="w-full px-3 py-2 text-left hover:bg-zentry-bg flex items-center gap-2 text-zentry-text-1 cursor-pointer"><Pencil className="w-3.5 h-3.5" /> Renombrar</button>
                          <button onClick={() => move(item)} className="w-full px-3 py-2 text-left hover:bg-zentry-bg flex items-center gap-2 text-zentry-text-1 cursor-pointer"><MoveRight className="w-3.5 h-3.5" /> Mover</button>
                          <button onClick={() => remove(item)} className="w-full px-3 py-2 text-left hover:bg-red-500/10 flex items-center gap-2 text-red-400 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> Eliminar</button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {preview && (
        <div className="fixed inset-0 z-[160] bg-black/90 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="max-w-4xl w-full space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between text-white">
              <p className="text-sm font-bold truncate">{preview.name}</p>
              <div className="flex gap-2">
                {preview.url && <a href={getImageUrl(preview.url)} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-white/10" aria-label="Abrir en otra pestaña"><ExternalLink className="w-4 h-4" /></a>}
                <button onClick={() => setPreview(null)} className="p-2 rounded-xl bg-white/10 cursor-pointer" aria-label="Cerrar"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <DrivePreview item={preview} />
          </div>
        </div>
      )}
    </div>
  )
}

function DrivePreview({ item }: { item: DriveItem }) {
  const src = item.url ? getImageUrl(item.url) : ""
  const Icon = iconFor(item)
  if (Icon === FileImage) {
    // eslint-disable-next-line @next/next/no-img-element -- archivo arbitrario del drive
    return <img src={src} alt={item.name} className="max-h-[75dvh] mx-auto rounded-2xl object-contain" />
  }
  if (Icon === FileVideo) return <video src={src} controls className="w-full max-h-[75dvh] rounded-2xl bg-black" />
  if (Icon === FileAudio) return <audio src={src} controls className="w-full" />
  if (item.type === "PDF") return <iframe src={src} title={item.name} className="w-full h-[75dvh] rounded-2xl bg-white" />
  return (
    <div className="p-10 text-center rounded-2xl bg-zentry-card text-zentry-text-2 text-sm">
      Vista previa no disponible. <a href={src} target="_blank" rel="noreferrer" className="text-zentry-accent font-bold">Descargar archivo</a>
    </div>
  )
}
