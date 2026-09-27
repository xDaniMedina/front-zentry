"use client"

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { mutate } from "swr";
import {
  Bell, Heart, UserPlus, Star, CheckCheck, MessageSquare, Trash2,
  Sparkles, Loader2, UserCheck, Trophy, Smile, Reply, Send, Flame, FolderKanban, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Notification } from "@/types";
import { getImageUrl, getInitials, timeAgo } from "@/lib/utils";
import {
  getNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
  clearNotificationsAction
} from "@/lib/actions/notifications";

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'like':
      return { icon: Heart, color: 'text-red-500', bg: 'bg-red-500/10' };
    case 'comment_like':
      return { icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10' };
    case 'comment':
      return { icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    case 'story_reaction':
      return { icon: Smile, color: 'text-orange-400', bg: 'bg-orange-500/10' };
    case 'story_reply':
      return { icon: Reply, color: 'text-orange-400', bg: 'bg-orange-500/10' };
    case 'message':
      return { icon: Send, color: 'text-sky-400', bg: 'bg-sky-500/10' };
    case 'follow':
    case 'friend_request':
      return { icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-500/10' };
    case 'friend_accept':
      return { icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    case 'achievement':
      return { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' };
    case 'mission':
      return { icon: CheckCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    case 'streak':
      return { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' };
    case 'project_invite':
    case 'project_message':
      return { icon: FolderKanban, color: 'text-indigo-400', bg: 'bg-indigo-500/10' };
    case 'community':
      return { icon: Users, color: 'text-teal-400', bg: 'bg-teal-500/10' };
    case 'reward':
      return { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    case 'system':
    default:
      return { icon: Sparkles, color: 'text-zentry-accent', bg: 'bg-zentry-accent/10' };
  }
}

/** A dónde lleva cada notificación al tocarla. */
function getNotificationHref(n: Notification): string | null {
  switch (n.type) {
    case 'like':
    case 'comment':
    case 'comment_like':
      return n.relatedId ? `/feed?post=${n.relatedId}` : '/feed';
    case 'message':
    case 'story_reply':
      return n.sourceUsername ? `/messages?user=${encodeURIComponent(n.sourceUsername)}` : '/messages';
    case 'story_reaction':
      return '/feed';
    case 'follow':
    case 'friend_accept':
      return n.sourceUsername ? `/profile/${encodeURIComponent(n.sourceUsername)}` : null;
    case 'friend_request':
      return '/friends';
    case 'achievement':
    case 'reward':
      return '/wallet';
    case 'mission':
    case 'streak':
      return '/feed?missions=1';
    case 'project_invite':
    case 'project_message':
      return n.relatedId ? `/projects/${n.relatedId}` : '/projects';
    case 'community':
      return '/communities';
    default:
      return null;
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();
  const router = useRouter();

  // Cargar notificaciones reales desde el backend al montar (nunca datos de relleno)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const res = await getNotificationsAction();
      if (isMounted && res.success && res.data) {
        setNotifications(res.data);
      }
      if (isMounted) setIsLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string | number) => {
    // Actualización optimista
    setNotifications(prev => prev.map(n => 
      String(n.id) === String(id) ? { ...n, read: true } : n
    ));

    startTransition(async () => {
      await markNotificationReadAction(id);
      mutate('unreadNotifications');
    });
  };

  const handleOpen = (n: Notification) => {
    if (!n.read) handleMarkAsRead(n.id);
    const href = getNotificationHref(n);
    if (href) router.push(href);
  };

  const handleMarkAllAsRead = () => {
    // Actualización optimista
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("Todas las notificaciones marcadas como leídas");

    startTransition(async () => {
      await markAllNotificationsReadAction();
      mutate('unreadNotifications');
    });
  };

  const handleClearAll = () => {
    // Actualización optimista
    setNotifications([]);
    toast.info("Bandeja de notificaciones vaciada");

    startTransition(async () => {
      await clearNotificationsAction();
      mutate('unreadNotifications');
    });
  };

  const displayedNotifs = notifications.filter(n => 
    filter === 'all' ? true : !n.read
  );

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zentry-text-1 flex items-center gap-3">
            <Bell className="text-zentry-accent w-7 h-7" /> Notificaciones
            {unreadCount > 0 && (
              <span className="bg-zentry-accent text-white text-xs sm:text-sm px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                {unreadCount} nuevas
              </span>
            )}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={handleMarkAllAsRead} 
            variant="ghost" 
            size="sm"
            disabled={unreadCount === 0}
            className="text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-card border border-zentry-border transition-colors text-xs font-semibold rounded-xl"
          >
            <CheckCheck className="w-4 h-4 mr-1.5" /> Marcar leídas
          </Button>
          <Button 
            onClick={handleClearAll} 
            variant="ghost" 
            size="sm"
            disabled={notifications.length === 0}
            className="text-zentry-text-2 hover:text-red-400 hover:bg-red-500/10 border border-zentry-border transition-colors rounded-xl"
            title="Vaciar bandeja"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Pestañas de Filtro */}
      <div className="flex bg-zentry-card p-1 rounded-2xl border border-zentry-border w-fit shadow-inner">
        <button 
          onClick={() => setFilter('all')}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
            filter === 'all' 
              ? 'bg-zentry-bg text-zentry-text-1 shadow-md border border-zentry-border' 
              : 'text-zentry-text-2 hover:text-zentry-text-1'
          }`}
        >
          Todas ({notifications.length})
        </button>
        <button 
          onClick={() => setFilter('unread')}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
            filter === 'unread' 
              ? 'bg-zentry-bg text-zentry-text-1 shadow-md border border-zentry-border' 
              : 'text-zentry-text-2 hover:text-zentry-text-1'
          }`}
        >
          No leídas ({unreadCount})
        </button>
      </div>

      {/* Lista de Notificaciones */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 sm:py-20 text-zentry-text-2 gap-2 text-xs">
            <Loader2 className="w-5 h-5 animate-spin" /> Cargando notificaciones...
          </div>
        ) : displayedNotifs.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-zentry-card/40 border border-zentry-border border-dashed rounded-3xl space-y-3">
            <Bell className="w-12 h-12 text-zinc-700 mx-auto" />
            <p className="text-zentry-text-1 font-bold text-sm">No tienes notificaciones pendientes</p>
            <p className="text-zentry-text-2 text-xs max-w-xs mx-auto">Te avisaremos cuando otros creadores interactúen con tus obras o recibas recompensas.</p>
          </div>
        ) : (
          displayedNotifs.map(n => {
            const iconConfig = getNotificationIcon(n.type);
            const IconComponent = iconConfig.icon;
            const notifText = n.text || n.content || "Nueva notificación en Zentry";
            const notifTime = n.time || timeAgo(n.created_at);

            return (
              <div 
                key={n.id} 
                onClick={() => handleOpen(n)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') handleOpen(n); }}
                className={`p-4 rounded-2xl flex items-center gap-4 transition-all cursor-pointer border ${
                  n.read 
                    ? 'bg-zentry-card/60 border-zentry-border/60 hover:bg-zentry-card' 
                    : 'bg-zentry-card border-zentry-accent/40 hover:border-zentry-accent relative overflow-hidden shadow-md'
                }`}
              >
                {/* Indicador lateral para no leídas */}
                {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-zentry-accent" />}

                {/* Foto de quien la envía (con el ícono del tipo) o solo el ícono */}
                {n.sourceUsername ? (
                  <div className="relative shrink-0">
                    <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-zentry-accent/15 border border-zentry-border flex items-center justify-center text-xs font-black text-zentry-accent">
                      {n.sourceAvatarUrl ? (
                        <Image src={getImageUrl(n.sourceAvatarUrl)} alt={n.sourceUsername} fill sizes="44px" className="object-cover" />
                      ) : getInitials(n.sourceUsername)}
                    </div>
                    <span className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-zentry-card ${iconConfig.bg} ${iconConfig.color} bg-zentry-card`}>
                      <IconComponent className="w-3 h-3" />
                    </span>
                  </div>
                ) : (
                  <div className={`p-3 rounded-2xl shrink-0 ${iconConfig.bg} ${iconConfig.color}`}>
                    <IconComponent className="w-5 h-5"/>
                  </div>
                )}

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs sm:text-sm ${n.read ? 'text-zentry-text-2' : 'text-zentry-text-1 font-bold'}`}>
                    {notifText}
                  </p>
                  {notifTime && (
                    <p className="text-zentry-text-2 text-[11px] font-mono mt-1">{notifTime}</p>
                  )}
                </div>

                {/* Puntito indicador extra de no leído */}
                {!n.read && (
                  <div className="w-2.5 h-2.5 rounded-full bg-zentry-accent shrink-0 shadow-sm shadow-zentry-accent/50" />
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}