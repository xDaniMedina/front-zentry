"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { X, Loader2, Check, ShieldCheck, ShieldOff, UserMinus, Crown, Clock } from "lucide-react"
import { toast } from "sonner"
import { getCommunityMembersAction, manageCommunityMemberAction, type CommunityMemberDTO, type CommunityDTO } from "@/lib/actions/communities"
import UserAvatar from "@/components/shared/UserAvatar"

/** Miembros del grupo. Los administradores aprueban solicitudes, nombran admins y expulsan miembros. */
export default function CommunityMembersModal({ identifier, isAdmin, onClose, onCommunityChange }: {
  identifier: string
  isAdmin: boolean
  onClose: () => void
  onCommunityChange?: (c: CommunityDTO) => void
}) {
  const [members, setMembers] = useState<CommunityMemberDTO[] | null>(null)
  const [busy, setBusy] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    getCommunityMembersAction(identifier).then(res => setMembers(res.data))
  }, [identifier])

  const act = async (m: CommunityMemberDTO, action: "approve" | "reject" | "promote" | "demote" | "remove") => {
    if ((action === "remove" || action === "reject") && !window.confirm(action === "remove" ? `¿Expulsar a @${m.username}?` : `¿Rechazar la solicitud de @${m.username}?`)) return
    setBusy(m.userId)
    const res = await manageCommunityMemberAction(identifier, m.userId, action)
    setBusy(null)
    if (!res.success) { toast.error(res.error); return }
    if (res.data) onCommunityChange?.(res.data)
    setMembers(prev => (prev || []).flatMap(x => {
      if (x.userId !== m.userId) return [x]
      if (action === "reject" || action === "remove") return []
      return [{ ...x, role: action === "promote" ? "ADMIN" : "MEMBER" }]
    }))
  }

  if (!mounted) return null
  const pending = (members || []).filter(m => m.role === "PENDING")
  const active = (members || []).filter(m => m.role !== "PENDING")

  return createPortal(
    <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Miembros del grupo"
        className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-lg max-h-[88dvh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-zentry-border flex items-center justify-between">
          <h3 className="text-base font-black text-zentry-text-1">Miembros ({active.length})</h3>
          <button onClick={onClose} aria-label="Cerrar" className="p-1.5 rounded-xl text-zentry-text-2 hover:bg-zentry-bg cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
          {members === null ? (
            <div className="py-10 flex justify-center text-zentry-text-2"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : (
            <>
              {isAdmin && pending.length > 0 && (
                <section className="space-y-2">
                  <p className="text-xs font-black text-amber-300 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Solicitudes pendientes ({pending.length})</p>
                  {pending.map(m => (
                    <Row key={m.userId} m={m}>
                      <button disabled={busy === m.userId} onClick={() => act(m, "approve")} className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-black flex items-center gap-1 cursor-pointer disabled:opacity-50"><Check className="w-3 h-3" /> Aceptar</button>
                      <button disabled={busy === m.userId} onClick={() => act(m, "reject")} className="px-2.5 py-1.5 rounded-lg bg-zentry-bg border border-zentry-border text-zentry-text-2 text-[11px] font-bold cursor-pointer disabled:opacity-50">Rechazar</button>
                    </Row>
                  ))}
                </section>
              )}
              <section className="space-y-2">
                {active.map(m => (
                  <Row key={m.userId} m={m}>
                    {m.isOwner ? (
                      <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1"><Crown className="w-3 h-3" /> Creador</span>
                    ) : m.role === "ADMIN" ? (
                      <span className="text-[10px] font-bold text-zentry-accent flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Admin</span>
                    ) : null}
                    {isAdmin && !m.isOwner && (
                      <>
                        <button disabled={busy === m.userId} onClick={() => act(m, m.role === "ADMIN" ? "demote" : "promote")}
                          title={m.role === "ADMIN" ? "Quitar administrador" : "Hacer administrador"}
                          className="p-1.5 rounded-lg text-zentry-text-2 hover:text-zentry-accent hover:bg-zentry-bg cursor-pointer disabled:opacity-50">
                          {m.role === "ADMIN" ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </button>
                        <button disabled={busy === m.userId} onClick={() => act(m, "remove")} title="Expulsar"
                          className="p-1.5 rounded-lg text-zentry-text-2 hover:text-red-400 hover:bg-red-500/10 cursor-pointer disabled:opacity-50"><UserMinus className="w-4 h-4" /></button>
                      </>
                    )}
                  </Row>
                ))}
              </section>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

function Row({ m, children }: { m: CommunityMemberDTO; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-zentry-bg border border-zentry-border">
      <Link href={`/profile/${m.username}`}><UserAvatar name={m.name} avatarUrl={m.avatarUrl} cosmetics={m.cosmetics} size={36} /></Link>
      <div className="min-w-0 flex-1">
        <Link href={`/profile/${m.username}`} className="text-xs font-bold text-zentry-text-1 truncate block hover:text-zentry-accent">{m.name}</Link>
        <p className="text-[10px] text-zentry-text-2">@{m.username}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">{children}</div>
    </div>
  )
}
