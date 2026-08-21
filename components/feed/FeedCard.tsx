import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MessageCircle, Share2, MoreHorizontal, Sparkles, Bookmark, Flag, Link as LinkIcon } from "lucide-react"
import Link from "next/link"

export type PostType = { id: number; title: string; author: string; handle: string; likes: number; comments: number; height: string; color: string; avatar?: string }

interface FeedCardProps {
  post: PostType;
  isLiked: boolean;
  onLike: (postId: number) => void;
  onComment?: (post: PostType) => void;
  onShare?: (post: PostType) => void;
  isListMode?: boolean;
}

export function FeedCard({ post, isLiked, onLike, onComment, onShare, isListMode }: FeedCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cleanUsername = post.handle.replace('@', '');

  return (
    <motion.div layout className={`break-inside-avoid bg-zentry-card border border-zentry-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all relative ${isListMode ? 'mb-6' : 'mb-0'}`}>
      
      {/* Cabecera */}
      <div className="p-4 flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${cleanUsername}`} className="w-10 h-10 rounded-full bg-zentry-bg border border-zentry-border flex items-center justify-center text-sm font-bold text-zentry-text-1 hover:border-zentry-accent transition-colors">
            {post.avatar || post.author.substring(0, 2).toUpperCase()}
          </Link>
          <div>
            <Link href={`/profile/${cleanUsername}`} className="text-sm font-bold text-zentry-text-1 leading-tight hover:underline">
              {post.author}
            </Link>
            <p className="text-xs text-zentry-text-2">{post.handle}</p>
          </div>
        </div>

        {/* Botón de Menú y Menú Desplegable */}
        <div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-zentry-text-2 hover:text-zentry-text-1 p-2 rounded-full hover:bg-zentry-bg transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          <AnimatePresence>
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-4 top-14 w-48 bg-zentry-card border border-zentry-border rounded-xl shadow-xl z-20 py-2"
                >
                  <button onClick={() => setIsMenuOpen(false)} className="w-full px-4 py-2 text-left text-sm text-zentry-text-1 hover:bg-zentry-bg flex items-center gap-2 transition-colors">
                    <Bookmark className="w-4 h-4 text-zentry-text-2" /> Guardar publicación
                  </button>
                  <button onClick={() => { onShare?.(post); setIsMenuOpen(false); }} className="w-full px-4 py-2 text-left text-sm text-zentry-text-1 hover:bg-zentry-bg flex items-center gap-2 transition-colors">
                    <LinkIcon className="w-4 h-4 text-zentry-text-2" /> Copiar enlace
                  </button>
                  <div className="h-px bg-zentry-border my-1 w-full" />
                  <button onClick={() => setIsMenuOpen(false)} className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors">
                    <Flag className="w-4 h-4" /> Reportar
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Imagen / Contenido Visual */}
      <div onDoubleClick={() => onLike(post.id)} className={`w-full ${isListMode ? 'h-96' : post.height} bg-gradient-to-br ${post.color} relative group cursor-pointer flex items-center justify-center`}>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        <Sparkles className="w-8 h-8 text-zentry-text-1/20" />
      </div>

      {/* Acciones e Info */}
      <div className="p-4">
        <div className="flex items-center gap-4 mb-3">
          <button onClick={() => onLike(post.id)} className="flex items-center gap-1.5 group">
            <motion.div whileTap={{ scale: 0.8 }} className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-red-500/10' : 'hover:bg-zentry-bg'}`}>
              <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-zentry-text-1 group-hover:text-red-500'}`} />
            </motion.div>
            <span className={`text-sm font-medium ${isLiked ? 'text-red-500' : 'text-zentry-text-2'}`}>
              {post.likes + (isLiked ? 1 : 0)}
            </span>
          </button>
          
          <button onClick={() => onComment?.(post)} className="flex items-center gap-1.5 group">
            <motion.div whileTap={{ scale: 0.8 }} className="p-2 rounded-full hover:bg-zentry-bg transition-colors">
              <MessageCircle className="w-5 h-5 text-zentry-text-1 group-hover:text-blue-500 transition-colors" />
            </motion.div>
            <span className="text-sm font-medium text-zentry-text-2">{post.comments}</span>
          </button>

          <button onClick={() => onShare?.(post)} className="ml-auto p-2 rounded-full hover:bg-zentry-bg transition-colors">
            <motion.div whileTap={{ scale: 0.8 }}>
              <Share2 className="w-5 h-5 text-zentry-text-1 hover:text-green-500" />
            </motion.div>
          </button>
        </div>
        
        <h3 className="text-sm font-bold text-zentry-text-1 leading-snug">
          {post.handle} <span className="font-normal text-zentry-text-2 ml-1">{post.title}</span>
        </h3>
      </div>
    </motion.div>
  )
}

