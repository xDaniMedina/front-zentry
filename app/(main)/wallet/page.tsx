'use client'

import { useState } from 'react'
import { motion, Variants } from 'framer-motion'
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, Gift, 
  History, TrendingUp, Sparkles, Send, CreditCard,
  Target, Trophy, Zap, Flame, Medal, CheckCircle2
} from 'lucide-react'

// Mocks
const TRANSACTIONS = [
  { id: 1, type: 'income', title: 'Obra aprobada', desc: 'Serie Raíces', amount: '+50', date: 'Hoy, 10:30 AM', icon: Sparkles },
  { id: 2, type: 'income', title: 'Colaboración', desc: 'Con @pixelkid', amount: '+25', date: 'Ayer, 16:45 PM', icon: TrendingUp },
  { id: 3, type: 'expense', title: 'Retiro a cuenta', desc: 'Terminación ****4589', amount: '-100', date: '12 May, 09:00 AM', icon: ArrowDownLeft },
  { id: 4, type: 'income', title: 'Misión completada', desc: 'Publica tu primera obra', amount: '+30', date: '10 May, 12:00 PM', icon: Target },
  { id: 5, type: 'expense', title: 'Apoyo a artista', desc: 'Donación a @novabeats', amount: '-15', date: '08 May, 20:15 PM', icon: Send },
]

const MISSIONS = [
  { id: 1, title: 'Arte Diario', desc: 'Publica tu primera obra del día', progress: 0, total: 1, reward: '+15 ZC', type: 'Diaria', completed: false },
  { id: 2, title: 'Impacto Visual', desc: 'Recibe 50 likes en total', progress: 34, total: 50, reward: '+50 ZC', type: 'Semanal', completed: false },
  { id: 3, title: 'Sinergia', desc: 'Colabora con otro artista', progress: 1, total: 1, reward: '+100 ZC', type: 'Única', completed: true },
]

const ACHIEVEMENTS = [
  { id: 1, title: 'Pionero', desc: 'Usuario Beta', icon: Zap, unlocked: true, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { id: 2, title: 'Esteta', desc: '10 Obras 4.5+', icon: Sparkles, unlocked: true, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 3, title: 'Tribu', desc: 'Crea comunidad', icon: Medal, unlocked: true, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 4, title: 'Viral', desc: 'Llega a tendencias', icon: Flame, unlocked: false, color: 'text-zentry-text-2/50', bg: 'bg-zentry-bg' },
]

// Variantes de animación tipadas
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
}

