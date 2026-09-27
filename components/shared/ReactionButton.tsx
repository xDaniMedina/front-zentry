"use client"

import { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { REACTIONS, reactionColorClass, reactionEmoji, reactionLabel, topReactions } from "@/lib/reactions"

interface ReactionButtonProps {
  /** Reacción actual del usuario (null = no reaccionó) */
  myReaction?: string | null
  /** Clic simple: quita la reacción actual o pone ❤️ */
  onToggle: () => void
  /** Elegir un emoji concreto del selector */
  onReact: (type: string) => void
  className?: string
}

/**
 * Botón de reacción estilo Facebook: clic = me gusta; mantener el cursor encima
 * (o pulsación larga en móvil) abre la barra flotante de reacciones.
 * El botón muestra el emoji y el nombre de la reacción elegida, con su color.
 */
export default function ReactionButton({ myReaction, onToggle, onReact, className }: ReactionButtonProps) {
  const [open, setOpen] = useState(false)
  const [burst, setBurst] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressed = useRef(false)

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }
  const openSoon = (delay: number) => {
    clearTimer()
    timer.current = setTimeout(() => {
      longPressed.current = true
      setOpen(true)
    }, delay)
  }
  const closeSoon = () => {
    clearTimer()
    timer.current = setTimeout(() => setOpen(false), 300)
  }
  const pop = (emoji: string) => {
    setBurst(emoji)
    setTimeout(() => setBurst(null), 700)
  }

  const reacted = Boolean(myReaction)

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => openSoon(400)}
      onMouseLeave={closeSoon}
    >
      {/* Barra flotante de reacciones */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 520, damping: 28 }}
            onMouseEnter={clearTimer}
            onMouseLeave={closeSoon}
            className="absolute bottom-full left-0 mb-2 z-50 flex items-center gap-1 px-2 py-1.5 rounded-full bg-zentry-card border border-zentry-border shadow-2xl"
            role="menu"
            aria-label="Elegir reacción"
          >
            {REACTIONS.map((r, i) => (
              <motion.button
                key={r.type}
                type="button"
                role="menuitem"
                aria-label={r.label}
                initial={{ opacity: 0, y: 8, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.035, type: "spring", stiffness: 500, damping: 22 }}
                whileHover={{ scale: 1.45, y: -6 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen(false)
                  if (myReaction !== r.type) pop(r.emoji)
                  onReact(r.type)
                }}
                className={cn(
                  "group relative w-9 h-9 flex items-center justify-center text-2xl rounded-full cursor-pointer",
                  myReaction === r.type && "bg-zentry-accent/20"
                )}
              >
                {r.emoji}
                <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  {r.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji que salta al reaccionar */}
      <AnimatePresence>
        {burst && (
          <motion.span
            key={burst}
            initial={{ opacity: 1, y: 0, scale: 0.6 }}
            animate={{ opacity: 0, y: -36, scale: 1.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="pointer-events-none absolute left-3 -top-2 text-2xl z-50"
          >
            {burst}
          </motion.span>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          clearTimer()
          if (longPressed.current) {
            // Tras una pulsación larga no se dispara también el clic
            longPressed.current = false
            return
          }
          setOpen(false)
          if (!reacted) pop("❤️")
          onToggle()
        }}
        onTouchStart={() => { longPressed.current = false; openSoon(380) }}
        onTouchEnd={clearTimer}
        onContextMenu={(e) => { e.preventDefault(); setOpen(true) }}
        aria-label={reacted ? `Quitar reacción (${reactionLabel(myReaction)})` : "Me gusta (mantén para más reacciones)"}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-90 select-none hover:bg-zentry-bg",
          reacted ? reactionColorClass(myReaction) : "text-zentry-text-2 hover:text-zentry-text-1"
        )}
      >
        {reacted ? (
          <motion.span
            key={myReaction}
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 15 }}
            className="text-base leading-none"
          >
            {reactionEmoji(myReaction)}
          </motion.span>
        ) : (
          <Heart className="w-4 h-4" />
        )}
        <span>{reacted ? reactionLabel(myReaction) : "Me gusta"}</span>
      </button>
    </div>
  )
}

/** Resumen tipo Facebook: iconos de las reacciones más usadas + "Tú y N más". */
export function ReactionSummary({ counts, total, myReaction, className }: {
  counts?: Record<string, number>
  total: number
  myReaction?: string | null
  className?: string
}) {
  if (!total) return null
  const top = topReactions(counts)
  const others = total - (myReaction ? 1 : 0)
  const text = myReaction
    ? (others > 0 ? `Tú y ${others} ${others === 1 ? 'persona más' : 'personas más'}` : 'Tú')
    : String(total)

  return (
    <div className={cn("flex items-center gap-1.5 text-[11px] text-zentry-text-2", className)}>
      <span className="flex -space-x-1">
        {(top.length ? top : ['like']).map(t => (
          <span key={t} className="w-[18px] h-[18px] rounded-full bg-zentry-card border border-zentry-border flex items-center justify-center text-[11px] leading-none">
            {reactionEmoji(t)}
          </span>
        ))}
      </span>
      <span className="font-semibold">{text}</span>
    </div>
  )
}
