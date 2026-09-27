"use client"

import useSWR from "swr"
import { Volume2 } from "lucide-react"
import { getVoiceParticipantsAction } from "@/lib/actions/projects"
import UserAvatar from "@/components/shared/UserAvatar"

/** "🔊 N en llamada" con las fotos de quienes están en la sala de voz del proyecto ahora mismo. */
export default function VoicePresenceBadge({ projectId, onJoin }: { projectId: string; onJoin?: () => void }) {
  const { data = [] } = useSWR(["voice", projectId], () => getVoiceParticipantsAction(projectId), { refreshInterval: 10000 })
  if (data.length === 0) return null
  const names = data.map(p => `@${p.username}`).join(", ")
  return (
    <button
      onClick={onJoin}
      title={`En llamada: ${names}`}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[11px] font-black cursor-pointer hover:bg-emerald-500/25"
    >
      <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" /></span>
      <Volume2 className="w-3.5 h-3.5" />
      <span className="flex -space-x-2">
        {data.slice(0, 4).map(p => <UserAvatar key={p.userId} name={p.username} avatarUrl={p.avatarUrl} size={20} showPet={false} className="ring-2 ring-zentry-card rounded-full" />)}
      </span>
      {data.length} en llamada
    </button>
  )
}
