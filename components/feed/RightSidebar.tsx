"use client"

import { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, Users, Sparkles, Check, X, 
  ExternalLink, Flame, Settings, Shield, Lock, Eye, Volume2, 
  Moon, Sun, ChevronRight, CheckCircle2, UserCheck, KeyRound,
  User, Palette, Save, CreditCard, SlidersHorizontal, LogOut,
  MessageSquare, UserPlus, Circle, Loader2, Coins, Zap, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/components/providers/ThemeProvider";
import Link from "next/link";
import LogoutModal from "@/components/shared/LogoutModal";
import { FriendUser } from "@/types";
import { getImageUrl, getInitials } from "@/lib/utils";
import { 
  getFriendsAction, 
  getPendingFriendRequestsAction, 
  acceptFriendRequestAction, 
  rejectFriendRequestAction,
  pingPresenceAction
} from "@/lib/actions/friends";
import { 
  getUserStreak, 
  checkInDailyStreak, 
  UserStreak,
  DEFAULT_STREAK
} from "@/lib/streak";
import MissionsModal from "./MissionsModal";

export default function RightSidebar() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const rawUsername = user?.username || user?.email || 'creador';
  const cleanUsername = rawUsername.replace(/^@/, '').toLowerCase().trim();

  // Estados Dinámicos de Amigos y Solicitudes
  const [requests, setRequests] = useState<FriendUser[]>([]);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Estados de Racha Diaria tipo TikTok
  const [mounted, setMounted] = useState(false);
  const [streak, setStreak] = useState<UserStreak>(DEFAULT_STREAK);
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);

  // Modal / Drawer de Ajustes Globales
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'notifications' | 'appearance' | 'account'>('privacy');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Carga de Racha por usuario tras montaje
  useEffect(() => {
    setMounted(true);
    if (cleanUsername) {
      setStreak(getUserStreak(cleanUsername));
    }
  }, [cleanUsername]);

  // Carga de Amigos y Solicitudes
  const fetchSocialData = async () => {
    try {
      const [reqsRes, friendsRes] = await Promise.all([
        getPendingFriendRequestsAction(),
        getFriendsAction(true) // onlineOnly = true
      ]);

      if (reqsRes.success && reqsRes.data) {
        setRequests(reqsRes.data.filter(r => r.username !== user?.username && String(r.id) !== String(user?.id)));
      }
      if (friendsRes.success && friendsRes.data) {
        setFriends(friendsRes.data.filter(f => f.username !== user?.username && String(f.id) !== String(user?.id)));
      }
    } catch (e) {
      console.warn("Error cargando amigos:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSocialData();
    pingPresenceAction('online');

    const interval = setInterval(() => {
      fetchSocialData();
      pingPresenceAction('online');
    }, 15000);

    return () => clearInterval(interval);
  }, [user?.username, user?.id]);

  const acceptRequest = (requestId: number, senderName: string) => {
    setRequests(prev => prev.filter(r => r.request_id !== requestId));
    toast.success(`¡Ahora eres amigo de ${senderName}!`);

    startTransition(async () => {
      const res = await acceptFriendRequestAction(requestId);
      if (res.success) {
        fetchSocialData();
      }
    });
  };

  const declineRequest = (requestId: number) => {
    setRequests(prev => prev.filter(r => r.request_id !== requestId));
    toast.info("Solicitud ignorada");

    startTransition(async () => {
      await rejectFriendRequestAction(requestId);
    });
  };

  // Check-in diario de la racha
  const handleCheckInStreak = () => {
    const res = checkInDailyStreak(cleanUsername);
    if (res.success) {
      setStreak(res.streak);
      if (user) {
        updateUser({ zentry_coins: (user.zentry_coins || 0) + res.rewardBonus });
      }
      toast.success(`🔥 ¡Racha aumentada a ${res.streak.currentStreak} días! Ganaste +${res.rewardBonus} ZC 🎉`);
    } else {
      toast.info("¡Ya mantuviste tu racha hoy! Vuelve mañana para seguir sumando 🔥");
    }
  };

  const currentUsername = user?.username || user?.email;
  const onlineFriends = friends.filter(
    f => f.is_online && f.username !== currentUsername && String(f.id) !== String(user?.id)
  );

  return (
    <aside className="flex flex-col gap-4 p-4 lg:p-6 w-full h-full">
      <div className="flex flex-col gap-6 w-full h-full pb-8">
        
        {/* 1. SECCIÓN PRINCIPAL: RACHA DIARIA TIPO TIKTOK 🔥 */}
        <div className="bg-gradient-to-br from-orange-950/80 via-[#181224] to-purple-950/70 border border-orange-500/40 rounded-3xl p-5 shadow-xl relative overflow-hidden space-y-4">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Cabecera de la Racha */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/40 animate-pulse">
                  <Flame className="w-7 h-7 fill-white text-orange-200" />
                </div>
                <span suppressHydrationWarning className="absolute -bottom-1 -right-1 bg-black/80 text-[10px] font-black text-amber-400 px-1.5 py-0.2 rounded-full border border-amber-500/40 font-mono">
                  x{streak.multiplier.toFixed(1)}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 suppressHydrationWarning className="font-black text-base text-white tracking-tight">
                    {streak.currentStreak} {streak.currentStreak === 1 ? 'Día' : 'Días'} de Racha
                  </h3>
                </div>
                <p suppressHydrationWarning className="text-[10px] text-orange-300/90 font-medium">
                  {streak.todayCompleted ? '🔥 ¡Racha activa hoy!' : '⚡ Mantén tu fuego encendido'}
                </p>
              </div>
            </div>

            {/* Escudos de Protección */}
            <div className="flex items-center gap-1 bg-[#0d0914] px-2.5 py-1 rounded-xl border border-orange-500/30 text-amber-400 text-xs font-black shadow-inner" title="Escudos de Racha disponibles">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
              <span suppressHydrationWarning className="text-[10px] font-mono">{streak.streakShields}</span>
            </div>
          </div>

          {/* Días de la Semana Tracker (TikTok / Duolingo style) */}
          <div className="grid grid-cols-7 gap-1.5 p-2.5 bg-[#0a0712]/90 rounded-2xl border border-zinc-800/80">
            {streak.weeklyDays.map((d, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-bold text-zinc-400 uppercase">
                  {d.day}
                </span>
                <div 
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    d.checked 
                      ? 'bg-gradient-to-br from-orange-500 to-amber-400 text-black shadow-md shadow-orange-500/30 scale-105' 
                      : d.isToday 
                        ? 'border-2 border-orange-400 text-orange-400 bg-orange-950/40 animate-pulse' 
                        : 'bg-zinc-800/60 text-zinc-600 border border-zinc-800'
                  }`}
                >
                  {d.checked ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <span className="text-[10px]">•</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Botón de Acción de Racha */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCheckInStreak}
              disabled={streak.todayCompleted}
              className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md ${
                streak.todayCompleted
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                  : 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:opacity-95 text-black shadow-orange-500/30 active:scale-95 cursor-pointer'
              }`}
            >
              {streak.todayCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Racha Completada Hoy
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 fill-black" /> Encender Racha (+{50 + streak.currentStreak * 10} ZC)
                </>
              )}
            </button>

            <button
              onClick={() => setIsMissionsOpen(true)}
              className="p-2.5 bg-[#140e22] hover:bg-[#1e1532] border border-orange-500/30 text-amber-400 rounded-2xl transition-colors shrink-0"
              title="Abrir Centro de Misiones"
            >
              <Zap className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. SOLICITUDES DE AMISTAD DINÁMICAS */}
        <AnimatePresence>
          {requests.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-zentry-card border border-zentry-border rounded-3xl p-5 shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-zentry-text-1 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-zentry-accent" /> Solicitudes ({requests.length})
                </h3>
                <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 animate-pulse">
                  Nuevas
                </span>
              </div>
              
              <div className="space-y-3">
                {requests.map(req => (
                  <div key={req.request_id || req.id} className="bg-zentry-bg border border-zentry-border rounded-2xl p-3.5 space-y-3 shadow-sm hover:border-zentry-accent/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 font-extrabold text-xs flex items-center justify-center shrink-0 border border-purple-500/30 overflow-hidden">
                        {req.avatar_url ? (
                          <img src={getImageUrl(req.avatar_url)} alt={req.name} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(req.name || req.username)
                        )}
                        {req.is_online && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-zentry-bg rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/profile/${encodeURIComponent(req.username)}`} className="text-xs font-black text-zentry-text-1 truncate hover:underline block">
                          {req.name}
                        </Link>
                        <p className="text-[10px] text-zentry-text-2 truncate">
                          @{req.username} • <span className="text-zentry-accent font-semibold">{req.discipline || 'Creador'}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => acceptRequest(Number(req.request_id || req.id), req.name)} 
                        className="flex-1 bg-zentry-text-1 text-zentry-bg text-xs font-black py-2 px-1 rounded-xl flex items-center justify-center gap-1 hover:opacity-90 transition-opacity shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" /> Aceptar
                      </button>
                      <button 
                        onClick={() => declineRequest(Number(req.request_id || req.id))} 
                        className="flex-1 bg-zentry-bg border border-zentry-border text-zentry-text-2 text-xs font-extrabold py-2 px-1 rounded-xl flex items-center justify-center gap-1 hover:text-red-400 hover:border-red-500/30 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Ignorar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. CREADORES Y AMIGOS EN LÍNEA DINÁMICOS */}
        <div className="bg-zentry-card border border-zentry-border rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-zentry-text-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> Amigos en Línea
            </h3>
            <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              {onlineFriends.length} activos
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-6 text-zentry-text-2 text-xs gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-zentry-accent" /> Cargando red...
            </div>
          ) : onlineFriends.length === 0 ? (
            <div className="text-center py-6 px-3 bg-zentry-bg rounded-2xl border border-zentry-border space-y-2">
              <Users className="w-8 h-8 text-zentry-text-2 mx-auto opacity-40" />
              <p className="text-xs font-bold text-zentry-text-1">No hay creadores en línea en este momento</p>
              <p className="text-[11px] text-zentry-text-2">¡Tus amigos aparecerán aquí cuando se conecten!</p>
              <Link href="/explore" className="inline-block mt-1 text-xs text-zentry-accent font-black hover:underline">
                Explorar Creadores →
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {onlineFriends.slice(0, 5).map((friend) => (
                <div 
                  key={friend.id} 
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-zentry-bg/60 border border-zentry-border/60 hover:border-zentry-accent/40 transition-all group"
                >
                  <Link href={`/profile/${encodeURIComponent(friend.username)}`} className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 font-black text-xs flex items-center justify-center shrink-0 border border-purple-500/30 overflow-hidden">
                      {friend.avatar_url ? (
                        <img src={getImageUrl(friend.avatar_url)} alt={friend.name} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(friend.name || friend.username)
                      )}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-zentry-card bg-emerald-400 shadow-sm shadow-emerald-400" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-zentry-text-1 truncate group-hover:text-zentry-accent transition-colors">
                        {friend.name}
                      </p>
                      <p className="text-[10px] text-zentry-text-2 truncate">
                        @{friend.username}
                      </p>
                    </div>
                  </Link>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link 
                      href={`/messages?user=${encodeURIComponent(friend.username)}`}
                      className="p-1.5 bg-zentry-card hover:bg-zentry-accent hover:text-white text-zentry-text-2 rounded-xl transition-colors border border-zentry-border"
                      title="Enviar Mensaje Directo"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. AJUSTES GLOBALES */}
        <div className="bg-zentry-card border border-zentry-border rounded-3xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zentry-accent/20 border border-zentry-accent/30 flex items-center justify-center text-zentry-accent">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-zentry-text-1">Ajustes</h4>
              <p className="text-[10px] text-zentry-text-2">Preferencias globales</p>
            </div>
          </div>

          <button 
            onClick={() => setShowSettingsDrawer(true)}
            className="px-3 py-1.5 bg-zentry-bg hover:bg-zentry-accent hover:text-white border border-zentry-border text-zentry-text-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Abrir
          </button>
        </div>

        <div className="text-center text-[10px] text-zentry-text-2/50 pt-2">
          © 2026 Zentry Network • Conexiones Seguras
        </div>

      </div>

      {/* Modal de Misiones Diarias */}
      <MissionsModal isOpen={isMissionsOpen} onClose={() => setIsMissionsOpen(false)} />

      {/* MODAL / DRAWER DE AJUSTES GLOBALES */}
      <AnimatePresence>
        {showSettingsDrawer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-zentry-border flex justify-between items-center bg-zentry-bg">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-zentry-accent" />
                  <h3 className="text-lg font-extrabold text-zentry-text-1">Ajustes Globales</h3>
                </div>
                <button 
                  onClick={() => setShowSettingsDrawer(false)} 
                  className="p-1.5 text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-card rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="flex gap-2 overflow-x-auto pb-1 border-b border-zentry-border">
                  {[
                    { id: 'privacy', label: 'Privacidad', icon: Shield },
                    { id: 'notifications', label: 'Notificaciones', icon: Bell },
                    { id: 'appearance', label: 'Apariencia', icon: Palette },
                    { id: 'account', label: 'Cuenta', icon: KeyRound },
                  ].map(tab => {
                    const IconComp = tab.icon;
                    const tabId = tab.id as 'profile' | 'privacy' | 'notifications' | 'appearance' | 'account';
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tabId)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                          activeTab === tab.id 
                            ? 'bg-zentry-accent text-white shadow-md' 
                            : 'text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg'
                        }`}
                      >
                        <IconComp className="w-4 h-4" /> {tab.label}
                      </button>
                    )
                  })}
                </div>

                {activeTab === 'privacy' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-zentry-bg rounded-2xl border border-zentry-border flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-sm text-zentry-text-1">Cuenta Pública</h4>
                        <p className="text-xs text-zentry-text-2">Cualquier creador puede ver tus proyectos y enviarte mensajes.</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">Activo</span>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setTheme('dark')} 
                        className={`p-4 rounded-2xl border flex flex-col items-center gap-2 font-bold text-xs ${theme === 'dark' ? 'bg-zentry-accent/20 border-zentry-accent text-zentry-accent' : 'bg-zentry-bg border-zentry-border text-zentry-text-2'}`}
                      >
                        <Moon className="w-5 h-5" /> Modo Oscuro
                      </button>
                      <button 
                        onClick={() => setTheme('light')} 
                        className={`p-4 rounded-2xl border flex flex-col items-center gap-2 font-bold text-xs ${theme === 'light' ? 'bg-zentry-accent/20 border-zentry-accent text-zentry-accent' : 'bg-zentry-bg border-zentry-border text-zentry-text-2'}`}
                      >
                        <Sun className="w-5 h-5" /> Modo Claro
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'account' && (
                  <div className="space-y-4">
                    <button 
                      onClick={() => {
                        setShowSettingsDrawer(false);
                        setIsLogoutModalOpen(true);
                      }} 
                      className="w-full p-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Cerrar Sesión de la Cuenta
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />
    </aside>
  );
}
