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
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-5xl mx-auto py-4 sm:py-8 transition-colors duration-300 pb-24 relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-20 left-1/2 -translate-x-1/2 bg-zentry-text-1 text-zentry-bg px-6 py-3 rounded-full font-bold text-sm z-50 shadow-lg">
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <FeedSearch onSearch={setSearchQuery} />
      
      {/* Pasamos nuestras historias combinadas */}
      <Stories stories={stories} onStoryClick={(story) => setActiveStory(story)} />
      
      <FeedTabs activeTab={activeTab} setTab={setActiveTab} />
      <FeedLayoutControls layout={layoutStyle} setLayout={setLayoutStyle} />

      <motion.div layout className={layoutStyle === 'grid' ? "columns-1 sm:columns-2 gap-4 sm:gap-6 space-y-4 sm:space-y-6 px-4 sm:px-0" : "flex flex-col gap-6 px-4 sm:px-0"}>
        {filteredPosts.map((post) => (
          <FeedCard key={post.id} post={post} isLiked={likedPosts.includes(post.id)} onLike={toggleLike} onComment={setActiveCommentPost} onShare={handleShare} isListMode={layoutStyle === 'list'} />
        ))}
      </motion.div>

      {/* MODALES MANTENIDOS IGUAL */}
      {/* MODAL DE HISTORIAS */}
      <AnimatePresence>
        {activeStory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4">
            <button onClick={() => setActiveStory(null)} className="absolute top-6 right-6 text-white p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-10"><X className="w-6 h-6" /></button>
            <div className="w-full max-w-sm h-[80vh] bg-gradient-to-br from-zentry-accent to-purple-800 rounded-3xl relative overflow-hidden flex flex-col">
              <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
                <div className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden"><motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 5 }} className="h-full bg-white" onAnimationComplete={() => setActiveStory(null)} /></div>
              </div>
              <div className="absolute top-8 left-4 flex items-center gap-3 z-10">
                <div className="w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white font-bold">{activeStory.avatar}</div>
                <span className="text-white font-bold text-sm shadow-black drop-shadow-md">{activeStory.handle}</span>
              </div>
              <div className="flex-1 flex items-center justify-center"><Sparkles className="w-24 h-24 text-white/20 animate-pulse" /></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE COMENTARIOS */}
      <AnimatePresence>
        {activeCommentPost && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="w-full max-w-md bg-zentry-card border border-zentry-border rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[70vh] sm:h-[60vh]">
              <div className="p-4 border-b border-zentry-border flex justify-between items-center bg-zentry-bg rounded-t-3xl sm:rounded-t-3xl">
                <h3 className="font-bold text-zentry-text-1">Comentarios</h3>
                <button onClick={() => setActiveCommentPost(null)} className="text-zentry-text-2 hover:text-zentry-text-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-zentry-bg border border-zentry-border flex shrink-0 items-center justify-center text-xs font-bold text-zentry-text-1">PK</div>
                  <div>
                    <p className="text-sm"><span className="font-bold text-zentry-text-1 mr-2">pixelkid</span><span className="text-zentry-text-1">¡Increíble trabajo con los colores!</span></p>
                    <p className="text-xs text-zentry-text-2 mt-1">Hace 2 horas</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSendComment} className="p-4 border-t border-zentry-border flex gap-2">
                <input autoFocus type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder={`Responde a ${activeCommentPost.author}...`} className="flex-1 bg-zentry-bg border border-zentry-border rounded-xl px-4 py-2.5 text-sm text-zentry-text-1 focus:outline-none" />
                <button type="submit" disabled={!commentText.trim()} className="bg-zentry-text-1 text-zentry-bg px-4 py-2.5 rounded-xl disabled:opacity-50"><Send className="w-4 h-4" /></button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}