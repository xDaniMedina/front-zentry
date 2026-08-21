"use client"

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, Users, Sparkles, Check, X, 
  ExternalLink, Flame, Settings, Shield, Lock, Eye, Volume2, 
  Moon, Sun, ChevronRight, CheckCircle2, UserCheck, KeyRound,
  User, Palette, Save, CreditCard, SlidersHorizontal
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import Link from "next/link";

export default function RightSidebar() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [requests, setRequests] = useState([
    { id: 1, name: 'Luna Muse', handle: '@lunamuse', project: 'Bocetos UI', avatar: 'LM' }
  ]);

  // Modal / Drawer de Ajustes Globales en el Lado Derecho
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'notifications' | 'appearance' | 'account'>('privacy');

  // Estados de Configuración
  const [displayName, setDisplayName] = useState(user?.username || "Creador Zentry");
  const [bio, setBio] = useState("Artista Digital creando en Zentry.");
  const [isPrivate, setIsPrivate] = useState(false);
  const [showStatus, setShowStatus] = useState(true);
  const [notifyLikes, setNotifyLikes] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);
  const [autoplayMedia, setAutoplayMedia] = useState(true);

  // Amigos en línea (Mock)
  const onlineFriends = ['PK', 'CD', 'AB', 'JS'];

  const acceptRequest = (id: number) => {
    setRequests(requests.filter(r => r.id !== id));
    toast.success("Solicitud de colaboración aceptada");
  };

  const declineRequest = (id: number) => {
    setRequests(requests.filter(r => r.id !== id));
    toast.info("Solicitud ignorada");
  };

  return (
    <aside className="flex flex-col gap-4 p-4 lg:p-6 w-full h-full">
      <div className="flex flex-col gap-6 w-full h-full pb-8">
        
        {/* 1. BOTÓN Y TARJETA DE AJUSTES GLOBALES (Lado Derecho del Feed) */}
        <div className="bg-gradient-to-r from-purple-950/60 via-zentry-card to-indigo-950/60 border border-zentry-border rounded-3xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-zentry-accent/20 border border-zentry-accent/30 flex items-center justify-center text-zentry-accent">
                <Settings className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h3 className="font-black text-sm text-zentry-text-1">Ajustes Globales</h3>
                <p className="text-[10px] text-zentry-text-2">Preferencias de la red social</p>
              </div>
            </div>

            <button 
              onClick={() => setShowSettingsDrawer(true)}
              suppressHydrationWarning
              className="p-2 bg-zentry-accent text-white rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-zentry-accent/20"
              title="Abrir panel de ajustes"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-zentry-text-2 mb-4 leading-relaxed">
            Personaliza tu privacidad, notificaciones push, tema visual y cuenta desde el panel lateral.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setShowSettingsDrawer(true)}
              suppressHydrationWarning
              className="py-2.5 bg-zentry-accent text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity shadow-md"
            >
              <Settings className="w-3.5 h-3.5" /> Configurar
            </button>

            <Link 
              href="/settings"
              className="py-2.5 bg-zentry-bg border border-zentry-border text-zentry-text-1 hover:border-zentry-accent rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-colors text-center"
            >
              Ver Todo <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
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
                <Bell className="w-4 h-4 text-zentry-accent" /> Solicitudes ({requests.length})
              </h3>
              
              {requests.map(req => (
                <div key={req.id} className="bg-zentry-bg border border-zentry-border rounded-2xl p-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 font-extrabold text-xs flex items-center justify-center shrink-0 border border-purple-500/30">
                      {req.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zentry-text-1 truncate">{req.name}</p>
                      <p className="text-[11px] text-zentry-text-2 truncate">quiere colaborar en <span className="text-zentry-text-1 font-medium">{req.project}</span></p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => acceptRequest(req.id)} className="flex-1 bg-zentry-text-1 text-zentry-bg text-xs font-extrabold py-2 px-1 rounded-xl flex items-center justify-center gap-1 hover:opacity-90 transition-opacity">
                      <Check className="w-3.5 h-3.5" /> Aceptar
                    </button>
                    <button onClick={() => declineRequest(req.id)} className="flex-1 bg-zentry-bg border border-zentry-border text-zentry-text-2 text-xs font-extrabold py-2 px-1 rounded-xl flex items-center justify-center gap-1 hover:text-red-400 hover:border-red-500/30 transition-colors">
                      <X className="w-3.5 h-3.5" /> Ignorar
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. CREADORES EN LÍNEA */}
        <div className="bg-zentry-card border border-zentry-border rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-zentry-text-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> Creadores En Línea
            </h3>
            <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {onlineFriends.length} activos
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {onlineFriends.map((friend, i) => (
              <div key={i} className="relative group cursor-pointer">
                <div className="w-10 h-10 rounded-2xl bg-zentry-bg border border-zentry-border flex items-center justify-center font-extrabold text-zentry-text-1 text-xs hover:border-zentry-accent transition-all shadow-sm">
                  {friend}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-zentry-card rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-[10px] text-zentry-text-2/50 pt-2">
          © 2026 Zentry Network • Ajustes Globales
        </div>

      </div>

      {/* MODAL / DRAWER INTERACTIVO DE AJUSTES GLOBALES */}
      <AnimatePresence>
        {showSettingsDrawer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header Modal */}
              <div className="p-5 border-b border-zentry-border flex justify-between items-center bg-zentry-bg">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-zentry-accent" />
                  <h3 className="text-lg font-extrabold text-zentry-text-1">Ajustes Globales de la Red Social</h3>
                </div>
                <button 
                  onClick={() => setShowSettingsDrawer(false)} 
                  className="p-1.5 text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-card rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenido del Modal de Ajustes */}
              <div className="p-6 overflow-y-auto space-y-6">
                
                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1 border-b border-zentry-border">
                  {[
                    { id: 'privacy', label: 'Privacidad', icon: Shield },
                    { id: 'notifications', label: 'Notificaciones', icon: Bell },
                    { id: 'appearance', label: 'Apariencia', icon: Palette },
                    { id: 'profile', label: 'Perfil', icon: User },
                  ].map(tab => {
                    const IconComp = tab.icon;
                    const tabId = tab.id as 'profile' | 'privacy' | 'notifications' | 'appearance';
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

                {/* TAB 1: PRIVACIDAD */}
                {activeTab === 'privacy' && (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between p-4 bg-zentry-bg border border-zentry-border rounded-2xl">
                      <div>
                        <h4 className="font-extrabold text-zentry-text-1 text-sm">Perfil Privado</h4>
                        <p className="text-zentry-text-2 mt-0.5">Solo seguidores aprobados ven tus publicaciones.</p>
                      </div>
                      <button 
                        onClick={() => {
                          setIsPrivate(!isPrivate);
                          toast.success(isPrivate ? "Perfil Público" : "Perfil Privado");
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPrivate ? 'bg-zentry-accent' : 'bg-zentry-border'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-zentry-bg border border-zentry-border rounded-2xl">
                      <div>
                        <h4 className="font-extrabold text-zentry-text-1 text-sm">Estado En Línea</h4>
                        <p className="text-zentry-text-2 mt-0.5">Mostrar el indicador verde cuando estés activo.</p>
                      </div>
                      <button 
                        onClick={() => {
                          setShowStatus(!showStatus);
                          toast.info(showStatus ? "Estado oculto" : "Estado visible");
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showStatus ? 'bg-emerald-500' : 'bg-zentry-border'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showStatus ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: NOTIFICACIONES */}
                {activeTab === 'notifications' && (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between p-4 bg-zentry-bg border border-zentry-border rounded-2xl">
                      <div>
                        <h4 className="font-extrabold text-zentry-text-1 text-sm">Notificaciones de Me Gusta</h4>
                        <p className="text-zentry-text-2 mt-0.5">Alertas cuando alguien reaccione a tus publicaciones.</p>
                      </div>
                      <button 
                        onClick={() => setNotifyLikes(!notifyLikes)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifyLikes ? 'bg-zentry-accent' : 'bg-zentry-border'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifyLikes ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-zentry-bg border border-zentry-border rounded-2xl">
                      <div>
                        <h4 className="font-extrabold text-zentry-text-1 text-sm">Notificaciones de Comentarios</h4>
                        <p className="text-zentry-text-2 mt-0.5">Alertas cuando comenten tus obras o proyectos.</p>
                      </div>
                      <button 
                        onClick={() => setNotifyComments(!notifyComments)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifyComments ? 'bg-zentry-accent' : 'bg-zentry-border'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifyComments ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: APARIENCIA */}
                {activeTab === 'appearance' && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setTheme('dark')}
                        className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-extrabold transition-all ${
                          theme === 'dark' ? 'border-zentry-accent bg-zentry-accent/10 text-white' : 'border-zentry-border text-zentry-text-2'
                        }`}
                      >
                        <Moon className="w-4 h-4 text-purple-400" /> Oscuro (Dark)
                      </button>
                      <button
                        onClick={() => setTheme('light')}
                        className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-extrabold transition-all ${
                          theme === 'light' ? 'border-zentry-accent bg-zentry-accent/10 text-zentry-text-1' : 'border-zentry-border text-zentry-text-2'
                        }`}
                      >
                        <Sun className="w-4 h-4 text-amber-400" /> Claro (Light)
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 4: PERFIL */}
                {activeTab === 'profile' && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-zentry-text-2 mb-1.5 uppercase">Nombre Visible</label>
                      <input 
                        type="text" 
                        value={displayName} 
                        onChange={(e) => setDisplayName(e.target.value)} 
                        className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-zentry-text-2 mb-1.5 uppercase">Biografía</label>
                      <textarea 
                        rows={2} 
                        value={bio} 
                        onChange={(e) => setBio(e.target.value)} 
                        className="w-full bg-zentry-bg border border-zentry-border rounded-xl p-3 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent resize-none"
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Footer Modal */}
              <div className="p-4 border-t border-zentry-border flex justify-between items-center bg-zentry-bg">
                <Link 
                  href="/settings"
                  onClick={() => setShowSettingsDrawer(false)}
                  className="text-xs text-zentry-accent font-bold hover:underline"
                >
                  Abrir Ajustes Avanzados Completo
                </Link>
                <button 
                  onClick={() => {
                    toast.success("¡Ajustes guardados!");
                    setShowSettingsDrawer(false);
                  }}
                  className="px-5 py-2.5 bg-zentry-accent text-white rounded-xl text-xs font-black hover:opacity-90 transition-opacity shadow-md"
                >
                  Guardar y Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </aside>
  );
}
