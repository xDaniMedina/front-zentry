"use client"

import { useState } from "react";
import { Grid, Trophy, MapPin, Calendar, Edit3, Settings, Share2, UserPlus, UserCheck, X, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from '@/lib/actions/auth';

export type ProfileData = {
  username: string;
  name: string;
  discipline: string;
  location: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  followersCount: number;
  followingCount: number;
  createdAt: string;
}

export default function ProfileClient({ initialData, username }: { initialData: ProfileData | null, username: string }) {
  const { user } = useAuth();
  const decodedUsername = decodeURIComponent(username);

    const isCurrentUser = user && (
    user.username === decodedUsername || 
    user.email === decodedUsername
  );

const [profile, setProfile] = useState<ProfileData>(initialData || {
    username: decodedUsername,
    name: isCurrentUser ? (user?.username || decodedUsername) : decodedUsername,
    discipline: "Creador Digital",
    location: "Sin ubicación",
    bio: "Este usuario aún no ha escrito una biografía.",
    avatarUrl: "",
    bannerUrl: "",
    followersCount: 0,
    followingCount: 0,
    createdAt: ""
  });

  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'achievements'>('posts');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: profile.name || "",
    discipline: profile.discipline || "",
    location: profile.location || "",
    bio: profile.bio || ""
  });

  const handleToggleFollow = async () => {
    setIsFollowing(prev => !prev);
    setProfile(prev => ({
      ...prev,
      followersCount: isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
    }));

    try {
      const tokenMatch = document.cookie.match(new RegExp('(^| )zentry_token=([^;]+)'));
      const clientToken = tokenMatch ? tokenMatch[2] : null;

      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, "");
      await fetch(`${apiBase}/api/core/profiles/${decodedUsername}/follow`, {
        method: 'POST',
        headers: {
          ...(clientToken ? { 'Authorization': `Bearer ${clientToken}` } : {})
        }
      });
    } catch (error) {
      console.error("Error al seguir usuario:", error);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const tokenMatch = document.cookie.match(new RegExp('(^| )zentry_token=([^;]+)'));
      const clientToken = tokenMatch ? tokenMatch[2] : null;

      //FormData
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('discipline', editForm.discipline);
      formData.append('location', editForm.location);
      formData.append('bio', editForm.bio);

      if (avatarFile) formData.append('avatar', avatarFile);
      if (bannerFile) formData.append('banner', bannerFile);

      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, "");
      const response = await fetch(`${apiBase}/api/core/profiles/me`, {
        method: 'PUT',
        headers: {
          ...(clientToken ? { 'Authorization': `Bearer ${clientToken}` } : {})
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile((prev) => ({ ...prev, ...updatedProfile }));
        setIsEditModalOpen(false);
        setAvatarFile(null);
        setBannerFile(null)
      } else {
        console.error("Error del servidor:", response.status);
        alert("Hubo un error al guardar los cambios.");
      }
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      alert("No se pudo conectar con el servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleForceLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm("¿Estás seguro de que deseas salir de Zentry?")) {
      await logout();
      
      // Limpiamos la cookie de forma manual por seguridad
      document.cookie = "zentry_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax;";
      window.location.href = "/login";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 relative">
      
      {/* Banner y Avatar */}
      <div className="relative mb-16">
        <div className="w-full h-32 sm:h-48 bg-zentry-card border border-zentry-border rounded-3xl overflow-hidden relative group cursor-pointer">
          <div className="w-full h-full bg-gradient-to-r from-purple-600/40 to-blue-600/40" />
          {isCurrentUser && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-medium gap-2">
              <Edit3 className="w-4 h-4" /> Cambiar portada
            </div>
          )}
        </div>
        <div className="absolute -bottom-10 left-6 sm:left-10 group cursor-pointer">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-zentry-bg bg-zentry-card flex items-center justify-center text-3xl sm:text-4xl font-bold text-zentry-text-1 relative overflow-hidden">
            {(profile.name || profile.username || "DA").substring(0, 2).toUpperCase()}
            {isCurrentUser && (
              <div
                onClick={() => setIsEditModalOpen(true)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                <Edit3 className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info del Perfil */}
      <div className="px-2 sm:px-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-zentry-text-1">{profile.name}</h1>
            <p className="text-zentry-text-2">@{profile.username} • {profile.discipline}</p>
          </div>
          
          <div className="flex items-center gap-2">
            {isCurrentUser ? (
              <>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-zentry-bg border border-zentry-border rounded-xl text-sm font-medium text-zentry-text-1 hover:bg-zentry-card transition-colors"
                >
                  <Edit3 className="w-4 h-4" /> Editar
                </button>
                <button className="p-2 border border-zentry-border rounded-xl text-zentry-text-1 hover:bg-zentry-card transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
                {/* BOTÓN DE CERRAR SESIÓN */}
                <button 
                    onClick={handleForceLogout} 
                    className="p-2 border border-red-900/50 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors" 
                    title="Cerrar sesión">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button 
                onClick={handleToggleFollow}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  isFollowing 
                    ? 'bg-zentry-bg border border-zentry-border text-zentry-text-1 hover:border-red-500/50 hover:text-red-400' 
                    : 'bg-zentry-text-1 text-zentry-bg hover:opacity-90'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4 text-emerald-400" /> Siguiendo
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Seguir
                  </>
                )}
              </button>
            )}
            <button className="p-2 border border-zentry-border rounded-xl text-zentry-text-1 hover:bg-zentry-card transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <p className="text-sm text-zentry-text-1 mb-4 max-w-2xl leading-relaxed">
          {profile.bio}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs text-zentry-text-2 mb-6">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {profile.location}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Zentry desde {profile.createdAt ? "2026" : "Recientemente"}</span>
        </div>

        {/* NÚMEROS DINÁMICOS */}
        <div className="flex gap-4">
          <p className="text-sm cursor-pointer hover:underline"><span className="font-bold text-zentry-text-1">{profile.followingCount}</span> <span className="text-zentry-text-2">Siguiendo</span></p>
          <p className="text-sm cursor-pointer hover:underline"><span className="font-bold text-zentry-text-1">{profile.followersCount}</span> <span className="text-zentry-text-2">Seguidores</span></p>
        </div>
      </div>

      <div className="flex gap-6 border-b border-zentry-border mb-6 px-2 sm:px-4">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`pb-3 flex items-center gap-2 text-sm font-medium transition-colors relative ${activeTab === 'posts' ? 'text-zentry-text-1' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
        >
          <Grid className="w-4 h-4" /> Obras
          {activeTab === 'posts' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zentry-text-1 rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('achievements')}
          className={`pb-3 flex items-center gap-2 text-sm font-medium transition-colors relative ${activeTab === 'achievements' ? 'text-zentry-text-1' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
        >
          <Trophy className="w-4 h-4" /> Logros
          {activeTab === 'achievements' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zentry-text-1 rounded-t-full" />}
        </button>
      </div>

      {/* Contenido */}
      <div className="px-2 sm:px-4">
        {activeTab === 'posts' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-square bg-zentry-card border border-zentry-border rounded-2xl hover:opacity-80 transition-opacity cursor-pointer group relative overflow-hidden flex items-center justify-center">
                 <span className="text-zentry-text-2/20 font-bold text-4xl">Z</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-zentry-text-2 text-sm border border-zentry-border rounded-3xl border-dashed">
            Aún no hay logros desbloqueados.
          </div>
        )}
      </div>

      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-zentry-card border border-zentry-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-zentry-border flex justify-between items-center bg-zentry-bg">
                <h3 className="font-bold text-lg text-zentry-text-1">Editar Perfil</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-zentry-text-2 hover:text-zentry-text-1 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <form id="editProfileForm" onSubmit={handleSaveProfile} className="flex flex-col gap-5">

                  <div className="flex gap-4 mb-2">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-zentry-text-2 mb-1.5 uppercase tracking-wider">Foto de Perfil</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => setAvatarFile(e.target.files?.[0] || null)}
                        className="w-full text-sm text-zentry-text-1 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-zentry-accent/20 file:text-zentry-accent hover:file:bg-zentry-accent/30 transition-colors cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-zentry-text-2 mb-1.5 uppercase tracking-wider">Foto de Portada</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => setBannerFile(e.target.files?.[0] || null)}
                        className="w-full text-sm text-zentry-text-1 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-zentry-accent/20 file:text-zentry-accent hover:file:bg-zentry-accent/30 transition-colors cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zentry-text-2 mb-1.5 uppercase tracking-wider">Nombre a mostrar</label>
                    <input 
                      type="text" 
                      value={editForm.name} 
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                      className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors"
                      placeholder="Ej. Daniel Artesano"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-zentry-text-2 mb-1.5 uppercase tracking-wider">Disciplina principal</label>
                    <input 
                      type="text" 
                      value={editForm.discipline} 
                      onChange={e => setEditForm({...editForm, discipline: e.target.value})}
                      className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors"
                      placeholder="Ej. Ilustración Digital"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zentry-text-2 mb-1.5 uppercase tracking-wider">Ubicación</label>
                    <input 
                      type="text" 
                      value={editForm.location} 
                      onChange={e => setEditForm({...editForm, location: e.target.value})}
                      className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors"
                      placeholder="Ej. Puebla, México"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zentry-text-2 mb-1.5 uppercase tracking-wider">Biografía</label>
                    <textarea 
                      value={editForm.bio} 
                      onChange={e => setEditForm({...editForm, bio: e.target.value})}
                      className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors resize-none h-24"
                      placeholder="Cuéntale a la comunidad sobre ti..."
                    />
                  </div>
                </form>
              </div>

              <div className="p-4 border-t border-zentry-border bg-zentry-bg flex justify-end gap-3">
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-zentry-text-2 hover:bg-zentry-card transition-colors"
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  form="editProfileForm"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-zentry-text-1 text-zentry-bg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : "Guardar cambios"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}