export default function WalletPage() {
  const [activeFilter, setActiveFilter] = useState('all')

  const filteredTransactions = TRANSACTIONS.filter(t => {
    if (activeFilter === 'income') return t.type === 'income'
    if (activeFilter === 'expense') return t.type === 'expense'
    return true
  })

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-8 transition-colors duration-300 overflow-hidden pb-20 sm:pb-8"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="bg-zentry-card border-y sm:border border-zentry-border rounded-none sm:rounded-3xl p-6 sm:p-8 mb-4 sm:mb-8 overflow-hidden shadow-sm transition-colors duration-300">
        <h1 className="text-2xl sm:text-3xl font-bold text-zentry-text-1 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zentry-accent/20 flex items-center justify-center border border-zentry-accent/30">
            <Wallet className="w-5 h-5 text-zentry-accent" />
          </div>
          Mi Billetera
        </h1>
        <p className="text-zentry-text-2 mt-2">Gestiona tus Zentry Coins, completa misiones y colecciona logros.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-0">
        
        {/* ========================================== */}
        {/* COLUMNA IZQUIERDA: Balance, Misiones, Logros */}
        {/* ========================================== */}
        <div className="flex flex-col gap-4 sm:gap-6">
          
          {/* Tarjeta de Balance Principal */}
          <motion.div variants={fadeInUp} className="relative bg-zentry-card border border-zentry-border rounded-3xl p-6 sm:p-8 overflow-hidden shadow-sm transition-colors duration-300">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-zentry-accent/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <p className="text-sm font-semibold text-zentry-text-2 uppercase tracking-wider mb-2">
                  Balance Disponible
                </p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-5xl sm:text-6xl font-black text-zentry-text-1">285</h2>
                  <span className="text-2xl font-bold text-zentry-accent">ZC</span>
                </div>
                <div className="flex items-center gap-2 mt-4 text-sm">
                  <span className="flex items-center gap-1 text-green-500 bg-green-500/10 px-2 py-1 rounded-lg font-medium">
                    <ArrowUpRight className="w-4 h-4" /> +105 ZC
                  </span>
                  <span className="text-zentry-text-2">este mes</span>
                </div>
              </div>

              {/* Botones de Acción Rápida */}
              <div className="flex gap-3 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-zentry-accent hover:opacity-90 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-lg shadow-zentry-accent/20">
                  <ArrowDownLeft className="w-4 h-4" /> Retirar
                </button>
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-zentry-bg border border-zentry-border hover:border-zentry-accent text-zentry-text-1 font-medium px-6 py-3 rounded-xl transition-all">
                  <CreditCard className="w-4 h-4" /> Comprar
                </button>
              </div>
            </div>
          </motion.div>

          {/* Misiones Activas */}
          <motion.div variants={fadeInUp} className="bg-zentry-card border border-zentry-border rounded-3xl p-6 shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-zentry-text-1 flex items-center gap-2">
                <Target className="w-5 h-5 text-zentry-accent" /> Misiones Activas
              </h3>
              <span className="text-xs font-medium text-zentry-accent bg-zentry-accent/10 px-3 py-1 rounded-full">Actualizadas hoy</span>
            </div>
            
            <div className="flex flex-col gap-4">
              {MISSIONS.map(m => (
                <div key={m.id} className="bg-zentry-bg border border-zentry-border rounded-2xl p-4 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zentry-text-2">{m.type}</span>
                        {m.completed && <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded-md">Completada</span>}
                      </div>
                      <h4 className={`font-bold ${m.completed ? 'text-zentry-text-2 line-through' : 'text-zentry-text-1'}`}>{m.title}</h4>
                      <p className="text-xs text-zentry-text-2 mt-0.5">{m.desc}</p>
                    </div>
                    <div className="bg-zentry-accent/10 border border-zentry-accent/20 text-zentry-accent text-xs font-bold px-2.5 py-1.5 rounded-lg shrink-0">
                      {m.reward}
                    </div>
                  </div>
                  
                  {/* Barra de progreso */}
                  {!m.completed ? (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-zentry-card rounded-full overflow-hidden border border-zentry-border/50">
                        <motion.div 
                          initial={{ width: 0 }} animate={{ width: `${(m.progress / m.total) * 100}%` }} transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-zentry-accent rounded-full" 
                        />
                      </div>
                      <span className="text-xs font-medium text-zentry-text-2 shrink-0">{m.progress} / {m.total}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-green-500 text-sm font-medium mt-2">
                      <CheckCircle2 className="w-4 h-4" /> Recompensa reclamada
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Logros y Medallas */}
          <motion.div variants={fadeInUp} className="bg-zentry-card border border-zentry-border rounded-3xl p-6 shadow-sm transition-colors duration-300">
            <h3 className="text-lg font-bold text-zentry-text-1 flex items-center gap-2 mb-6">
              <Trophy className="w-5 h-5 text-yellow-500" /> Mis Logros
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {ACHIEVEMENTS.map(ach => {
                const Icon = ach.icon
                return (
                  <div key={ach.id} className={`flex flex-col items-center text-center p-4 rounded-2xl border transition-all ${ach.unlocked ? 'border-zentry-border bg-zentry-bg hover:border-zentry-accent/30' : 'border-dashed border-zentry-border/50 bg-zentry-bg/30 opacity-60 grayscale'}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${ach.bg}`}>
                      <Icon className={`w-6 h-6 ${ach.color}`} />
                    </div>
                    <h4 className="text-sm font-bold text-zentry-text-1 mb-1">{ach.title}</h4>
                    <p className="text-[10px] text-zentry-text-2 leading-tight">{ach.desc}</p>
                  </div>
                )
              })}
            </div>
          </motion.div>

        </div>

        {/* ========================================== */}
        {/* COLUMNA DERECHA: Historial (Sticky en PC)    */}
        {/* ========================================== */}
        <div className="lg:sticky lg:top-[96px] lg:h-[calc(100vh-120px)] flex flex-col">
          <motion.div variants={fadeInUp} className="bg-zentry-card border border-zentry-border rounded-3xl p-5 sm:p-6 flex flex-col h-full shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-zentry-text-1 flex items-center gap-2">
                <History className="w-5 h-5 text-zentry-text-2" /> Historial
              </h3>
              
              {/* Filtros simples */}
              <div className="flex gap-1 bg-zentry-bg border border-zentry-border rounded-lg p-1">
                <button 
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeFilter === 'all' ? 'bg-zentry-card text-zentry-text-1 shadow-sm' : 'text-zentry-text-2'}`}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setActiveFilter('income')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeFilter === 'income' ? 'bg-zentry-card text-zentry-text-1 shadow-sm' : 'text-zentry-text-2'}`}
                >
                  Ingresos
                </button>
              </div>
            </div>

            {/* Lista scrolleable */}
            <div className="flex-1 overflow-y-auto hide-scrollbar pr-2 flex flex-col gap-2">
              {filteredTransactions.map((t) => {
                const Icon = t.icon
                const isIncome = t.type === 'income'
                
                return (
                  <div key={t.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-zentry-bg transition-colors border border-transparent hover:border-zentry-border/50">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isIncome ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zentry-text-1 truncate">{t.title}</p>
                      <p className="text-xs text-zentry-text-2 truncate mt-0.5">{t.desc}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${isIncome ? 'text-green-500' : 'text-zentry-text-1'}`}>
                        {t.amount} ZC
                      </p>
                      <p className="text-[10px] text-zentry-text-2 mt-1">{t.date}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>

      </div>
    </motion.div>
  )
}