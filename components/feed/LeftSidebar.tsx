'use client'

import Link from 'next/link'
import {
  Home, Wand2, Compass, LayoutGrid, Bell, Shield, Key,
  MessageSquare, Users, LogOut, Settings, Wallet, Flame, ArrowUpRight, Loader2
} from 'lucide-react'
import { logout } from '@/lib/actions/auth'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import MissionsModal from './MissionsModal'

const NAV_ITEMS = [
  { href: '/feed',        icon: Home,          label: 'Feed' },
  { href: '/studio',      icon: Wand2,         label: 'Estudio' },
  { href: '/explore',     icon: Compass,       label: 'Explorar' },
  { href: '/projects',    icon: LayoutGrid,    label: 'Proyectos' },
  { href: '/messages',    icon: MessageSquare, label: 'Mensajes' },
  { href: '/communities', icon: Users,         label: 'Comunidades' },
]

export default function LeftSidebar() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [isMissionsOpen, setIsMissionsOpen] = useState(false)

  const rawUsername = user?.username || user?.email || 'creador';
  const displayUsername = user?.username?.includes('@') 
      ? user.username.split('@')[0] 
      : (user?.username || 'creador');

  const initials = displayUsername.slice(0, 2).toUpperCase();

  const discipline = user?.discipline || "Creador Digital"
  const posts = user?.postsCount ?? 12
  const followers = user?.followersCount ?? 340
  const coins = user?.zentry_coins ?? 285
  const coinsToday = 15
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      document.cookie = "zentry_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax;"
      localStorage.removeItem('zentry_user')
    } catch (error) {
      console.error("Error al salir:", error)
    }
    setTimeout(() => {
      window.location.href = "/login"
    }, 700)
  }

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* NAVEGACIÓN MÓVIL */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zentry-card/90 backdrop-blur-xl border-t border-zentry-border z-[100] px-6 py-3 flex justify-between items-center shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] pb-safe">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all text-sm justify-center ${
              pathname === item.href
                ? 'bg-zentry-accent/10 text-zentry-accent font-medium'
                : 'text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg'
            }`}
            title={item.label}
          >
            <item.icon className="w-6 h-6 shrink-0" />
          </Link>
        ))}
        
        <Link href={`/profile/${displayUsername}`} className="w-8 h-8 rounded-full bg-zentry-accent/20 flex items-center justify-center text-xs font-bold text-zentry-accent border border-zentry-accent/50 ring-2 ring-transparent active:ring-zentry-accent/50 transition-all">
          {initials}
        </Link>
      </div>

      {/* SIDEBAR ESCRITORIO (IZQUIERDA) */}
      <aside className="hidden md:flex flex-col gap-4 p-4 lg:p-6 w-[80px] lg:w-[280px] h-screen sticky top-0 overflow-y-auto custom-scrollbar transition-all duration-300">
        
        {/* PERFIL RESUMIDO */}
        <Link href={`/profile/${rawUsername}`} className="flex items-center gap-3 lg:mb-1 group cursor-pointer transition-all">
          <div className="w-10 h-10 rounded-2xl bg-zentry-accent/20 border border-zentry-accent/30 flex items-center justify-center text-sm font-extrabold text-zentry-accent shrink-0">
            {initials}
          </div>
          <div className="hidden lg:block group-hover:opacity-80 min-w-0">
            <p className="text-sm font-extrabold text-zentry-text-1 truncate max-w-[140px]">@{displayUsername}</p>
            <p className="text-xs text-zentry-text-2 truncate">{discipline}</p>
          </div>
        </Link>
          
        <div className="hidden lg:grid grid-cols-3 gap-2 text-center border-t border-zentry-border pt-3">
          <div><p className="text-sm font-extrabold text-zentry-text-1">{posts}</p><p className="text-[11px] text-zentry-text-2">obras</p></div>
          <div><p className="text-sm font-extrabold text-zentry-text-1">{followers}</p><p className="text-[11px] text-zentry-text-2">segs</p></div>
          <div><p className="text-sm font-extrabold text-zentry-text-1">{coins}</p><p className="text-[11px] text-zentry-text-2">coins</p></div>
        </div>

        {/* 1. TARJETA DE BILLETERA (UBICADA EN LA PARTE SUPERIOR) */}
        <div className="hidden lg:block">
          <Link href="/wallet" className="block p-4 bg-gradient-to-r from-purple-950/40 via-zentry-card to-indigo-950/40 border border-zentry-border rounded-2xl hover:border-zentry-accent/50 transition-all group shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-zentry-text-2 group-hover:text-zentry-text-1 transition-colors font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-zentry-accent" /> Mi Billetera
              </span>
              <span className="text-[10px] text-emerald-400 font-black bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                +{coinsToday} ZC hoy
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-zentry-text-1">{coins}</span>
                <span className="text-xs text-amber-400 font-black font-mono">ZC</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-zentry-text-2 group-hover:text-zentry-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>
        </div>

        {/* MENÚ PRINCIPAL */}
        <div className="bg-zentry-card border border-zentry-border rounded-2xl p-2 lg:p-3 transition-colors duration-300">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 p-3 lg:px-3 lg:py-2.5 rounded-xl transition-all text-sm justify-center lg:justify-start ${
                  pathname === item.href
                    ? 'bg-zentry-accent/10 text-zentry-accent font-extrabold'
                    : 'text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg'
                }`}
                title={item.label}
              >
                <item.icon className="w-5 h-5 lg:w-4 lg:h-4 shrink-0" />
                <span className="hidden lg:block">{item.label}</span>
              </Link>
            ))} 
          </div>

          <div className="border-t border-zentry-border mt-2 pt-2">
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              suppressHydrationWarning
              className="flex items-center gap-3 p-3 lg:px-3 lg:py-2.5 rounded-xl text-zentry-text-2 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm w-full justify-center lg:justify-start font-bold"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5 lg:w-4 lg:h-4 shrink-0" />
              <span className="hidden lg:block">Salir</span>
            </button>
          </div>
        </div>

        {/* 2. MISIONES DIARIAS EN LEFTSIDEBAR */}
        <div 
          onClick={() => setIsMissionsOpen(true)}
          className="hidden lg:block bg-gradient-to-br from-zentry-card to-zentry-bg border border-zentry-border rounded-2xl p-4 shadow-sm space-y-3 cursor-pointer hover:border-orange-500/50 transition-all group"
        >
          <h3 className="font-extrabold text-xs text-zentry-text-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5 group-hover:text-orange-400 transition-colors">
              <Flame className="w-4 h-4 text-orange-500 animate-bounce" /> Misiones & Logros
            </span>
            <span className="text-[10px] text-amber-400 font-mono font-bold">Ver Todo →</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-zentry-text-2">Dar 5 likes hoy</span>
                <span className="text-[10px] font-black text-amber-400">+5 ZC</span>
              </div>
              <div className="w-full bg-zentry-bg rounded-full h-1.5 overflow-hidden border border-zentry-border">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
            
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-zentry-text-2">Crear 1 obra en Estudio</span>
                <span className="text-[10px] font-black text-amber-400">+25 ZC</span>
              </div>
              <div className="w-full bg-zentry-bg rounded-full h-1.5 overflow-hidden border border-zentry-border">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>

      </aside>

      {/* PORTAL MODAL DE MISIONES Y LOGROS */}
      <MissionsModal isOpen={isMissionsOpen} onClose={() => setIsMissionsOpen(false)} />

      {/* MODAL ANIMADO DE CONFIRMACIÓN DE CIERRE DE SESIÓN */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <div 
            onClick={() => setIsLogoutModalOpen(false)}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-zentry-card border border-red-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden relative text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
                <LogOut className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <h3 className="text-lg font-black text-zentry-text-1">¿Cerrar Sesión?</h3>
                <p className="text-xs text-zentry-text-2 mt-1.5 leading-relaxed">
                  Tu sesión actual en Zentry finalizará de manera segura.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  disabled={isLoggingOut}
                  className="flex-1 py-3 px-4 rounded-xl border border-zentry-border text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmLogout}
                  disabled={isLoggingOut}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black hover:opacity-90 transition-all shadow-lg shadow-red-600/25 flex items-center justify-center gap-2"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saliendo...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" /> Sí, Salir
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PANTALLA ANIMADA DE SALIDA */}
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#090912]/95 backdrop-blur-xl flex flex-col items-center justify-center space-y-4"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-500 to-orange-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-red-500/25"
            >
              Z
            </motion.div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-extrabold text-white">Cerrando sesión de forma segura...</h4>
              <p className="text-xs text-zentry-text-2 font-mono">¡Hasta pronto, creador! 👋</p>
            </div>
            <div className="w-48 h-1.5 bg-zentry-border rounded-full overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-full h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}