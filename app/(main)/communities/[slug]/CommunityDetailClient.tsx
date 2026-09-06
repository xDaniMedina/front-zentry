"use client"

import { useState, useRef } from "react";
import { Shield, Bell, Info, ArrowLeft, Globe, ShieldCheck,
  Send, Image as ImageIcon, Link as LinkIcon, Flame,
  CheckCircle2, Sparkles, Settings, Plus, Trash2, X, Edit3,
  MessageSquare, MessagesSquare, Loader2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { FeedCard, PostType } from "@/components/feed/FeedCard";
import { useAuth } from "@/context/AuthContext";
import { timeAgo } from "@/lib/utils";
import {
  joinCommunityAction, leaveCommunityAction, updateCommunityConfigAction,
  createCommunityPostAction, toggleCommunityNotificationsAction,
  getCommunityForumThreadsAction, createForumThreadAction,
  getForumThreadRepliesAction, createForumReplyAction,
  type CommunityDTO, type CommunityPostDTO, type ForumThreadDTO, type ForumReplyDTO,
} from "@/lib/actions/communities";

function toPostType(p: CommunityPostDTO): PostType {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    author: p.author,
    handle: p.handle,
    avatar: p.avatar,
    media_url: p.media_url,
    likes: p.likes,
    comments: p.comments,
    created_at: p.created_at,
    height: 'h-64',
    color: 'from-purple-500/20 to-indigo-500/20',
  } as PostType;
}

