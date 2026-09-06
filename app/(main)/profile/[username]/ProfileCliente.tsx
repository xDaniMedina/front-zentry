"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Grid, Trophy, MapPin, Calendar, Edit3, Settings, Share2, 
  UserPlus, UserCheck, X, LogOut, Loader2, MessageSquare, Lock, 
  CheckCircle2, Bookmark, Heart, Video, Music, FolderLock
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'sonner';
import LogoutModal from "@/components/shared/LogoutModal";
import { AchievementItem } from "@/lib/gamification";
import { fetchAchievements } from "@/lib/actions/gamification";
import { followUserAction, updateProfileAction, updateProfileWithFilesAction } from "@/lib/actions/profile";
import FollowsModal from "@/components/feed/FollowsModal";

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
  isFollowing?: boolean;
}

export default function ProfileClient({ initialData, username }: { initialData: ProfileData | null, username: string }) {
  const { user, updateUser } = useAuth();
  const decodedUsername = decodeURIComponent(username);

  const normalize = (str?: string | null) => {
    if (!str) return '';
    const clean = str.includes('@') ? str.split('@')[0] : str;
    return clean.toLowerCase().trim();
  };

  const isCurrentUser = Boolean(
    user && (
      normalize(user.username) === normalize(decodedUsername) || 
      normalize(user.email) === normalize(decodedUsername)
    )
  );

  const displayName = isCurrentUser
    ? (user?.username?.includes('@') ? user.username.split('@')[0] : (user?.username || decodedUsername))
    : decodedUsername;

  const [profile, setProfile] = useState<ProfileData>(initialData || {
    username: decodedUsername,
    name: displayName,
    discipline: "Creador Digital",
    location: "Sin ubicación",
    bio: "Este usuario aún no ha escrito una biografía.",
    avatarUrl: "",
    bannerUrl: "",
    followersCount: 0,
    followingCount: 0,
    createdAt: "",
    isFollowing: false
  });

  const [isFollowing, setIsFollowing] = useState(Boolean(initialData?.isFollowing));
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'liked' | 'achievements'>('posts');
  const [achievementCategory, setAchievementCategory] = useState<string>('all');
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);

  useEffect(() => {
    if (!isCurrentUser) return;
    fetchAchievements().then(res => {
      if (res.success) setAchievements(res.achievements);
    });
  }, [isCurrentUser]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  // Estados Dinámicos de Publicaciones
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);

  // Cargar Posts desde el Motor de Publicaciones
  useEffect(() => {
    async function loadProfilePosts() {
      try {
        const res = await fetch('/api/posts');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setAllPosts(data.data);
          }
        }
      } catch {}
    }

    loadProfilePosts();

    if (typeof window !== 'undefined') {
      try {
        const savedKey = `zentry_saved_posts_${decodedUsername.toLowerCase()}`;
        const saved = JSON.parse(localStorage.getItem(savedKey) || '[]');
        if (Array.isArray(saved)) setSavedPostIds(saved);

        const likedKey = `zentry_liked_posts_${decodedUsername.toLowerCase()}`;
        const liked = JSON.parse(localStorage.getItem(likedKey) || '[]');
        if (Array.isArray(liked)) setLikedPostIds(liked);
      } catch {}
    }
  }, [decodedUsername]);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [followsModal, setFollowsModal] = useState<{isOpen: boolean, type: 'followers' | 'following'}>({ isOpen: false, type: 'followers' });
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: profile.name || "",
    discipline: profile.discipline || "",
    location: profile.location || "",
    bio: profile.bio || ""
  });

  const handleToggleFollow = async () => {
    const previousState = isFollowing;
    const nextState = !previousState;

    // Actualización optimista de UI
    setIsFollowing(nextState);
    setProfile(prev => ({
      ...prev,
      followersCount: nextState ? prev.followersCount + 1 : Math.max(0, prev.followersCount - 1),
      isFollowing: nextState
    }));

    try {
      const result = await followUserAction(decodedUsername);

      if (result.success) {
        const data = result.data;
        if (data && typeof data.following === 'boolean') {
          setIsFollowing(data.following);
          if (typeof data.followersCount === 'number') {
            setProfile(prev => ({ ...prev, followersCount: data.followersCount, isFollowing: data.following }));
          }
        }
        toast.success(nextState ? `Ahora sigues a @${decodedUsername} ✨` : `Dejaste de seguir a @${decodedUsername}`);
      } else {
        // Revertir en caso de fallo
        setIsFollowing(previousState);
        setProfile(prev => ({
          ...prev,
          followersCount: previousState ? prev.followersCount + 1 : Math.max(0, prev.followersCount - 1),
          isFollowing: previousState
        }));
        toast.error("No se pudo actualizar el seguimiento.");
      }
    } catch (error) {
      console.error("Error al seguir usuario:", error);
      setIsFollowing(previousState);
      setProfile(prev => ({
        ...prev,
        followersCount: previousState ? prev.followersCount + 1 : Math.max(0, prev.followersCount - 1),
        isFollowing: previousState
      }));
    }
  };

  const handleAvatarChange = (file: File | null) => {
    setAvatarFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (file: File | null) => {
    setBannerFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, bannerUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const hasFiles = Boolean(avatarFile || bannerFile);

      // Actualización local garantizada en AuthContext y LocalStorage
      const newAvatarUrl = profile.avatarUrl || "";
      const newBannerUrl = profile.bannerUrl || "";

      updateUser({
        name: editForm.name,
        discipline: editForm.discipline,
        bio: editForm.bio,
        location: editForm.location,
        avatar_url: newAvatarUrl,
        banner_url: newBannerUrl
      });

      setProfile(prev => ({
        ...prev,
        name: editForm.name,
        discipline: editForm.discipline,
        location: editForm.location,
        bio: editForm.bio
      }));

      setIsEditModalOpen(false);
      setAvatarFile(null);
      setBannerFile(null);
      toast.success("Foto de perfil y datos actualizados correctamente ✨");

      // Notificar al backend
      if (hasFiles) {
        const formData = new FormData();
        formData.append('name', editForm.name);
        formData.append('discipline', editForm.discipline);
        formData.append('location', editForm.location);
        formData.append('bio', editForm.bio);

        if (avatarFile) formData.append('avatar', avatarFile);
        if (bannerFile) formData.append('banner', bannerFile);

        await updateProfileWithFilesAction(formData).catch(err => console.warn("Backend no guardó copia remota:", err));
      } else {
        const formData = new FormData();
        formData.append('name', editForm.name);
        formData.append('discipline', editForm.discipline);
        formData.append('location', editForm.location);
        formData.append('bio', editForm.bio);

        await updateProfileAction(formData).catch(err => console.warn("Backend no guardó copia remota:", err));
      }
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      toast.success("Cambios guardados localmente ✨");
    } finally {
      setIsSaving(false);
    }
  };

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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
                  onClick={() => setIsLogoutModalOpen(true)} 
                  className="p-2 border border-red-900/50 rounded-xl text-red-400 hover:text-white hover:bg-red-500/20 transition-all hover:scale-105 active:scale-95" 
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleToggleFollow}
                  className={`group flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                    isFollowing 
                      ? 'bg-zentry-bg border border-zentry-border text-zentry-text-1 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400' 
                      : 'bg-zentry-text-1 text-zentry-bg hover:opacity-90'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4 text-emerald-400 group-hover:hidden" />
                      <UserPlus className="w-4 h-4 text-red-400 hidden group-hover:block rotate-45" />
                      <span className="group-hover:hidden">Siguiendo</span>
                      <span className="hidden group-hover:inline text-red-400">Dejar de seguir</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Seguir
                    </>
                  )}
                </button>

                <Link
                  href={`/messages?user=${encodeURIComponent(decodedUsername)}`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-zentry-accent text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-md shadow-zentry-accent/20"
                  title="Enviar Mensaje Directo"
                >
                  <MessageSquare className="w-4 h-4" /> Mensaje
                </Link>
              </div>
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
          <p 
            onClick={() => setFollowsModal({ isOpen: true, type: 'following' })}
            className="text-sm cursor-pointer hover:underline"
          >
            <span className="font-bold text-zentry-text-1">{profile.followingCount}</span> <span className="text-zentry-text-2">Siguiendo</span>
          </p>
          <p 
            onClick={() => setFollowsModal({ isOpen: true, type: 'followers' })}
            className="text-sm cursor-pointer hover:underline"
          >
            <span className="font-bold text-zentry-text-1">{profile.followersCount}</span> <span className="text-zentry-text-2">Seguidores</span>
          </p>
        </div>
      </div>

      {/* Pestañas Estilo TikTok / Instagram */}
      <div className="flex gap-4 sm:gap-6 border-b border-zentry-border mb-6 px-2 sm:px-4 overflow-x-auto custom-scrollbar">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`pb-3 flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors relative shrink-0 cursor-pointer ${activeTab === 'posts' ? 'text-zentry-text-1' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
        >
          <Grid className="w-4 h-4" /> Obras ({allPosts.filter(p => p.handle.toLowerCase().includes(decodedUsername.toLowerCase()) || p.author.toLowerCase().includes(decodedUsername.toLowerCase())).length})
          {activeTab === 'posts' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zentry-accent rounded-t-full shadow-sm shadow-zentry-accent" />}
        </button>

        <button 
          onClick={() => setActiveTab('saved')}
          className={`pb-3 flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors relative shrink-0 cursor-pointer ${activeTab === 'saved' ? 'text-zentry-text-1' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
        >
          <Bookmark className="w-4 h-4" /> Guardados ({savedPostIds.length})
          {activeTab === 'saved' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-t-full shadow-sm shadow-amber-400" />}
        </button>

        <button 
          onClick={() => setActiveTab('liked')}
          className={`pb-3 flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors relative shrink-0 cursor-pointer ${activeTab === 'liked' ? 'text-zentry-text-1' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
        >
          <Heart className="w-4 h-4" /> Me gusta ({allPosts.filter(p => likedPostIds.includes(String(p.id)) || (p.liked_by && p.liked_by.includes(decodedUsername.toLowerCase()))).length})
          {activeTab === 'liked' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-t-full shadow-sm shadow-rose-500" />}
        </button>

        <button 
          onClick={() => setActiveTab('achievements')}
          className={`pb-3 flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors relative shrink-0 cursor-pointer ${activeTab === 'achievements' ? 'text-zentry-text-1' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
        >
          <Trophy className="w-4 h-4 text-amber-400" /> Logros
          {activeTab === 'achievements' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zentry-text-1 rounded-t-full" />}
        </button>
      </div>

      {/* Contenido Dinámico de las Pestañas */}
      <div className="px-2 sm:px-4">
        {/* 1. PESTAÑA: OBRAS CREADAS */}
        {activeTab === 'posts' && (() => {
          const userPosts = allPosts.filter(p => 
            p.handle.toLowerCase().includes(decodedUsername.toLowerCase()) || 
            p.author.toLowerCase().includes(decodedUsername.toLowerCase())
          );

          if (userPosts.length === 0) {
            return (
              <div className="text-center py-16 px-4 bg-zentry-card border border-zentry-border rounded-3xl space-y-3">
                <Grid className="w-12 h-12 text-zentry-text-2/40 mx-auto" />
                <h3 className="text-base font-extrabold text-zentry-text-1">Aún no hay publicaciones</h3>
                <p className="text-xs text-zentry-text-2 max-w-sm mx-auto">
                  {isCurrentUser ? "¡Comparte tus creaciones de arte, video o música en el feed principal!" : `@${decodedUsername} aún no ha publicado ninguna obra.`}
                </p>
                {isCurrentUser && (
                  <Link href="/feed" className="inline-block px-5 py-2.5 bg-zentry-accent text-white rounded-2xl text-xs font-black hover:opacity-90 shadow-md">
                    Ir al Feed a Crear
                  </Link>
                )}
              </div>
            );
          }

          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {userPosts.map(post => (
                <Link
                  key={post.id}
                  href={`/feed?post=${post.id}`}
                  className="aspect-square bg-zentry-card border border-zentry-border rounded-2xl hover:border-zentry-accent/60 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between p-3"
                >
                  {post.media_type === 'image' && post.media_url ? (
                    <Image src={post.media_url} alt={post.title} fill sizes="300px" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : post.media_type === 'video' ? (
                    <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                      <Video className="w-10 h-10 text-indigo-400 opacity-60 group-hover:scale-110 transition-transform" />
                    </div>
                  ) : post.media_type === 'audio' ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-indigo-950 to-zentry-card flex items-center justify-center p-4 text-center">
                      <Music className="w-10 h-10 text-purple-400 opacity-70 group-hover:scale-110 transition-transform" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/40 via-zentry-card to-blue-950/40 flex items-center justify-center p-4">
                      <p className="text-xs font-bold text-zentry-text-1 line-clamp-4">{post.title}</p>
                    </div>
                  )}

                  <div className="relative z-10 flex justify-between items-center text-[10px] text-white bg-black/60 backdrop-blur-md px-2 py-1 rounded-xl w-fit">
                    <span className="font-bold capitalize">{post.media_type}</span>
                  </div>

                  <div className="relative z-10 flex items-center gap-3 text-xs font-black text-white bg-black/70 backdrop-blur-md p-2 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity">
                    <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> {post.likes}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-zinc-300" /> {post.comments}</span>
                  </div>
                </Link>
              ))}
            </div>
          );
        })()}

        {/* 2. PESTAÑA: GUARDADOS (Estilo Instagram / TikTok) */}
        {activeTab === 'saved' && (() => {
          if (!isCurrentUser) {
            return (
              <div className="text-center py-16 px-4 bg-zentry-card border border-zentry-border rounded-3xl space-y-3">
                <FolderLock className="w-12 h-12 text-amber-400/60 mx-auto" />
                <h3 className="text-base font-extrabold text-zentry-text-1">Colección Privada</h3>
                <p className="text-xs text-zentry-text-2 max-w-sm mx-auto">
                  Solo @{decodedUsername} puede ver sus publicaciones guardadas.
                </p>
              </div>
            );
          }

          const savedPosts = allPosts.filter(p => savedPostIds.includes(String(p.id)));

          if (savedPosts.length === 0) {
            return (
              <div className="text-center py-16 px-4 bg-zentry-card border border-zentry-border rounded-3xl space-y-3">
                <Bookmark className="w-12 h-12 text-amber-400/40 mx-auto" />
                <h3 className="text-base font-extrabold text-zentry-text-1">Aún no has guardado publicaciones</h3>
                <p className="text-xs text-zentry-text-2 max-w-sm mx-auto">
                  Guarda tus fotos, videos y audios favoritos desde el feed haciendo clic en el icono de marcador 🔖.
                </p>
                <Link href="/feed" className="inline-block px-5 py-2.5 bg-amber-500 text-black font-black rounded-2xl text-xs hover:opacity-90 shadow-md">
                  Explorar el Feed
                </Link>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {savedPosts.map(post => (
                <Link
                  key={post.id}
                  href={`/feed?post=${post.id}`}
                  className="aspect-square bg-zentry-card border border-zentry-border rounded-2xl hover:border-amber-400/60 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between p-3"
                >
                  {post.media_type === 'image' && post.media_url ? (
                    <Image src={post.media_url} alt={post.title} fill sizes="300px" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 via-zentry-card to-purple-950/40 flex items-center justify-center p-4">
                      <p className="text-xs font-bold text-zentry-text-1 line-clamp-4">{post.title}</p>
                    </div>
                  )}

                  <div className="relative z-10 flex justify-between items-center text-[10px] text-white bg-black/60 backdrop-blur-md px-2 py-1 rounded-xl w-fit">
                    <span className="font-bold text-amber-300">Guardado</span>
                  </div>

                  <div className="relative z-10 flex items-center gap-3 text-xs font-black text-white bg-black/70 backdrop-blur-md p-2 rounded-xl">
                    <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> {post.likes}</span>
                    <span className="truncate text-[10px] text-zinc-300">{post.author}</span>
                  </div>
                </Link>
              ))}
            </div>
          );
        })()}

        {/* 3. PESTAÑA: ME GUSTA (Estilo TikTok) */}
        {activeTab === 'liked' && (() => {
          const likedPosts = allPosts.filter(p => 
            likedPostIds.includes(String(p.id)) || 
            (p.liked_by && p.liked_by.includes(decodedUsername.toLowerCase()))
          );

          if (likedPosts.length === 0) {
            return (
              <div className="text-center py-16 px-4 bg-zentry-card border border-zentry-border rounded-3xl space-y-3">
                <Heart className="w-12 h-12 text-rose-500/40 mx-auto" />
                <h3 className="text-base font-extrabold text-zentry-text-1">Aún no hay publicaciones con Me gusta</h3>
                <p className="text-xs text-zentry-text-2 max-w-sm mx-auto">
                  {isCurrentUser ? "Dale corazón a las obras que te inspiren en el feed para encontrarlas aquí." : `@${decodedUsername} no tiene publicaciones con me gusta públicas.`}
                </p>
                {isCurrentUser && (
                  <Link href="/feed" className="inline-block px-5 py-2.5 bg-rose-600 text-white rounded-2xl text-xs font-black hover:opacity-90 shadow-md">
                    Descubrir Obras
                  </Link>
                )}
              </div>
            );
          }

          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {likedPosts.map(post => (
                <Link
                  key={post.id}
                  href={`/feed?post=${post.id}`}
                  className="aspect-square bg-zentry-card border border-zentry-border rounded-2xl hover:border-rose-500/60 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between p-3"
                >
                  {post.media_type === 'image' && post.media_url ? (
                    <Image src={post.media_url} alt={post.title} fill sizes="300px" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-950/40 via-zentry-card to-purple-950/40 flex items-center justify-center p-4">
                      <p className="text-xs font-bold text-zentry-text-1 line-clamp-4">{post.title}</p>
                    </div>
                  )}

                  <div className="relative z-10 flex justify-between items-center text-[10px] text-white bg-black/60 backdrop-blur-md px-2 py-1 rounded-xl w-fit">
                    <span className="font-bold text-rose-400 flex items-center gap-1"><Heart className="w-3 h-3 fill-rose-500" /> Me gusta</span>
                  </div>

                  <div className="relative z-10 flex items-center justify-between text-xs font-black text-white bg-black/70 backdrop-blur-md p-2 rounded-xl">
                    <span className="truncate text-[10px] text-zinc-300">{post.author}</span>
                    <span className="text-[10px] font-mono">{post.likes} ❤️</span>
                  </div>
                </Link>
              ))}
            </div>
          );
        })()}

        {/* 4. PESTAÑA: LOGROS */}
        {activeTab === 'achievements' && !isCurrentUser && (
          <div className="text-center py-16 px-4 bg-zentry-card border border-zentry-border rounded-3xl space-y-3">
            <FolderLock className="w-12 h-12 text-amber-400/60 mx-auto" />
            <h3 className="text-base font-extrabold text-zentry-text-1">Logros Privados</h3>
            <p className="text-xs text-zentry-text-2 max-w-sm mx-auto">
              Solo @{decodedUsername} puede ver el detalle de sus logros.
            </p>
          </div>
        )}
        {activeTab === 'achievements' && isCurrentUser && (
          <div className="space-y-5">
            {/* Resumen Superior de Logros del Perfil */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zentry-card p-4 rounded-2xl border border-zentry-border shadow-sm">
              <div className="flex flex-col">
                <span className="text-[10px] text-zentry-text-2 uppercase font-bold">Total Logros</span>
                <span className="text-base font-black text-zentry-text-1">{achievements.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-zentry-text-2 uppercase font-bold">Desbloqueados</span>
                <span className="text-base font-black text-emerald-400">
                  {achievements.filter(a => a.isUnlocked).length} / {achievements.length}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-zentry-text-2 uppercase font-bold">Misterios Revelados</span>
                <span className="text-base font-black text-pink-400">
                  {achievements.filter(a => a.rarity === 'mysterious' && a.isUnlocked).length} / {achievements.filter(a => a.rarity === 'mysterious').length}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-zentry-text-2 uppercase font-bold">Recompensas ZC</span>
                <span className="text-base font-black text-amber-400 font-mono">
                  +{achievements.filter(a => a.isUnlocked).reduce((sum, a) => sum + a.rewardCoins, 0)} ZC
                </span>
              </div>
            </div>

            {/* Filtros de Categorías */}
            <div className="flex gap-2 overflow-x-auto pb-1 text-xs custom-scrollbar">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'mysterious', label: '🔮 Misteriosos' },
                { id: 'unlocked', label: '✨ Desbloqueados' },
                { id: 'locked', label: '🔒 Bloqueados' },
                { id: 'creation', label: '🎨 Creación' },
                { id: 'social', label: '💬 Social' },
                { id: 'community', label: '🏛️ Comunidad' },
                { id: 'reputation', label: '👑 Reputación' },
                { id: 'mastery', label: '⚡ Maestría' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setAchievementCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
                    achievementCategory === cat.id
                      ? cat.id === 'mysterious'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                        : 'bg-zentry-accent text-white shadow-md'
                      : 'bg-zentry-card border border-zentry-border text-zentry-text-2 hover:text-zentry-text-1'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Grid de Tarjetas de Logros */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements.filter(ach => {
                if (achievementCategory === 'all') return true;
                if (achievementCategory === 'mysterious') return ach.rarity === 'mysterious';
                if (achievementCategory === 'unlocked') return ach.isUnlocked;
                if (achievementCategory === 'locked') return !ach.isUnlocked;
                return ach.category === achievementCategory;
              }).map(ach => {
                const isMysterious = ach.rarity === 'mysterious';
                const isSecretAndLocked = isMysterious && !ach.isUnlocked;

                const rarityBadge = {
                  common: 'border-zinc-700 bg-zinc-800/40 text-zinc-300',
                  rare: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
                  epic: 'border-purple-500/40 bg-purple-500/10 text-purple-400',
                  legendary: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
                  mysterious: 'border-pink-500/40 bg-pink-500/10 text-pink-300 shadow-sm shadow-pink-500/20'
                }[ach.rarity];

                return (
                  <div 
                    key={ach.id} 
                    className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all relative overflow-hidden ${
                      ach.isUnlocked 
                        ? isMysterious
                          ? 'bg-gradient-to-br from-purple-950/60 via-[#1a142e] to-pink-950/40 border-pink-500/60 shadow-lg shadow-pink-500/10'
                          : 'bg-gradient-to-br from-purple-950/30 via-zentry-card to-indigo-950/30 border-purple-500/40 shadow-md' 
                        : isMysterious
                          ? 'bg-gradient-to-br from-[#120824] via-[#0e0a1a] to-[#160a28] border-pink-900/50'
                          : 'bg-zentry-bg/60 border-zentry-border/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-2xl p-2.5 rounded-2xl border shrink-0 shadow-inner ${
                          isSecretAndLocked ? 'bg-purple-950/50 border-pink-500/30 text-pink-400 animate-pulse' : 'bg-zentry-bg border-zentry-border'
                        }`}>
                          {isSecretAndLocked ? '🔮' : ach.icon}
                        </span>
                        <div>
                          <h4 className="font-extrabold text-sm text-zentry-text-1">
                            {isSecretAndLocked ? '??? (Logro Oculto)' : ach.title}
                          </h4>
                          <span className="text-[10px] font-mono text-purple-400 font-bold">
                            {ach.isUnlocked 
                              ? `Desbloqueado (${ach.unlockedDate || '2026'})` 
                              : isMysterious 
                                ? 'Enigma por descifrar 🗝️' 
                                : 'Bloqueado 🔒'}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-black text-amber-400 font-mono bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 shrink-0">
                        +{ach.rewardCoins} ZC
                      </span>
                    </div>

                    <p className={`text-xs leading-relaxed ${isSecretAndLocked ? 'text-pink-300/80 italic font-mono' : 'text-zentry-text-2'}`}>
                      {isSecretAndLocked ? (ach.secretHint || 'Pista: Realiza acciones extraordinarias en la red para revelar este misterio...') : ach.description}
                    </p>

                    <div className="pt-2 border-t border-zentry-border/60 flex items-center justify-between text-xs">
                      {ach.isUnlocked ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Desbloqueado
                        </span>
                      ) : (
                        <span className="text-zentry-text-2 flex items-center gap-1 font-mono text-[11px]">
                          <Lock className="w-3.5 h-3.5" /> {isMysterious ? 'Por descubrir' : 'Bloqueado'}
                        </span>
                      )}
                      <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border ${rarityBadge}`}>
                        {ach.rarity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
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
                        onChange={e => handleAvatarChange(e.target.files?.[0] || null)}
                        className="w-full text-sm text-zentry-text-1 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-zentry-accent/20 file:text-zentry-accent hover:file:bg-zentry-accent/30 transition-colors cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-zentry-text-2 mb-1.5 uppercase tracking-wider">Foto de Portada</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => handleBannerChange(e.target.files?.[0] || null)}
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
      
      <FollowsModal 
        isOpen={followsModal.isOpen} 
        onClose={() => setFollowsModal(prev => ({ ...prev, isOpen: false }))} 
        username={decodedUsername} 
        type={followsModal.type} 
      />

      {/* MODAL PORTAL DE CIERRE DE SESIÓN ANIMADO */}
      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />

    </div>
  )
}