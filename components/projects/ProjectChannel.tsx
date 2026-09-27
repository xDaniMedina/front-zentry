"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Hash, Send, Loader2, Mic, MicOff, PhoneOff, Volume2, Headphones, Wifi, WifiOff } from "lucide-react"
import { toast } from "sonner"
import type { Message, ProjectMember } from "@/types"
import { getProjectChatAction } from "@/lib/actions/projects"
import { getConversationMessages, sendMessageAction } from "@/lib/actions/messages"
import { useStomp } from "@/lib/hooks/useStomp"
import { useVoiceChannel } from "@/lib/hooks/useVoiceChannel"
import UserAvatar from "@/components/shared/UserAvatar"
import { cn, timeAgo } from "@/lib/utils"

/**
 * Canal del proyecto al estilo Discord: chat de texto del equipo + canal de voz.
 * Solo los miembros del proyecto pueden escribir y unirse (lo valida el backend).
 */
export default function ProjectChannel({ projectId, projectTitle, members, myUserId }: {
  projectId: string
  projectTitle: string
  members: ProjectMember[]
  myUserId?: number
}) {
  const stomp = useStomp(true)
  const { connected, subscribe } = stomp
  const voice = useVoiceChannel(projectId, myUserId, stomp)

  const [conversationId, setConversationId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const byUserId = useMemo(() => new Map(members.filter(m => m.userId).map(m => [m.userId!, m])), [members])

  useEffect(() => {
    let alive = true
    getProjectChatAction(projectId).then(async res => {
      if (!alive) return
      if (!res.success || !res.conversationId) { setLoading(false); return }
      setConversationId(res.conversationId)
      const msgs = await getConversationMessages(res.conversationId)
      if (alive) { setMessages(msgs.data); setLoading(false) }
    })
    return () => { alive = false }
  }, [projectId])

  // Mensajes nuevos en tiempo real
  useEffect(() => {
    if (!conversationId || !connected) return
    return subscribe(`/topic/conversations/${conversationId}`, (body) => {
      const msg = body as Message
      if (!msg?.id) return
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev.filter(m => !(m.pending && m.content === msg.content && m.senderId === msg.senderId)), msg])
    })
  }, [conversationId, connected, subscribe])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }) }, [messages.length])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = text.trim()
    if (!content || !conversationId || myUserId == null) return
    setText("")
    const temp: Message = { id: -Date.now(), conversationId, senderId: myUserId, content, createdAt: new Date().toISOString(), pending: true }
    setMessages(prev => [...prev, temp])
    setSending(true)
    const res = await sendMessageAction(conversationId, content)
    setSending(false)
    if (!res.success || !res.data) {
      setMessages(prev => prev.filter(m => m.id !== temp.id))
      setText(content)
      toast.error(res.error || "No se pudo enviar")
      return
    }
    setMessages(prev => prev.some(m => m.id === res.data!.id) ? prev.filter(m => m.id !== temp.id) : prev.map(m => m.id === temp.id ? res.data! : m))
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-4">
      {/* Chat de texto */}
      <section className="bg-zentry-card border border-zentry-border rounded-3xl flex flex-col h-[70dvh] min-h-[420px]">
        <header className="px-4 py-3 border-b border-zentry-border flex items-center justify-between">
          <p className="text-sm font-black text-zentry-text-1 flex items-center gap-1.5 truncate"><Hash className="w-4 h-4 text-zentry-accent" /> chat-{projectTitle.toLowerCase().replace(/\s+/g, "-").slice(0, 30)}</p>
          <span className={cn("text-[10px] font-bold flex items-center gap-1", connected ? "text-emerald-400" : "text-zentry-text-2")}>
            {connected ? <><Wifi className="w-3 h-3" /> En vivo</> : <><WifiOff className="w-3 h-3" /> Conectando…</>}
          </span>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center text-zentry-text-2"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : !conversationId ? (
            <p className="text-center text-xs text-zentry-text-2 mt-10">El chat es solo para los miembros del proyecto.</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-xs text-zentry-text-2 mt-10">Este es el inicio del canal del proyecto. ¡Saluda a tu equipo! 👋</p>
          ) : messages.map((m, i) => {
            const author = byUserId.get(m.senderId)
            const grouped = i > 0 && messages[i - 1].senderId === m.senderId
            const name = author?.handle ?? (m.senderId === myUserId ? "tú" : `usuario ${m.senderId}`)
            return (
              <div key={m.id} className={cn("flex gap-3", grouped && "-mt-2", m.pending && "opacity-60")}>
                <div className="w-9 shrink-0">
                  {!grouped && <UserAvatar name={name} avatarUrl={author?.avatarUrl} cosmetics={author?.cosmetics} size={36} showPet={false} />}
                </div>
                <div className="min-w-0">
                  {!grouped && (
                    <p className="text-xs"><span className="font-extrabold text-zentry-text-1">@{name}</span> <span className="text-[10px] text-zentry-text-2">{timeAgo(m.createdAt)}</span></p>
                  )}
                  <p className="text-sm text-zentry-text-1 whitespace-pre-wrap break-words">{m.content}</p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
        {conversationId && (
          <form onSubmit={send} className="p-3 border-t border-zentry-border flex gap-2">
            <input value={text} onChange={e => setText(e.target.value)} placeholder="Escribe al equipo…" maxLength={2000}
              className="flex-1 bg-zentry-bg border border-zentry-border rounded-2xl px-4 py-2.5 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent" />
            <button type="submit" disabled={!text.trim() || sending} aria-label="Enviar"
              className="p-3 rounded-2xl bg-zentry-accent text-white disabled:opacity-40 cursor-pointer"><Send className="w-4 h-4" /></button>
          </form>
        )}
      </section>

      {/* Canal de voz */}
      <aside className="bg-zentry-card border border-zentry-border rounded-3xl p-4 space-y-4 h-fit">
        <div className="flex items-center justify-between">
          <p className="text-sm font-black text-zentry-text-1 flex items-center gap-1.5"><Volume2 className="w-4 h-4 text-emerald-400" /> Sala de voz</p>
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", voice.participants.length ? "bg-emerald-500/15 text-emerald-300" : "text-zentry-text-2")}>
            {voice.participants.length ? `${voice.participants.length} en llamada ahora` : "Vacía"}
          </span>
        </div>

        <ul className="space-y-2 min-h-[3rem]">
          {voice.participants.length === 0 && <li className="text-[11px] text-zentry-text-2">Nadie en la sala todavía.</li>}
          {voice.participants.map(p => {
            const isSpeaking = voice.speaking.has(p.userId)
            const member = byUserId.get(p.userId)
            return (
              <li key={p.userId} className="flex items-center gap-2.5">
                <span className={cn("rounded-full transition-shadow", isSpeaking && "shadow-[0_0_0_3px_rgba(16,185,129,0.8)]")}>
                  <UserAvatar name={p.username} avatarUrl={p.avatarUrl} cosmetics={member?.cosmetics} size={32} showPet={false} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-zentry-text-1 truncate">@{p.username}{p.userId === myUserId && " (tú)"}</span>
                  <span className={cn("block text-[10px]", isSpeaking ? "text-emerald-400" : "text-zentry-text-2")}>
                    {p.muted ? "Silenciado" : isSpeaking ? "Hablando…" : "En llamada"}
                  </span>
                </span>
                {p.muted ? <MicOff className="w-3.5 h-3.5 text-red-400" aria-label="Silenciado" /> : <Mic className={cn("w-3.5 h-3.5", isSpeaking ? "text-emerald-400" : "text-zentry-text-2")} />}
              </li>
            )
          })}
        </ul>

        {voice.error && <p className="text-[11px] text-red-400">{voice.error}</p>}

        {!voice.joined ? (
          <button onClick={voice.join} disabled={!connected}
            className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer">
            <Headphones className="w-4 h-4" /> Unirse a la voz
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={voice.toggleMute}
              className={cn("flex-1 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer",
                voice.muted ? "bg-red-500/15 text-red-400 border border-red-500/30" : "bg-zentry-bg border border-zentry-border text-zentry-text-1")}>
              {voice.muted ? <><MicOff className="w-4 h-4" /> Activar</> : <><Mic className="w-4 h-4" /> Silenciar</>}
            </button>
            <button onClick={voice.leave} aria-label="Salir de la voz"
              className="px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white cursor-pointer"><PhoneOff className="w-4 h-4" /></button>
          </div>
        )}
        <p className="text-[10px] text-zentry-text-2 leading-relaxed">El audio va directo entre los miembros conectados. Solo el equipo del proyecto puede entrar.</p>
      </aside>
    </div>
  )
}
