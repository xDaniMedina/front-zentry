"use client"

import { useState, useEffect } from "react"
import { motion, Variants, AnimatePresence } from "framer-motion"
import { Stories, Story } from "@/components/feed/Stories"
import { FeedSearch } from "@/components/feed/FeedSearch"
import { FeedTabs } from "@/components/feed/FeedTabs"
import { FeedLayoutControls } from "@/components/feed/FeedLayoutControls"
import { FeedCard, PostType } from "@/components/feed/FeedCard"
import { useMemo } from "react"; 
import { X, Send, Sparkles } from "lucide-react"
import { useAuth } from "@/context/AuthContext" // <-- INYECTAMOS LA SESIÓN

// Mantenemos algunos mocks para la UI mientras el backend se termina de poblar
const MOCK_STORIES: Story[] = [
  { id: 2, handle: 'pixelkid', isUser: false, avatar: 'PK', viewed: false },
  { id: 3, handle: 'lunamuse', isUser: false, avatar: 'LM', viewed: true },
  { id: 4, handle: 'carlos_dev', isUser: false, avatar: 'CD', viewed: true },
];


const FALLBACK_POSTS: PostType[] = [
  { id: 1, title: 'Serie Raíces: Origen', author: 'Daniel Artesano', handle: '@danielarte', likes: 342, comments: 28, height: 'h-80', color: 'from-blue-500/20 to-purple-500/20', avatar: 'DA' },
];

const containerVariants: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }

export default function FeedClient({ initialPosts }: { initialPosts: PostType[] | null }) {
  // OBTENEMOS AL USUARIO REAL
  const { user } = useAuth();
  
  const [posts] = useState<PostType[]>(initialPosts && initialPosts.length > 0 ? initialPosts : FALLBACK_POSTS)
  const [likedPosts, setLikedPosts] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState('Para ti')
  const [layoutStyle, setLayoutStyle] = useState<'grid' | 'list'>('grid')

  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [activeCommentPost, setActiveCommentPost] = useState<PostType | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [commentText, setCommentText] = useState("");

  // Creamos la lista de historias combinando al usuario real con los mocks
const stories = useMemo(() => {
    const userInitials = user?.username ? user.username.substring(0, 2).toUpperCase() : 'ME';
    
    const userStory: Story = {
      id: 1,
      handle: 'Tu Historia',
      isUser: true,
      avatar: userInitials,
      viewed: false
    };
    
    return [userStory, ...MOCK_STORIES];
  }, [user]);


  const toggleLike = (postId: number) => {
    setLikedPosts(prev => prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId])
  }

  const handleShare = (post: PostType) => {
    navigator.clipboard.writeText(`https://zentry.app/post/${post.id}`);
    setToastMsg(`¡Enlace de la obra de ${post.author} copiado!`);
    setTimeout(() => setToastMsg(""), 3000);
  }

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setToastMsg("Comentario publicado.");
    setCommentText("");
    setActiveCommentPost(null);
    setTimeout(() => setToastMsg(""), 3000);
  }

  const filteredPosts = posts.filter(post => post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.author.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full mx-auto py-2 sm:py-6 transition-colors duration-300 relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 bg-zentry-text-1 text-zentry-bg px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm z-50 shadow-lg">
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <FeedSearch onSearch={setSearchQuery} />
      
      {/* Historias Adaptables */}
      <Stories stories={stories} onStoryClick={(story) => setActiveStory(story)} />
      
      {/* Pestañas y Controles de Vista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <FeedTabs activeTab={activeTab} setTab={setActiveTab} />
        <FeedLayoutControls layout={layoutStyle} setLayout={setLayoutStyle} />
      </div>

      {/* Cuadrícula de Posts Responsiva (1 columna en móvil, 2 columnas en tablet y desktop) */}
      <motion.div 
        layout 
        className={
          layoutStyle === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5" 
            : "flex flex-col gap-4 sm:gap-6 max-w-2xl mx-auto w-full"
        }
      >
        {filteredPosts.map((post) => (
          <FeedCard key={post.id} post={post} isLiked={likedPosts.includes(post.id)} onLike={toggleLike} onComment={setActiveCommentPost} onShare={handleShare} isListMode={layoutStyle === 'list'} />
        ))}
      </motion.div>

      {/* MODAL DE HISTORIAS */}
      <AnimatePresence>
        {activeStory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-3 sm:p-4">
            <button onClick={() => setActiveStory(null)} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-10">
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="w-full max-w-sm sm:max-w-md h-[78vh] sm:h-[82vh] max-h-[750px] bg-gradient-to-br from-zentry-accent to-purple-800 rounded-3xl relative overflow-hidden flex flex-col shadow-2xl">
              <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
                <div className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden">
                  <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 5 }} className="h-full bg-white" onAnimationComplete={() => setActiveStory(null)} />
                </div>
              </div>
              <div className="absolute top-8 left-4 flex items-center gap-3 z-10">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                  {activeStory.avatar}
                </div>
                <span className="text-white font-bold text-xs sm:text-sm shadow-black drop-shadow-md">{activeStory.handle}</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <Sparkles className="w-20 h-20 sm:w-24 sm:h-24 text-white/20 animate-pulse" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE COMENTARIOS */}
      <AnimatePresence>
        {activeCommentPost && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="w-full max-w-md bg-zentry-card border border-zentry-border rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[75vh] sm:h-[60vh] pb-safe">
              <div className="p-3.5 sm:p-4 border-b border-zentry-border flex justify-between items-center bg-zentry-bg rounded-t-3xl">
                <h3 className="font-bold text-sm sm:text-base text-zentry-text-1">Comentarios</h3>
                <button onClick={() => setActiveCommentPost(null)} className="text-zentry-text-2 hover:text-zentry-text-1 p-1 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto flex flex-col gap-3 sm:gap-4">
                <div className="flex gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 rounded-full bg-zentry-bg border border-zentry-border flex shrink-0 items-center justify-center text-xs font-bold text-zentry-text-1">
                    PK
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm">
                      <span className="font-bold text-zentry-text-1 mr-1.5">pixelkid</span>
                      <span className="text-zentry-text-1">¡Increíble trabajo con los colores!</span>
                    </p>
                    <p className="text-[10px] sm:text-xs text-zentry-text-2 mt-1">Hace 2 horas</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSendComment} className="p-3 sm:p-4 border-t border-zentry-border flex gap-2 bg-zentry-bg/50">
                <input autoFocus type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder={`Responde a ${activeCommentPost.author}...`} className="flex-1 bg-zentry-bg border border-zentry-border rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors" />
                <button type="submit" disabled={!commentText.trim()} className="bg-zentry-accent text-white px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl disabled:opacity-50 flex items-center justify-center">
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}