export default function CommunityDetailClient({ slug, initialData, initialPosts }: { slug: string; initialData?: CommunityDTO | null; initialPosts?: CommunityPostDTO[] }) {
  const { user } = useAuth();

  const communityId = initialData?.id || '';
  const ownerUsername = initialData?.ownerUsername || 'admin';

  const [communityName] = useState<string>(initialData?.name || slug);
  const [description, setDescription] = useState<string>(initialData?.description || '');
  const [rules, setRules] = useState<string[]>(initialData?.rules || []);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatarUrl || null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(initialData?.bannerUrl || null);

  const [membersCount, setMembersCount] = useState<number>(initialData?.members ?? 0);
  const [isJoined, setIsJoined] = useState<boolean>(initialData?.isJoined ?? false);
  const [posts, setPosts] = useState<PostType[]>((initialPosts || []).map(toPostType));
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  // Notificaciones Bell State
  const [isNotificationsActive, setIsNotificationsActive] = useState<boolean>(true);

  // Adjuntos en Post Form
  const [newPostText, setNewPostText] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [attachedLink, setAttachedLink] = useState("");
  const [attachedMediaFile, setAttachedMediaFile] = useState<File | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const mediaInputRef = useRef<HTMLInputElement>(null);

  // Modal de Configuración para el Admin
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editDesc, setEditDesc] = useState(description);
  const [editRules, setEditRules] = useState<string[]>(rules);
  const [newRuleText, setNewRuleText] = useState("");
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [newBannerFile, setNewBannerFile] = useState<File | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const [feedSort, setFeedSort] = useState<'hot' | 'new'>('hot');
  const isAdmin = user && user.username ? (user.username.toLowerCase() === ownerUsername.toLowerCase()) : false;

  // Foro de la Comunidad
  const [mainTab, setMainTab] = useState<'posts' | 'forum'>('posts');
  const [forumThreads, setForumThreads] = useState<ForumThreadDTO[]>([]);
  const [isLoadingForumThreads, setIsLoadingForumThreads] = useState(false);
  const [hasLoadedForum, setHasLoadedForum] = useState(false);
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [activeThread, setActiveThread] = useState<ForumThreadDTO | null>(null);
  const [threadReplies, setThreadReplies] = useState<ForumReplyDTO[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const loadForumThreads = async () => {
    if (!slug) return;
    setIsLoadingForumThreads(true);
    const res = await getCommunityForumThreadsAction(slug);
    setIsLoadingForumThreads(false);
    setHasLoadedForum(true);
    if (res.success) setForumThreads(res.data);
  };

  const handleSelectMainTab = (tab: 'posts' | 'forum') => {
    setMainTab(tab);
    if (tab === 'forum' && !hasLoadedForum) {
      loadForumThreads();
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;

    setIsCreatingThread(true);
    const res = await createForumThreadAction(slug, newThreadTitle.trim(), newThreadContent.trim());
    setIsCreatingThread(false);

    if (res.success && res.data) {
      setForumThreads(prev => [res.data as ForumThreadDTO, ...prev]);
      setNewThreadTitle("");
      setNewThreadContent("");
      setShowNewThreadForm(false);
      toast.success("¡Hilo publicado en el foro!");
    } else {
      toast.error(res.error || "No se pudo abrir el hilo");
    }
  };

  const handleOpenThread = async (thread: ForumThreadDTO) => {
    setActiveThread(thread);
    setThreadReplies([]);
    setIsLoadingReplies(true);
    const res = await getForumThreadRepliesAction(thread.id);
    setIsLoadingReplies(false);
    if (res.success) setThreadReplies(res.data);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;

    setIsSubmittingReply(true);
    const res = await createForumReplyAction(activeThread.id, replyText.trim());
    setIsSubmittingReply(false);

    if (res.success && res.data) {
      setThreadReplies(prev => [...prev, res.data as ForumReplyDTO]);
      setForumThreads(prev => prev.map(t => t.id === activeThread.id ? { ...t, repliesCount: t.repliesCount + 1 } : t));
      setReplyText("");
    } else {
      toast.error(res.error || "No se pudo publicar tu respuesta");
    }
  };

  // Manejador de Notificaciones (el backend hoy solo guarda un booleano fijo; se llama para no fingir estado local)
  const handleToggleNotifications = async () => {
    const nextState = !isNotificationsActive;
    setIsNotificationsActive(nextState);
    await toggleCommunityNotificationsAction(communityId);
    if (nextState) {
      toast.success(`Notificaciones activadas para c/${slug}`);
    } else {
      toast.info(`Notificaciones silenciadas para c/${slug}`);
    }
  };

  const toggleLike = (postId: string | number) => {
    const id = Number(postId);
    setLikedPosts(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
  };

  const handleToggleJoin = async () => {
    if (!communityId) return;
    const previous = isJoined;
    const nextState = !isJoined;
    setIsJoined(nextState);
    setMembersCount(prev => nextState ? prev + 1 : Math.max(0, prev - 1));

    const res = await (nextState ? joinCommunityAction(communityId) : leaveCommunityAction(communityId));
    if (res.success && res.data) {
      setIsJoined(res.data.isJoined);
      setMembersCount(res.data.members);
      toast.success(nextState ? `Te has unido a c/${slug}` : `Has salido de c/${slug}`);
    } else {
      setIsJoined(previous);
      setMembersCount(prev => previous ? prev + 1 : Math.max(0, prev - 1));
      toast.error(res.error || "No se pudo actualizar tu membresía");
    }
  };

  // Manejadores de Archivos de Adjuntos en el Formulario de Publicación
  const handleSelectMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedMediaFile(file);
      toast.success(`Archivo "${file.name}" adjuntado`);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() && !attachedLink) return;
    if (!communityId) return;

    let content = newPostText;
    if (attachedLink) {
      content += `\n\n🔗 ${attachedLink}`;
    }

    setIsPosting(true);
    const res = await createCommunityPostAction(communityId, content, attachedMediaFile);
    setIsPosting(false);

    if (res.success && res.data) {
      setPosts([toPostType(res.data), ...posts]);
      setNewPostText("");
      setAttachedMediaFile(null);
      setAttachedLink("");
      setShowLinkInput(false);
      toast.success("¡Publicación creada con éxito!");
    } else {
      toast.error(res.error || "No se pudo publicar en la comunidad");
    }
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
    if (!communityId) return;
    setIsSavingConfig(true);

    const res = await updateCommunityConfigAction(
      communityId,
      { description: editDesc, rules: editRules },
      { avatar: newAvatarFile, banner: newBannerFile }
    );

    if (res.success && res.data) {
      setDescription(res.data.description);
      setRules(res.data.rules);
      if (res.data.avatarUrl) setAvatarPreview(res.data.avatarUrl);
      if (res.data.bannerUrl) setBannerPreview(res.data.bannerUrl);
      toast.success("Configuración de la comunidad guardada correctamente");
      setIsAdminModalOpen(false);
    } else {
      toast.error(res.error || "No se pudo guardar la configuración");
    }
    setIsSavingConfig(false);
  };

  if (!initialData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="text-xl font-extrabold text-zentry-text-1">Comunidad no encontrada</h1>
        <p className="text-sm text-zentry-text-2">No existe ninguna comunidad con el slug c/{slug}.</p>
        <Link href="/communities" className="inline-flex items-center gap-2 text-zentry-accent font-bold text-sm hover:underline">
          <ArrowLeft className="w-4 h-4" /> Volver a Comunidades
        </Link>
      </div>
    );
  }

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

          {/* Pestañas: Publicaciones vs Foro */}
          <div className="flex gap-2 p-1.5 bg-zentry-card border border-zentry-border rounded-2xl">
            <button
              onClick={() => handleSelectMainTab('posts')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                mainTab === 'posts' ? 'bg-zentry-text-1 text-zentry-bg' : 'text-zentry-text-2 hover:text-zentry-text-1'
              }`}
            >
              <ImageIcon className="w-4 h-4" /> Publicaciones
            </button>
            <button
              onClick={() => handleSelectMainTab('forum')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                mainTab === 'forum' ? 'bg-zentry-text-1 text-zentry-bg' : 'text-zentry-text-2 hover:text-zentry-text-1'
              }`}
            >
              <MessagesSquare className="w-4 h-4" /> Foro
            </button>
          </div>

          {mainTab === 'posts' && (
          <>
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
            {attachedMediaFile && (
              <div className="flex items-center justify-between bg-zentry-bg p-3 rounded-2xl border border-zentry-border text-xs text-zentry-text-1">
                <div className="flex items-center gap-2 truncate">
                  <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate font-bold">{attachedMediaFile.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedMediaFile(null)}
                  className="text-zentry-text-2 hover:text-red-400 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Input de Archivo Oculto */}
            <input type="file" ref={mediaInputRef} onChange={handleSelectMedia} accept="image/*" className="hidden" />

            <div className="flex items-center justify-between pt-2 border-t border-zentry-border/50">
              <div className="flex items-center gap-2 text-zentry-text-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => mediaInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-zentry-bg transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-400" /> Imagen
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkInput(!showLinkInput)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-zentry-bg transition-colors"
                >
                  <LinkIcon className="w-4 h-4 text-blue-400" /> Enlace
                </button>
              </div>

              <button
                type="submit"
                disabled={isPosting || (!newPostText.trim() && !attachedMediaFile && !attachedLink)}
                className="px-5 py-2.5 bg-zentry-text-1 text-zentry-bg rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-30 transition-opacity flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" /> {isPosting ? 'Publicando...' : 'Publicar'}
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
                isLiked={likedPosts.includes(Number(post.id))}
                onLike={toggleLike}
                isListMode={true}
              />
            ))}
          </div>
          </>
          )}

          {mainTab === 'forum' && (
          <div className="space-y-4">
            {/* Botón para abrir un nuevo hilo */}
            {!showNewThreadForm ? (
              <button
                onClick={() => setShowNewThreadForm(true)}
                className="w-full bg-zentry-card border border-zentry-border rounded-3xl p-4 flex items-center gap-3 text-left hover:border-zentry-accent/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-2xl bg-zentry-bg border border-zentry-border flex items-center justify-center font-bold text-zentry-text-1 shrink-0">
                  {(user?.username || "DA").substring(0, 2).toUpperCase()}
                </div>
                <span className="text-sm text-zentry-text-2">Abrir un nuevo hilo de discusión en c/{slug}...</span>
                <Plus className="w-4 h-4 text-zentry-accent ml-auto shrink-0" />
              </button>
            ) : (
              <form onSubmit={handleCreateThread} className="bg-zentry-card border border-zentry-border rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
                <input
                  type="text"
                  value={newThreadTitle}
                  onChange={(e) => setNewThreadTitle(e.target.value)}
                  placeholder="Título del hilo"
                  className="w-full bg-zentry-bg border border-zentry-border rounded-2xl px-4 py-2.5 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors placeholder:text-zentry-text-2/70"
                  autoFocus
                />
                <textarea
                  value={newThreadContent}
                  onChange={(e) => setNewThreadContent(e.target.value)}
                  placeholder="¿De qué quieres hablar?"
                  rows={3}
                  className="w-full bg-zentry-bg border border-zentry-border rounded-2xl px-4 py-2.5 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors resize-none placeholder:text-zentry-text-2/70"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowNewThreadForm(false); setNewThreadTitle(""); setNewThreadContent(""); }}
                    className="px-4 py-2 text-xs font-bold text-zentry-text-2 hover:text-zentry-text-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingThread || !newThreadTitle.trim() || !newThreadContent.trim()}
                    className="px-5 py-2 bg-zentry-text-1 text-zentry-bg rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-30 transition-opacity flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> {isCreatingThread ? 'Publicando...' : 'Abrir Hilo'}
                  </button>
                </div>
              </form>
            )}

            {/* Lista de Hilos */}
            {isLoadingForumThreads ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-zentry-text-2" />
              </div>
            ) : forumThreads.length === 0 ? (
              <div className="py-16 text-center text-zentry-text-2 space-y-2">
                <MessagesSquare className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-sm font-bold text-zentry-text-1">Aún no hay hilos en el foro</p>
                <p className="text-xs">¡Sé el primero en abrir una discusión en c/{slug}!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {forumThreads.map(thread => (
                  <button
                    key={thread.id}
                    onClick={() => handleOpenThread(thread)}
                    className="w-full text-left bg-zentry-card border border-zentry-border rounded-3xl p-4 sm:p-5 hover:border-zentry-accent/50 transition-colors space-y-2"
                  >
                    <div className="flex items-center gap-2 text-xs text-zentry-text-2">
                      <span className="font-bold text-zentry-text-1">@{thread.author}</span>
                      <span>•</span>
                      <span className="font-mono">{timeAgo(thread.updatedAt)}</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-zentry-text-1">{thread.title}</h4>
                    <p className="text-xs text-zentry-text-2 line-clamp-2 leading-relaxed">{thread.content}</p>
                    <div className="flex items-center gap-1.5 text-xs text-zentry-text-2 pt-1">
                      <MessageSquare className="w-3.5 h-3.5" /> {thread.repliesCount} {thread.repliesCount === 1 ? 'respuesta' : 'respuestas'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          )}
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

      {/* MODAL DE HILO DE FORO (DETALLE + RESPUESTAS) */}
      {activeThread && (
        <div
          onClick={() => setActiveThread(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
          >
            <div className="p-4 sm:p-5 border-b border-zentry-border flex justify-between items-start gap-3 bg-zentry-bg">
              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-zentry-text-1 truncate">{activeThread.title}</h3>
                <p className="text-xs text-zentry-text-2 mt-0.5">
                  @{activeThread.author} • {timeAgo(activeThread.createdAt)}
                </p>
              </div>
              <button onClick={() => setActiveThread(null)} className="p-1.5 text-zentry-text-2 hover:text-zentry-text-1 rounded-xl shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
              <p className="text-sm text-zentry-text-1 leading-relaxed whitespace-pre-wrap">{activeThread.content}</p>

              <div className="pt-3 border-t border-zentry-border/60 space-y-3">
                <h4 className="text-xs font-bold text-zentry-text-2 uppercase tracking-wider">
                  {threadReplies.length} {threadReplies.length === 1 ? 'Respuesta' : 'Respuestas'}
                </h4>

                {isLoadingReplies ? (
                  <div className="py-8 flex justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-zentry-text-2" />
                  </div>
                ) : threadReplies.length === 0 ? (
                  <p className="text-xs text-zentry-text-2 py-4 text-center">Aún no hay respuestas. ¡Sé el primero!</p>
                ) : (
                  threadReplies.map(reply => (
                    <div key={reply.id} className="p-3 bg-zentry-bg rounded-2xl border border-zentry-border/70 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-zentry-text-1">@{reply.author}</span>
                        <span className="text-[10px] text-zentry-text-2 font-mono">{timeAgo(reply.createdAt)}</span>
                      </div>
                      <p className="text-xs text-zentry-text-1 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <form onSubmit={handleSendReply} className="p-3.5 border-t border-zentry-border bg-zentry-bg flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escribe una respuesta..."
                className="flex-1 bg-zentry-card border border-zentry-border rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-zentry-text-1 placeholder:text-zentry-text-2/60 focus:outline-none focus:border-zentry-accent transition-colors"
              />
              <button
                type="submit"
                disabled={!replyText.trim() || isSubmittingReply}
                className="p-2.5 bg-zentry-accent text-white rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center shrink-0 shadow-md"
              >
                {isSubmittingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      )}

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



