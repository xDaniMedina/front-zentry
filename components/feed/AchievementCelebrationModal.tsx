"use client"

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Coins, Award } from 'lucide-react'

interface AchievementCelebrationModalProps {
  isOpen: boolean
  onClose: () => void
  achievementName?: string
  description?: string
  rewardCoins?: number
  icon?: string
}

export default function AchievementCelebrationModal({
  isOpen,
  onClose,
  achievementName = "¡Pionero de Zentry!",
  description = "Has completado tu perfil y te has unido a la red de creadores.",
  rewardCoins = 100,
  icon = "🏆"
}: AchievementCelebrationModalProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!isOpen || !mounted) return null

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-label={`Logro desbloqueado: ${achievementName}`}
      >
        
        {/* Glow de Fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(500px,90vw)] h-[min(500px,90vw)] bg-amber-500/20 blur-[130px] rounded-full pointer-events-none animate-pulse" />

        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 18, stiffness: 200 }}
          className="relative w-full max-w-md bg-gradient-to-b from-[#1c1c24] to-[#0d0d12] border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden"
        >
          {/* Botón Cerrar */}
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Insignia Principal Animada */}
          <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 mb-6 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400/40"
            />
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-xl shadow-amber-500/30">
              <div className="w-full h-full rounded-full bg-[#121218] flex items-center justify-center text-4xl sm:text-5xl shadow-inner">
                {icon}
              </div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-1 -right-1 bg-amber-400 text-black p-1.5 rounded-full shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-wider mb-3">
            <Award className="w-3.5 h-3.5" /> Logro Desbloqueado
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            {achievementName}
          </h2>

          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            {description}
          </p>

          {/* Recompensa */}
          {rewardCoins > 0 && (
            <div className="flex items-center justify-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 mb-6">
              <Coins className="w-6 h-6 text-amber-400 animate-bounce" />
              <div className="text-left">
                <span className="block text-[10px] uppercase font-bold text-amber-400/80">Recompensa</span>
                <span className="text-lg font-black text-amber-300 font-mono">+{rewardCoins} Zentry Coins</span>
                <span className="block text-[10px] text-amber-200/70">Ya se añadieron a tu billetera</span>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-black font-black py-4 rounded-2xl text-sm transition-all shadow-lg shadow-amber-500/25 active:scale-95"
          >
            ¡Genial, continuar! 🚀
          </button>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  )
}
