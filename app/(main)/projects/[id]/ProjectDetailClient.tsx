"use client"

import VoicePresenceBadge from "@/components/projects/VoicePresenceBadge"
import { useCallback, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft, Globe, Lock, Heart, Send, Trash2, LogOut, Camera, Loader2, LayoutDashboard, BookOpen, FolderOpen,
  CheckSquare, MessagesSquare, Users, Wand2, Plus, UserPlus, Crown, X, CheckCircle2, Activity, StickyNote, Pencil,
} from "lucide-react"
import { toast } from "sonner"
import type { Project, ProjectMember, ProjectTask, ProjectComment, DriveItem } from "@/types"
import {
  updateProjectAction, deleteProjectAction, publishProjectAction, toggleProjectLikeAction, uploadProjectCoverAction,
  inviteProjectMemberAction, removeProjectMemberAction, addProjectTaskAction, toggleProjectTaskAction, deleteTaskAction,
  addNoteAction,
} from "@/lib/actions/projects"
import { useAuth } from "@/context/AuthContext"
import ProjectDrive from "@/components/projects/ProjectDrive"
import BookWorkspace from "@/components/projects/BookWorkspace"
import SharedWorkPanel from "@/components/projects/SharedWorkPanel"
import ProjectChannel from "@/components/projects/ProjectChannel"
import PublishCelebration from "@/components/shared/PublishCelebration"
import UserAvatar from "@/components/shared/UserAvatar"
import { projectTypeInfo, STATUS_LABELS } from "@/lib/projects"
import { cn, getImageUrl, timeAgo } from "@/lib/utils"

type Tab = "overview" | "work" | "drive" | "tasks" | "channel" | "team"

