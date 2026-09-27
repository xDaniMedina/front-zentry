"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs"
import SockJS from "sockjs-client"

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "")

type Handler = (body: unknown) => void

/**
 * Conexión STOMP autenticada y genérica: permite suscribirse a cualquier destino y publicar.
 * Las suscripciones hechas antes de conectar (o que se pierden al reconectar) se rehacen solas.
 * El JWT se pide a /api/auth/ws-token (lee la cookie HTTP-Only en el servidor) y no se persiste.
 */
export function useStomp(enabled: boolean) {
  const clientRef = useRef<Client | null>(null)
  const handlersRef = useRef(new Map<string, Set<Handler>>())
  const subsRef = useRef(new Map<string, StompSubscription>())
  const [connected, setConnected] = useState(false)

  const attach = useCallback((destination: string) => {
    const client = clientRef.current
    if (!client?.connected || subsRef.current.has(destination)) return
    const sub = client.subscribe(destination, (frame: IMessage) => {
      let body: unknown = frame.body
      try { body = JSON.parse(frame.body) } catch { /* texto plano */ }
      handlersRef.current.get(destination)?.forEach(h => h(body))
    })
    subsRef.current.set(destination, sub)
  }, [])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    const handlers = handlersRef.current
    const subs = subsRef.current

    ;(async () => {
      try {
        const res = await fetch("/api/auth/ws-token")
        if (!res.ok || cancelled) return
        const { token } = await res.json()
        if (!token || cancelled) return

        const client = new Client({
          webSocketFactory: () => new SockJS(`${BACKEND_URL}/ws`),
          connectHeaders: { Authorization: `Bearer ${token}` },
          reconnectDelay: 4000,
          onConnect: () => {
            subs.clear()
            handlers.forEach((_, dest) => attach(dest))
            setConnected(true)
          },
          onDisconnect: () => setConnected(false),
          onWebSocketClose: () => setConnected(false),
          onStompError: () => setConnected(false),
        })
        clientRef.current = client
        client.activate()
      } catch {
        // sin tiempo real; la app sigue funcionando por REST
      }
    })()

    return () => {
      cancelled = true
      setConnected(false)
      subs.forEach(s => { try { s.unsubscribe() } catch { /* ya cerrada */ } })
      subs.clear()
      clientRef.current?.deactivate()
      clientRef.current = null
    }
  }, [enabled, attach])

  const subscribe = useCallback((destination: string, handler: Handler) => {
    const set = handlersRef.current.get(destination) ?? new Set<Handler>()
    set.add(handler)
    handlersRef.current.set(destination, set)
    attach(destination)
    return () => {
      set.delete(handler)
      if (set.size === 0) {
        handlersRef.current.delete(destination)
        subsRef.current.get(destination)?.unsubscribe()
        subsRef.current.delete(destination)
      }
    }
  }, [attach])

  const publish = useCallback((destination: string, body: unknown) => {
    const client = clientRef.current
    if (!client?.connected) return false
    client.publish({ destination, body: JSON.stringify(body) })
    return true
  }, [])

  return { connected, subscribe, publish }
}
