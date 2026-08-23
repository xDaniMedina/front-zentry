"use client"

import { useState, useEffect, useTransition } from "react";
import { 
  Bell, Heart, UserPlus, Star, CheckCheck, MessageSquare, Trash2, 
  Sparkles, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Notification } from "@/types";
import { 
  getNotificationsAction, 
  markNotificationReadAction, 
  markAllNotificationsReadAction, 
  clearNotificationsAction 
} from "@/lib/actions/notifications";

const INITIAL_FALLBACK_NOTIFS: Notification[] = [
  { id: 1, type: 'like', text: "A Ryuu Logic le gustó tu proyecto 'Cyber Art'", time: "Hace 5m", read: false },
  { id: 2, type: 'comment', text: "LuisDev comentó: '¡Increíble la arquitectura!'", time: "Hace 1h", read: false },
  { id: 3, type: 'follow', text: "StatMaster ha comenzado a seguirte", time: "Hace 2h", read: true },
  { id: 4, type: 'reward', text: "Has recibido 50 Zentry Coins por tu racha creativa", time: "Hace 5h", read: true },
];

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'like':
      return { icon: Heart, color: 'text-red-500', bg: 'bg-red-500/10' };
    case 'comment':
      return { icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    case 'follow':
      return { icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-500/10' };
    case 'reward':
      return { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    case 'system':
    default:
      return { icon: Sparkles, color: 'text-zentry-accent', bg: 'bg-zentry-accent/10' };
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_FALLBACK_NOTIFS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Cargar notificaciones desde el backend al montar
  useEffect(() => {
    let isMounted = true;
    startTransition(async () => {
      try {
        const res = await getNotificationsAction();
        if (isMounted && res.success && res.data && res.data.length > 0) {
          setNotifications(res.data);
        }
      } catch (err) {
        console.warn("Fallback local notifications:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    });

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
    });
  };

  const handleMarkAllAsRead = () => {
    // Actualización optimista
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("Todas las notificaciones marcadas como leídas");

    startTransition(async () => {
      await markAllNotificationsReadAction();
    });
  };

  const handleClearAll = () => {
    // Actualización optimista
    setNotifications([]);
    toast.info("Bandeja de notificaciones vaciada");

    startTransition(async () => {
      await clearNotificationsAction();
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
        {displayedNotifs.length === 0 ? (
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
            const notifTime = n.time || (n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');

            return (
              <div 
                key={n.id} 
                onClick={() => handleMarkAsRead(n.id)}
                className={`p-4 rounded-2xl flex items-center gap-4 transition-all cursor-pointer border ${
                  n.read 
                    ? 'bg-zentry-card/60 border-zentry-border/60 hover:bg-zentry-card' 
                    : 'bg-zentry-card border-zentry-accent/40 hover:border-zentry-accent relative overflow-hidden shadow-md'
                }`}
              >
                {/* Indicador lateral para no leídas */}
                {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-zentry-accent" />}

                {/* Icono */}
                <div className={`p-3 rounded-2xl shrink-0 ${iconConfig.bg} ${iconConfig.color}`}>
                  <IconComponent className="w-5 h-5"/>
                </div>

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