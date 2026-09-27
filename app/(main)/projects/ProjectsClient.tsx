"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createPortal } from "react-dom"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus, Search, X, Globe, Lock, Users, Heart, Loader2, FolderKanban, Compass, BookOpen, CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"
import { Project, ProjectType } from "@/types"
import { createProjectAction, getPublicProjectsAction } from "@/lib/actions/projects"
import { PROJECT_TYPES, STATUS_LABELS, projectTypeInfo } from "@/lib/projects"
import { cn, getImageUrl, timeAgo } from "@/lib/utils"

type Tab = "mine" | "discover"

export default function ProjectsClient({ initialProjects }: { initialProjects: Project[] | null }) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("mine")
  const [projects] = useState<Project[]>(initialProjects || [])
  const [publicProjects, setPublicProjects] = useState<Project[] | null>(null)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<ProjectType | "all">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused" | "completed">("all")

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [portalReady, setPortalReady] = useState(false)
  useEffect(() => setPortalReady(true), [])

  // "Descubrir" se carga solo cuando se abre por primera vez
  useEffect(() => {
    if (tab !== "discover" || publicProjects !== null) return
    getPublicProjectsAction().then(res => setPublicProjects(res.data))
  }, [tab, publicProjects])

  const source = tab === "mine" ? projects : publicProjects || []
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return source.filter(p =>
      (!q || p.title.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q)
        || (p.tags || []).some(t => t.toLowerCase().includes(q)))
      && (typeFilter === "all" || (p.projectType || "general") === typeFilter)
      && (statusFilter === "all" || p.status === statusFilter)
    )
  }, [source, search, typeFilter, statusFilter])

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === "active").length,
    completed: projects.filter(p => p.status === "completed").length,
    shared: projects.filter(p => !p.isOwner).length,
  }

  return (
    <div className="w-full space-y-6 py-2 sm:py-6 pb-24">
      {/* Cabecera */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-950/50 via-zentry-card to-purple-950/40 border border-zentry-border overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zentry-text-1 flex items-center gap-2">
              <FolderKanban className="w-7 h-7 text-zentry-accent" /> Proyectos
            </h1>
            <p className="text-sm text-zentry-text-2 mt-1 max-w-xl">
              Tu drive creativo en equipo: archivos, libros por capítulos, obras compartidas, chat y canal de voz.
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-3 bg-zentry-accent text-white rounded-2xl text-sm font-black flex items-center gap-2 shadow-lg shadow-zentry-accent/30 hover:opacity-90 active:scale-95 transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Nuevo proyecto
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { label: "Proyectos", value: stats.total },
            { label: "En progreso", value: stats.active },
            { label: "Completados", value: stats.completed },
            { label: "Colaboraciones", value: stats.shared },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-2xl bg-zentry-bg/60 border border-zentry-border">
              <p className="text-xl font-black text-zentry-text-1">{s.value}</p>
              <p className="text-[11px] text-zentry-text-2">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pestañas + búsqueda */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
        <div className="flex bg-zentry-card p-1 rounded-2xl border border-zentry-border w-fit">
          {([
            { id: "mine", label: "Mis proyectos", icon: FolderKanban },
            { id: "discover", label: "Descubrir públicos", icon: Compass },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer",
                tab === t.id ? "bg-zentry-accent text-white shadow" : "text-zentry-text-2 hover:text-zentry-text-1"
              )}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zentry-text-2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar proyectos, etiquetas..."
            className="w-full bg-zentry-card border border-zentry-border rounded-2xl pl-9 pr-3 py-2.5 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <FilterChip active={typeFilter === "all"} onClick={() => setTypeFilter("all")}>Todos</FilterChip>
        {PROJECT_TYPES.map(t => (
          <FilterChip key={t.id} active={typeFilter === t.id} onClick={() => setTypeFilter(t.id)}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </FilterChip>
        ))}
        <span className="w-px bg-zentry-border mx-1" />
        {(["all", "active", "paused", "completed"] as const).map(s => (
          <FilterChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
            {s === "all" ? "Cualquier estado" : STATUS_LABELS[s].label}
          </FilterChip>
        ))}
      </div>

      {/* Lista */}
      {tab === "discover" && publicProjects === null ? (
        <div className="py-20 flex justify-center text-zentry-text-2"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-zentry-card border border-dashed border-zentry-border rounded-3xl space-y-3">
          <FolderKanban className="w-12 h-12 mx-auto text-zentry-text-2/40" />
          <p className="text-sm font-extrabold text-zentry-text-1">
            {tab === "mine" ? "Aún no tienes proyectos aquí" : "No hay proyectos públicos con estos filtros"}
          </p>
          {tab === "mine" && (
            <button onClick={() => setIsCreateOpen(true)} className="px-5 py-2.5 bg-zentry-accent text-white rounded-2xl text-xs font-black cursor-pointer">
              Crear mi primer proyecto
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => <ProjectCard key={p.id} project={p} onOpen={() => router.push(`/projects/${p.id}`)} />)}
        </div>
      )}

      {portalReady && createPortal(
        <AnimatePresence>
          {isCreateOpen && <CreateProjectModal onClose={() => setIsCreateOpen(false)} onCreated={(p) => router.push(`/projects/${p.id}`)} />}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 transition cursor-pointer",
        active ? "bg-zentry-accent/15 border-zentry-accent text-zentry-accent" : "bg-zentry-card border-zentry-border text-zentry-text-2 hover:text-zentry-text-1"
      )}
    >
      {children}
    </button>
  )
}

function ProjectCard({ project: p, onOpen }: { project: Project; onOpen: () => void }) {
  const type = projectTypeInfo(p.projectType)
  const status = STATUS_LABELS[p.status] ?? STATUS_LABELS.active
  return (
    <motion.button
      layout
      onClick={onOpen}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-left bg-zentry-card border border-zentry-border rounded-3xl overflow-hidden hover:border-zentry-accent/60 transition group cursor-pointer flex flex-col"
    >
      <div className="relative h-28 bg-gradient-to-br from-indigo-950 via-purple-950/60 to-zentry-bg">
        {p.coverUrl && <Image src={getImageUrl(p.coverUrl)} alt={p.title} fill sizes="400px" className="object-cover opacity-80 group-hover:opacity-100 transition" />}
        <span className={cn("absolute top-3 left-3 text-[10px] font-black px-2 py-1 rounded-lg border flex items-center gap-1 backdrop-blur", type.color)}>
          <type.icon className="w-3 h-3" /> {type.label}
        </span>
        <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-lg bg-black/50 text-white flex items-center gap-1 backdrop-blur">
          {p.visibility === "public" ? <><Globe className="w-3 h-3" /> Público</> : <><Lock className="w-3 h-3" /> Privado</>}
        </span>
      </div>
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div>
          <h3 className="font-extrabold text-sm text-zentry-text-1 line-clamp-1">{p.title}</h3>
          <p className="text-xs text-zentry-text-2 line-clamp-2 mt-0.5 min-h-[2rem]">{p.description || "Sin descripción"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <span className={cn("font-bold px-2 py-0.5 rounded-full border", status.className)}>{status.label}</span>
          {p.publishedPostId && <span className="font-bold px-2 py-0.5 rounded-full border text-sky-300 bg-sky-500/10 border-sky-500/20 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> En el feed</span>}
          {!p.isOwner && p.isMember && <span className="font-bold px-2 py-0.5 rounded-full border text-teal-300 bg-teal-500/10 border-teal-500/20">Colaboras</span>}
        </div>
        {p.tasksCount > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-zentry-text-2"><span>Tareas</span><span>{p.progress}%</span></div>
            <div className="h-1.5 rounded-full bg-zentry-bg overflow-hidden"><div className="h-full bg-zentry-accent rounded-full" style={{ width: `${p.progress}%` }} /></div>
          </div>
        )}
        <div className="mt-auto pt-2 border-t border-zentry-border/60 flex items-center justify-between text-[11px] text-zentry-text-2">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {p.membersCount || 1}</span>
            <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {p.likesCount || 0}</span>
            {p.projectType === "book" && <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {p.chaptersCount || 0}</span>}
          </span>
          <span className="truncate">@{p.authorUsername} · {timeAgo(p.updatedAt)}</span>
        </div>
      </div>
    </motion.button>
  )
}

function CreateProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: (p: Project) => void }) {
  const [type, setType] = useState<ProjectType>("general")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [visibility, setVisibility] = useState<"private" | "public">("private")
  const [tags, setTags] = useState("")
  const [deadline, setDeadline] = useState("")
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { toast.error("Ponle un título al proyecto"); return }
    setSaving(true)
    const res = await createProjectAction({
      title: title.trim(),
      description: description.trim(),
      projectType: type,
      visibility,
      deadline: deadline || undefined,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
    })
    setSaving(false)
    if (!res.success || !res.data) { toast.error(res.error || "No se pudo crear el proyecto"); return }
    toast.success("📁 Proyecto creado")
    onCreated(res.data)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
      <motion.form
        onSubmit={submit}
        onClick={e => e.stopPropagation()}
        initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
        className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-2xl max-h-[92dvh] overflow-y-auto shadow-2xl"
        role="dialog" aria-modal="true" aria-label="Nuevo proyecto"
      >
        <div className="p-5 border-b border-zentry-border flex items-center justify-between sticky top-0 bg-zentry-card z-10">
          <h2 className="text-lg font-black text-zentry-text-1">Nuevo proyecto</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="p-1.5 rounded-xl text-zentry-text-2 hover:bg-zentry-bg cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <p className="text-xs font-extrabold text-zentry-text-1 mb-2">¿Qué van a crear?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PROJECT_TYPES.map(t => (
                <button type="button" key={t.id} onClick={() => setType(t.id)}
                  className={cn("p-3 rounded-2xl border text-left flex items-start gap-3 transition cursor-pointer",
                    type === t.id ? "border-zentry-accent bg-zentry-accent/10" : "border-zentry-border bg-zentry-bg hover:border-zentry-text-2/40")}>
                  <span className={cn("p-2 rounded-xl border", t.color)}><t.icon className="w-4 h-4" /></span>
                  <span>
                    <span className="block text-xs font-extrabold text-zentry-text-1">{t.label}</span>
                    <span className="block text-[11px] text-zentry-text-2">{t.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título del proyecto" maxLength={120} required
            className="w-full bg-zentry-bg border border-zentry-border rounded-2xl px-4 py-3 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent" />
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
            placeholder={type === "book" ? "Sinopsis del libro..." : "¿De qué trata el proyecto?"}
            className="w-full bg-zentry-bg border border-zentry-border rounded-2xl px-4 py-3 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent resize-none" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Etiquetas (separadas por comas)"
              className="w-full bg-zentry-bg border border-zentry-border rounded-2xl px-4 py-2.5 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent" />
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} aria-label="Fecha límite"
              className="w-full bg-zentry-bg border border-zentry-border rounded-2xl px-4 py-2.5 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {([
              { id: "private", label: "Privado", desc: "Solo los miembros lo ven", icon: Lock },
              { id: "public", label: "Público", desc: "Visible en Descubrir (solo lectura)", icon: Globe },
            ] as const).map(v => (
              <button type="button" key={v.id} onClick={() => setVisibility(v.id)}
                className={cn("p-3 rounded-2xl border text-left transition cursor-pointer",
                  visibility === v.id ? "border-zentry-accent bg-zentry-accent/10" : "border-zentry-border bg-zentry-bg")}>
                <span className="text-xs font-extrabold text-zentry-text-1 flex items-center gap-1.5"><v.icon className="w-3.5 h-3.5" /> {v.label}</span>
                <span className="text-[11px] text-zentry-text-2">{v.desc}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="p-5 border-t border-zentry-border flex justify-end gap-2 sticky bottom-0 bg-zentry-card">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-xs font-bold text-zentry-text-2 cursor-pointer">Cancelar</button>
          <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl text-xs font-black bg-zentry-accent text-white disabled:opacity-50 flex items-center gap-2 cursor-pointer">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Crear proyecto
          </button>
        </div>
      </motion.form>
    </motion.div>
  )
}
