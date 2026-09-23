"use client"

import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { fetchAPI } from '@/lib/api'

export default function PresencePing() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const sendOnlinePing = async () => {
      try {
        await fetchAPI('/api/core/friends/presence/ping?status=online', { method: 'POST' })
      } catch {
        // Silent
      }
    }

    const sendOfflinePing = () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          navigator.sendBeacon(`${apiUrl}/api/core/friends/presence/ping?status=offline`)
        } else {
          fetch(`${apiUrl}/api/core/friends/presence/ping?status=offline`, {
            method: 'POST',
            keepalive: true
          }).catch(() => {})
        }
      } catch {
        // Silent
      }
    }

    sendOnlinePing()
    const interval = setInterval(sendOnlinePing, 30000) // Pings cada 30 segundos

    const handleVisibilityOrUnload = () => {
      if (document.visibilityState === 'hidden') {
        sendOfflinePing()
      } else if (document.visibilityState === 'visible') {
        sendOnlinePing()
      }
    }

    window.addEventListener('beforeunload', sendOfflinePing)
    window.addEventListener('pagehide', sendOfflinePing)
    document.addEventListener('visibilitychange', handleVisibilityOrUnload)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', sendOfflinePing)
      window.removeEventListener('pagehide', sendOfflinePing)
      document.removeEventListener('visibilitychange', handleVisibilityOrUnload)
      sendOfflinePing()
    }
  }, [user])

  return null
}
