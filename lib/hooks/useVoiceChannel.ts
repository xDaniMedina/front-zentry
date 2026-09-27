"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { getVoiceParticipantsAction, type VoiceParticipant } from "@/lib/actions/projects"

type Stomp = {
  connected: boolean
  subscribe: (destination: string, handler: (body: unknown) => void) => () => void
  publish: (destination: string, body: unknown) => boolean
}

type Signal = { type: "offer" | "answer" | "ice"; from: number; to?: number; data: unknown }

const ICE_SERVERS: RTCIceServer[] = [
  { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
]

/**
 * Canal de voz del proyecto (tipo Discord): WebRTC en malla entre los miembros conectados.
 * El servidor solo reenvía señales; el audio va directo navegador ↔ navegador.
 * Para evitar ofertas cruzadas, en cada pareja inicia la conexión el de menor userId.
 */
export function useVoiceChannel(projectId: string, myUserId: number | undefined, stomp: Stomp) {
  // Solo las funciones (estables) y el estado de conexión: el objeto stomp cambia en cada render
  const { connected, subscribe, publish } = stomp
  const [participants, setParticipants] = useState<VoiceParticipant[]>([])
  const [joined, setJoined] = useState(false)
  const [muted, setMuted] = useState(false)
  const [speaking, setSpeaking] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const localStream = useRef<MediaStream | null>(null)
  const peers = useRef(new Map<number, RTCPeerConnection>())
  const audioEls = useRef(new Map<number, HTMLAudioElement>())
  const analysers = useRef(new Map<number, AnalyserNode>())
  const audioCtx = useRef<AudioContext | null>(null)
  const joinedRef = useRef(false)

  const topic = `/topic/projects/${projectId}/voice`
  const sendTo = `/app/projects/${projectId}/voice`

  const watchVolume = useCallback((userId: number, stream: MediaStream) => {
    try {
      audioCtx.current ??= new AudioContext()
      const source = audioCtx.current.createMediaStreamSource(stream)
      const analyser = audioCtx.current.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)
      analysers.current.set(userId, analyser)
    } catch { /* sin indicador de voz */ }
  }, [])

  const closePeer = useCallback((userId: number) => {
    peers.current.get(userId)?.close()
    peers.current.delete(userId)
    const el = audioEls.current.get(userId)
    if (el) { el.srcObject = null; el.remove() }
    audioEls.current.delete(userId)
    analysers.current.delete(userId)
  }, [])

  const createPeer = useCallback((remoteId: number) => {
    const existing = peers.current.get(remoteId)
    if (existing) return existing
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
    localStream.current?.getTracks().forEach(t => pc.addTrack(t, localStream.current!))

    pc.onicecandidate = (e) => {
      if (e.candidate) publish(sendTo, { type: "ice", to: remoteId, data: e.candidate.toJSON() })
    }
    pc.ontrack = (e) => {
      const [stream] = e.streams
      if (!stream) return
      let el = audioEls.current.get(remoteId)
      if (!el) {
        el = document.createElement("audio")
        el.autoplay = true
        el.setAttribute("playsinline", "true")
        el.style.display = "none"
        document.body.appendChild(el)
        audioEls.current.set(remoteId, el)
      }
      el.srcObject = stream
      el.play().catch(() => { /* se reproducirá tras la siguiente interacción */ })
      watchVolume(remoteId, stream)
    }
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed") closePeer(remoteId)
    }
    peers.current.set(remoteId, pc)
    return pc
  }, [publish, sendTo, watchVolume, closePeer])

  // Lista de participantes (siempre, para ver quién está en el canal aunque no me haya unido)
  useEffect(() => {
    if (!connected) return
    const unsubscribe = subscribe(topic, (body) => {
      if (Array.isArray(body)) setParticipants(body as VoiceParticipant[])
    })
    // Quién ya está en la llamada (el topic solo avisa de entradas/salidas posteriores)
    getVoiceParticipantsAction(projectId).then(list => setParticipants(prev => (prev.length ? prev : list)))
    return unsubscribe
  }, [subscribe, connected, topic, projectId])

  // Señales dirigidas a mí
  useEffect(() => {
    if (!connected) return
    return subscribe("/user/queue/voice", async (body) => {
      const signal = body as Signal
      if (!joinedRef.current || !signal?.from) return
      try {
        if (signal.type === "offer") {
          const pc = createPeer(signal.from)
          await pc.setRemoteDescription(signal.data as RTCSessionDescriptionInit)
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          publish(sendTo, { type: "answer", to: signal.from, data: pc.localDescription })
        } else if (signal.type === "answer") {
          await peers.current.get(signal.from)?.setRemoteDescription(signal.data as RTCSessionDescriptionInit)
        } else if (signal.type === "ice") {
          await peers.current.get(signal.from)?.addIceCandidate(signal.data as RTCIceCandidateInit)
        }
      } catch {
        // señal fuera de orden: la conexión se reintenta con el siguiente cambio de participantes
      }
    })
  }, [subscribe, publish, connected, sendTo, createPeer])

  // Al cambiar la sala: conectar con los nuevos y cerrar con los que se fueron
  useEffect(() => {
    if (!joined || myUserId == null) return
    const present = new Set(participants.map(p => p.userId))
    peers.current.forEach((_, id) => { if (!present.has(id)) closePeer(id) })

    participants.forEach(async (p) => {
      if (p.userId === myUserId || peers.current.has(p.userId)) return
      if (myUserId > p.userId) return // el de menor id inicia
      const pc = createPeer(p.userId)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      publish(sendTo, { type: "offer", to: p.userId, data: pc.localDescription })
    })
  }, [participants, joined, myUserId, createPeer, closePeer, publish, sendTo])

  // Indicador de quién está hablando
  useEffect(() => {
    if (!joined) return
    const buf = new Uint8Array(256)
    const id = setInterval(() => {
      const next = new Set<number>()
      analysers.current.forEach((an, userId) => {
        an.getByteFrequencyData(buf)
        const avg = buf.reduce((a, b) => a + b, 0) / buf.length
        if (avg > 18) next.add(userId)
      })
      if (muted && myUserId != null) next.delete(myUserId)
      setSpeaking(prev => (prev.size === next.size && [...next].every(x => prev.has(x)) ? prev : next))
    }, 200)
    return () => clearInterval(id)
  }, [joined, muted, myUserId])

  const join = useCallback(async () => {
    setError(null)
    if (!connected) { setError("Sin conexión en tiempo real. Intenta de nuevo en unos segundos."); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
      localStream.current = stream
      if (myUserId != null) watchVolume(myUserId, stream)
      joinedRef.current = true
      setJoined(true)
      setMuted(false)
      publish(sendTo, { type: "join", muted: false })
    } catch {
      setError("No se pudo acceder al micrófono. Revisa los permisos del navegador.")
    }
  }, [publish, connected, sendTo, myUserId, watchVolume])

  const leave = useCallback(() => {
    if (joinedRef.current) publish(sendTo, { type: "leave" })
    joinedRef.current = false
    setJoined(false)
    peers.current.forEach((_, id) => closePeer(id))
    localStream.current?.getTracks().forEach(t => t.stop())
    localStream.current = null
    analysers.current.clear()
    audioCtx.current?.close().catch(() => {})
    audioCtx.current = null
    setSpeaking(new Set())
  }, [publish, sendTo, closePeer])

  const toggleMute = useCallback(() => {
    const next = !muted
    localStream.current?.getAudioTracks().forEach(t => { t.enabled = !next })
    setMuted(next)
    publish(sendTo, { type: "mute", muted: next })
  }, [muted, publish, sendTo])

  // Salir limpiamente al cerrar la página del proyecto
  useEffect(() => () => { if (joinedRef.current) leave() }, [leave])

  return { participants, joined, muted, speaking, error, join, leave, toggleMute }
}
