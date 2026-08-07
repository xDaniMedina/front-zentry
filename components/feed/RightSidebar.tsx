"use client"

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, Users, Globe2, Sparkles, Check, X, 
  ExternalLink, Search, Flame, Zap
} from "lucide-react";

export default function RightSidebar() {
  const [requests, setRequests] = useState([
    { id: 1, name: 'Luna Muse', handle: '@lunamuse', project: 'Bocetos UI', avatar: 'LM' }
  ]);

  // Traductor Global
  const [autoTranslate, setAutoTranslate] = useState(false);

  //  Amigos en línea (Mock)
  const onlineFriends = ['PK', 'CD', 'AB', 'JS'];

  const acceptRequest = (id: number) => {
    setRequests(requests.filter(r => r.id !== id));
  };

  const declineRequest = (id: number) => {
    setRequests(requests.filter(r => r.id !== id));
  };

  return (
    <aside className="flex flex-col gap-4 p-4 lg:p-6 w-full h-full">


  
    <div className="flex flex-col gap-6 w-full h-full pb-8">
      
      {/* 1. TRADUCTOR Y BÚSQUEDA RÁPIDA */}
      <div className="bg-zentry-card border border-zentry-border rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-zentry-text-1 flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-blue-500" /> Traductor Zentry
          </h3>
          <button 
            onClick={() => setAutoTranslate(!autoTranslate)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${autoTranslate ? 'bg-blue-500' : 'bg-zentry-border'}`}
          >
            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${autoTranslate ? 'translate-x-5' : 'translate-x-1'}`} />
          </button>
        </div>
        <p className="text-xs text-zentry-text-2">
          {autoTranslate 
            ? 'Traduciendo el feed automáticamente al Español.' 
            : 'Activa para traducir publicaciones de otros idiomas.'}
        </p>
      </div>

      {/* 2. SOLICITUDES DE COLABORACIÓN */}
      <AnimatePresence>
        {requests.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-zentry-card border border-zentry-border rounded-3xl p-5 shadow-sm overflow-hidden"
          >
            <h3 className="font-bold text-sm text-zentry-text-1 flex items-center gap-2 mb-4">
              <Bell className="w-4 h-8 text-zentry-accent" /> Solicitudes ({requests.length})
            </h3>
            
            {requests.map(req => (
              <div key={req.id} className="bg-zentry-bg border border-zentry-border rounded-xl p-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 font-bold text-xs flex items-center justify-center shrink-0">
                    {req.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zentry-text-1 truncate">{req.name}</p>
                    <p className="text-xs text-zentry-text-2 truncate">quiere colaborar en <span className="text-zentry-text-1 font-medium">{req.project}</span></p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => acceptRequest(req.id)} className="flex-1 bg-zentry-text-1 text-zentry-bg text-xs font-bold py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity whitespace-nowrap">
                    <Check className="w-3.5 h-3.5" /> Aceptar
                  </button>
                  <button  onClick={() => declineRequest(req.id)} className="flex-1 bg-zentry-bg border border-zentry-border text-zentry-text-2 text-xs font-bold py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/10 transition-colors whitespace-nowrap">
                    <X className="w-3.5 h-3.5" /> Ignorar
                  </button>
                </div>             

              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. AMIGOS EN LÍNEA */}
      <div className="bg-zentry-card border border-zentry-border rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-zentry-text-1 flex items-center gap-2">
            <Users className="w-4 h-4 text-green-500" /> En línea
          </h3>
          <span className="text-xs font-bold text-zentry-text-2 bg-zentry-bg px-2 py-1 rounded-md">{onlineFriends.length}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {onlineFriends.map((friend, i) => (
            <div key={i} className="relative group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-zentry-bg border border-zentry-border flex items-center justify-center font-bold text-zentry-text-1 text-sm hover:border-zentry-accent transition-colors">
                {friend}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-zentry-card rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. MISIONES DIARIAS (Gamificación) */}
      <div className="bg-gradient-to-br from-zentry-card to-zentry-bg border border-zentry-border rounded-3xl p-5 shadow-sm">
        <h3 className="font-bold text-sm text-zentry-text-1 flex items-center gap-2 mb-4">
          <Flame className="w-4 h-4 text-orange-500" /> Misiones Diarias
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zentry-text-2">Da 5 likes hoy</span>
            <span className="text-xs font-bold text-yellow-500 flex items-center gap-1">+5 ZC</span>
          </div>
          <div className="w-full bg-zentry-bg rounded-full h-1.5 overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full" style={{ width: '60%' }} />
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-medium text-zentry-text-2">Comenta 2 obras</span>
            <span className="text-xs font-bold text-yellow-500 flex items-center gap-1">+10 ZC</span>
          </div>
          <div className="w-full bg-zentry-bg rounded-full h-1.5 overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* 5. PUBLICIDAD / ZENTRY ADS */}
      <div className="bg-zentry-card border border-zentry-border rounded-3xl p-5 shadow-sm relative overflow-hidden group cursor-pointer">
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white z-10">
          Patrocinado
        </div>
        <div className="h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
          <Sparkles className="w-8 h-8 text-purple-400" />
        </div>
        <h4 className="font-bold text-sm text-zentry-text-1 mb-1">Paquete UI Neumorfismo</h4>
        <p className="text-xs text-zentry-text-2 mb-3">Descarga el nuevo kit de diseño para tus proyectos web.</p>
        <button className="w-full bg-zentry-bg border border-zentry-border text-xs font-bold text-zentry-text-1 py-2 rounded-lg flex items-center justify-center gap-2 group-hover:border-zentry-accent transition-colors">
          Obtener ahora <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="text-center text-[10px] text-zentry-text-2/50 mt-4">
        © 2026 Zentry Network • Privacidad • Términos
      </div>

    </div>
      </aside>
  );
}

