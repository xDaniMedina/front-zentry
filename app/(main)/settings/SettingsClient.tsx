"use client"

import { useState, useEffect } from "react";
import {
  Settings, User, Shield, Bell, Palette, CreditCard, KeyRound, Save, Moon, Sun,
  LifeBuoy, FileText, BarChart3, Bookmark, Heart, Loader2, Mail, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/components/providers/ThemeProvider";
import { updateProfile, updateSecurity, updatePrivacySettings } from "@/lib/actions/settings";
import { getMyProfileAction } from "@/lib/actions/profile";
import { getUserStatsAction, UserSocialStats } from "@/lib/actions/friends";

type Tab = 'profile' | 'privacy' | 'notifications' | 'appearance' | 'account' | 'stats' | 'support' | 'policies';

export default function SettingsClient() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);
  const [stats, setStats] = useState<UserSocialStats | null>(null);

  // Form States (cargados desde el perfil real del backend)
  const [displayName, setDisplayName] = useState(user?.username || "");
  const [bio, setBio] = useState("");
  const email = user?.email || "";

  // Privacy States (reales, persistidos en el perfil del backend)
  const [isPrivate, setIsPrivate] = useState(false);
  const [showSavedPosts, setShowSavedPosts] = useState(true);
  const [showLikedPosts, setShowLikedPosts] = useState(true);

  // Notification States (preferencia local del dispositivo, no hay backend de notificaciones push aún)
  const [notifyLikes, setNotifyLikes] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyMentions, setNotifyMentions] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);

  // Appearance
  const [autoplayMedia, setAutoplayMedia] = useState(true);

  // Passwords
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    getMyProfileAction().then(res => {
      if (res.success && res.data) {
        const p = res.data;
        setDisplayName(p.name || user?.username || "");
        setBio(p.bio || "");
        setIsPrivate(Boolean(p.isPrivate));
        setShowSavedPosts(p.showSavedPosts !== false);
        setShowLikedPosts(p.showLikedPosts !== false);
      }
      setIsLoadingProfile(false);
    });
    getUserStatsAction().then(res => {
      if (res.success && res.data) setStats(res.data);
    });

    try {
      const savedPrefs = JSON.parse(localStorage.getItem('zentry_notification_prefs') || '{}');
      if (typeof savedPrefs.notifyLikes === 'boolean') setNotifyLikes(savedPrefs.notifyLikes);
      if (typeof savedPrefs.notifyComments === 'boolean') setNotifyComments(savedPrefs.notifyComments);
      if (typeof savedPrefs.notifyMentions === 'boolean') setNotifyMentions(savedPrefs.notifyMentions);
      if (typeof savedPrefs.notifyEmail === 'boolean') setNotifyEmail(savedPrefs.notifyEmail);
      const appearancePrefs = JSON.parse(localStorage.getItem('zentry_appearance_prefs') || '{}');
      if (typeof appearancePrefs.autoplayMedia === 'boolean') setAutoplayMedia(appearancePrefs.autoplayMedia);
    } catch { /* localStorage no disponible o corrupto: usar valores por defecto */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistNotificationPrefs = (next: Partial<{ notifyLikes: boolean; notifyComments: boolean; notifyMentions: boolean; notifyEmail: boolean }>) => {
    try {
      const current = { notifyLikes, notifyComments, notifyMentions, notifyEmail, ...next };
      localStorage.setItem('zentry_notification_prefs', JSON.stringify(current));
    } catch { /* ignore */ }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateProfile({ displayName, bio, website: "", email });
    if (res.success) {
      toast.success("¡Perfil actualizado correctamente!");
      updateUser({ name: displayName, bio });
    } else {
      toast.error(res.message || "Error al actualizar perfil.");
    }
  };

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

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) {
      toast.error("Por favor, completa los campos de contraseña.");
      return;
    }
    if (newPass.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setIsSavingPassword(true);
    const res = await updateSecurity({ currentPass, newPass });
    setIsSavingPassword(false);
    if (res.success) {
      toast.success("Contraseña cambiada con éxito.");
      setCurrentPass("");
      setNewPass("");
    } else {
      toast.error(res.message || "Error al cambiar contraseña.");
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
            { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
            { id: 'support', label: 'Soporte', icon: LifeBuoy },
            { id: 'policies', label: 'Políticas', icon: FileText },
          ].map(tab => {
            const IconComp = tab.icon;
            const tabId = tab.id as Tab;
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

              {isLoadingProfile ? (
                <div className="flex items-center justify-center py-10 text-zentry-text-2 gap-2 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" /> Cargando tu perfil...
                </div>
              ) : (
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

                  <div>
                    <label className="block text-xs font-bold text-zentry-text-2 mb-1.5 uppercase">Correo Electrónico</label>
                    <div className="w-full bg-zentry-bg/60 border border-zentry-border rounded-xl px-4 py-3 text-xs text-zentry-text-2 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 shrink-0" /> {email || "Sin correo registrado"}
                    </div>
                    <p className="text-[10px] text-zentry-text-2 mt-1">El correo de acceso no puede cambiarse desde aquí por seguridad.</p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-zentry-border flex justify-end">
                <button type="submit" disabled={isLoadingProfile} className="px-6 py-3 bg-zentry-text-1 text-zentry-bg font-extrabold text-xs rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50">
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
                <p className="text-xs text-zentry-text-2">Controla quién puede ver tu perfil y tu actividad.</p>
              </div>

              <div className="space-y-5 text-xs">
                {/* Perfil Privado */}
                <div className="flex items-center justify-between p-4 bg-zentry-bg border border-zentry-border rounded-2xl">
                  <div>
                    <h3 className="font-extrabold text-zentry-text-1 text-sm">Cuenta Privada</h3>
                    <p className="text-zentry-text-2 mt-0.5">Marca tu cuenta como privada. Tu perfil seguirá visible, pero se identificará como privado para otros creadores.</p>
                  </div>
                  <button
                    onClick={() => handleTogglePrivacy('isPrivate', !isPrivate)}
                    disabled={isSavingPrivacy}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 disabled:opacity-50 ${isPrivate ? 'bg-zentry-accent' : 'bg-zentry-border'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Mostrar Guardados */}
                <div className="flex items-center justify-between p-4 bg-zentry-bg border border-zentry-border rounded-2xl">
                  <div className="flex items-start gap-2">
                    <Bookmark className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="font-extrabold text-zentry-text-1 text-sm">Mostrar mis Guardados</h3>
                      <p className="text-zentry-text-2 mt-0.5">Permite que otros creadores vean tu colección de publicaciones guardadas en tu perfil.</p>
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

                {/* Mostrar Me gusta */}
                <div className="flex items-center justify-between p-4 bg-zentry-bg border border-zentry-border rounded-2xl">
                  <div className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="font-extrabold text-zentry-text-1 text-sm">Mostrar mis Me Gusta</h3>
                      <p className="text-zentry-text-2 mt-0.5">Permite que otros creadores vean las publicaciones que marcaste con me gusta.</p>
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
            </div>
          )}

          {/* TAB 3: NOTIFICACIONES */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="border-b border-zentry-border pb-4">
                <h2 className="text-lg font-extrabold text-zentry-text-1">Preferencias de Notificaciones</h2>
                <p className="text-xs text-zentry-text-2">Configura las alertas que deseas recibir en este dispositivo.</p>
              </div>

              <div className="space-y-4 text-xs">
                {[
                  { key: 'notifyLikes' as const, state: notifyLikes, setState: setNotifyLikes, title: 'Notificaciones de Me Gusta', desc: 'Recibe una alerta cuando alguien reaccione a tus obras' },
                  { key: 'notifyComments' as const, state: notifyComments, setState: setNotifyComments, title: 'Notificaciones de Comentarios', desc: 'Recibe una alerta cuando alguien comente tu publicación' },
                  { key: 'notifyMentions' as const, state: notifyMentions, setState: setNotifyMentions, title: 'Menciones y Etiquetas', desc: 'Notificar cuando te mencionen en un post o comentario' },
                  { key: 'notifyEmail' as const, state: notifyEmail, setState: setNotifyEmail, title: 'Resumen por Correo Electrónico', desc: 'Recibe un resumen semanal con las tendencias más destacadas' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-zentry-bg border border-zentry-border rounded-2xl">
                    <div>
                      <h3 className="font-extrabold text-zentry-text-1 text-sm">{item.title}</h3>
                      <p className="text-zentry-text-2 mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        const next = !item.state;
                        item.setState(next);
                        persistNotificationPrefs({ [item.key]: next });
                      }}
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
                <p className="text-xs text-zentry-text-2">Ajusta el tema visual de tu interfaz.</p>
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
                    <p className="text-zentry-text-2 mt-0.5">Reproducir automáticamente los videos al desplazar el feed.</p>
                  </div>
                  <button
                    onClick={() => {
                      const next = !autoplayMedia;
                      setAutoplayMedia(next);
                      try { localStorage.setItem('zentry_appearance_prefs', JSON.stringify({ autoplayMedia: next })); } catch { /* ignore */ }
                    }}
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
                <button type="submit" disabled={isSavingPassword} className="px-6 py-3 bg-zentry-text-1 text-zentry-bg font-extrabold text-xs rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50">
                  {isSavingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />} Actualizar Contraseña
                </button>
              </div>
            </form>
          )}

          {/* TAB 6: ESTADÍSTICAS */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="border-b border-zentry-border pb-4">
                <h2 className="text-lg font-extrabold text-zentry-text-1">Tus Estadísticas</h2>
                <p className="text-xs text-zentry-text-2">Un vistazo rápido a tu actividad real en Zentry.</p>
              </div>

              {!stats ? (
                <div className="flex items-center justify-center py-10 text-zentry-text-2 gap-2 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" /> Cargando estadísticas...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  {[
                    { label: 'Obras publicadas', value: stats.posts_count },
                    { label: 'Seguidores', value: stats.followers_count },
                    { label: 'Siguiendo', value: stats.following_count },
                    { label: 'Amigos', value: stats.friends_count },
                    { label: 'Zentry Coins', value: `${stats.zentry_coins} ZC` },
                    { label: 'Reputación', value: stats.reputation_score },
                    { label: 'Rango actual', value: stats.rank },
                  ].map(item => (
                    <div key={item.label} className="p-4 bg-zentry-bg border border-zentry-border rounded-2xl">
                      <p className="text-[10px] uppercase font-black tracking-wider text-zentry-text-2">{item.label}</p>
                      <p className="text-lg font-black text-zentry-text-1 mt-1">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: SOPORTE */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <div className="border-b border-zentry-border pb-4">
                <h2 className="text-lg font-extrabold text-zentry-text-1">Centro de Soporte</h2>
                <p className="text-xs text-zentry-text-2">¿Necesitas ayuda? Escríbenos y te responderemos lo antes posible.</p>
              </div>

              <div className="space-y-4 text-xs">
                <a
                  href="mailto:soporte@zentry.com"
                  className="flex items-center gap-3 p-4 bg-zentry-bg border border-zentry-border rounded-2xl hover:border-zentry-accent transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-zentry-accent/15 text-zentry-accent flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-extrabold text-zentry-text-1 text-sm">Escríbenos por correo</h3>
                    <p className="text-zentry-text-2 mt-0.5">soporte@zentry.com</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zentry-text-2 shrink-0" />
                </a>

                <div className="p-4 bg-zentry-bg border border-zentry-border rounded-2xl space-y-3">
                  <h3 className="font-extrabold text-zentry-text-1 text-sm">Preguntas frecuentes</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-bold text-zentry-text-1">¿Cómo elimino mi cuenta?</p>
                      <p className="text-zentry-text-2 mt-0.5">Escríbenos a soporte@zentry.com desde el correo registrado y procesaremos la solicitud en un plazo de 48 horas.</p>
                    </div>
                    <div>
                      <p className="font-bold text-zentry-text-1">¿Cómo reporto contenido inapropiado?</p>
                      <p className="text-zentry-text-2 mt-0.5">Usa el botón de opciones (•••) en cualquier publicación o comunidad y selecciona &quot;Reportar&quot;.</p>
                    </div>
                    <div>
                      <p className="font-bold text-zentry-text-1">¿Cómo funcionan los Zentry Coins?</p>
                      <p className="text-zentry-text-2 mt-0.5">Se ganan completando misiones diarias y logros, y se usan en la Tienda para desbloquear artículos cosméticos.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: POLÍTICAS */}
          {activeTab === 'policies' && (
            <div className="space-y-6">
              <div className="border-b border-zentry-border pb-4">
                <h2 className="text-lg font-extrabold text-zentry-text-1">Políticas de Zentry</h2>
                <p className="text-xs text-zentry-text-2">Revisa los términos y la política de privacidad de la plataforma.</p>
              </div>

              <div className="space-y-3 text-xs">
                <Link
                  href="/terms"
                  className="flex items-center gap-3 p-4 bg-zentry-bg border border-zentry-border rounded-2xl hover:border-zentry-accent transition-colors"
                >
                  <FileText className="w-5 h-5 text-zentry-accent shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-extrabold text-zentry-text-1 text-sm">Términos y Condiciones</h3>
                    <p className="text-zentry-text-2 mt-0.5">Reglas de uso de la plataforma Zentry.</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zentry-text-2 shrink-0" />
                </Link>

                <Link
                  href="/privacy"
                  className="flex items-center gap-3 p-4 bg-zentry-bg border border-zentry-border rounded-2xl hover:border-zentry-accent transition-colors"
                >
                  <Shield className="w-5 h-5 text-zentry-accent shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-extrabold text-zentry-text-1 text-sm">Política de Privacidad</h3>
                    <p className="text-zentry-text-2 mt-0.5">Cómo protegemos y usamos tus datos.</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zentry-text-2 shrink-0" />
                </Link>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
