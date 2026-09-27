"use client"

import { useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { getMyProfileAction } from "@/lib/actions/profile"
import { updateNotificationPrefsAction, NotificationPrefs } from "@/lib/actions/settings"

const ITEMS: { key: keyof NotificationPrefs; title: string; desc: string }[] = [
  { key: 'notifyReactions', title: 'Me gusta y reacciones', desc: 'Cuando alguien reacciona a tus obras o comentarios' },
  { key: 'notifyComments', title: 'Comentarios', desc: 'Cuando alguien comenta tus publicaciones' },
  { key: 'notifyMessages', title: 'Mensajes directos', desc: 'Cuando recibes un mensaje nuevo' },
  { key: 'notifyStories', title: 'Historias', desc: 'Reacciones y respuestas a tus historias' },
]

/**
 * Preferencias de notificación guardadas en el perfil del backend: lo desactivado aquí
 * deja de generarse (no solo de mostrarse). Lo usan Ajustes (barra derecha) y /settings.
 */
export default function NotificationPrefsPanel() {
  const { data: profileRes, isLoading, mutate } = useSWR('myProfile', getMyProfileAction)
  const profile = profileRes?.success ? profileRes.data : null
  const [overrides, setOverrides] = useState<Partial<NotificationPrefs>>({})

  const valueOf = (key: keyof NotificationPrefs) => overrides[key] ?? profile?.[key] !== false

  const toggle = async (key: keyof NotificationPrefs) => {
    const next = !valueOf(key)
    setOverrides(prev => ({ ...prev, [key]: next }))
    const res = await updateNotificationPrefsAction({ [key]: next })
    if (!res.success) {
      setOverrides(prev => ({ ...prev, [key]: !next }))
      toast.error(res.message || "No se pudo guardar tu preferencia")
      return
    }
    mutate()
  }

  return (
    <div className="space-y-4">
      {ITEMS.map(item => {
        const on = valueOf(item.key)
        return (
          <div key={item.key} className="p-4 bg-zentry-bg rounded-2xl border border-zentry-border flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h4 className="font-extrabold text-sm text-zentry-text-1">{item.title}</h4>
              <p className="text-xs text-zentry-text-2">{item.desc}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={on}
              aria-label={item.title}
              disabled={isLoading}
              onClick={() => toggle(item.key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 disabled:opacity-50 ${on ? 'bg-zentry-accent' : 'bg-zentry-border'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        )
      })}
      <p className="text-[11px] text-zentry-text-2">Seguidores, solicitudes de amistad, recompensas y logros siempre se notifican.</p>
    </div>
  )
}