export default function ProjectDetailClient({ projectId, initialProject }: { projectId: string; initialProject: Project | null }) {
  const router = useRouter()
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(initialProject)
  const [tab, setTab] = useState<Tab>("overview")
  const [publishing, setPublishing] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const coverInput = useRef<HTMLInputElement>(null)

  const patch = useCallback((changes: Partial<Project>) => setProject(p => (p ? { ...p, ...changes } : p)), [])

  if (!project) {
    return (
      <div className="py-24 text-center space-y-3">
        <Lock className="w-10 h-10 mx-auto text-zentry-text-2" />
        <p className="text-sm font-bold text-zentry-text-1">Este proyecto no existe o es privado</p>
        <Link href="/projects" className="text-xs text-zentry-accent font-bold">Volver a Proyectos</Link>
      </div>
    )
  }

  const isOwner = Boolean(project.isOwner)
  const isMember = Boolean(project.isMember)
  const type = projectTypeInfo(project.projectType)
  const status = STATUS_LABELS[project.status] ?? STATUS_LABELS.active
  const hasWorkTab = project.projectType && project.projectType !== "general"

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard; show: boolean }[] = [
    { id: "overview", label: "Resumen", icon: LayoutDashboard, show: true },
    { id: "work", label: project.projectType === "book" ? "Libro" : "Obra", icon: project.projectType === "book" ? BookOpen : Wand2, show: Boolean(hasWorkTab) },
    { id: "drive", label: "Drive", icon: FolderOpen, show: true },
    { id: "tasks", label: "Tareas", icon: CheckSquare, show: isMember },
    { id: "channel", label: "Chat y voz", icon: MessagesSquare, show: isMember },
    { id: "team", label: "Equipo", icon: Users, show: true },
  ]

  const update = async (changes: Parameters<typeof updateProjectAction>[1], okMessage?: string) => {
    const res = await updateProjectAction(project.id, changes)
    if (!res.success || !res.data) { toast.error(res.error); return false }
    patch({ ...res.data, members: project.members, resources: project.resources })
    if (okMessage) toast.success(okMessage)
    return true
  }

  const uploadCover = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("La portada debe ser una imagen"); return }
    const fd = new FormData()
    fd.set("file", file, file.name)
    const res = await uploadProjectCoverAction(project.id, fd)
    if (!res.success || !res.data) { toast.error(res.error); return }
    patch({ coverUrl: res.data.coverUrl })
    toast.success("Portada actualizada")
  }

  const publish = async () => {
    if (!window.confirm("¿Publicar el proyecto terminado en el feed principal? Quedará marcado como completado.")) return
    setPublishing(true)
    const res = await publishProjectAction(project.id)
    setPublishing(false)
    if (!res.success || !res.data) { toast.error(res.error); return }
    patch({ status: res.data.status, publishedPostId: res.data.publishedPostId })
    setCelebrate(true)
  }

  const toggleLike = async () => {
    const was = project.isLiked
    patch({ isLiked: !was, likesCount: (project.likesCount || 0) + (was ? -1 : 1) })
    const res = await toggleProjectLikeAction(project.id)
    if (res.success) patch({ isLiked: res.isLiked, likesCount: res.likesCount })
    else patch({ isLiked: was, likesCount: project.likesCount })
  }

  const remove = async () => {
    if (!window.confirm(`¿Eliminar "${project.title}"? Se borrarán sus archivos, capítulos, tareas y chat.`)) return
    const res = await deleteProjectAction(project.id)
    if (!res.success) { toast.error(res.error); return }
    toast.success("Proyecto eliminado")
    router.push("/projects")
  }

  const leave = async () => {
    const me = project.members.find(m => m.userId === user?.id)
    if (!me?.username || !window.confirm("¿Salir de este proyecto?")) return
    const res = await removeProjectMemberAction(project.id, me.username)
    if (!res.success) { toast.error(res.error); return }
    toast.success("Saliste del proyecto")
    router.push("/projects")
  }

  return (
    <div className="w-full py-2 sm:py-6 pb-24 space-y-5">
      <Link href="/projects" className="text-xs font-bold text-zentry-text-2 hover:text-zentry-text-1 flex items-center gap-1 w-fit"><ArrowLeft className="w-4 h-4" /> Proyectos</Link>

      {/* Portada + cabecera */}
      <header className="bg-zentry-card border border-zentry-border rounded-3xl overflow-hidden">
        <div className="relative h-36 sm:h-48 bg-gradient-to-br from-indigo-950 via-purple-950/70 to-zentry-bg group">
          {project.coverUrl && <Image src={getImageUrl(project.coverUrl)} alt={project.title} fill sizes="1000px" className="object-cover" priority />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          {isOwner && (
            <>
              <button onClick={() => coverInput.current?.click()}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 text-white text-[11px] font-bold flex items-center gap-1.5 backdrop-blur cursor-pointer">
                <Camera className="w-3.5 h-3.5" /> {project.coverUrl ? "Cambiar portada" : "Añadir portada"}
              </button>
              <input ref={coverInput} type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) uploadCover(f); e.target.value = "" }} />
            </>
          )}
          <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center gap-2">
            <span className={cn("text-[10px] font-black px-2 py-1 rounded-lg border flex items-center gap-1 backdrop-blur", type.color)}><type.icon className="w-3 h-3" /> {type.label}</span>
            <span className={cn("text-[10px] font-bold px-2 py-1 rounded-lg border backdrop-blur", status.className)}>{status.label}</span>
            {project.publishedPostId && <span className="text-[10px] font-bold px-2 py-1 rounded-lg border text-sky-300 bg-sky-500/15 border-sky-500/30 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Publicado en el feed</span>}
          </div>
        </div>
        <div className="p-4 sm:p-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-zentry-text-1 break-words">{project.title}</h1>
            <p className="text-xs text-zentry-text-2 mt-1">
              Creado por <Link href={`/profile/${project.authorUsername}`} className="font-bold text-zentry-text-1 hover:text-zentry-accent">@{project.authorUsername}</Link>
              {" · "}actualizado {timeAgo(project.updatedAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isMember && <VoicePresenceBadge projectId={project.id} onJoin={() => setTab("channel")} />}
            <button onClick={toggleLike} className={cn("px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer",
              project.isLiked ? "text-rose-400 border-rose-500/40 bg-rose-500/10" : "text-zentry-text-2 border-zentry-border bg-zentry-bg")}>
              <Heart className={cn("w-3.5 h-3.5", project.isLiked && "fill-rose-400")} /> {project.likesCount || 0}
            </button>
            {isOwner && (
              <button onClick={() => update({ visibility: project.visibility === "public" ? "private" : "public" },
                project.visibility === "public" ? "El proyecto ahora es privado" : "El proyecto ahora es público")}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-zentry-border bg-zentry-bg text-zentry-text-1 flex items-center gap-1.5 cursor-pointer"
                title="Cambiar visibilidad">
                {project.visibility === "public" ? <><Globe className="w-3.5 h-3.5 text-emerald-400" /> Público</> : <><Lock className="w-3.5 h-3.5 text-amber-400" /> Privado</>}
              </button>
            )}
            {!isOwner && (
              <span className="px-3 py-2 rounded-xl text-xs font-bold border border-zentry-border bg-zentry-bg text-zentry-text-2 flex items-center gap-1.5">
                {project.visibility === "public" ? <><Globe className="w-3.5 h-3.5" /> Público</> : <><Lock className="w-3.5 h-3.5" /> Privado</>}
              </span>
            )}
            {isOwner && !project.publishedPostId && (
              <button onClick={publish} disabled={publishing}
                className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">
                {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Publicar en el feed
              </button>
            )}
            {isOwner ? (
              <button onClick={remove} aria-label="Eliminar proyecto" className="p-2 rounded-xl text-red-400 border border-red-500/30 hover:bg-red-500/10 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
            ) : isMember ? (
              <button onClick={leave} className="px-3 py-2 rounded-xl text-xs font-bold text-red-400 border border-red-500/30 flex items-center gap-1.5 cursor-pointer"><LogOut className="w-3.5 h-3.5" /> Salir</button>
            ) : null}
          </div>
        </div>
      </header>

      {/* Pestañas */}
      <nav className="flex gap-1 overflow-x-auto bg-zentry-card border border-zentry-border rounded-2xl p-1 custom-scrollbar" aria-label="Secciones del proyecto">
        {tabs.filter(t => t.show).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer",
              tab === t.id ? "bg-zentry-accent text-white shadow" : "text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg")}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </nav>

      {tab === "overview" && <Overview project={project} isOwner={isOwner} isMember={isMember} onUpdate={update} onGo={setTab} />}
      {tab === "work" && (project.projectType === "book"
        ? <BookWorkspace projectId={project.id} canEdit={isMember} onCountChange={(n) => patch({ chaptersCount: n })} />
        : <SharedWorkPanel studioProjectId={project.studioProjectId} projectType={project.projectType || "image"} canEdit={isMember} />)}
      {tab === "drive" && <ProjectDrive projectId={project.id} items={project.resources || []} canEdit={isMember} onChange={(resources: DriveItem[]) => patch({ resources })} />}
      {tab === "tasks" && isMember && <Tasks project={project} onChange={patch} />}
      {tab === "channel" && isMember && <ProjectChannel projectId={project.id} projectTitle={project.title} members={project.members} myUserId={user?.id ? Number(user.id) : undefined} />}
      {tab === "team" && <Team project={project} isOwner={isOwner} onChange={(members) => patch({ members, membersCount: members.length })} />}

      <PublishCelebration
        open={celebrate}
        title={project.title}
        mediaType={project.projectType === "book" ? "text" : project.projectType === "general" ? "image" : project.projectType}
        mediaUrl={project.coverUrl ? getImageUrl(project.coverUrl) : null}
        onClose={() => { setCelebrate(false); router.push("/feed") }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------

function Overview({ project, isOwner, isMember, onUpdate, onGo }: {
  project: Project
  isOwner: boolean
  isMember: boolean
  onUpdate: (changes: Parameters<typeof updateProjectAction>[1], msg?: string) => Promise<boolean>
  onGo: (tab: Tab) => void
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description)
  const [notes, setNotes] = useState<ProjectComment[]>(project.comments || [])
  const [note, setNote] = useState("")

  const save = async () => {
    if (!title.trim()) { toast.error("El título no puede estar vacío"); return }
    if (await onUpdate({ title: title.trim(), description: description.trim() }, "Proyecto actualizado")) setEditing(false)
  }

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!note.trim()) return
    const res = await addNoteAction(project.id, note.trim())
    if (!res.success || !res.data) { toast.error(res.error); return }
    setNotes(prev => [...prev, res.data!])
    setNote("")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <section className="lg:col-span-2 space-y-4">
        <div className="bg-zentry-card border border-zentry-border rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-zentry-text-1">{project.projectType === "book" ? "Sinopsis" : "Descripción"}</h2>
            {isOwner && !editing && <button onClick={() => setEditing(true)} className="text-xs font-bold text-zentry-accent flex items-center gap-1 cursor-pointer"><Pencil className="w-3.5 h-3.5" /> Editar</button>}
          </div>
          {editing ? (
            <div className="space-y-2">
              <input value={title} onChange={e => setTitle(e.target.value)} maxLength={120}
                className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-3 py-2 text-sm font-bold text-zentry-text-1 focus:outline-none focus:border-zentry-accent" />
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5}
                className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-3 py-2 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent resize-none" />
              <div className="flex justify-end gap-2">
                <button onClick={() => { setEditing(false); setTitle(project.title); setDescription(project.description) }} className="px-3 py-1.5 text-xs font-bold text-zentry-text-2 cursor-pointer">Cancelar</button>
                <button onClick={save} className="px-4 py-1.5 rounded-xl bg-zentry-accent text-white text-xs font-black cursor-pointer">Guardar</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-zentry-text-1 whitespace-pre-line leading-relaxed">{project.description || <span className="text-zentry-text-2">Sin descripción.</span>}</p>
          )}
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">{project.tags.map(t => <span key={t} className="text-[11px] font-bold text-zentry-accent bg-zentry-accent/10 border border-zentry-accent/20 px-2 py-0.5 rounded-lg">#{t}</span>)}</div>
          )}
        </div>

        {isMember && (
          <div className="bg-zentry-card border border-zentry-border rounded-3xl p-5 space-y-3">
            <h2 className="text-sm font-black text-zentry-text-1 flex items-center gap-1.5"><StickyNote className="w-4 h-4 text-amber-400" /> Notas del equipo</h2>
            <ul className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
              {notes.length === 0 && <li className="text-xs text-zentry-text-2">Sin notas todavía.</li>}
              {notes.map(n => (
                <li key={n.id} className="p-3 rounded-2xl bg-zentry-bg border border-zentry-border">
                  <p className="text-[11px] text-zentry-text-2"><span className="font-bold text-zentry-text-1">@{n.authorUsername}</span> · {timeAgo(n.createdAt)}</p>
                  <p className="text-sm text-zentry-text-1 whitespace-pre-line mt-1">{n.content}</p>
                </li>
              ))}
            </ul>
            <form onSubmit={addNote} className="flex gap-2">
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="Escribe una nota para el equipo…"
                className="flex-1 bg-zentry-bg border border-zentry-border rounded-xl px-3 py-2 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent" />
              <button type="submit" disabled={!note.trim()} className="px-3 rounded-xl bg-zentry-accent text-white disabled:opacity-40 cursor-pointer" aria-label="Guardar nota"><Plus className="w-4 h-4" /></button>
            </form>
          </div>
        )}
      </section>

      <aside className="space-y-4">
        <div className="bg-zentry-card border border-zentry-border rounded-3xl p-5 space-y-3">
          <h2 className="text-sm font-black text-zentry-text-1">Estado</h2>
          {isOwner ? (
            <select value={project.status} onChange={e => onUpdate({ status: e.target.value }, "Estado actualizado")}
              className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-3 py-2 text-xs text-zentry-text-1 focus:outline-none">
              <option value="active">En progreso</option>
              <option value="paused">En pausa</option>
              <option value="completed">Completado</option>
            </select>
          ) : (
            <p className="text-xs text-zentry-text-1">{(STATUS_LABELS[project.status] ?? STATUS_LABELS.active).label}</p>
          )}
          <div className="grid grid-cols-2 gap-2 text-center">
            <button onClick={() => onGo("team")} className="p-3 rounded-2xl bg-zentry-bg border border-zentry-border cursor-pointer"><p className="text-lg font-black text-zentry-text-1">{project.membersCount || project.members.length}</p><p className="text-[10px] text-zentry-text-2">Miembros</p></button>
            <button onClick={() => onGo("drive")} className="p-3 rounded-2xl bg-zentry-bg border border-zentry-border cursor-pointer"><p className="text-lg font-black text-zentry-text-1">{(project.resources || []).filter(r => !r.isFolder).length}</p><p className="text-[10px] text-zentry-text-2">Archivos</p></button>
            {project.projectType === "book" && <button onClick={() => onGo("work")} className="p-3 rounded-2xl bg-zentry-bg border border-zentry-border cursor-pointer"><p className="text-lg font-black text-zentry-text-1">{project.chaptersCount || 0}</p><p className="text-[10px] text-zentry-text-2">Capítulos</p></button>}
            {isMember && <button onClick={() => onGo("tasks")} className="p-3 rounded-2xl bg-zentry-bg border border-zentry-border cursor-pointer"><p className="text-lg font-black text-zentry-text-1">{project.progress}%</p><p className="text-[10px] text-zentry-text-2">Tareas</p></button>}
          </div>
          <p className="text-[11px] text-zentry-text-2">Fecha límite: {project.deadline}</p>
        </div>

        <div className="bg-zentry-card border border-zentry-border rounded-3xl p-5 space-y-3">
          <h2 className="text-sm font-black text-zentry-text-1 flex items-center gap-1.5"><Activity className="w-4 h-4 text-zentry-accent" /> Actividad</h2>
          <ul className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar">
            {[...(project.activities || [])].reverse().slice(0, 30).map(a => (
              <li key={a.id} className="text-xs text-zentry-text-2">
                <span className="font-bold text-zentry-text-1">@{a.user}</span> {a.action} <span className="text-zentry-text-1">{a.target}</span>
                <span className="block text-[10px]">{timeAgo(a.time)}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}

function Tasks({ project, onChange }: { project: Project; onChange: (c: Partial<Project>) => void }) {
  const [tasks, setTasks] = useState<ProjectTask[]>(project.tasks || [])
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState("media")
  const [assignee, setAssignee] = useState("")

  const sync = (next: ProjectTask[]) => {
    setTasks(next)
    const done = next.filter(t => t.completed).length
    onChange({ tasks: next, tasksCount: next.length, completedTasksCount: done, progress: next.length ? Math.round((done / next.length) * 100) : 0 })
  }

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const res = await addProjectTaskAction(project.id, { title: title.trim(), priority, assignedTo: assignee || undefined })
    if (!res.success || !res.data) { toast.error(res.error); return }
    sync([...tasks, res.data])
    setTitle("")
  }

  const toggle = async (task: ProjectTask) => {
    sync(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))
    const res = await toggleProjectTaskAction(project.id, task.id)
    if (!res.success) { sync(tasks); toast.error("No se pudo actualizar la tarea") }
  }

  const remove = async (task: ProjectTask) => {
    const res = await deleteTaskAction(project.id, task.id)
    if (!res.success) { toast.error("No se pudo eliminar"); return }
    sync(tasks.filter(t => t.id !== task.id))
  }

  const done = tasks.filter(t => t.completed).length
  return (
    <div className="bg-zentry-card border border-zentry-border rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-zentry-text-1">Tareas del equipo</h2>
        <span className="text-xs text-zentry-text-2">{done}/{tasks.length} completadas</span>
      </div>
      <div className="h-2 rounded-full bg-zentry-bg overflow-hidden"><div className="h-full bg-emerald-500 transition-all" style={{ width: `${tasks.length ? (done / tasks.length) * 100 : 0}%` }} /></div>
      <form onSubmit={add} className="flex flex-col sm:flex-row gap-2">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nueva tarea…"
          className="flex-1 bg-zentry-bg border border-zentry-border rounded-xl px-3 py-2 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent" />
        <select value={assignee} onChange={e => setAssignee(e.target.value)} aria-label="Asignar a"
          className="bg-zentry-bg border border-zentry-border rounded-xl px-3 py-2 text-xs text-zentry-text-1">
          <option value="">Asignar a mí</option>
          {project.members.map(m => <option key={m.id} value={m.handle}>@{m.handle}</option>)}
        </select>
        <select value={priority} onChange={e => setPriority(e.target.value)} aria-label="Prioridad"
          className="bg-zentry-bg border border-zentry-border rounded-xl px-3 py-2 text-xs text-zentry-text-1">
          <option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option><option value="urgente">Urgente</option>
        </select>
        <button type="submit" disabled={!title.trim()} className="px-4 py-2 rounded-xl bg-zentry-accent text-white text-xs font-black disabled:opacity-40 cursor-pointer">Añadir</button>
      </form>
      <ul className="space-y-2">
        {tasks.length === 0 && <li className="text-xs text-zentry-text-2">Sin tareas todavía.</li>}
        {tasks.map(t => (
          <li key={t.id} className="flex items-center gap-3 p-3 rounded-2xl bg-zentry-bg border border-zentry-border">
            <input type="checkbox" checked={t.completed} onChange={() => toggle(t)} className="w-4 h-4 accent-emerald-500 cursor-pointer" aria-label={`Completar ${t.title}`} />
            <span className={cn("flex-1 text-sm", t.completed ? "line-through text-zentry-text-2" : "text-zentry-text-1")}>{t.title}</span>
            {t.assignedTo && <span className="text-[10px] text-zentry-text-2">@{t.assignedTo}</span>}
            <span className="text-[10px] font-bold uppercase text-zentry-text-2">{t.priority}</span>
            <button onClick={() => remove(t)} aria-label="Eliminar tarea" className="p-1 text-zentry-text-2 hover:text-red-400 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Team({ project, isOwner, onChange }: { project: Project; isOwner: boolean; onChange: (members: ProjectMember[]) => void }) {
  const [handle, setHandle] = useState("")
  const [inviting, setInviting] = useState(false)

  const invite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!handle.trim()) return
    setInviting(true)
    const res = await inviteProjectMemberAction(project.id, handle.trim())
    setInviting(false)
    if (!res.success || !res.data) { toast.error(res.error); return }
    onChange([...project.members, res.data])
    setHandle("")
    toast.success(`@${res.data.handle} se unió al proyecto`)
  }

  const kick = async (m: ProjectMember) => {
    if (!m.username || !window.confirm(`¿Quitar a @${m.handle} del proyecto?`)) return
    const res = await removeProjectMemberAction(project.id, m.username)
    if (!res.success) { toast.error(res.error); return }
    onChange(project.members.filter(x => x.id !== m.id))
  }

  return (
    <div className="bg-zentry-card border border-zentry-border rounded-3xl p-5 space-y-4">
      <h2 className="text-sm font-black text-zentry-text-1">Equipo ({project.members.length})</h2>
      {isOwner && (
        <form onSubmit={invite} className="flex gap-2">
          <input value={handle} onChange={e => setHandle(e.target.value)} placeholder="@usuario o email del colaborador"
            className="flex-1 bg-zentry-bg border border-zentry-border rounded-xl px-3 py-2 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent" />
          <button type="submit" disabled={inviting || !handle.trim()} className="px-4 py-2 rounded-xl bg-zentry-accent text-white text-xs font-black flex items-center gap-1.5 disabled:opacity-40 cursor-pointer">
            {inviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />} Agregar
          </button>
        </form>
      )}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {project.members.map(m => (
          <li key={m.id} className="flex items-center gap-3 p-3 rounded-2xl bg-zentry-bg border border-zentry-border">
            <Link href={`/profile/${m.handle}`}><UserAvatar name={m.name} avatarUrl={m.avatarUrl} cosmetics={m.cosmetics} size={40} /></Link>
            <div className="min-w-0 flex-1">
              <Link href={`/profile/${m.handle}`} className="text-sm font-bold text-zentry-text-1 truncate block hover:text-zentry-accent">{m.name}</Link>
              <p className="text-[11px] text-zentry-text-2 flex items-center gap-1">@{m.handle} · {m.isOwner ? <><Crown className="w-3 h-3 text-amber-400" /> Líder</> : "Colaborador"}</p>
            </div>
            {isOwner && !m.isOwner && (
              <button onClick={() => kick(m)} aria-label={`Quitar a ${m.handle}`} className="p-1.5 rounded-lg text-zentry-text-2 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"><X className="w-4 h-4" /></button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
