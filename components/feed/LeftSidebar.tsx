import Link from 'next/link'
import {
  Home, Wand2, Compass, LayoutGrid,
  MessageSquare, Users, LogOut
} from 'lucide-react'
import { logout } from '@/lib/actions/auth'

const NAV_ITEMS = [
  { href: '/feed',      icon: Home,         label: 'Feed',        active: true },
  { href: '/studio',    icon: Wand2,         label: 'Studio',      active: false },
  { href: '/explore',   icon: Compass,       label: 'Explorar',    active: false },
  { href: '/projects',  icon: LayoutGrid,    label: 'Proyectos',   active: false },
  { href: '/messages',  icon: MessageSquare, label: 'Mensajes',    active: false },
  { href: '/community', icon: Users,         label: 'Comunidades', active: false },
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
    <div className="flex flex-col gap-3">

      {/* Perfil mini */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-sm font-semibold text-violet-400">
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-white">@{username}</p>
            <p className="text-xs text-zinc-500">{discipline}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center border-t border-zinc-800 pt-3">
          <div>
            <p className="text-sm font-semibold text-white">{posts}</p>
            <p className="text-xs text-zinc-600">obras</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{followers}</p>
            <p className="text-xs text-zinc-600">seguidores</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{coins}</p>
            <p className="text-xs text-zinc-600">coins</p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                item.active
                  ? 'bg-violet-500/10 text-violet-400 font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="border-t border-zinc-800 mt-2 pt-2">
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-all text-sm w-full"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>

      {/* Coins */}
      <div className="bg-violet-600 rounded-2xl p-4">
        <p className="text-xs text-violet-200 uppercase tracking-wider mb-1">
          Zentry Coins
        </p>
        <p className="text-2xl font-bold text-white mb-1">{coins} ZC</p>
        <p className="text-xs text-violet-300 mb-3">
          +{coinsToday} ZC ganados hoy
        </p>
        <Link
          href="/studio"
          className="block text-center bg-violet-800 hover:bg-violet-700 text-violet-100 text-xs font-medium py-2 rounded-xl transition-colors"
        >
          Subir obra → ganar coins
        </Link>
      </div>

    </div>
  )
}