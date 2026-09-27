"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  BookOpen, Plus, ChevronUp, ChevronDown, Trash2, Loader2, CheckCircle2, PenLine, Eye, ChevronLeft, ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import type { ProjectChapter } from "@/types"
import { addChapterAction, deleteChapterAction, getChaptersAction, updateChapterAction } from "@/lib/actions/projects"
import { cn, timeAgo } from "@/lib/utils"

type SaveState = "idle" | "saving" | "saved" | "error"

/** Libro por capítulos, estilo Wattpad: índice, editor con autoguardado y modo lectura. */
export default function BookWorkspace({ projectId, canEdit, onCountChange }: {
  projectId: string
  canEdit: boolean
  onCountChange?: (count: number) => void
}) {
  const [chapters, setChapters] = useState<ProjectChapter[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [mode, setMode] = useState<"read" | "edit">(canEdit ? "edit" : "read")
  const [draftTitle, setDraftTitle] = useState("")
  const [draftContent, setDraftContent] = useState("")
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    getChaptersAction(projectId).then(res => {
      setChapters(res.data)
      setActiveId(res.data[0]?.id ?? null)
      setLoading(false)
    })
  }, [projectId])

  useEffect(() => { onCountChange?.(chapters.length) }, [chapters.length, onCountChange])

  const active = chapters.find(c => c.id === activeId) || null
  const activeIndex = active ? chapters.findIndex(c => c.id === active.id) : -1

  // Cargar el capítulo en el editor al cambiar de capítulo
  useEffect(() => {
    setDraftTitle(active?.title ?? "")
    setDraftContent(active?.content ?? "")
    setSaveState("idle")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  const save = useCallback(async (title: string, content: string) => {
    if (!activeId) return
    setSaveState("saving")
    const res = await updateChapterAction(projectId, activeId, { title, content })
    if (!res.success || !res.data) { setSaveState("error"); return }
    setChapters(prev => prev.map(c => c.id === res.data!.id ? res.data! : c))
    setSaveState("saved")
  }, [projectId, activeId])

  // Autoguardado 1.2 s después de dejar de escribir
  const scheduleSave = (title: string, content: string) => {
    setSaveState("saving")
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => save(title, content), 1200)
  }
  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current) }, [])

  const addChapter = async () => {
    const res = await addChapterAction(projectId, { title: `Capítulo ${chapters.length + 1}`, content: "" })
    if (!res.success || !res.data) { toast.error(res.error); return }
    setChapters(prev => [...prev, res.data!])
    setActiveId(res.data.id)
    setMode("edit")
  }

  const moveChapter = async (chapter: ProjectChapter, delta: -1 | 1) => {
    const position = chapter.position + delta
    if (position < 1 || position > chapters.length) return
    const res = await updateChapterAction(projectId, chapter.id, { position })
    if (!res.success) { toast.error(res.error); return }
    const refreshed = await getChaptersAction(projectId)
    setChapters(refreshed.data)
  }

  const removeChapter = async (chapter: ProjectChapter) => {
    if (!window.confirm(`¿Eliminar "${chapter.title}"? No se puede deshacer.`)) return
    const res = await deleteChapterAction(projectId, chapter.id)
    if (!res.success) { toast.error(res.error); return }
    const refreshed = await getChaptersAction(projectId)
    setChapters(refreshed.data)
    if (activeId === chapter.id) setActiveId(refreshed.data[0]?.id ?? null)
  }

  const totalWords = chapters.reduce((a, c) => a + (c.wordCount || 0), 0)
  const draftWords = draftContent.trim() ? draftContent.trim().split(/\s+/).length : 0

  if (loading) return <div className="py-16 flex justify-center text-zentry-text-2"><Loader2 className="w-6 h-6 animate-spin" /></div>

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
      {/* Índice */}
      <aside className="bg-zentry-card border border-zentry-border rounded-3xl p-3 space-y-2 h-fit lg:sticky lg:top-4">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-black text-zentry-text-1 flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-amber-400" /> Capítulos</p>
          <span className="text-[10px] text-zentry-text-2">{totalWords.toLocaleString()} palabras</span>
        </div>
        <ol className="space-y-1 max-h-[50dvh] overflow-y-auto custom-scrollbar">
          {chapters.map((c, i) => (
            <li key={c.id} className={cn("group rounded-xl border flex items-center gap-1 pr-1",
              c.id === activeId ? "border-zentry-accent bg-zentry-accent/10" : "border-transparent hover:bg-zentry-bg")}>
              <button onClick={() => setActiveId(c.id)} className="flex-1 min-w-0 text-left px-2.5 py-2 cursor-pointer">
                <span className="block text-[10px] text-zentry-text-2">Capítulo {i + 1}</span>
                <span className="block text-xs font-bold text-zentry-text-1 truncate">{c.title}</span>
              </button>
              {canEdit && (
                <span className="flex flex-col opacity-60 group-hover:opacity-100">
                  <button onClick={() => moveChapter(c, -1)} disabled={i === 0} aria-label="Subir capítulo" className="p-0.5 disabled:opacity-20 cursor-pointer"><ChevronUp className="w-3 h-3" /></button>
                  <button onClick={() => moveChapter(c, 1)} disabled={i === chapters.length - 1} aria-label="Bajar capítulo" className="p-0.5 disabled:opacity-20 cursor-pointer"><ChevronDown className="w-3 h-3" /></button>
                </span>
              )}
            </li>
          ))}
        </ol>
        {chapters.length === 0 && <p className="text-[11px] text-zentry-text-2 px-1">Aún no hay capítulos.</p>}
        {canEdit && (
          <button onClick={addChapter} className="w-full py-2 rounded-xl text-xs font-black bg-zentry-accent text-white flex items-center justify-center gap-1.5 cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Nuevo capítulo
          </button>
        )}
      </aside>

      {/* Editor / lector */}
      <section className="bg-zentry-card border border-zentry-border rounded-3xl min-h-[60dvh] flex flex-col">
        {!active ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 text-zentry-text-2">
            <BookOpen className="w-12 h-12 opacity-30" />
            <p className="text-sm font-bold text-zentry-text-1 mt-3">{canEdit ? "Empieza tu historia" : "Este libro aún no tiene capítulos"}</p>
            {canEdit && <button onClick={addChapter} className="mt-3 px-4 py-2 rounded-xl bg-zentry-accent text-white text-xs font-black cursor-pointer">Escribir el primer capítulo</button>}
          </div>
        ) : (
          <>
            <div className="px-4 sm:px-6 py-3 border-b border-zentry-border flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-zentry-text-2">
                Capítulo {activeIndex + 1} de {chapters.length}
                {active.lastEditedBy && ` · editado por @${active.lastEditedBy} ${timeAgo(active.updatedAt)}`}
              </span>
              <div className="flex items-center gap-2">
                {mode === "edit" && (
                  <span className={cn("text-[11px] font-bold flex items-center gap-1",
                    saveState === "error" ? "text-red-400" : saveState === "saving" ? "text-zentry-text-2" : "text-emerald-400")}>
                    {saveState === "saving" && <><Loader2 className="w-3 h-3 animate-spin" /> Guardando…</>}
                    {saveState === "saved" && <><CheckCircle2 className="w-3 h-3" /> Guardado</>}
                    {saveState === "error" && "No se pudo guardar"}
                  </span>
                )}
                {canEdit && (
                  <div className="flex bg-zentry-bg rounded-xl p-0.5 border border-zentry-border">
                    <button onClick={() => setMode("edit")} className={cn("px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer", mode === "edit" ? "bg-zentry-card text-zentry-text-1" : "text-zentry-text-2")}><PenLine className="w-3 h-3" /> Escribir</button>
                    <button onClick={() => setMode("read")} className={cn("px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer", mode === "read" ? "bg-zentry-card text-zentry-text-1" : "text-zentry-text-2")}><Eye className="w-3 h-3" /> Leer</button>
                  </div>
                )}
                {canEdit && (
                  <button onClick={() => removeChapter(active)} aria-label="Eliminar capítulo" className="p-1.5 rounded-lg text-zentry-text-2 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
            </div>

            {mode === "edit" && canEdit ? (
              <div className="flex-1 flex flex-col p-4 sm:p-8 gap-3">
                <input
                  value={draftTitle}
                  onChange={e => { setDraftTitle(e.target.value); scheduleSave(e.target.value, draftContent) }}
                  placeholder="Título del capítulo"
                  maxLength={200}
                  className="w-full bg-transparent text-xl sm:text-2xl font-black text-zentry-text-1 focus:outline-none"
                />
                <textarea
                  value={draftContent}
                  onChange={e => { setDraftContent(e.target.value); scheduleSave(draftTitle, e.target.value) }}
                  placeholder="Había una vez…"
                  className="flex-1 min-h-[45dvh] w-full bg-transparent text-[15px] leading-8 text-zentry-text-1 font-serif focus:outline-none resize-none"
                />
                <p className="text-[11px] text-zentry-text-2 text-right">{draftWords.toLocaleString()} palabras</p>
              </div>
            ) : (
              <article className="flex-1 p-5 sm:p-10 max-w-2xl mx-auto w-full">
                <h2 className="text-2xl sm:text-3xl font-black text-zentry-text-1 mb-6 text-center">{active.title}</h2>
                <div className="text-[16px] leading-8 text-zentry-text-1 font-serif whitespace-pre-line">
                  {active.content || <span className="text-zentry-text-2 italic">Capítulo vacío.</span>}
                </div>
              </article>
            )}

            <div className="px-4 sm:px-6 py-3 border-t border-zentry-border flex justify-between">
              <button disabled={activeIndex <= 0} onClick={() => setActiveId(chapters[activeIndex - 1].id)}
                className="text-xs font-bold text-zentry-text-2 hover:text-zentry-text-1 disabled:opacity-30 flex items-center gap-1 cursor-pointer"><ChevronLeft className="w-4 h-4" /> Anterior</button>
              <button disabled={activeIndex >= chapters.length - 1} onClick={() => setActiveId(chapters[activeIndex + 1].id)}
                className="text-xs font-bold text-zentry-text-2 hover:text-zentry-text-1 disabled:opacity-30 flex items-center gap-1 cursor-pointer">Siguiente <ChevronRight className="w-4 h-4" /></button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
