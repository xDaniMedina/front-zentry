"use client"

import { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Users, Check, X, Flame, Settings, Shield,
  Moon, Sun, KeyRound, Palette, SlidersHorizontal, LogOut,
  MessageSquare, Loader2, Zap, Bookmark, Heart
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/components/providers/ThemeProvider";
import Link from "next/link";
import Image from "next/image";
import LogoutModal from "@/components/shared/LogoutModal";
import { FriendUser } from "@/types";
import { getImageUrl, getInitials } from "@/lib/utils";
import {
  getFriendsAction,
  getPendingFriendRequestsAction,
  acceptFriendRequestAction,
  rejectFriendRequestAction,
  pingPresenceAction,
} from "@/lib/actions/friends";
import { getMyProfileAction } from "@/lib/actions/profile";
import { updatePrivacySettings } from "@/lib/actions/settings";
import { fetchDailyMissions } from "@/lib/actions/gamification";
import { DailyMission } from "@/lib/gamification";
import { getActiveAdsAction, AdDTO } from "@/lib/actions/ads";
import AdCard from "./AdCard";
import MissionsModal from "./MissionsModal";

export default function RightSidebar() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const rawUsername = user?.username || user?.email || 'creador';
  const cleanUsername = rawUsername.replace(/^@/, '').toLowerCase().trim();

  // Estados Dinámicos de Amigos y Solicitudes
  const [requests, setRequests] = useState<FriendUser[]>([]);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();

  // Estado de la Racha: encendida o apagada según las misiones diarias reales
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>([]);
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);
  const [sidebarAd, setSidebarAd] = useState<AdDTO | null>(null);

  // Modal / Drawer de Ajustes Globales
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'notifications' | 'appearance' | 'account'>('privacy');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Privacidad real (persistida en el perfil del backend)
  const [isPrivacyLoading, setIsPrivacyLoading] = useState(false);
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [showSavedPosts, setShowSavedPosts] = useState(true);
  const [showLikedPosts, setShowLikedPosts] = useState(true);

  // Notificaciones: preferencia local del dispositivo (no hay backend de push aún)
  const [notifyLikes, setNotifyLikes] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyMentions, setNotifyMentions] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);

  useEffect(() => {
    if (!showSettingsDrawer) return;

    setIsPrivacyLoading(true);
    getMyProfileAction().then(res => {
      if (res.success && res.data) {
        setIsPrivate(Boolean(res.data.isPrivate));
        setShowSavedPosts(res.data.showSavedPosts !== false);
        setShowLikedPosts(res.data.showLikedPosts !== false);
      }
      setIsPrivacyLoading(false);
    });

    try {
      const savedPrefs = JSON.parse(localStorage.getItem('zentry_notification_prefs') || '{}');
      if (typeof savedPrefs.notifyLikes === 'boolean') setNotifyLikes(savedPrefs.notifyLikes);
      if (typeof savedPrefs.notifyComments === 'boolean') setNotifyComments(savedPrefs.notifyComments);
      if (typeof savedPrefs.notifyMentions === 'boolean') setNotifyMentions(savedPrefs.notifyMentions);
      if (typeof savedPrefs.notifyEmail === 'boolean') setNotifyEmail(savedPrefs.notifyEmail);
    } catch { /* localStorage no disponible o corrupto: usar valores por defecto */ }
  }, [showSettingsDrawer]);

  const handleTogglePrivacy = async (field: 'isPrivate' | 'showSavedPosts' | 'showLikedPosts', value: boolean) => {
    const prev = { isPrivate, showSavedPosts, showLikedPosts };
    if (field === 'isPrivate') setIsPrivate(value);
    if (field === 'showSavedPosts') setShowSavedPosts(value);
    if (field === 'showLikedPosts') setShowLikedPosts(value);

    setIsSavingPrivacy(true);
    const res = await updatePrivacySettings({
      isPrivate: field === 'isPrivate' ? value : isPrivate,
      showSavedPosts: field === 'showSavedPosts' ? value : showSavedPosts,
      showLikedPosts: field === 'showLikedPosts' ? value : showLikedPosts,
    });
    setIsSavingPrivacy(false);

    if (!res.success) {
      setIsPrivate(prev.isPrivate);
      setShowSavedPosts(prev.showSavedPosts);
      setShowLikedPosts(prev.showLikedPosts);
      toast.error(res.message || "No se pudo actualizar tu privacidad");
    } else {
      toast.success("Preferencia de privacidad actualizada");
    }
  };

  const persistNotificationPrefs = (next: Partial<{ notifyLikes: boolean; notifyComments: boolean; notifyMentions: boolean; notifyEmail: boolean }>) => {
    try {
      const current = { notifyLikes, notifyComments, notifyMentions, notifyEmail, ...next };
      localStorage.setItem('zentry_notification_prefs', JSON.stringify(current));
    } catch { /* ignore */ }
  };


  // Carga de misiones diarias reales tras montaje (definen si la racha está encendida)
  useEffect(() => {
    fetchDailyMissions().then(res => {
      if (res.success) setDailyMissions(res.missions);
    });
    getActiveAdsAction('SIDEBAR').then(res => {
      if (res.success && res.data.length > 0) setSidebarAd(res.data[0]);
    });
  }, [cleanUsername]);

  const completedMissionsToday = dailyMissions.filter(m => m.currentProgress >= m.targetProgress).length;
  const totalDailyMissions = dailyMissions.length;
  const isStreakOn = completedMissionsToday > 0;

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

  const currentUsername = user?.username || user?.email;
  const onlineFriends = friends.filter(
    f => f.is_online && f.username !== currentUsername && String(f.id) !== String(user?.id)
  );

  return (
    <aside className="flex flex-col gap-4 p-4 lg:p-6 w-full h-full">
      <div className="flex flex-col gap-6 w-full h-full pb-8">
        
        {/* 1. SECCIÓN PRINCIPAL: RACHA DIARIA (encendida/apagada según misiones reales) 🔥 */}
        <div className={`border rounded-3xl p-5 shadow-xl relative overflow-hidden space-y-4 transition-colors ${
          isStreakOn
            ? 'bg-gradient-to-br from-orange-950/80 via-[#181224] to-purple-950/70 border-orange-500/40'
            : 'bg-zentry-card border-zentry-border'
        }`}>
          {isStreakOn && <div className="absolute -top-10 -right-10 w-36 h-36 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />}

          {/* Cabecera de la Racha */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                isStreakOn
                  ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-orange-500/40 animate-pulse'
                  : 'bg-zentry-bg border border-zentry-border text-zentry-text-2'
              }`}>
                <Flame className={`w-7 h-7 ${isStreakOn ? 'fill-white text-orange-200' : ''}`} />
              </div>

              <div>
                <h3 className={`font-black text-base tracking-tight ${isStreakOn ? 'text-white' : 'text-zentry-text-1'}`}>
                  Racha {isStreakOn ? 'Encendida' : 'Apagada'}
                </h3>
                <p suppressHydrationWarning className={`text-[10px] font-medium ${isStreakOn ? 'text-orange-300/90' : 'text-zentry-text-2'}`}>
                  {totalDailyMissions === 0
                    ? 'Cargando misiones de hoy...'
                    : `${completedMissionsToday}/${totalDailyMissions} misiones completadas hoy`}
                </p>
              </div>
            </div>
          </div>

          {/* Botón de Acción: Abrir Misiones */}
          <button
            onClick={() => setIsMissionsOpen(true)}
            className={`w-full py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
              isStreakOn
                ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:opacity-95 text-black shadow-orange-500/30 active:scale-95'
                : 'bg-zentry-bg border border-zentry-border text-zentry-text-1 hover:border-zentry-accent active:scale-95'
            }`}
          >
            <Zap className="w-4 h-4" />
            {isStreakOn ? 'Ver Misiones Diarias' : 'Completa una misión para encender tu racha'}
          </button>
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
                <Link href="/friends" className="text-[10px] font-black text-zentry-accent hover:underline">
                  Ver todas
                </Link>
              </div>
              
              <div className="space-y-3">
                {requests.map(req => (
                  <div key={req.request_id || req.id} className="bg-zentry-bg border border-zentry-border rounded-2xl p-3.5 space-y-3 shadow-sm hover:border-zentry-accent/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 font-extrabold text-xs flex items-center justify-center shrink-0 border border-purple-500/30 overflow-hidden">
                        {req.avatar_url ? (
                          <Image src={getImageUrl(req.avatar_url)} alt={req.name || "avatar"} fill sizes="40px" className="object-cover" />
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
                        <Image src={getImageUrl(friend.avatar_url)} alt={friend.name || "avatar"} fill sizes="40px" className="object-cover" />
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

        {/* 3.5. ANUNCIO PATROCINADO */}
        {sidebarAd && <AdCard ad={sidebarAd} variant="sidebar" />}

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
                  isPrivacyLoading ? (
                    <div className="flex items-center justify-center py-10 text-zentry-text-2 gap-2 text-xs">
                      <Loader2 className="w-4 h-4 animate-spin" /> Cargando privacidad...
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-zentry-bg rounded-2xl border border-zentry-border flex items-center justify-between">
                        <div>
                          <h4 className="font-extrabold text-sm text-zentry-text-1">Cuenta Privada</h4>
                          <p className="text-xs text-zentry-text-2">Tu perfil seguirá visible, pero se identificará como privado para otros creadores.</p>
                        </div>
                        <button
                          onClick={() => handleTogglePrivacy('isPrivate', !isPrivate)}
                          disabled={isSavingPrivacy}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 disabled:opacity-50 ${isPrivate ? 'bg-zentry-accent' : 'bg-zentry-border'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>

                      <div className="p-4 bg-zentry-bg rounded-2xl border border-zentry-border flex items-center justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <Bookmark className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                          <div>
                            <h4 className="font-extrabold text-sm text-zentry-text-1">Mostrar mis Guardados</h4>
                            <p className="text-xs text-zentry-text-2">Otros creadores podrán ver tu colección de guardados.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleTogglePrivacy('showSavedPosts', !showSavedPosts)}
                          disabled={isSavingPrivacy}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 disabled:opacity-50 ${showSavedPosts ? 'bg-amber-500' : 'bg-zentry-border'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showSavedPosts ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>

                      <div className="p-4 bg-zentry-bg rounded-2xl border border-zentry-border flex items-center justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <Heart className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                          <div>
                            <h4 className="font-extrabold text-sm text-zentry-text-1">Mostrar mis Me Gusta</h4>
                            <p className="text-xs text-zentry-text-2">Otros creadores podrán ver lo que marcaste con me gusta.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleTogglePrivacy('showLikedPosts', !showLikedPosts)}
                          disabled={isSavingPrivacy}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 disabled:opacity-50 ${showLikedPosts ? 'bg-rose-500' : 'bg-zentry-border'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showLikedPosts ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                  )
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-4">
                    {[
                      { key: 'notifyLikes' as const, state: notifyLikes, setState: setNotifyLikes, title: 'Me Gusta', desc: 'Alerta cuando alguien reaccione a tus obras' },
                      { key: 'notifyComments' as const, state: notifyComments, setState: setNotifyComments, title: 'Comentarios', desc: 'Alerta cuando alguien comente tu publicación' },
                      { key: 'notifyMentions' as const, state: notifyMentions, setState: setNotifyMentions, title: 'Menciones y Etiquetas', desc: 'Cuando te mencionen en un post o comentario' },
                      { key: 'notifyEmail' as const, state: notifyEmail, setState: setNotifyEmail, title: 'Resumen por Correo', desc: 'Resumen semanal de tendencias por email' },
                    ].map((item) => (
                      <div key={item.key} className="p-4 bg-zentry-bg rounded-2xl border border-zentry-border flex items-center justify-between gap-3">
                        <div>
                          <h4 className="font-extrabold text-sm text-zentry-text-1">{item.title}</h4>
                          <p className="text-xs text-zentry-text-2">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => {
                            const next = !item.state;
                            item.setState(next);
                            persistNotificationPrefs({ [item.key]: next });
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${item.state ? 'bg-zentry-accent' : 'bg-zentry-border'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.state ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    ))}
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
