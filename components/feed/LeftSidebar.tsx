'use client'

import Link from 'next/link'
import {
  Home, Wand2, Compass, LayoutGrid, X, Bell, Shield, Key,
  MessageSquare, Users, LogOut
} from 'lucide-react'
import { logout } from '@/lib/actions/auth'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import {usePathname} from 'next/navigation'
import { Settings } from 'lucide-react'
import {motion, AnimatePresence} from "framer-motion"

const NAV_ITEMS = [
  { href: '/feed',        icon: Home,          label: 'Feed' },
  { href: '/studio',      icon: Wand2,         label: 'Estudio' },
  { href: '/explore',     icon: Compass,       label: 'Explorar' },
  { href: '/projects',    icon: LayoutGrid,    label: 'Proyectos' },
  { href: '/messages',    icon: MessageSquare, label: 'Mensajes' },
  { href: '/communities', icon: Users,         label: 'Comunidades' },
]

export interface LeftSidebarProps {
  username: string
  discipline: string
  posts: number
  followers: number
  coins: number
  coinsToday: number
}

export default function LeftSidebar(props: LeftSidebarProps) {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname();
  const [layoutStyle, setLayoutStyle] = useState('vertical'); 
  const { username, discipline, posts, followers, coins, coinsToday } = props;
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
  const timer = setTimeout(() => setMounted(true), 0);
  return () => clearTimeout(timer); 
  }, []);


  const initials = username?.slice(0, 2).toUpperCase() || 'ZA';

  return (
    <aside className="flex flex-col gap-4 p-4 lg:p-6 w-full h-full">
      
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zentry-card/90 backdrop-blur-xl border-t border-zentry-border z-[100] px-6 py-3 flex justify-between items-center shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] pb-safe">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 p-3 lg:px-3 lg:py-2.5 rounded-xl transition-all text-sm justify-center lg:justify-start ${
              pathname === item.href
                ? 'bg-zentry-accent/10 text-zentry-accent font-medium'
                : 'text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg'
            }`}
            title={item.label}
          >
            <item.icon className="w-5 h-5 lg:w-4 lg:h-4 shrink-0" />
            <span className="hidden lg:block">{item.label}</span>
          </Link>
        ))}
        
        <Link href={'/profile/${username}'} className="w-8 h-8 rounded-full bg-zentry-accent/20 flex items-center justify-center text-xs font-bold text-zentry-accent border border-zentry-accent/50 ring-2 ring-transparent active:ring-zentry-accent/50 transition-all">
          {initials}
        </Link>
      </div>

      {/*  VISTA TABLET & DESKTOP:                 */}
      <div className="hidden md:flex flex-col gap-3 transition-all duration-300">
       
        {/* Perfil mini (Se contrae en Tablet) */}
        <link href={'/profile/${username}'} className='flex items-center gap-3 lg:mb-3 group cursor-points' />
          <div className="flex items-center gap-3 lg:mb-3">
            <div className="w-10 h-10 rounded-full bg-zentry-accent/20 flex items-center justify-center text-sm font-semibold text-zentry-accent shrink-0">
              {initials}
            </div>
            <div className="hidden lg:block group-hover:opacity-80">
              <p className="text-sm font-medium text-zentry-text-1 truncate max-w-[140px]">@{username}</p>
              <p className="text-xs text-zentry-text-2 truncate">{discipline}</p>
            </div>
          </div>
         
          <div className="hidden lg:grid grid-cols-3 gap-2 text-center border-t border-zentry-border pt-3">
            <div><p className="text-sm font-semibold text-zentry-text-1">{posts}</p><p className="text-xs text-zentry-text-2">obras</p></div>
            <div><p className="text-sm font-semibold text-zentry-text-1">{followers}</p><p className="text-xs text-zentry-text-2">segs</p></div>
            <div><p className="text-sm font-semibold text-zentry-text-1">{coins}</p><p className="text-xs text-zentry-text-2">coins</p></div>
          </div>
        

        {/* Navegación (Solo iconos en Tablet, Texto en Desktop) */}
        <div className="bg-zentry-card border border-zentry-border rounded-2xl p-2 lg:p-3 transition-colors duration-300">
          <div className="flex flex-col gap-1">
           {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 p-3 lg:px-3 lg:py-2.5 rounded-xl transition-all text-sm justify-center lg:justify-start ${
                  pathname === item.href
                    ? 'bg-zentry-accent/10 text-zentry-accent font-medium'
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
                className="flex items-center gap-3 p-3 lg:px-3 lg:py-2.5 rounded-xl text-zentry-text-2 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm w-full justify-center lg:justify-start"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5 lg:w-4 lg:h-4 shrink-0" />
                <span className="hidden lg:block">Salir</span>
              </button>
            </form>
          </div>
        </div>

        {/* Selector de Apariencia (Temas) */}
        {mounted && (
          <div className="bg-zentry-card border border-zentry-border rounded-2xl p-3 transition-colors duration-300 hidden lg:block">
            <p className="text-xs font-medium text-zentry-text-2 mb-3">Apariencia</p>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button 
                  onClick={() => setTheme('light')} 
                  className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${theme === 'light' ? 'bg-zentry-text-1 text-zentry-bg border-transparent' : 'border-zentry-border text-zentry-text-2 hover:bg-zentry-bg'}`}
                >
                  Claro
                </button>
                <button 
                  onClick={() => setTheme('dark')} 
                  className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${theme === 'dark' ? 'bg-zentry-text-1 text-zentry-bg border-transparent' : 'border-zentry-border text-zentry-text-2 hover:bg-zentry-bg'}`}
                >
                  Oscuro
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto pt-6 flex flex-col gap-4">
        
        {/* NUEVO PATROCINADOR */}
        <div className="bg-zentry-card border border-zentry-border rounded-3xl p-4 shadow-sm relative overflow-hidden group cursor-pointer">
          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white z-10">
            Patrocinado
          </div>
          <div className="h-20 bg-gradient-to-r from-red-500/10 to-blue-500/10 rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <span className="text-3xl">🍕</span>
          </div>
          <h4 className="font-bold text-sm text-zentry-text-1 mb-1"> Pizza Teziutlán</h4>
          <p className="text-[11px] leading-tight text-zentry-text-2 mb-3">
            ¿Antojo de Hawaiana o Pepperoni? Pide ahora tu pizza y paga en efectivo al recibir.
          </p>
          <button className="w-full bg-zentry-bg border border-zentry-border text-xs font-bold text-zentry-text-1 py-2 rounded-lg hover:border-zentry-accent transition-colors">
            Pedir ahora
          </button>
        </div>

        {/* BOTÓN DE AJUSTES GLOBALES */}
        <button className="w-full flex items-center gap-3 px-4 py-3 text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-card border border-transparent hover:border-zentry-border rounded-2xl transition-all font-medium">
          <Settings className="w-5 h-5" />
          <span>Ajustes Globales</span>
        </button>
        
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
    </aside>
  )
}
