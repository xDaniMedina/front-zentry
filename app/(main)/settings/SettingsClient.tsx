"use client"

import { useState } from "react";
import {
  Settings, User, Shield, Bell, Palette, CreditCard, KeyRound, Save, Moon, Sun
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/components/providers/ThemeProvider";
import { updateProfile, updateSecurity } from "@/lib/actions/settings";
import Link from "next/link";

export default function SettingsClient() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'notifications' | 'appearance' | 'account'>('profile');

  // Form States
  const [displayName, setDisplayName] = useState(user?.username || "Creador Zentry");
  const [bio, setBio] = useState("Artista Digital & Diseñador de Interfaces creando en Zentry.");
  const [website, setWebsite] = useState("https://zentry.io");
  const [email, setEmail] = useState(user?.email || "creador@zentry.app");

  // Privacy States
  const [isPrivate, setIsPrivate] = useState(false);
  const [showStatus, setShowStatus] = useState(true);
  const [allowDms, setAllowDms] = useState<'everyone' | 'following' | 'nobody'>('everyone');

  // Notification States
  const [notifyLikes, setNotifyLikes] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyMentions, setNotifyMentions] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);

  // Appearance
  const [accentColor, setAccentColor] = useState('purple');
  const [autoplayMedia, setAutoplayMedia] = useState(true);

  // Passwords
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateProfile({ displayName, bio, website, email });
    if (res.success) {
      toast.success("¡Perfil actualizado correctamente!");
      updateUser({ name: displayName, bio, email });
    } else {
      toast.error("Error al actualizar perfil.");
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) {
      toast.error("Por favor, completa los campos de contraseña.");
      return;
    }
    const res = await updateSecurity({ currentPass, newPass });
    if (res.success) {
      toast.success("Contraseña cambiada con éxito.");
      setCurrentPass("");
      setNewPass("");
    } else {
      toast.error("Error al cambiar contraseña.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-24 space-y-8">

      {/* Header de Ajustes Globales */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zentry-border pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zentry-text-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zentry-accent/20 border border-zentry-accent/30 flex items-center justify-center text-zentry-accent">
              <Settings className="w-5 h-5" />
            </div>
            Ajustes de la Red Social
          </h1>
          <p className="text-xs text-zentry-text-2">
            Gestiona tu perfil, privacidad, notificaciones y preferencias de interfaz.
          </p>
        </div>

        <Link
          href="/wallet"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zentry-card border border-zentry-border text-zentry-text-1 hover:border-zentry-accent rounded-xl text-xs font-bold transition-all shrink-0"
        >
          <CreditCard className="w-4 h-4 text-zentry-accent" /> Ir a Billetera & Planes
        </Link>
      </div>

      {/* Grid Principal: Menú Lateral de Ajustes + Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Pestañas / Menú Lateral */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'profile', label: 'Mi Perfil', icon: User },
            { id: 'privacy', label: 'Privacidad & Seguridad', icon: Shield },
            { id: 'notifications', label: 'Notificaciones', icon: Bell },
            { id: 'appearance', label: 'Apariencia & Tema', icon: Palette },
            { id: 'account', label: 'Seguridad de Cuenta', icon: KeyRound },
          ].map(tab => {
            const IconComp = tab.icon;
            const tabId = tab.id as 'profile' | 'privacy' | 'notifications' | 'appearance' | 'account';
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tabId)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold transition-all ${activeTab === tab.id
                    ? 'bg-zentry-accent text-white shadow-md shadow-zentry-accent/20'
                    : 'text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-card'
                  }`}
              >
                <IconComp className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Panel de Contenido Según Pestaña */}
        <div className="lg:col-span-3 bg-zentry-card border border-zentry-border rounded-3xl p-6 sm:p-8 shadow-sm">

          {/* TAB 1: PERFIL */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="border-b border-zentry-border pb-4">
                <h2 className="text-lg font-extrabold text-zentry-text-1">Información de Perfil</h2>
                <p className="text-xs text-zentry-text-2">Esta información se mostrará públicamente en tu tarjeta de creador.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zentry-text-2 mb-1.5 uppercase">Nombre Visible</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zentry-text-2 mb-1.5 uppercase">Biografía del Creador</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-zentry-bg border border-zentry-border rounded-xl p-4 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zentry-text-2 mb-1.5 uppercase">Correo Electrónico</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zentry-text-2 mb-1.5 uppercase">Sitio Web / Portafolio</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zentry-border flex justify-end">
                <button type="submit" className="px-6 py-3 bg-zentry-text-1 text-zentry-bg font-extrabold text-xs rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2">
                  <Save className="w-4 h-4" /> Guardar Cambios
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: PRIVACIDAD */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="border-b border-zentry-border pb-4">
                <h2 className="text-lg font-extrabold text-zentry-text-1">Privacidad & Seguridad Social</h2>
                <p className="text-xs text-zentry-text-2">Controla quién puede ver tus publicaciones e interactuar contigo.</p>
              </div>

              <div className="space-y-5 text-xs">
                {/* Perfil Privado */}
                <div className="flex items-center justify-between p-4 bg-zentry-bg border border-zentry-border rounded-2xl">
                  <div>
                    <h3 className="font-extrabold text-zentry-text-1 text-sm">Perfil Privado</h3>
                    <p className="text-zentry-text-2 mt-0.5">Solo los usuarios que apruebes podrán ver tus publicaciones e historias.</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsPrivate(!isPrivate);
                      toast.success(isPrivate ? "Perfil ahora es Público" : "Perfil cambiado a Privado");
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPrivate ? 'bg-zentry-accent' : 'bg-zentry-border'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Estado en Línea */}
                <div className="flex items-center justify-between p-4 bg-zentry-bg border border-zentry-border rounded-2xl">
                  <div>
                    <h3 className="font-extrabold text-zentry-text-1 text-sm">Mostrar Estado En Línea </h3>
                    <p className="text-zentry-text-2 mt-0.5">Permite que tus amigos vean el indicador verde cuando estés activo.</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowStatus(!showStatus);
                      toast.info(showStatus ? "Estado oculta" : "Estado visible");
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showStatus ? 'bg-emerald-500' : 'bg-zentry-border'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showStatus ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Mensajes Directos */}
                <div className="p-4 bg-zentry-bg border border-zentry-border rounded-2xl space-y-3">
                  <h3 className="font-extrabold text-zentry-text-1 text-sm">¿Quién puede enviarte Mensajes Directos?</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'everyone', label: 'Cualquiera' },
                      { id: 'following', label: 'Solo a quienes sigo' },
                      { id: 'nobody', label: 'Nadie' },
                    ].map(opt => {
                      const optId = opt.id as 'everyone' | 'following' | 'nobody';
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setAllowDms(optId)}
                          className={`py-2.5 px-3 rounded-xl font-bold border text-center transition-all ${allowDms === opt.id
                              ? 'border-zentry-accent bg-zentry-accent/10 text-zentry-accent'
                              : 'border-zentry-border text-zentry-text-2 hover:text-zentry-text-1'
                            }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICACIONES */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="border-b border-zentry-border pb-4">
                <h2 className="text-lg font-extrabold text-zentry-text-1">Preferencias de Notificaciones</h2>
                <p className="text-xs text-zentry-text-2">Configura las alertas que deseas recibir en tiempo real.</p>
              </div>

              <div className="space-y-4 text-xs">
                {[
                  { state: notifyLikes, setState: setNotifyLikes, title: 'Notificaciones de Me Gusta', desc: 'Recibe una alerta cuando alguien reaccione a tus obras' },
                  { state: notifyComments, setState: setNotifyComments, title: 'Notificaciones de Comentarios', desc: 'Recibe una alerta cuando alguien comente tu publicación' },
                  { state: notifyMentions, setState: setNotifyMentions, title: 'Menciones y Etiquetas', desc: 'Notificar cuando te mencionen en un post o comentario' },
                  { state: notifyEmail, setState: setNotifyEmail, title: 'Resumen por Correo Electrónico', desc: 'Recibe un resumen semanal con las tendencias más destacadas' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-zentry-bg border border-zentry-border rounded-2xl">
                    <div>
                      <h3 className="font-extrabold text-zentry-text-1 text-sm">{item.title}</h3>
                      <p className="text-zentry-text-2 mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => item.setState(!item.state)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.state ? 'bg-zentry-accent' : 'bg-zentry-border'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.state ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: APARIENCIA & TEMA */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="border-b border-zentry-border pb-4">
                <h2 className="text-lg font-extrabold text-zentry-text-1">Apariencia & Personalización</h2>
                <p className="text-xs text-zentry-text-2">Ajusta el tema visual y colores de acento de tu interfaz.</p>
              </div>

              <div className="space-y-5 text-xs">
                {/* Selector de Tema Dark/Light */}
                <div className="space-y-3">
                  <label className="block font-bold text-zentry-text-1 text-sm">Tema Visual</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 font-extrabold transition-all ${theme === 'dark' ? 'border-zentry-accent bg-zentry-accent/10 text-white' : 'border-zentry-border text-zentry-text-2'
                        }`}
                    >
                      <Moon className="w-5 h-5 text-purple-400" /> Tema Oscuro (Recomendado)
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 font-extrabold transition-all ${theme === 'light' ? 'border-zentry-accent bg-zentry-accent/10 text-zentry-text-1' : 'border-zentry-border text-zentry-text-2'
                        }`}
                    >
                      <Sun className="w-5 h-5 text-amber-400" /> Tema Claro
                    </button>
                  </div>
                </div>

                {/* Autoplay Multimedia */}
                <div className="flex items-center justify-between p-4 bg-zentry-bg border border-zentry-border rounded-2xl">
                  <div>
                    <h3 className="font-extrabold text-zentry-text-1 text-sm">Reproducción Automática de Videos</h3>
                    <p className="text-zentry-text-2 mt-0.5">Reproducir automáticamenet los videos al desplazar el feed.</p>
                  </div>
                  <button
                    onClick={() => setAutoplayMedia(!autoplayMedia)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoplayMedia ? 'bg-zentry-accent' : 'bg-zentry-border'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoplayMedia ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SEGURIDAD DE CUENTA */}
          {activeTab === 'account' && (
            <form onSubmit={handleSaveSecurity} className="space-y-6">
              <div className="border-b border-zentry-border pb-4">
                <h2 className="text-lg font-extrabold text-zentry-text-1">Cambiar Contraseña</h2>
                <p className="text-xs text-zentry-text-2">Actualiza tu contraseña para mantener tu cuenta protegida.</p>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-zentry-text-2 mb-1.5 uppercase">Contraseña Actual</label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zentry-text-2 mb-1.5 uppercase">Nueva Contraseña</label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zentry-border flex justify-end">
                <button type="submit" className="px-6 py-3 bg-zentry-text-1 text-zentry-bg font-extrabold text-xs rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2">
                  <KeyRound className="w-4 h-4" /> Actualizar Contraseña
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
