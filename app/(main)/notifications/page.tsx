"use client"

import { useState } from "react";
import { Bell, Heart, UserPlus, Star, CheckCheck, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Datos iniciales con estado "read"
const INITIAL_NOTIFS = [
  { id: 1, type: 'like', icon: Heart, color: "text-red-500", text: "A Ryuu Logic le gustó tu proyecto 'Cyber Art'", time: "Hace 5m", read: false },
  { id: 2, type: 'comment', icon: MessageSquare, color: "text-emerald-500", text: "LuisDev comentó: '¡Increíble la arquitectura!'", time: "Hace 1h", read: false },
  { id: 3, type: 'follow', icon: UserPlus, color: "text-blue-500", text: "StatMaster ha comenzado a seguirte", time: "Hace 2h", read: true },
  { id: 4, type: 'reward', icon: Star, color: "text-yellow-500", text: "Has recibido 50 Zentry Coins por tu racha", time: "Hace 5h", read: true },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success("Todas las notificaciones marcadas como leídas");
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.info("Bandeja de notificaciones vaciada");
  };

  // Filtramos las notificaciones según la pestaña activa
  const displayedNotifs = notifications.filter(n => 
    filter === 'all' ? true : !n.read
  );

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bell className="text-violet-500" /> Notificaciones
            {unreadCount > 0 && (
              <span className="bg-violet-600 text-white text-sm px-2.5 py-0.5 rounded-full font-medium">
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
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <CheckCheck className="w-4 h-4 mr-2" /> Marcar leídas
          </Button>
          <Button 
            onClick={handleClearAll} 
            variant="ghost" 
            size="sm"
            disabled={notifications.length === 0}
            className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Pestañas de Filtro */}
      <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-zinc-800 w-fit">
        <button 
          onClick={() => setFilter('all')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Todas
        </button>
        <button 
          onClick={() => setFilter('unread')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'unread' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          No leídas
        </button>
      </div>

      {/* Lista de Notificaciones */}
      <div className="space-y-3">
        {displayedNotifs.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 border border-zinc-800 border-dashed rounded-2xl">
            <Bell className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 font-medium">No tienes notificaciones por aquí.</p>
          </div>
        ) : (
          displayedNotifs.map(n => (
            <div 
              key={n.id} 
              onClick={() => handleMarkAsRead(n.id)}
              className={`p-4 rounded-xl flex items-center gap-4 transition-all cursor-pointer border ${
                n.read 
                  ? 'bg-zinc-900/50 border-transparent hover:bg-zinc-900' 
                  : 'bg-zinc-900 border-violet-500/30 hover:border-violet-500/50 relative overflow-hidden'
              }`}
            >
              {/* Indicador lateral para no leídas */}
              {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500" />}

              {/* Icono */}
              <div className={`p-3 rounded-xl ${n.read ? 'bg-zinc-800/50' : 'bg-zinc-800'} ${n.color}`}>
                <n.icon className="w-5 h-5"/>
              </div>

              {/* Contenido */}
              <div className="flex-1">
                <p className={`text-sm ${n.read ? 'text-zinc-300' : 'text-white font-medium'}`}>
                  {n.text}
                </p>
                <p className="text-zinc-500 text-xs mt-1">{n.time}</p>
              </div>

              {/* Puntito indicador extra de no leído */}
              {!n.read && (
                <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}