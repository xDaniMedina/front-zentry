'use client'

import Link from 'next/link'
import {
  Home, Wand2, Compass, LayoutGrid, Bell, Shield, Key,
  MessageSquare, Users, LogOut, Settings, Wallet, Flame, ArrowUpRight
} from 'lucide-react'
import { logout } from '@/lib/actions/auth'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
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

  const discipline = "Ilustración Digital"
  const posts = 12
  const followers = 340
  const coins = 285
  const coinsToday = 15

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
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-3 p-3 lg:px-3 lg:py-2.5 rounded-xl text-zentry-text-2 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm w-full justify-center lg:justify-start font-bold"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5 lg:w-4 lg:h-4 shrink-0" />
                <span className="hidden lg:block">Salir</span>
              </button>
            </form>
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
    </>
  )
}