"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, Variants, AnimatePresence } from "framer-motion"
import { Stories, Story } from "@/components/feed/Stories"
import { FeedSearch } from "@/components/feed/FeedSearch"
import { FeedTabs } from "@/components/feed/FeedTabs"
import { FeedLayoutControls } from "@/components/feed/FeedLayoutControls"
import { FeedCard, PostType } from "@/components/feed/FeedCard"
import CreatePostModal from "@/components/feed/CreatePostModal"
import { 
  X, Send, Sparkles, Image as ImageIcon, Video, Music, 
  FileText, MessageSquare, Loader2, Heart, Share2, PlusCircle
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { getImageUrl, getInitials } from "@/lib/utils"
import { getFriendsAction } from "@/lib/actions/friends"
import { FriendUser } from "@/types"

const containerVariants: Variants = { 
  hidden: { opacity: 0 }, 
  show: { opacity: 1, transition: { staggerChildren: 0.08 } } 
};

export default function FeedClient({ initialPosts }: { initialPosts: any }) {
  const { user } = useAuth();
  
  const rawUsername = (user?.username || user?.email || 'creador').replace(/^@/, '').toLowerCase();
  const displayName = user?.name || user?.username || 'Creador Zentry';

  const [posts, setPosts] = useState<PostType[]>([]);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [likedPosts, setLikedPosts] = useState<(string | number)[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [activeTab, setActiveTab] = useState('Para ti');
  const [layoutStyle, setLayoutStyle] = useState<'grid' | 'list'>('grid');

  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState<PostType | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // 1. Cargar Posts Dinámicos desde Servidor Next.js y Backend
  const loadPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setPosts(data.data);
          return;
        }
      }
    } catch (err) {}

    // Fallback a initialPosts si existen
    if (initialPosts && Array.isArray(initialPosts)) {
      setPosts(initialPosts);
    }
  };

  // Cargar Amigos para Historias Dinámicas
  useEffect(() => {
    loadPosts();

    async function loadFriends() {
      try {
        const res = await getFriendsAction(false);
        if (res.success && res.data) {
          setFriends(res.data);
        }
      } catch (e) {}
    }

    loadFriends();
  }, []);

  // 2. Historias Dinámicas (Usuario Actual + Amigos/Creadores Activos)
  const stories: Story[] = useMemo(() => {
    const userStory: Story = {
      id: 'my_story',
      handle: 'Tu Historia',
      name: displayName.split(' ')[0],
      isUser: true,
      avatar: getInitials(displayName),
      avatar_url: user?.avatar_url,
      viewed: false
    };

    const friendStories: Story[] = friends.map(f => ({
      id: f.id,
      handle: `@${f.username}`,
      name: f.name || f.username,
      isUser: false,
      avatar: getInitials(f.name || f.username),
      avatar_url: f.avatar_url,
      viewed: !f.is_online
    }));

    return [userStory, ...friendStories];
  }, [user, friends, displayName]);

  // 3. Manejo de Likes Dinámico
  const toggleLike = async (postId: string | number) => {
    const isCurrentlyLiked = likedPosts.includes(postId);

    setLikedPosts(prev => 
      isCurrentlyLiked ? prev.filter(id => id !== postId) : [...prev, postId]
    );

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: isCurrentlyLiked ? Math.max(0, p.likes - 1) : p.likes + 1
        };
      }
      return p;
    }));

    try {
      await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'like',
          postId,
          username: rawUsername
        })
      });
    } catch {}
  };

  // 4. Compartir Obra
  const handleShare = (post: PostType) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/feed?post=${post.id}`;
      navigator.clipboard.writeText(url);
      toast.success(`🔗 ¡Enlace de "${post.title}" copiado al portapapeles!`);
    }
  };

  // 5. Enviar Comentario en Vivo
  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeCommentPost) return;

    setIsSubmittingComment(true);
    const newComment = {
      id: `c_${Date.now()}`,
      author: displayName,
      handle: `@${rawUsername}`,
      text: commentText.trim(),
      time: 'Justo ahora'
    };

    const targetPostId = activeCommentPost.id;

    setPosts(prev => prev.map(p => {
      if (p.id === targetPostId) {
        return {
          ...p,
          comments: p.comments + 1,
          comments_list: [newComment, ...(p.comments_list || [])]
        };
      }
      return p;
    }));

    setActiveCommentPost(prev => prev ? {
      ...prev,
      comments: prev.comments + 1,
      comments_list: [newComment, ...(prev.comments_list || [])]
    } : null);

    setCommentText("");
    toast.success("💬 Comentario publicado");

    try {
      await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'comment',
          postId: targetPostId,
          username: rawUsername,
          authorName: displayName,
          commentText: newComment.text
        })
      });
    } catch {} finally {
      setIsSubmittingComment(false);
    }
  };

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
      
      {/* 2. Historias Dinámicas */}
      <Stories 
        stories={stories} 
        onStoryClick={(story) => {
          toast.info(`Viendo la historia de ${story.handle}`);
        }} 
        onAddStory={() => setIsCreateModalOpen(true)}
      />

      {/* 3. BARRA CREADORA SUPERIOR (Estilo Facebook / X / LinkedIn) */}
      <div className="bg-zentry-card border border-zentry-border rounded-3xl p-4 sm:p-5 shadow-sm mb-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-950/50 border border-purple-500/30 flex items-center justify-center font-black text-xs text-purple-300 shrink-0 overflow-hidden shadow-sm">
            {user?.avatar_url ? (
              <img src={getImageUrl(user.avatar_url)} alt={displayName} className="w-full h-full object-cover" />
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

      {/* 5. Flujo Principal de Publicaciones */}
      {filteredPosts.length === 0 ? (
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
          {filteredPosts.map(post => (
            <FeedCard 
              key={post.id}
              post={post}
              currentUsername={rawUsername}
              isLiked={likedPosts.includes(post.id) || (post.liked_by && post.liked_by.includes(rawUsername))}
              onLike={toggleLike}
              onComment={(p) => setActiveCommentPost(p)}
              onShare={handleShare}
              isListMode={layoutStyle === 'list'}
            />
          ))}
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

      {/* 7. DRAWER / MODAL DE COMENTARIOS */}
      <AnimatePresence>
        {activeCommentPost && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              {/* Header Comentarios */}
              <div className="p-4 border-b border-zentry-border flex justify-between items-center bg-zentry-bg">
                <div>
                  <h3 className="font-extrabold text-sm text-zentry-text-1">Comentarios</h3>
                  <p className="text-[11px] text-zentry-text-2 truncate max-w-xs">{activeCommentPost.title}</p>
                </div>
                <button 
                  onClick={() => setActiveCommentPost(null)}
                  className="p-1.5 text-zentry-text-2 hover:text-zentry-text-1 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lista de Comentarios */}
              <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                {(!activeCommentPost.comments_list || activeCommentPost.comments_list.length === 0) ? (
                  <div className="py-12 text-center text-zentry-text-2 space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-xs font-bold text-zentry-text-1">Aún no hay comentarios</p>
                    <p className="text-[11px]">¡Sé el primero en dejar una opinión a {activeCommentPost.author}!</p>
                  </div>
                ) : (
                  activeCommentPost.comments_list.map(c => (
                    <div key={c.id} className="p-3 bg-zentry-bg rounded-2xl border border-zentry-border/70 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-zentry-text-1">{c.author}</span>
                        <span className="text-[10px] text-zentry-text-2 font-mono">{c.time}</span>
                      </div>
                      <p className="text-xs text-zentry-text-1 leading-relaxed">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Formulario de Comentar */}
              <form onSubmit={handleSendComment} className="p-3.5 border-t border-zentry-border bg-zentry-bg flex items-center gap-2">
                <input 
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={`Comentar como @${rawUsername}...`}
                  className="flex-1 bg-zentry-card border border-zentry-border rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-zentry-text-1 placeholder:text-zentry-text-2/60 focus:outline-none focus:border-zentry-accent transition-colors"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || isSubmittingComment}
                  className="p-2.5 bg-zentry-accent text-white rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center shrink-0 cursor-pointer shadow-md"
                >
                  {isSubmittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}