'use client'

import Link from 'next/link'
import {
  Home, Wand2, Compass, LayoutGrid,
  MessageSquare, Users, LogOut
} from 'lucide-react'
import { logout } from '@/lib/actions/auth'

const NAV_ITEMS = [
  { href: '/feed',        icon: Home,          label: 'Feed',        active: true },
  { href: '/studio',      icon: Wand2,         label: 'Estudio',      active: false },
  { href: '/explore',     icon: Compass,       label: 'Explorar',    active: false },
  { href: '/projects',    icon: LayoutGrid,    label: 'Proyectos',   active: false },
  { href: '/messages',    icon: MessageSquare, label: 'Mensajes',    active: false },
  { href: '/communities', icon: Users,         label: 'Comunidades', active: false },
]

interface LeftSidebarProps {
  username: string
  discipline: string
  posts: number
  followers: number
  coins: number
  coinsToday: number
}

export default function LeftSidebar({
  username, discipline, posts, followers, coins, coinsToday
}: LeftSidebarProps) {
  const initials = username.slice(0, 2).toUpperCase()

  return (
    <>
      {/* ========================================================= */}
      {/* 1. VISTA MÓVIL: BOTTOM NAVIGATION BAR (< md)                */}
      {/* ========================================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zentry-card/90 backdrop-blur-xl border-t border-zentry-border z-[100] px-6 py-3 flex justify-between items-center shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] pb-safe">
        {/* Mostramos solo los 4 primeros iconos en móvil para no saturar */}
        {NAV_ITEMS.slice(0, 4).map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex flex-col items-center justify-center p-2 transition-colors ${
              item.active ? 'text-zentry-accent' : 'text-zentry-text-2 hover:text-zentry-text-1'
            }`}
          >
            <item.icon className="w-6 h-6" />
            {item.active && <span className="absolute -bottom-1 w-1 h-1 bg-zentry-accent rounded-full" />}
          </Link>
        ))}
        {/* Avatar del usuario como último elemento en la barra inferior */}
        <Link href="/profile" className="w-8 h-8 rounded-full bg-zentry-accent/20 flex items-center justify-center text-xs font-bold text-zentry-accent border border-zentry-accent/50 ring-2 ring-transparent active:ring-zentry-accent/50 transition-all">
          {initials}
        </Link>
      </div>

      {/* ========================================================= */}
      {/* 2. VISTA TABLET & DESKTOP: SIDEBAR (>= md)                  */}
      {/* ========================================================= */}
      <div className="hidden md:flex flex-col gap-3 transition-all duration-300">
        
        {/* Perfil mini (Se contrae en Tablet) */}
        <div className="bg-zentry-card border border-zentry-border rounded-2xl p-3 lg:p-4 transition-colors duration-300 flex flex-col items-center lg:items-stretch">
          <div className="flex items-center gap-3 lg:mb-3">
            <div className="w-10 h-10 rounded-full bg-zentry-accent/20 flex items-center justify-center text-sm font-semibold text-zentry-accent shrink-0">
              {initials}
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-zentry-text-1 truncate max-w-[140px]">@{username}</p>
              <p className="text-xs text-zentry-text-2 truncate">{discipline}</p>
            </div>
          </div>
          
          <div className="hidden lg:grid grid-cols-3 gap-2 text-center border-t border-zentry-border pt-3">
            <div><p className="text-sm font-semibold text-zentry-text-1">{posts}</p><p className="text-xs text-zentry-text-2">obras</p></div>
            <div><p className="text-sm font-semibold text-zentry-text-1">{followers}</p><p className="text-xs text-zentry-text-2">segs</p></div>
            <div><p className="text-sm font-semibold text-zentry-text-1">{coins}</p><p className="text-xs text-zentry-text-2">coins</p></div>
          </div>
        </div>

        {/* Navegación (Solo iconos en Tablet, Texto en Desktop) */}
        <div className="bg-zentry-card border border-zentry-border rounded-2xl p-2 lg:p-3 transition-colors duration-300">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 p-3 lg:px-3 lg:py-2.5 rounded-xl transition-all text-sm justify-center lg:justify-start ${
                  item.active
                    ? 'bg-zentry-accent/10 text-zentry-accent font-medium'
                    : 'text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg'
                }`}
                title={item.label} // Muestra el nombre al pasar el mouse en tablet
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
                className="flex items-center gap-3 p-3 lg:px-3 lg:py-2.5 rounded-xl text-zentry-text-2 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm w-full justify-center lg:justify-start"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5 lg:w-4 lg:h-4 shrink-0" />
                <span className="hidden lg:block">Salir</span>
              </button>
            </form>
          </div>
        </div>

        {/* Billetera (Oculta en Tablet, Visible en Desktop) */}
        <div className="hidden lg:block">
          <Link href="/wallet" className="block mt-2 p-4 bg-zentry-card/50 border border-zentry-border rounded-xl hover:border-zentry-accent/50 hover:bg-zentry-bg transition-all group backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zentry-text-2 group-hover:text-zentry-text-1 transition-colors">Mi Billetera</span>
              <span className="text-xs text-zentry-accent font-medium">+ {coinsToday}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-zentry-text-1">{coins}</span>
              <span className="text-sm text-yellow-500 font-medium">ZC</span>
            </div>
          </Link>
        </div>
      </div>
    </>
  )
}