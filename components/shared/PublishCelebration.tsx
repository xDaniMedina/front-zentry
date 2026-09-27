"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Compass, FileText, Music, Sparkles, Video } from "lucide-react"
import Image from "next/image"

interface PublishCelebrationProps {
  open: boolean
  title?: string
  mediaType?: 'image' | 'video' | 'audio' | 'text' | string
  mediaUrl?: string | null
  actionLabel?: string
  onClose: () => void
}

const SPARKS = Array.from({ length: 14 }, (_, i) => i)

/** Ventana emergente de "¡Obra publicada!" con la animación del emblema de Zentry. */
export default function PublishCelebration({
  open,
  title,
  mediaType,
  mediaUrl,
  actionLabel = "Ver mi obra en el Feed",
  onClose,
}: PublishCelebrationProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="publish-celebration"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Obra publicada"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-b from-[#1c1836] via-[#121124] to-[#0c0a18] border border-purple-500/40 rounded-3xl w-full max-w-md p-6 sm:p-8 text-center shadow-[0_0_60px_rgba(168,85,247,0.35)] relative overflow-hidden"
          >
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />

            {/* Emblema de Zentry con destellos */}
            <div className="relative mx-auto w-24 h-24 mb-5 flex items-center justify-center">
              {SPARKS.map(i => (
                <motion.span
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-amber-300"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos((i / SPARKS.length) * Math.PI * 2) * 70,
                    y: Math.sin((i / SPARKS.length) * Math.PI * 2) * 70,
                    opacity: 0,
                    scale: 0.3,
                  }}
                  transition={{ duration: 1.1, delay: 0.2, ease: "easeOut" }}
                />
              ))}
              <motion.div
                animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.1, 0.6] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 blur-md"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-purple-400/50"
              />
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 p-0.5 shadow-2xl flex items-center justify-center relative z-10"
              >
                <div className="w-full h-full bg-[#131126] rounded-[14px] flex items-center justify-center">
                  <span className="text-3xl font-black bg-gradient-to-br from-amber-200 to-purple-300 bg-clip-text text-transparent">Z</span>
                </div>
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="absolute -bottom-1 -right-1 z-20 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#131126] shadow-md"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
              </motion.div>
            </div>

            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2"
            >
              ¡Obra publicada en Zentry!
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-xs sm:text-sm text-purple-200/80 mb-6 leading-relaxed"
            >
              Ya está visible en el Feed para toda la comunidad y guardada en tu <strong className="text-white">Estudio</strong>.
            </motion.p>

            {title && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="p-3 bg-white/5 rounded-2xl border border-white/10 mb-6 flex items-center gap-3 text-left"
              >
                <div className="relative w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center shrink-0 overflow-hidden text-purple-300">
                  {mediaType === 'video' ? (
                    <Video className="w-6 h-6 text-indigo-400" />
                  ) : mediaType === 'audio' ? (
                    <Music className="w-6 h-6 text-purple-400" />
                  ) : mediaUrl ? (
                    <Image src={mediaUrl} alt={title} fill sizes="48px" className="object-cover" />
                  ) : mediaType === 'text' ? (
                    <FileText className="w-6 h-6 text-pink-400" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-amber-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-xs text-white truncate">{title}</h4>
                  <p className="text-[11px] text-zinc-400 font-mono">Tipo: {(mediaType || "obra").toString().toUpperCase()}</p>
                </div>
              </motion.div>
            )}

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={onClose}
              autoFocus
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-purple-600/40 transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" /> {actionLabel}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
