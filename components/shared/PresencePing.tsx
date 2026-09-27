"use client"

import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

const PING_MS = 25_000

/**
 * Mantiene al usuario "en línea" mientras tenga Zentry abierto (aunque cambie de pestaña).
 * - Ping cada 25 s y al volver a la pestaña; el backend considera en línea 90 s tras el último.
 * - "Desconectado" solo al cerrar/abandonar la página (no al cambiar de pestaña).
 * Todo pasa por /api/presence para que el JWT de la cookie HTTP-Only viaje al backend.
 */
export default function PresencePing() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const ping = (status: 'online' | 'offline') => {
      const url = `/api/presence?status=${status}`
      if (status === 'offline' && navigator.sendBeacon) {
        navigator.sendBeacon(url)
        return
      }
      fetch(url, { method: 'POST', keepalive: true }).catch(() => {})
    }

    ping('online')
    const interval = setInterval(() => ping('online'), PING_MS)
    const onVisible = () => { if (document.visibilityState === 'visible') ping('online') }
    const onLeave = () => ping('offline')

    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    window.addEventListener('pagehide', onLeave)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
      window.removeEventListener('pagehide', onLeave)
    }
  }, [user])

  return null
}
