'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Sparkles, Home, Wand2, User, LogOut, Bell, Menu, X } from 'lucide-react'
import { logout } from '@/lib/actions/auth'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface NavbarProps {
  user: SupabaseUser
}

export default function Navbar({ user }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifications] = useState(4)

  const username = user.email?.split('@')[0] ?? 'artista'

  return (
    <>
      <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-white font-bold text-base tracking-tight">Zentry</span>
          </Link>

          {/* Nav central — desktop */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            <Link href="/feed" className="flex items-center gap-1.5 px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all text-xs">
              <Home className="w-3.5 h-3.5" /> Feed
            </Link>
            <Link href="/studio" className="flex items-center gap-1.5 px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all text-xs">
              <Wand2 className="w-3.5 h-3.5" /> Studio
            </Link>
            <Link href={`/profile/${username}`} className="flex items-center gap-1.5 px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all text-xs">
              <User className="w-3.5 h-3.5" /> Perfil
            </Link>
          </div>

          {/* Acciones derecha */}
          <div className="flex items-center gap-2">

            {/* Coins */}
            <div className="hidden sm:flex items-center gap-1 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-full">
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span className="text-violet-300 text-xs font-medium">85 ZC</span>
            </div>

            {/* Notificaciones */}
<button 
  type="button" // Le dice a los forms/extensiones que esto no envía datos
  suppressHydrationWarning // Obliga a React a ignorar diferencias en este nodo
  className="relative p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
>
  <Bell className="w-4 h-4" />
  {notifications > 0 && (
    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-violet-600 text-white text-xs flex items-center justify-center rounded-full">
      {notifications}
    </span>
  )}
</button>

            {/* Subir obra */}
            <Link
              href="/studio"
              className="hidden sm:flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-all"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Subir obra
            </Link>

            {/* Logout */}
            <form action={logout}>
              <button type="submit" className="hidden sm:flex p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-xl transition-all">
                <LogOut className="w-4 h-4" />
              </button>
            </form>

            {/* Menú móvil */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        {mobileOpen && (
          <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-3 flex flex-col gap-1">
            <Link href="/feed" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all text-sm">
              <Home className="w-4 h-4" /> Feed
            </Link>
            <Link href="/studio" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all text-sm">
              <Wand2 className="w-4 h-4" /> Studio
            </Link>
            <Link href={`/profile/${username}`} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all text-sm">
              <User className="w-4 h-4" /> Perfil
            </Link>
            <div className="border-t border-zinc-800 mt-1 pt-1">
              <form action={logout}>
                <button type="submit" className="flex items-center gap-2 px-3 py-2.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-xl transition-all text-sm w-full">
                  <LogOut className="w-4 h-4" /> Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}