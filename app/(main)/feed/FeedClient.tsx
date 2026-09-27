"use client"

import { useMyAvatar } from "@/lib/hooks/useMyAvatar"
import { applyReactionLocally } from "@/lib/reactions"
import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, Variants } from "framer-motion"
import Image from "next/image"
import { Stories } from "@/components/feed/Stories"
import StoryViewer from "@/components/feed/StoryViewer"
import CreateStoryModal from "@/components/feed/CreateStoryModal"
import { FeedSearch } from "@/components/feed/FeedSearch"
import { FeedTabs } from "@/components/feed/FeedTabs"
import { FeedLayoutControls } from "@/components/feed/FeedLayoutControls"
import { FeedCard, PostType } from "@/components/feed/FeedCard"
import CreatePostModal from "@/components/feed/CreatePostModal"
import PostDetailModal from "@/components/feed/PostDetailModal"
import { 
  Sparkles, Image as ImageIcon, Video, Music,
  FileText, Loader2, Radio, Bell, Tv
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { getImageUrl, getInitials } from "@/lib/utils"
import { getFriendsAction } from "@/lib/actions/friends"
import { getFeedPosts, getPostByIdAction, toggleLikePostAction, reactToPostAction } from "@/lib/actions/feed"
import { getStoryFeedAction, viewStoryAction, toggleStoryLikeAction, reactToStoryAction, replyToStoryAction, deleteStoryAction } from "@/lib/actions/stories"
import { getActiveAdsAction, AdDTO } from "@/lib/actions/ads"
import AdCard from "@/components/feed/AdCard"
import { FriendUser, UserStoryGroup, StoryItem } from "@/types"

const containerVariants: Variants = { 
  hidden: { opacity: 0 }, 
  show: { opacity: 1, transition: { staggerChildren: 0.08 } } 
};

export default function FeedClient({ initialPosts, initialHasMore = false }: { initialPosts: PostType[] | null | undefined; initialHasMore?: boolean }) {
  const { user } = useAuth();
  
  const displayName = user?.name || user?.username || 'Creador Zentry';
  const myAvatar = useMyAvatar();

  // Las obras ya vienen renderizadas desde el servidor: no volver a pedirlas al montar
  const initialList: PostType[] = Array.isArray(initialPosts) ? initialPosts : [];
  const [posts, setPosts] = useState<PostType[]>(initialList);
  const [ads, setAds] = useState<AdDTO[]>([]);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [likedPosts, setLikedPosts] = useState<(string | number)[]>(() => initialList.filter(p => p.liked || p.myReaction).map(p => p.id));
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [activeTab, setActiveTab] = useState('Para ti');
  const [layoutStyle, setLayoutStyle] = useState<'grid' | 'list'>('grid');

  // Historias estilo Instagram
  const [storyGroups, setStoryGroups] = useState<UserStoryGroup[]>([]);
  const [activeViewerGroupIndex, setActiveViewerGroupIndex] = useState<number | null>(null);
  const [isCreateStoryModalOpen, setIsCreateStoryModalOpen] = useState(false);

  // Modales de Post y Comentarios
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState<PostType | null>(null);

  // 1. Cargar Posts Reales desde el Backend (más recientes primero)
  const [feedPage, setFeedPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(initialHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadPosts = async () => {
    const res = await getFeedPosts(0);
    if (res.success && res.data) {
      setPosts(res.data);
      setLikedPosts(res.data.filter(p => p.liked).map(p => p.id));
      setFeedPage(0);
      setHasMorePosts(Boolean(res.hasMore));
      return;
    }

    if (initialPosts && Array.isArray(initialPosts)) {
      setPosts(initialPosts);
    }
  };

  const loadMorePosts = async () => {
    setIsLoadingMore(true);
    const nextPage = feedPage + 1;
    const res = await getFeedPosts(nextPage);
    setIsLoadingMore(false);

    if (res.success && res.data) {
      setPosts(prev => [...prev, ...(res.data as PostType[])]);
      setLikedPosts(prev => [...prev, ...(res.data as PostType[]).filter(p => p.liked).map(p => p.id)]);
      setFeedPage(nextPage);
      setHasMorePosts(Boolean(res.hasMore));
    } else {
      toast.error("No se pudieron cargar más publicaciones");
    }
  };

  // 2. Cargar Historias Reales desde el Backend (estilo Instagram)
  const loadStories = useCallback(async () => {
    const res = await getStoryFeedAction();
    if (res.success) {
      setStoryGroups(res.data);
    }
  }, []);

  // Cargar Amigos, Posts e Historias
  useEffect(() => {
    if (initialList.length === 0) loadPosts();
    loadStories();

    async function loadFriends() {
      try {
        const res = await getFriendsAction(false);
        if (res.success && res.data) {
          setFriends(res.data);
        }
      } catch { /* ignore */ }
    }

    loadFriends();

    getActiveAdsAction('FEED').then(res => {
      if (res.success) setAds(res.data);
    });
  }, [loadStories]);

  // Abrir una obra directamente desde un enlace compartido o una notificación (/feed?post=ID)
  useEffect(() => {
    const postId = new URLSearchParams(window.location.search).get('post');
    if (!postId) return;
    getPostByIdAction(postId).then(res => {
      if (res.success && res.data) {
        setActiveCommentPost(res.data);
        if (res.data.liked) setLikedPosts(prev => prev.includes(res.data!.id) ? prev : [...prev, res.data!.id]);
      } else {
        toast.error("Esta publicación ya no está disponible");
      }
    });
  }, []);

  // Manejar cuando se ve una historia (marca cada ítem del grupo como visto en el backend)
  const handleStoryGroupViewed = (groupId: string | number) => {
    const group = storyGroups.find(g => g.id === groupId);
    // Si ya estaba marcado como visto, no crear un objeto/array nuevo: el visor de
    // historias vuelve a llamar esto en cada cambio de referencia de `currentGroup`,
    // y actualizar sin condición aquí provocaba un bucle infinito de renders.
    if (!group || !group.hasUnseen) return;

    setStoryGroups(prev => prev.map(g => g.id === groupId ? { ...g, hasUnseen: false } : g));

    group.items.forEach(item => {
      viewStoryAction(item.id);
    });
  };

  // Manejar Like en Historia (optimista, revertido si el backend falla)
  const handleLikeStory = async (storyId: string, groupId: string | number) => {
    const wasLiked = storyGroups
      .find(g => g.id === groupId)?.items.find(i => i.id === storyId)?.liked ?? false;

    const applyLiked = (liked: boolean) => setStoryGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        items: g.items.map(item => item.id === storyId
          ? { ...item, liked, myReaction: liked ? 'like' : null, likes: liked ? item.likes + 1 : Math.max(0, item.likes - 1) }
          : item)
      };
    }));

    applyLiked(!wasLiked);

    const res = await toggleStoryLikeAction(storyId);
    if (!res.success) {
      applyLiked(wasLiked);
      toast.error("No se pudo reaccionar a la historia");
    }
  };

  // Reacción con emoji a una historia (se guarda y notifica al dueño)
  const handleReactStory = async (storyId: string, groupId: string | number, type: string) => {
    const res = await reactToStoryAction(storyId, type);
    if (!res.success) {
      toast.error("No se pudo reaccionar a la historia");
      return;
    }
    setStoryGroups(prev => prev.map(g => g.id !== groupId ? g : {
      ...g,
      items: g.items.map(item => {
        if (item.id !== storyId) return item;
        const hadReaction = Boolean(item.myReaction ?? item.liked);
        const hasReaction = Boolean(res.reaction);
        const likes = item.likes + (hasReaction && !hadReaction ? 1 : !hasReaction && hadReaction ? -1 : 0);
        return { ...item, myReaction: res.reaction ?? null, liked: hasReaction, likes: Math.max(0, likes) };
      })
    }));
  };

  // Manejar eliminación de historia
  const handleDeleteStory = async (storyId: string, groupId: string | number) => {
    const previousGroups = storyGroups;
    setStoryGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          items: g.items.filter(item => item.id !== storyId)
        };
      }
      return g;
    }));

    const res = await deleteStoryAction(storyId);
    if (!res.success) {
      setStoryGroups(previousGroups);
      toast.error(res.error || "No se pudo eliminar la historia");
    }
  };

  // Manejar respuesta a una historia (envía un mensaje directo real al dueño)
  const handleReplyToStory = async (groupId: string | number, storyId: string, message: string) => {
    const group = storyGroups.find(g => g.id === groupId);
    const res = await replyToStoryAction(storyId, message);
    if (res.success) {
      toast.success(`Mensaje enviado a @${group?.username || 'usuario'}`);
    } else {
      toast.error(res.error || "No se pudo enviar tu respuesta");
    }
  };

  // Manejar nueva historia creada por el usuario
  const handleStoryCreated = (newStory: StoryItem) => {
    setStoryGroups(prev => {
      const userGroupIdx = prev.findIndex(g => g.isUser);
      if (userGroupIdx >= 0) {
        const updated = [...prev];
        updated[userGroupIdx] = {
          ...updated[userGroupIdx],
          items: [newStory, ...updated[userGroupIdx].items],
          hasUnseen: true,
          last_updated: 'Justo ahora'
        };
        return updated;
      }
      return prev;
    });
  };

  // 3. Manejo de Likes Dinámico (optimista, revertido si el backend falla)
  // Reacción optimista: la UI cambia al instante y luego se reconcilia con el backend.
  // type = null → botón "Me gusta" (quita la reacción actual o pone ❤️)
  const applyReaction = async (postId: string | number, type: string | null) => {
    const original = posts.find(p => p.id === postId)
      ?? (activeCommentPost?.id === postId ? activeCommentPost : null);
    if (!original) return;

    const withLiked = { ...original, liked: likedPosts.includes(postId) || original.liked };
    const optimistic = applyReactionLocally(withLiked, type);
    applyPostUpdate(optimistic);
    setLikedPosts(prev => {
      const without = prev.filter(id => id !== postId);
      return optimistic.myReaction ? [...without, postId] : without;
    });

    const res = type === null ? await toggleLikePostAction(postId) : await reactToPostAction(postId, type);
    if (!res.success || !res.data) {
      applyPostUpdate(original);
      setLikedPosts(prev => {
        const without = prev.filter(id => id !== postId);
        return original.liked || original.myReaction ? [...without, postId] : without;
      });
      toast.error(res.error || "No se pudo registrar tu reacción");
      return;
    }
    applyPostUpdate(res.data);
  };

  const toggleLike = (postId: string | number) => applyReaction(postId, null);
  const handleReact = (postId: string | number, type: string) => applyReaction(postId, type);

  // Mantiene la lista y el modal abierto sincronizados, conservando los comentarios ya cargados
  const applyPostUpdate = (updated: PostType) => {
    setPosts(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated, comments_list: p.comments_list } : p));
    setActiveCommentPost(prev => prev && prev.id === updated.id ? { ...prev, ...updated, comments_list: prev.comments_list } : prev);
  };

  const handlePostDeleted = (postId: string | number) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setActiveCommentPost(prev => prev && prev.id === postId ? null : prev);
  };

  // 4. Compartir Obra
  const handleShare = (post: PostType) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/feed?post=${post.id}`;
      navigator.clipboard.writeText(url);
      toast.success(`🔗 ¡Enlace de "${post.title}" copiado al portapapeles!`);
    }
  };

  // 5. Abrir Drawer de Comentarios y Cargar los Reales del Backend
  // PostDetailModal carga los comentarios reales al abrirse (una sola petición)
  const handleOpenComments = (post: PostType) => setActiveCommentPost(post);

  // 6. Filtrado de Publicaciones por Búsqueda, Tags y Pestañas Multimedia
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Filtro por Búsqueda y Tags
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        post.title.toLowerCase().includes(q) || 
        post.author.toLowerCase().includes(q) ||
        post.handle.toLowerCase().includes(q) ||
        (post.tags && post.tags.some(t => t.toLowerCase().includes(q)));

      if (!matchesSearch) return false;

      // Filtro por Pestañas Multimedia
      if (activeTab === 'image') return post.media_type === 'image';
      if (activeTab === 'video') return post.media_type === 'video';
      if (activeTab === 'audio') return post.media_type === 'audio';
      if (activeTab === 'text') return post.media_type === 'text';
      if (activeTab === 'Siguiendo') {
        const u = post.handle.replace(/^@/, '').toLowerCase();
        return friends.some(f => f.username.toLowerCase() === u);
      }

      return true;
    });
  }, [posts, searchQuery, activeTab, friends]);

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show" 
      className="w-full mx-auto py-2 sm:py-6 transition-colors duration-300 relative"
    >
      {/* 1. Buscador y Tendencias Dinámicas */}
      <FeedSearch 
        onSearch={setSearchQuery} 
        activeTag={activeTag} 
        onSelectTag={(tag) => {
          setActiveTag(tag);
          setSearchQuery(tag);
        }} 
      />
      
      {/* 2. Historias Dinámicas estilo Instagram */}
      <Stories 
        stories={storyGroups} 
        onStoryClick={(storyGroup) => {
          const validGroups = storyGroups.filter(g => g.items && g.items.length > 0);
          const targetIndex = validGroups.findIndex(g => g.id === storyGroup.id);
          if (targetIndex >= 0) {
            setActiveViewerGroupIndex(targetIndex);
          } else if (storyGroup.isUser) {
            setIsCreateStoryModalOpen(true);
          }
        }} 
        onAddStory={() => setIsCreateStoryModalOpen(true)}
      />

      {/* 3. BARRA CREADORA SUPERIOR (Estilo Facebook / X / LinkedIn) */}
      <div className="bg-zentry-card border border-zentry-border rounded-3xl p-4 sm:p-5 shadow-sm mb-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-950/50 border border-purple-500/30 flex items-center justify-center font-black text-xs text-purple-300 shrink-0 overflow-hidden shadow-sm relative">
            {myAvatar ? (
              <Image src={getImageUrl(myAvatar)} alt={displayName} fill sizes="40px" className="object-cover" />
            ) : (
              getInitials(displayName)
            )}
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-1 bg-zentry-bg hover:bg-zentry-card border border-zentry-border rounded-2xl py-3 px-4 text-left text-xs sm:text-sm text-zentry-text-2 hover:text-zentry-text-1 transition-all cursor-pointer shadow-inner"
          >
            ¿Qué estás creando hoy, {displayName.split(' ')[0]}?
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zentry-border/50 text-xs font-bold">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3 py-1.5 rounded-xl hover:bg-zentry-bg text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Foto / Arte</span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3 py-1.5 rounded-xl hover:bg-zentry-bg text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Video HD</span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3 py-1.5 rounded-xl hover:bg-zentry-bg text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Music className="w-4 h-4" />
              <span className="hidden sm:inline">Música / Audio</span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3 py-1.5 rounded-xl hover:bg-zentry-bg text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Artículo</span>
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-extrabold hover:opacity-90 shadow-md shadow-purple-600/30 transition-transform active:scale-95 cursor-pointer"
          >
            Publicar
          </button>
        </div>
      </div>
      
      {/* 4. Pestañas Multimedia y Controles de Vista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <FeedTabs activeTab={activeTab} setTab={setActiveTab} />
        <FeedLayoutControls layout={layoutStyle} setLayout={setLayoutStyle} />
      </div>

            {/* 5. Flujo Principal de Publicaciones O Sección En Vivo */}
      {activeTab === 'en_vivo' ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-red-950/40 via-purple-950/30 to-zentry-card border border-red-500/30 rounded-3xl p-8 relative overflow-hidden text-center sm:text-left">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Radio className="w-64 h-64 text-red-500" />
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full text-red-400 text-xs font-black uppercase tracking-wider mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Próxima Funcionalidad
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
              Zentry Live: Transmisiones En Vivo
            </h2>
            <p className="text-sm text-zentry-text-2 max-w-xl mb-6 leading-relaxed">
              Muy pronto podrás transmitir tu proceso creativo en tiempo real, realizar talleres interactivos, sesiones de feedback en vivo y conectar directamente con tu comunidad de creadores.
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <button
                onClick={() => toast.success("¡Te hemos anotado! Te avisaremos el día del lanzamiento oficial de Zentry Live.")}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all cursor-pointer"
              >
                <Bell className="w-4 h-4" /> Notificarme del Lanzamiento
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zentry-card border border-zentry-border/80 rounded-3xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <Tv className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-zentry-text-1">Workshops & Masterclasses</h4>
              <p className="text-xs text-zentry-text-2 leading-relaxed">
                Aprende de artistas destacados en sesiones interactivas de ilustración, 3D y diseño.
              </p>
            </div>

            <div className="bg-zentry-card border border-zentry-border/80 rounded-3xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Radio className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-zentry-text-1">Stream de Proceso Creativo</h4>
              <p className="text-xs text-zentry-text-2 leading-relaxed">
                Muestra tu flujo de trabajo en vivo mientras interactúas por chat con tus seguidores.
              </p>
            </div>

            <div className="bg-zentry-card border border-zentry-border/80 rounded-3xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-zentry-text-1">Monetización en Vivo</h4>
              <p className="text-xs text-zentry-text-2 leading-relaxed">
                Recibe apoyos directos y donaciones de tu audiencia durante tus transmisiones.
              </p>
            </div>
          </div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 px-4 bg-zentry-card border border-zentry-border rounded-3xl space-y-3">
          <Sparkles className="w-12 h-12 text-zentry-accent mx-auto opacity-50" />
          <h3 className="text-base font-extrabold text-zentry-text-1">No hay publicaciones en esta categoría</h3>
          <p className="text-xs text-zentry-text-2 max-w-sm mx-auto">
            ¡Sé el primero en compartir tu obra de arte, video o música con la comunidad!
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-zentry-accent text-white rounded-2xl text-xs font-black hover:opacity-90 transition-opacity shadow-md"
          >
            Crear Publicación
          </button>
        </div>
      ) : (
        <div className={layoutStyle === 'grid' ? 'columns-1 sm:columns-2 gap-6 space-y-6' : 'flex flex-col gap-6'}>
          {filteredPosts.map((post, idx) => (
            <div key={post.id} className="break-inside-avoid">
              <FeedCard
                post={post}
                isLiked={likedPosts.includes(post.id)}
                onLike={toggleLike}
                onReact={handleReact}
                onComment={handleOpenComments}
                onShare={handleShare}
                onPostUpdated={applyPostUpdate}
                onPostDeleted={handlePostDeleted}
                isListMode={layoutStyle === 'list'}
              />
              {ads.length > 0 && (idx + 1) % 3 === 0 && (
                <AdCard ad={ads[Math.floor(idx / 3) % ads.length]} variant="feed" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cargar más publicaciones (paginación real, no solo las primeras 20) */}
      {hasMorePosts && searchQuery === "" && activeTab !== 'Siguiendo' && (
        <div className="flex justify-center pt-2">
          <button
            onClick={loadMorePosts}
            disabled={isLoadingMore}
            className="px-6 py-2.5 bg-zentry-card border border-zentry-border text-zentry-text-1 rounded-2xl text-xs font-black hover:border-zentry-accent transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isLoadingMore ? 'Cargando...' : 'Cargar más publicaciones'}
          </button>
        </div>
      )}

      {/* 6. MODAL DE CREAR PUBLICACIÓN */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={(newPost) => {
          setPosts(prev => [newPost, ...prev]);
        }}
      />

      {/* 7. MODAL VENTANA EMERGENTE DE PUBLICACIÓN Y COMENTARIOS (ESTILO INSTAGRAM / X) */}
      <PostDetailModal
        post={activeCommentPost}
        isOpen={Boolean(activeCommentPost)}
        onClose={() => {
          setActiveCommentPost(null);
          // Limpiar ?post= para que recargar no vuelva a abrir el modal
          if (window.location.search.includes('post=')) window.history.replaceState(null, '', '/feed');
        }}
        isLiked={activeCommentPost ? likedPosts.includes(activeCommentPost.id) : false}
        onLike={toggleLike}
        onShare={handleShare}
        onReact={handleReact}
        onPostUpdated={applyPostUpdate}
        onPostDeleted={handlePostDeleted}
        onCommentCountChange={(postId, newCount) => {
          setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: newCount } : p))
        }}
      />

      {/* 8. MODAL DE CREAR HISTORIA 9:16 (Estilo Instagram) */}
      <CreateStoryModal
        isOpen={isCreateStoryModalOpen}
        onClose={() => setIsCreateStoryModalOpen(false)}
        onStoryCreated={handleStoryCreated}
      />

      {/* 9. VISOR INMERSIVO DE HISTORIAS (Estilo Instagram) */}
      {activeViewerGroupIndex !== null && (
        <StoryViewer
          storyGroups={storyGroups.filter(g => g.items && g.items.length > 0)}
          initialGroupIndex={Math.min(
            activeViewerGroupIndex,
            Math.max(0, storyGroups.filter(g => g.items && g.items.length > 0).length - 1)
          )}
          onClose={() => setActiveViewerGroupIndex(null)}
          onStoryGroupViewed={handleStoryGroupViewed}
          onLikeStory={handleLikeStory}
          onReactStory={handleReactStory}
          onSendReply={handleReplyToStory}
          onDeleteStory={handleDeleteStory}
          currentUserId={user?.id}
        />
      )}

    </motion.div>
  );
}