'use client'

import { getMyProfileAction } from '@/lib/actions/profile'
import { fetchDailyMissions, getStreakAction, UserStreakData } from '@/lib/actions/gamification'
import { getEquippedItemsAction, getStoreCatalogAction } from '@/lib/actions/shop'
import { rarityRingClass } from '@/lib/shop'
import { disciplineLabel } from '@/lib/disciplines'
import { cn, getImageUrl } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import {
  Home, Wand2, Compass, LayoutGrid,
  MessageSquare, Users, LogOut, Wallet, Flame, ArrowUpRight, ShoppingBag, UserPlus, Bell
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { describeStreak } from '@/lib/streak'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import MissionsModal from './MissionsModal'
import LogoutModal from '@/components/shared/LogoutModal'
import { getUserStatsAction, UserSocialStats } from '@/lib/actions/friends'
import { getUnreadNotificationsCountAction } from '@/lib/actions/notifications'
import { DailyMission } from '@/lib/gamification'
import useSWR, { mutate } from 'swr'

const NAV_ITEMS = [
  { href: '/feed',        icon: Home,          label: 'Feed' },
  { href: '/studio',      icon: Wand2,         label: 'Estudio' },
  { href: '/explore',     icon: Compass,       label: 'Explorar' },
  { href: '/projects',    icon: LayoutGrid,    label: 'Proyectos' },
  { href: '/messages',    icon: MessageSquare, label: 'Mensajes' },
  { href: '/notifications', icon: Bell,        label: 'Notificaciones' },
  { href: '/friends',     icon: UserPlus,      label: 'Amigos' },
  { href: '/shop',        icon: ShoppingBag,   label: 'Tienda ZC' },
  { href: '/communities', icon: Users,         label: 'Comunidades' },
]

export default function LeftSidebar() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [isMissionsOpen, setIsMissionsOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [portalReady, setPortalReady] = useState(false)
  useEffect(() => setPortalReady(true), [])

  // Las notificaciones de misión/racha enlazan a ?missions=1 para abrir directamente el modal
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('missions') === '1') {
      setIsMissionsOpen(true)
      window.history.replaceState(null, '', pathname)
    }
  }, [pathname])
  const rawUsername = user?.username || user?.email || 'creador';
  const displayUsername = user?.username?.includes('@') 
      ? user.username.split('@')[0] 
      : (user?.username || 'creador');

  const initials = displayUsername.slice(0, 2).toUpperCase();

  const { data: swrRes } = useSWR(
    user?.username ? 'userStats' : null,
    async () => await getUserStatsAction(),
    { refreshInterval: 60000, fallbackData: { success: true, data: undefined as UserSocialStats | undefined } }
  )
  
  const stats = swrRes?.data || null;

  const posts = stats?.posts_count ?? user?.postsCount ?? 0;
  const followers = stats?.followers_count ?? user?.followersCount ?? 0;
  const coins = stats?.zentry_coins ?? user?.zentry_coins ?? 100;
  const coinsToday = stats?.coins_today ?? Math.max(5, posts * 5);

  // Mismas claves SWR que perfil/tienda: al editar el perfil o equipar algo se refresca aquí
  const { data: profileRes } = useSWR(user ? 'myProfile' : null, getMyProfileAction)
  const { data: equippedRes } = useSWR(user ? 'equippedItems' : null, getEquippedItemsAction)
  const { data: catalogRes } = useSWR(user ? 'storeCatalog' : null, getStoreCatalogAction)
  const { data: streakRes } = useSWR<{ success: boolean; data?: UserStreakData }>(
    user ? 'myStreak' : null,
    getStreakAction,
    { refreshInterval: 30000 }
  )

  const { data: unreadNotifications = 0 } = useSWR(
    user ? 'unreadNotifications' : null,
    getUnreadNotificationsCountAction,
    { refreshInterval: 30000 }
  )
  const badgeFor = (href: string) => href === '/notifications' && unreadNotifications > 0
    ? (unreadNotifications > 99 ? '99+' : String(unreadNotifications))
    : null

  const myProfile = profileRes?.success ? profileRes.data : null
  const avatarUrl: string | null = myProfile?.avatarUrl || user?.avatar_url || null
  const discipline = disciplineLabel(myProfile?.discipline || user?.discipline) || 'Creador Digital'

  const equipped = equippedRes?.equipped || {}
  const storeItems = catalogRes?.items || []
  const equippedFrameItem = storeItems.find(i => Number(i.id) === Number(equipped.frames))
  const equippedPetItem = storeItems.find(i => Number(i.id) === Number(equipped.pets))
  const equippedTitleItem = storeItems.find(i => Number(i.id) === Number(equipped.titles))

  // Refresco periódico: la racha se enciende en cuanto se completa una misión en cualquier parte de la red
  const { data: missionsRes } = useSWR(user ? 'dailyMissions' : null, fetchDailyMissions, { refreshInterval: 30000 })
  const dailyMissions: DailyMission[] = missionsRes?.success ? missionsRes.missions : []
  const completedMissionsToday = dailyMissions.filter(m => m.currentProgress >= m.targetProgress).length

  const streak = describeStreak(streakRes?.data, completedMissionsToday)

  // Aviso inmediato al completar una misión (además de la notificación del backend)
  const completedIdsRef = useRef<Set<number> | null>(null)
  useEffect(() => {
    if (!missionsRes?.success) return
    const done = dailyMissions.filter(m => m.currentProgress >= m.targetProgress)
    if (completedIdsRef.current === null) {
      completedIdsRef.current = new Set(done.map(m => m.id))
      return
    }
    const fresh = done.filter(m => !completedIdsRef.current!.has(m.id))
    fresh.forEach(m => {
      completedIdsRef.current!.add(m.id)
      toast.success(`✅ Misión completada: ${m.title}`, {
        description: `Reclama tus +${m.rewardCoins} ZC en Misiones & Logros`,
        action: { label: 'Reclamar', onClick: () => setIsMissionsOpen(true) },
      })
    })
    if (fresh.length > 0) {
      mutate('myStreak')
      mutate('unreadNotifications')
    }
  }, [missionsRes, dailyMissions])

  return (
    <>
      {/* NAVEGACIÓN MÓVIL (< 768px). Va en portal: el layout oculta este componente
          dentro de un <aside hidden md:flex>, y sin portal la barra nunca se veía. */}
      {portalReady && createPortal(<div className="md:hidden fixed bottom-0 left-0 right-0 bg-zentry-card/95 backdrop-blur-2xl border-t border-zentry-border z-[100] px-1 sm:px-5 py-2 flex justify-around items-center gap-0.5 shadow-[0_-10px_35px_-10px_rgba(0,0,0,0.5)] pb-safe">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex flex-1 min-w-0 items-center p-1.5 sm:p-2.5 rounded-xl transition-all text-xs justify-center ${
              pathname === item.href
                ? 'bg-zentry-accent/15 text-zentry-accent font-bold scale-105'
                : 'text-zentry-text-2 hover:text-zentry-text-1 active:scale-95'
            }`}
            title={item.label}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {badgeFor(item.href) && (
              <span className="absolute top-0.5 right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                {badgeFor(item.href)}
              </span>
            )}
          </Link>
        ))}
        
        <Link 
          href={`/profile/${displayUsername}`} 
          className={cn(
            "relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zentry-accent/20 flex items-center justify-center text-[11px] font-bold text-zentry-accent border border-zentry-accent/50 active:scale-95 transition-all shrink-0 overflow-hidden",
            equippedFrameItem && rarityRingClass(equippedFrameItem.rarity)
          )}
        >
          {avatarUrl ? (
            <Image src={getImageUrl(avatarUrl)} alt={displayUsername} fill sizes="32px" className="object-cover" />
          ) : initials}
        </Link>
      </div>, document.body)}

      {/* SIDEBAR ESCRITORIO (IZQUIERDA) */}
      <aside className="hidden md:flex flex-col gap-3 p-3 lg:p-5 w-full h-full overflow-y-auto custom-scrollbar transition-all duration-300">
        
        {/* PERFIL RESUMIDO */}
        <Link href={`/profile/${rawUsername}`} className="flex items-center gap-3 lg:mb-1 group cursor-pointer transition-all">
          <div className="relative shrink-0">
            <div
              className={cn(
                "relative w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-zentry-accent/20 border border-zentry-accent/30 flex items-center justify-center text-xs lg:text-sm font-extrabold text-zentry-accent overflow-hidden",
                equippedFrameItem && rarityRingClass(equippedFrameItem.rarity)
              )}
              title={equippedFrameItem ? `Marco: ${equippedFrameItem.name}` : undefined}
            >
              {avatarUrl ? (
                <Image src={getImageUrl(avatarUrl)} alt={displayUsername} fill sizes="40px" className="object-cover" />
              ) : initials}
            </div>
            {equippedPetItem && (
              <span className="absolute -bottom-1 -right-1.5 text-sm drop-shadow-md" title={`Mascota: ${equippedPetItem.name}`}>
                {equippedPetItem.icon}
              </span>
            )}
          </div>
          <div className="hidden lg:block group-hover:opacity-80 min-w-0 flex-1">
            <p className="text-sm font-extrabold text-zentry-text-1 truncate">@{displayUsername}</p>
            {equippedTitleItem ? (
              <p className="text-[10px] font-bold text-purple-300 truncate">{equippedTitleItem.icon} {equippedTitleItem.name}</p>
            ) : null}
            <p className="text-[11px] text-zentry-text-2 truncate">{discipline}</p>
          </div>
        </Link>
          
        {/* ESTADÍSTICAS DINÁMICAS (Obras, Seguidores, Seguidos / Monedas) */}
        <div className="hidden lg:grid grid-cols-4 gap-1 text-center border-t border-zentry-border pt-2.5">
          <Link href="/studio" className="hover:opacity-80 transition-opacity">
            <p className="text-xs font-extrabold text-zentry-text-1">{posts}</p>
            <p className="text-[10px] text-zentry-text-2">obras</p>
          </Link>
          <Link href={`/profile/${rawUsername}`} className="hover:opacity-80 transition-opacity">
            <p className="text-xs font-extrabold text-zentry-text-1">{followers}</p>
            <p className="text-[10px] text-zentry-text-2">segs</p>
          </Link>
          <Link href="/wallet" className="hover:opacity-80 transition-opacity">
            <p className="text-xs font-extrabold text-amber-400">{coins}</p>
            <p className="text-[10px] text-zentry-text-2">coins</p>
          </Link>
          <button
            suppressHydrationWarning
            onClick={() => setIsMissionsOpen(true)}
            title={streak.tooltip}
            className="hover:opacity-80 transition-opacity flex flex-col items-center justify-center cursor-pointer"
          >
            <p className={`text-xs font-extrabold flex items-center gap-0.5 justify-center ${streak.lit ? 'text-orange-400' : streak.atRisk ? 'text-amber-300' : 'text-zentry-text-2'}`}>
              <Flame className={`w-3 h-3 ${streak.lit ? 'text-orange-500 fill-orange-500' : streak.atRisk ? 'text-amber-300 animate-pulse' : 'text-zentry-text-2'}`} /> {streak.days}
            </p>
            <p className="text-[10px] text-zentry-text-2">{streak.atRisk ? '¡en riesgo!' : streak.days === 1 ? 'día racha' : 'días racha'}</p>
          </button>
        </div>

        {/* 1. TARJETA DE BILLETERA (DINÁMICA) */}
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
                <span className="relative shrink-0">
                  <item.icon className="w-5 h-5 lg:w-4 lg:h-4" />
                  {badgeFor(item.href) && (
                    <span className="lg:hidden absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                      {badgeFor(item.href)}
                    </span>
                  )}
                </span>
                <span className="hidden lg:block flex-1 truncate">{item.label}</span>
                {badgeFor(item.href) && (
                  <span className="hidden lg:flex min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black items-center justify-center">
                    {badgeFor(item.href)}
                  </span>
                )}
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
            {dailyMissions.length === 0 ? (
              <p className="text-[11px] text-zentry-text-2">Cargando misiones...</p>
            ) : (
              dailyMissions.slice(0, 2).map((mission, i) => {
                const pct = Math.min(100, Math.round((mission.currentProgress / Math.max(1, mission.targetProgress)) * 100));
                return (
                  <div key={mission.id} className={i > 0 ? "space-y-1 pt-1" : "space-y-1"}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-zentry-text-2 truncate pr-2">{mission.title}</span>
                      <span className="text-[10px] font-black text-amber-400 shrink-0">+{mission.rewardCoins} ZC</span>
                    </div>
                    <div className="w-full bg-zentry-bg rounded-full h-1.5 overflow-hidden border border-zentry-border">
                      <div className={`h-full rounded-full ${mission.isClaimed ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </aside>

      {/* PORTAL MODAL DE MISIONES Y LOGROS */}
      <MissionsModal isOpen={isMissionsOpen} onClose={() => setIsMissionsOpen(false)} />

      {/* MODAL PORTAL DE CIERRE DE SESIÓN ANIMADO */}
      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />
    </>
  )
}
