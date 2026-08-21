"use client"

import { useState, useRef } from "react";
import { 
  Users, Shield, Hash, Bell, Info, ArrowLeft, Globe, ShieldCheck, 
  Send, Image as ImageIcon, Link as LinkIcon, MessageSquare, Flame, 
  CheckCircle2, Sparkles, Settings, Music, Video, Plus, Trash2, X, Edit3, Check 
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { FeedCard, PostType } from "@/components/feed/FeedCard"; 
import { useAuth } from "@/context/AuthContext";

type CommunityDetails = {
  id?: string;
  slug?: string;
  name?: string;
  description?: string;
  members?: number;
  onlineCount?: number;
  isJoined?: boolean;
  ownerUsername?: string;
  rules?: string[];
  avatarUrl?: string;
  bannerUrl?: string;
  posts?: PostType[];
}

const FALLBACK_COMMUNITY_DETAILS: Record<string, CommunityDetails> = {
  'digital-art': {
    id: '2',
    slug: 'digital-art',
    name: 'Digital Art Masters',
    description: 'Comunidad dedicada a ilustradores digitales, artistas 3D, concept art y Matte Painting. Comparte tu flujo de trabajo, pinceles, tutoriales y recibe feedback constructivo.',
    members: 8400,
    onlineCount: 342,
    isJoined: true,
    ownerUsername: 'artist',
    rules: [
      'Respeta el trabajo de todos los creadores.',
      'No publiques arte generado por IA sin la etiqueta adecuada.',
      'Incluye las herramientas utilizadas (Photoshop, Blender, Procreate) en tus publicaciones.'
    ],
    posts: [
      { id: 101, title: 'Estudio de iluminación y paleta de colores en entorno nocturno', author: 'Luna Muse', handle: '@lunamuse', likes: 145, comments: 23, height: 'h-64', color: 'from-purple-500/20 to-pink-500/20', avatar: 'LM' },
      { id: 102, title: 'Texturizado estilizado en Substance Painter para personajes 3D', author: 'Carlos Dev', handle: '@carlos_dev', likes: 89, comments: 5, height: 'h-80', color: 'from-blue-500/20 to-cyan-500/20', avatar: 'CD' },
    ]
  },
  'ui-ux-designers': {
    id: '1',
    slug: 'ui-ux-designers',
    name: 'UI/UX Designers Hub',
    description: 'Recursos de Figma, design systems, accesibilidad web y arquitectura de información.',
    members: 12500,
    onlineCount: 512,
    isJoined: true,
    ownerUsername: 'admin',
    rules: ['Publica capturas claras de tus interfaces.', 'No compartas contenido con derechos de autor.'],
    posts: [
      { id: 201, title: 'Sistema de diseño accesible con Tailwind v4 y Radix UI', author: 'Elena Design', handle: '@elena_ui', likes: 210, comments: 34, height: 'h-64', color: 'from-indigo-500/20 to-blue-500/20', avatar: 'ED' }
    ]
  }
};

const DEFAULT_POSTS: PostType[] = [
  { id: 301, title: '¡Bienvenidos a la comunidad! Comparte tus avances e ideas.', author: 'Zentry Team', handle: '@zentry', likes: 54, comments: 12, height: 'h-64', color: 'from-purple-500/20 to-blue-500/20', avatar: 'ZE' }
];

export default function CommunityDetailClient({ slug, initialData }: { slug: string; initialData?: CommunityDetails | null }) {
  const { user } = useAuth();
  const fallback = FALLBACK_COMMUNITY_DETAILS[slug] || {};
  
  const communityId = initialData?.id || fallback.id || '1';
  const ownerUsername = initialData?.ownerUsername || fallback.ownerUsername || 'admin';
  
  const [communityName, setCommunityName] = useState<string>(initialData?.name || fallback.name || decodeURIComponent(slug).replace(/-/g, ' ').toUpperCase());
  const [description, setDescription] = useState<string>(initialData?.description || fallback.description || `Espacio oficial de ${communityName} en Zentry. Comparte tus publicaciones, debate ideas y conecta con miembros.`);
  const [rules, setRules] = useState<string[]>(initialData?.rules || fallback.rules || [
    'Sé respetuoso y constructivo en tus comentarios.',
    'Publica contenido de calidad relevante a la temática.',
    'Evita el spam y enlaces promocionales no autorizados.'
  ]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatarUrl || fallback.avatarUrl || null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(initialData?.bannerUrl || fallback.bannerUrl || null);

  const [membersCount, setMembersCount] = useState<number>(initialData?.members || fallback.members || 1420);
  const [onlineCount] = useState<number>(initialData?.onlineCount || fallback.onlineCount || 85);
  const [isJoined, setIsJoined] = useState<boolean>(initialData?.isJoined ?? fallback.isJoined ?? true);
  const [posts, setPosts] = useState<PostType[]>(initialData?.posts || fallback.posts || DEFAULT_POSTS);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  
  // Notificaciones Bell State
  const [isNotificationsActive, setIsNotificationsActive] = useState<boolean>(true);

  // Adjuntos en Post Form
  const [newPostText, setNewPostText] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [attachedLink, setAttachedLink] = useState("");
  const [attachedMediaFile, setAttachedMediaFile] = useState<File | null>(null);
  const [attachedAudioFile, setAttachedAudioFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);

  const mediaInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Modal de Configuración para el Admin
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editDesc, setEditDesc] = useState(description);
  const [editRules, setEditRules] = useState<string[]>(rules);
  const [newRuleText, setNewRuleText] = useState("");
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [newBannerFile, setNewBannerFile] = useState<File | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const [feedSort, setFeedSort] = useState<'hot' | 'new'>('hot');
  const isAdmin = user ? (user.username.toLowerCase() === ownerUsername.toLowerCase() || ownerUsername === 'admin') : true;

  // Manejador de Notificaciones
  const handleToggleNotifications = () => {
    const nextState = !isNotificationsActive;
    setIsNotificationsActive(nextState);
    if (nextState) {
      toast.success(`Notificaciones activadas para c/${slug}`);
    } else {
      toast.info(`Notificaciones silenciadas para c/${slug}`);
    }
  };

  const toggleLike = (postId: number) => {
    setLikedPosts(prev => prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]);
  };

  const handleToggleJoin = async () => {
    const nextState = !isJoined;
    setIsJoined(nextState);
    setMembersCount(prev => nextState ? prev + 1 : Math.max(0, prev - 1));
    toast.success(nextState ? `Te has unido a c/${slug}` : `Has salido de c/${slug}`);

    try {
      const tokenMatch = document.cookie.match(new RegExp('(^| )zentry_token=([^;]+)'));
      const clientToken = tokenMatch ? tokenMatch[2] : null;
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, "");

      if (communityId) {
        await fetch(`${apiBase}/api/core/communities/${communityId}/${nextState ? 'join' : 'leave'}`, {
          method: 'POST',
          headers: {
            ...(clientToken ? { 'Authorization': `Bearer ${clientToken}` } : {})
          }
        });
      }
    } catch (err) {
      console.error("Error al cambiar estado de membresía:", err);
    }
  };

  // Manejadores de Archivos de Adjuntos en el Formulario de Publicación
  const handleSelectMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedMediaFile(file);
      setMediaPreviewUrl(URL.createObjectURL(file));
      toast.success(`Archivo "${file.name}" adjuntado`);
    }
  };

  const handleSelectAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedAudioFile(file);
      toast.success(`Audio "${file.name}" adjuntado`);
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() && !attachedMediaFile && !attachedLink && !attachedAudioFile) return;

    let postTitle = newPostText;
    if (attachedLink) {
      postTitle += ` (Enlace: ${attachedLink})`;
    }
    if (attachedMediaFile) {
      postTitle += ` [Archivo: ${attachedMediaFile.name}]`;
    }
    if (attachedAudioFile) {
      postTitle += ` [Audio: ${attachedAudioFile.name}]`;
    }

    const newPost: PostType = {
      id: Date.now(),
      title: postTitle,
      author: user?.username || 'Usuario Zentry',
      handle: `@${user?.username || 'usuario'}`,
      likes: 1,
      comments: 0,
      height: 'h-64',
      color: 'from-purple-500/20 to-indigo-500/20',
      avatar: (user?.username || 'DA').substring(0, 2).toUpperCase()
    };

    setPosts([newPost, ...posts]);
    setNewPostText("");
    setAttachedMediaFile(null);
    setAttachedAudioFile(null);
    setMediaPreviewUrl(null);
    setAttachedLink("");
    setShowLinkInput(false);
    toast.success("¡Publicación creada con éxito!");
  };

  // Lógica de Configuración Admin (Reglas, Descripción, Fotos)
  const handleAddRule = () => {
    if (!newRuleText.trim()) return;
    setEditRules([...editRules, newRuleText.trim()]);
    setNewRuleText("");
  };

  const handleRemoveRule = (index: number) => {
    setEditRules(editRules.filter((_, i) => i !== index));
  };

  const handleSaveAdminConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);

    try {
      const tokenMatch = document.cookie.match(new RegExp('(^| )zentry_token=([^;]+)'));
      const clientToken = tokenMatch ? tokenMatch[2] : null;
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, "");

      const formData = new FormData();
      formData.append('description', editDesc);
      formData.append('rules', JSON.stringify(editRules));
      if (newAvatarFile) formData.append('avatar', newAvatarFile);
      if (newBannerFile) formData.append('banner', newBannerFile);

      await fetch(`${apiBase}/api/core/communities/${communityId}`, {
        method: 'PUT',
        headers: {
          ...(clientToken ? { 'Authorization': `Bearer ${clientToken}` } : {})
        },
        body: formData
      });

      setDescription(editDesc);
      setRules(editRules);

      if (newAvatarFile) {
        setAvatarPreview(URL.createObjectURL(newAvatarFile));
      }
      if (newBannerFile) {
        setBannerPreview(URL.createObjectURL(newBannerFile));
      }

      toast.success("Configuración de la comunidad guardada correctamente");
      setIsAdminModalOpen(false);
    } catch (err) {
      console.error("Error al guardar configuración:", err);
      // Fallback UI
      setDescription(editDesc);
      setRules(editRules);
      toast.success("Configuración actualizada en vista local");
      setIsAdminModalOpen(false);
    } finally {
      setIsSavingConfig(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-24">
      
      {/* Banner Principal Estilo Facebook Group / Subreddit */}
      <div className="relative h-44 sm:h-60 bg-gradient-to-r from-purple-950 via-zentry-card to-blue-950 border-b border-zentry-border overflow-hidden">
        {bannerPreview ? (
          <img src={bannerPreview} alt="Banner Comunidad" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />
        )}
        
        {/* Botón Volver */}
        <Link href="/communities" className="absolute top-4 left-4 sm:left-8 bg-black/50 p-2.5 rounded-2xl text-white hover:bg-black/80 backdrop-blur-md transition-colors z-20 flex items-center gap-2 text-xs font-bold">
          <ArrowLeft className="w-4 h-4" /> Volver a Grupos
        </Link>

        {/* Botón de Configuración de Admin */}
        {isAdmin && (
          <button 
            onClick={() => {
              setEditDesc(description);
              setEditRules(rules);
              setIsAdminModalOpen(true);
            }}
            className="absolute top-4 right-4 sm:right-8 bg-black/50 hover:bg-black/80 text-white backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors z-20"
          >
            <Settings className="w-4 h-4" /> Configurar Grupo
          </button>
        )}
      </div>

      {/* Cabecera de la Comunidad Estilo Reddit / FB */}
      <div className="px-4 sm:px-8 -mt-12 relative z-10 flex flex-col sm:flex-row gap-5 items-start sm:items-end mb-8">
        {/* Icono Avatar Grande */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-zentry-card border-4 border-zentry-bg flex items-center justify-center shadow-xl font-black text-2xl sm:text-3xl text-zentry-accent shrink-0 overflow-hidden">
          {avatarPreview ? (
            <img src={avatarPreview} alt={communityName} className="w-full h-full object-cover" />
          ) : (
            `c/${slug.substring(0, 2).toUpperCase()}`
          )}
        </div>
        
        <div className="flex-1 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zentry-text-1 tracking-tight">{communityName}</h1>
                <span className="text-xs bg-zentry-card border border-zentry-border text-zentry-text-2 px-2.5 py-1 rounded-full font-mono">
                  c/{slug}
                </span>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 text-xs bg-zentry-accent/20 text-zentry-accent px-2.5 py-1 rounded-xl font-bold">
                    <ShieldCheck className="w-4 h-4" /> Admin del Grupo
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-zentry-text-2 mt-2">
                <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-zentry-text-1" /> {membersCount.toLocaleString()} Miembros</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> {onlineCount} Activos ahora</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Botón Campana Notificaciones */}
              <button 
                onClick={handleToggleNotifications}
                className={`p-3 rounded-2xl transition-colors ${
                  isNotificationsActive 
                    ? 'bg-zentry-accent/20 text-zentry-accent border border-zentry-accent/30' 
                    : 'bg-zentry-card border border-zentry-border text-zentry-text-2 hover:text-zentry-text-1'
                }`} 
                title={isNotificationsActive ? "Notificaciones activas" : "Notificaciones silenciadas"}
              >
                <Bell className={`w-5 h-5 ${isNotificationsActive ? 'fill-zentry-accent' : ''}`} />
              </button>

              <button 
                onClick={handleToggleJoin}
                className={`font-bold px-6 py-3 rounded-2xl transition-all shadow-md ${
                  isJoined 
                    ? 'bg-zentry-card border border-zentry-border text-zentry-text-1 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30' 
                    : 'bg-zentry-text-1 text-zentry-bg hover:opacity-90'
                }`}
              >
                {isJoined ? 'Unido' : '+ Unirse al grupo'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Disposición en 2 Columnas Estilo Reddit / FB */}
      <div className="px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA PRINCIPAL: FEED DE LA COMUNIDAD (70%) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Caja para Crear Publicación en la Comunidad Estilo Reddit/FB */}
          <form onSubmit={handleCreatePost} className="bg-zentry-card border border-zentry-border rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zentry-bg border border-zentry-border flex items-center justify-center font-bold text-zentry-text-1 shrink-0">
                {(user?.username || "DA").substring(0, 2).toUpperCase()}
              </div>
              <input 
                type="text" 
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder={`¿Qué quieres compartir en c/${slug}?`}
                className="flex-1 bg-zentry-bg border border-zentry-border rounded-2xl px-4 py-3 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors placeholder:text-zentry-text-2/70"
              />
            </div>

            {/* Input de Enlace Opcional */}
            {showLinkInput && (
              <div className="flex items-center gap-2 bg-zentry-bg p-2.5 rounded-2xl border border-zentry-border">
                <LinkIcon className="w-4 h-4 text-blue-400 shrink-0" />
                <input 
                  type="url"
                  value={attachedLink}
                  onChange={(e) => setAttachedLink(e.target.value)}
                  placeholder="Pega la URL aquí (https://...)"
                  className="w-full bg-transparent text-xs text-zentry-text-1 focus:outline-none"
                />
                <button type="button" onClick={() => { setAttachedLink(""); setShowLinkInput(false); }} className="text-zentry-text-2 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Previsualización de Archivo Adjunto */}
            {(attachedMediaFile || attachedAudioFile) && (
              <div className="flex items-center justify-between bg-zentry-bg p-3 rounded-2xl border border-zentry-border text-xs text-zentry-text-1">
                <div className="flex items-center gap-2 truncate">
                  {attachedMediaFile && <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {attachedAudioFile && <Music className="w-4 h-4 text-purple-400 shrink-0" />}
                  <span className="truncate font-bold">{attachedMediaFile?.name || attachedAudioFile?.name}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => { setAttachedMediaFile(null); setAttachedAudioFile(null); setMediaPreviewUrl(null); }}
                  className="text-zentry-text-2 hover:text-red-400 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Inputs de Archivo Ocultos */}
            <input type="file" ref={mediaInputRef} onChange={handleSelectMedia} accept="image/*,video/*" className="hidden" />
            <input type="file" ref={audioInputRef} onChange={handleSelectAudio} accept="audio/*" className="hidden" />

            <div className="flex items-center justify-between pt-2 border-t border-zentry-border/50">
              <div className="flex items-center gap-2 text-zentry-text-2 text-xs font-bold">
                <button 
                  type="button" 
                  onClick={() => mediaInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-zentry-bg transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-400" /> Imagen / Video
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowLinkInput(!showLinkInput)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-zentry-bg transition-colors"
                >
                  <LinkIcon className="w-4 h-4 text-blue-400" /> Enlace
                </button>
                <button 
                  type="button" 
                  onClick={() => audioInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-zentry-bg transition-colors"
                >
                  <Music className="w-4 h-4 text-purple-400" /> Audio
                </button>
              </div>

              <button 
                type="submit" 
                disabled={!newPostText.trim() && !attachedMediaFile && !attachedLink && !attachedAudioFile}
                className="px-5 py-2.5 bg-zentry-text-1 text-zentry-bg rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-30 transition-opacity flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" /> Publicar
              </button>
            </div>
          </form>

          {/* Filtros del Feed (Hot vs New) */}
          <div className="flex items-center justify-between border-b border-zentry-border pb-3">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setFeedSort('hot')}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                  feedSort === 'hot' ? 'bg-orange-500/20 text-orange-400' : 'text-zentry-text-2 hover:text-zentry-text-1'
                }`}
              >
                <Flame className="w-4 h-4" /> Destacados (Hot)
              </button>
              <button 
                onClick={() => setFeedSort('new')}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                  feedSort === 'new' ? 'bg-blue-500/20 text-blue-400' : 'text-zentry-text-2 hover:text-zentry-text-1'
                }`}
              >
                <Sparkles className="w-4 h-4" /> Recientes
              </button>
            </div>
            <span className="text-xs text-zentry-text-2 font-medium">{posts.length} publicaciones</span>
          </div>

          {/* Publicaciones usando FeedCard */}
          <div className="space-y-6">
            {posts.map(post => (
              <FeedCard 
                key={post.id}
                post={post}
                isLiked={likedPosts.includes(post.id)}
                onLike={toggleLike}
                isListMode={true}
              />
            ))}
          </div>
        </div>

        {/* COLUMNA LATERAL: INFORMACIÓN Y REGLAS (30%) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Tarjeta "Acerca de la Comunidad" */}
          <div className="bg-zentry-card border border-zentry-border rounded-3xl p-5 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-zentry-text-1 text-base flex items-center justify-between">
              <span className="flex items-center gap-2"><Info className="w-5 h-5 text-zentry-accent" /> Acerca del Grupo</span>
              {isAdmin && (
                <button 
                  onClick={() => setIsAdminModalOpen(true)}
                  className="text-xs text-zentry-accent hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Editar
                </button>
              )}
            </h3>

            <p className="text-xs text-zentry-text-2 leading-relaxed">
              {description}
            </p>

            <div className="pt-3 border-t border-zentry-border space-y-2 text-xs text-zentry-text-2">
              <div className="flex justify-between items-center py-1">
                <span>Miembros totales:</span>
                <span className="font-bold text-zentry-text-1">{membersCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Estado:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Público
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Administrador:</span>
                <span className="font-bold text-zentry-accent">@{ownerUsername}</span>
              </div>
            </div>
          </div>

          {/* Tarjeta "Reglas de la Comunidad" */}
          <div className="bg-zentry-card border border-zentry-border rounded-3xl p-5 space-y-3 shadow-sm">
            <h3 className="font-extrabold text-zentry-text-1 text-base flex items-center justify-between mb-2">
              <span className="flex items-center gap-2"><Shield className="w-5 h-5 text-purple-400" /> Reglas del Grupo</span>
              {isAdmin && (
                <button 
                  onClick={() => setIsAdminModalOpen(true)}
                  className="text-xs text-purple-400 hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Editar
                </button>
              )}
            </h3>

            <div className="space-y-3">
              {rules.map((rule, idx) => (
                <div key={idx} className="flex gap-3 text-xs text-zentry-text-2 leading-relaxed bg-zentry-bg/60 p-3 rounded-2xl border border-zentry-border/50">
                  <span className="font-extrabold text-zentry-accent shrink-0">{idx + 1}.</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tarjeta Moderadores */}
          <div className="bg-zentry-card border border-zentry-border rounded-3xl p-5 space-y-3 shadow-sm">
            <h3 className="font-bold text-zentry-text-1 text-sm flex items-center justify-between">
              <span>Moderación</span>
              <ShieldCheck className="w-4 h-4 text-zentry-accent" />
            </h3>
            
            <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-zentry-bg transition-colors">
              <div className="w-8 h-8 rounded-full bg-zentry-accent/20 flex items-center justify-center font-bold text-xs text-zentry-accent">
                {ownerUsername.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-zentry-text-1">@{ownerUsername}</p>
                <p className="text-[10px] text-zentry-text-2">Creador / Administrador</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* MODAL CONFIGURACIÓN DE COMUNIDAD (ADMIN) */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b border-zentry-border flex justify-between items-center bg-zentry-bg">
              <h3 className="text-lg font-bold text-zentry-text-1 flex items-center gap-2">
                <Settings className="w-5 h-5 text-zentry-accent" /> Configuración de c/{slug}
              </h3>
              <button onClick={() => setIsAdminModalOpen(false)} className="text-zentry-text-2 hover:text-zentry-text-1 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdminConfig} className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
              
              {/* Fotos: Avatar y Banner */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-zentry-text-2 uppercase tracking-wider">Imágenes del Grupo</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[11px] text-zentry-text-2 mb-1">Foto de Perfil</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setNewAvatarFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-zentry-text-1 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-zentry-accent/20 file:text-zentry-accent hover:file:bg-zentry-accent/30 cursor-pointer"
                    />
                  </div>
                  <div>
                    <span className="block text-[11px] text-zentry-text-2 mb-1">Portada / Banner</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setNewBannerFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-zentry-text-1 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-zentry-accent/20 file:text-zentry-accent hover:file:bg-zentry-accent/30 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Acerca de / Descripción */}
              <div>
                <label className="block text-xs font-bold text-zentry-text-2 mb-1.5 uppercase tracking-wider">Acerca del Grupo (Descripción)</label>
                <textarea 
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors resize-none"
                  required
                />
              </div>

              {/* Reglas de la Comunidad */}
              <div>
                <label className="block text-xs font-bold text-zentry-text-2 mb-1.5 uppercase tracking-wider">Reglas de la Comunidad</label>
                
                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto custom-scrollbar">
                  {editRules.map((rule, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-zentry-bg p-2.5 rounded-xl border border-zentry-border text-xs text-zentry-text-1">
                      <span className="truncate flex-1 font-medium">{idx + 1}. {rule}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveRule(idx)}
                        className="text-zentry-text-2 hover:text-red-400 p-1 ml-2 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={newRuleText}
                    onChange={(e) => setNewRuleText(e.target.value)}
                    placeholder="Escribe una regla nueva..."
                    className="flex-1 bg-zentry-bg border border-zentry-border rounded-xl px-3 py-2 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
                  />
                  <button 
                    type="button"
                    onClick={handleAddRule}
                    className="px-3 py-2 bg-zentry-bg border border-zentry-border text-zentry-text-1 rounded-xl text-xs font-bold hover:bg-zentry-card shrink-0 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-zentry-border flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  disabled={isSavingConfig}
                  className="flex-1 py-2.5 font-bold text-xs text-zentry-text-1 bg-zentry-bg border border-zentry-border rounded-xl hover:bg-zentry-card"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSavingConfig}
                  className="flex-1 py-2.5 font-bold text-xs bg-zentry-text-1 text-zentry-bg rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSavingConfig ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}



