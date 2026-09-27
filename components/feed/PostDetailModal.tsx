'use client'

import { useMyAvatar } from "@/lib/hooks/useMyAvatar"
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Heart, MessageSquare, Share2, Bookmark, Send, Loader2, 
  Play, Pause, Music, Edit3, Trash2, Check, Pencil,
  FileText
} from 'lucide-react'
import Image from 'next/image'
import ReactionButton, { ReactionSummary } from '@/components/shared/ReactionButton'
import UserAvatar, { UserTitleBadge } from '@/components/shared/UserAvatar'
import Link from 'next/link'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { getImageUrl, getInitials, timeAgo } from '@/lib/utils'
import { PostType, CommentItem } from '@/components/feed/FeedCard'
import { 
  getPostCommentsAction, 
  addPostCommentAction, 
  editPostCommentAction, 
  deletePostCommentAction, 
  toggleLikeCommentAction,
  toggleBookmarkAction, updatePostAction, deletePostAction
} from '@/lib/actions/feed'

interface PostDetailModalProps {
  post: PostType | null
  isOpen: boolean
  onClose: () => void
  isLiked?: boolean
  onLike?: (postId: string | number) => void
  onReact?: (postId: string | number, type: string) => void
  onShare?: (post: PostType) => void
  onCommentCountChange?: (postId: string | number, newCount: number) => void
  onPostUpdated?: (updated: PostType) => void
  onPostDeleted?: (postId: string | number) => void
}

export default function PostDetailModal({
  post,
  isOpen,
  onClose,
  isLiked = false,
  onLike,
  onReact,
  onShare,
  onCommentCountChange,
  onPostUpdated,
  onPostDeleted
}: PostDetailModalProps) {
  const { user } = useAuth()
  const myAvatar = useMyAvatar()
  const [comments, setComments] = useState<CommentItem[]>([])
  const [currentPost, setCurrentPost] = useState<PostType | null>(post)
  
  // Estados para edición y eliminación de la obra
  const [isEditingPost, setIsEditingPost] = useState(false)
  const [postTitle, setPostTitle] = useState('')
  const [postDesc, setPostDesc] = useState('')
  const [isSavingPost, setIsSavingPost] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeletingPost, setIsDeletingPost] = useState(false)

  useEffect(() => {
    setCurrentPost(post)
    if (post) {
      setPostTitle(post.title || '')
      setPostDesc(post.description || '')
    }
  }, [post])

  const handleSavePostEdit = async () => {
    if (!currentPost) return
    if (!postTitle.trim()) {
      toast.error('El título no puede estar vacío')
      return
    }
    setIsSavingPost(true)
    const res = await updatePostAction(currentPost.id, {
      title: postTitle.trim(),
      description: postDesc.trim()
    })
    setIsSavingPost(false)
    if (res.success && res.data) {
      setCurrentPost(res.data)
      setIsEditingPost(false)
      toast.success('✨ Publicación actualizada con éxito')
      onPostUpdated?.(res.data)
    } else {
      toast.error(res.error || 'No se pudo actualizar la obra')
    }
  }

  const handleDeletePost = async () => {
    if (!currentPost) return
    setIsDeletingPost(true)
    const res = await deletePostAction(currentPost.id)
    setIsDeletingPost(false)
    if (res.success) {
      setShowDeleteConfirm(false)
      toast.success('🗑️ Publicación eliminada')
      onPostDeleted?.(currentPost.id)
      onClose()
    } else {
      toast.error(res.error || 'No se pudo eliminar la obra')
    }
  }
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Estado de edición de comentario
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Estado de guardado / bookmark del post
  const [isSaved, setIsSaved] = useState(false)

  // Reproducción de audio
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Reproducción de video
  const [isPlayingVideo, setIsPlayingVideo] = useState(false)
  const [isVideoMuted, setIsVideoMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Cargar comentarios reales cuando se abre el modal o cambia el post
  useEffect(() => {
    if (isOpen && post) {
      setIsSaved(Boolean(post.saved))
      setComments(post.comments_list || [])
      setIsLoadingComments(true)

      getPostCommentsAction(post.id).then(res => {
        setIsLoadingComments(false)
        if (res.success && res.data) {
          setComments(res.data)
          if (onCommentCountChange) {
            onCommentCountChange(post.id, res.data.length)
          }
        }
      })
    } else {
      setComments([])
      setEditingCommentId(null)
      setIsPlayingAudio(false)
      setIsPlayingVideo(false)
    }
  }, [isOpen, post?.id])

  if (!isOpen || !post) return null

  const rawHandle = post.handle || '@creador'
  const cleanUsername = rawHandle.replace(/^@/, '')
  const displayAvatar = post.avatar_url || post.avatar

  // Manejo de Audio
  const togglePlayAudio = () => {
    if (!audioRef.current) return
    if (isPlayingAudio) {
      audioRef.current.pause()
      setIsPlayingAudio(false)
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingAudio(true)
      }).catch(err => {
        console.warn('Autoplay audio bloqueado:', err)
      })
    }
  }

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current) return
    const current = audioRef.current.currentTime
    const duration = audioRef.current.duration || 1
    setAudioProgress((current / duration) * 100)
  }

  // Manejo de Video
  const togglePlayVideo = () => {
    if (!videoRef.current) return
    if (isPlayingVideo) {
      videoRef.current.pause()
      setIsPlayingVideo(false)
    } else {
      videoRef.current.play().then(() => {
        setIsPlayingVideo(true)
      }).catch(err => {
        console.warn('Autoplay video bloqueado:', err)
      })
    }
  }

  // Manejo de Guardar Post
  const handleToggleSave = async () => {
    const prev = isSaved
    const next = !isSaved
    setIsSaved(next)
    const res = await toggleBookmarkAction(post.id)
    if (res.success) {
      setIsSaved(Boolean(res.saved))
      toast.success(res.saved ? 'Publicación guardada en tu perfil' : 'Publicación eliminada de guardados')
    } else {
      setIsSaved(prev)
      toast.error('No se pudo guardar la publicación')
    }
  }

  // Enviar Nuevo Comentario
  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setIsSubmitting(true)
    const res = await addPostCommentAction(post.id, commentText.trim())
    setIsSubmitting(false)

    if (res.success && res.data) {
      const newComment = res.data
      // La lista viene en orden cronológico: el nuevo va al final
      setComments(prev => [...prev, newComment])
      setCommentText('')
      toast.success('Comentario publicado')
      if (onCommentCountChange) {
        onCommentCountChange(post.id, comments.length + 1)
      }
    } else {
      toast.error(res.error || 'No se pudo publicar tu comentario')
    }
  }

  // Reaccionar / Dar Like a un Comentario
  const handleToggleLikeComment = async (commentId: string) => {
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const nextLiked = !c.liked
        const nextCount = nextLiked ? (c.likesCount || 0) + 1 : Math.max(0, (c.likesCount || 0) - 1)
        return { ...c, liked: nextLiked, likesCount: nextCount }
      }
      return c
    }))

    const res = await toggleLikeCommentAction(commentId)
    if (res.success && res.data) {
      setComments(prev => prev.map(c => c.id === commentId ? res.data! : c))
    } else {
      toast.error(res.error || 'No se pudo reaccionar al comentario')
    }
  }

  // Guardar Edición de Comentario
  const handleSaveEdit = async (commentId: string) => {
    if (!editingText.trim()) return
    setIsSavingEdit(true)
    const res = await editPostCommentAction(commentId, editingText.trim())
    setIsSavingEdit(false)

    if (res.success && res.data) {
      setComments(prev => prev.map(c => c.id === commentId ? res.data! : c))
      setEditingCommentId(null)
      setEditingText('')
      toast.success('Comentario actualizado')
    } else {
      toast.error(res.error || 'No se pudo editar el comentario')
    }
  }

  // Eliminar Comentario
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este comentario?')) return

    setComments(prev => prev.filter(c => c.id !== commentId))
    const res = await deletePostCommentAction(commentId)
    if (res.success) {
      toast.success('Comentario eliminado')
      if (onCommentCountChange) {
        onCommentCountChange(post.id, Math.max(0, comments.length - 1))
      }
    } else {
      toast.error(res.error || 'No se pudo eliminar el comentario')
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-zentry-card border border-zentry-border/80 rounded-3xl w-full max-w-5xl h-[92dvh] max-h-[850px] overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
        >
          {/* BOTÓN DE CERRAR */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-30 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md border border-white/10 transition-transform active:scale-90 cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>

          {/* COLUMNA IZQUIERDA: VISTA PREVIA DE LA OBRA / MEDIA (Video, Audio, Texto, Imagen) */}
          <div className="w-full md:w-[58%] lg:w-[62%] bg-black/90 relative flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-zentry-border/70 h-[38%] min-h-[180px] shrink-0 md:h-auto md:min-h-full md:shrink">
            {/* Backdrop con difuminado para imágenes */}
            {post.media_url && post.media_type === 'image' && (
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20 blur-2xl scale-110 pointer-events-none"
                style={{ backgroundImage: `url(${post.media_url})` }}
              />
            )}

            {/* VISTA 1: IMAGEN */}
            {post.media_type === 'image' && post.media_url && (
              <div className="relative w-full h-full flex items-center justify-center p-2">
                <Image
                  src={post.media_url}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            )}

            {/* VISTA 2: VIDEO */}
            {post.media_type === 'video' && post.media_url && (
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  src={post.media_url}
                  controls
                  playsInline
                  loop
                  muted={isVideoMuted}
                  className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
                  onPlay={() => setIsPlayingVideo(true)}
                  onPause={() => setIsPlayingVideo(false)}
                />
              </div>
            )}

            {/* VISTA 3: AUDIO CON REPRODUCTOR Y VISUALIZADOR */}
            {post.media_type === 'audio' && (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-950/40 via-indigo-950/30 to-black relative">
                <audio
                  ref={audioRef}
                  src={post.media_url}
                  onTimeUpdate={handleAudioTimeUpdate}
                  onEnded={() => setIsPlayingAudio(false)}
                />

                {/* Disco de Vinilo / Ilustración con Animación */}
                <div className="relative mb-6 group cursor-pointer" onClick={togglePlayAudio}>
                  <div className={`w-44 h-44 sm:w-56 sm:h-56 rounded-full border-4 border-purple-500/30 shadow-2xl overflow-hidden relative flex items-center justify-center ${isPlayingAudio ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }}>
                    {post.media_url ? (
                      <div className="w-full h-full bg-gradient-to-tr from-purple-900 via-indigo-900 to-black flex items-center justify-center">
                        <Music className="w-20 h-20 text-purple-400 opacity-60" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-zentry-card flex items-center justify-center">
                        <Music className="w-20 h-20 text-zentry-accent" />
                      </div>
                    )}
                    <div className="w-12 h-12 bg-black rounded-full border-2 border-purple-500/50 absolute shadow-inner" />
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 bg-purple-600/90 text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      {isPlayingAudio ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                    </div>
                  </div>
                </div>

                {/* Info & Controles de Reproductor */}
                <div className="w-full max-w-sm space-y-3 text-center">
                  <h4 className="font-black text-white text-base truncate">{post.title}</h4>
                  <p className="text-xs text-purple-300 font-bold truncate">{post.author}</p>

                  {/* Barra de Progreso */}
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden cursor-pointer">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-200"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-zentry-text-2 pt-1">
                    <span>{isPlayingAudio ? 'En reproducción' : 'Pausado'}</span>
                    <button
                      onClick={togglePlayAudio}
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer mx-auto"
                    >
                      {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      {isPlayingAudio ? 'Pausar' : 'Escuchar Obra'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VISTA 4: TEXTO / ESCRITO / ARTÍCULO */}
            {(post.media_type === 'text' || (!post.media_url && post.media_type !== 'audio')) && (
              <div className="w-full h-full p-6 sm:p-10 flex flex-col justify-between bg-gradient-to-br from-zentry-card via-purple-950/20 to-zentry-bg overflow-y-auto custom-scrollbar">
                <div className="space-y-4 max-w-xl mx-auto my-auto text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-300 text-xs font-black uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    Obra Literaria / Texto
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
                    {post.title}
                  </h2>

                  {post.description && (
                    <div className="text-sm text-zentry-text-1 leading-relaxed whitespace-pre-line border-l-2 border-purple-500/50 pl-4 py-1 italic font-serif">
                      &ldquo;{post.description}&rdquo;
                    </div>
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {post.tags.map((tag, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-zentry-bg border border-zentry-border rounded-lg text-[11px] font-mono text-purple-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: INFORMACIÓN DEL POST + COMENTARIOS INTERACTIVOS */}
          <div className="w-full md:w-[42%] lg:w-[38%] flex flex-col flex-1 min-h-0 md:flex-none md:h-full bg-zentry-card overflow-hidden">
            {/* 1. CABECERA AUTOR */}
            <div className="p-4 border-b border-zentry-border flex items-center justify-between bg-zentry-bg shrink-0">
              <Link href={`/profile/${cleanUsername}`} className="flex items-center gap-3 group min-w-0">
                <UserAvatar name={post.author} avatarUrl={displayAvatar} cosmetics={post.authorCosmetics} size={40} />
                <div className="overflow-hidden">
                  <h4 className="font-extrabold text-xs text-zentry-text-1 group-hover:text-purple-400 transition-colors truncate">
                    {post.author}
                  </h4>
                  <p className="text-[11px] text-zentry-text-2 font-mono truncate">
                    {post.handle} {post.discipline ? `• ${post.discipline}` : ''}
                  </p>
                </div>
              </Link>

              {/* Botones de Editar y Eliminar Obra */}
              {(currentPost?.canEdit || currentPost?.canDelete) && (
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {currentPost?.canEdit && !isEditingPost && (
                    <button
                      onClick={() => setIsEditingPost(true)}
                      className="p-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Editar título y descripción"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>
                  )}
                  {currentPost?.canDelete && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Eliminar publicación"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Eliminar</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 2. DESCRIPCIÓN DEL POST Y METADATOS */}
            <div className="p-4 border-b border-zentry-border/70 space-y-2.5 bg-zentry-card/50 shrink-0">
              {isEditingPost ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Título de la publicación"
                    className="w-full bg-zentry-bg border border-purple-500/50 rounded-xl py-1.5 px-3 text-xs font-bold text-white focus:outline-none focus:border-purple-400"
                  />
                  <textarea
                    rows={3}
                    value={postDesc}
                    onChange={(e) => setPostDesc(e.target.value)}
                    placeholder="Descripción de la obra..."
                    className="w-full bg-zentry-bg border border-purple-500/50 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-purple-400 resize-none"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingPost(false)}
                      className="px-3 py-1 rounded-lg text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePostEdit}
                      disabled={isSavingPost}
                      className="px-3.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-black flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {isSavingPost ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-extrabold text-sm text-zentry-text-1 leading-snug">{currentPost?.title || post.title}</h3>
                  {(currentPost?.description || post.description) && (
                    <p className="text-xs text-zentry-text-2 leading-relaxed max-h-24 overflow-y-auto custom-scrollbar">
                      {currentPost?.description || post.description}
                    </p>
                  )}
                  <ReactionSummary counts={post.reactionCounts} total={post.likes} myReaction={post.myReaction ?? (isLiked ? 'like' : null)} className="pt-1" />
                  <div className="flex items-center justify-between text-[11px] text-zentry-text-2 font-mono pt-1">
                    <span>{timeAgo(post.created_at)}</span>
                    <span>{comments.length} comentarios</span>
                  </div>
                </>
              )}
            </div>

            {/* 3. BARRA DE ACCIONES */}
            <div className="px-4 py-2.5 border-b border-zentry-border flex items-center justify-between text-xs bg-zentry-bg/80 shrink-0">
              <div className="flex items-center gap-4">
                <ReactionButton
                  myReaction={post.myReaction ?? (isLiked ? 'like' : null)}
                  onToggle={() => onLike?.(post.id)}
                  onReact={(type) => (onReact ? onReact(post.id, type) : onLike?.(post.id))}
                  className="-ml-3"
                />

                <button 
                  onClick={() => onShare && onShare(post)}
                  className="flex items-center gap-1.5 text-zentry-text-2 hover:text-zentry-text-1 font-bold transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartir</span>
                </button>
              </div>

              <button
                onClick={handleToggleSave}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${isSaved ? 'text-amber-400 bg-amber-400/10' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
                title="Guardar publicación"
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
              </button>
            </div>

            {/* 4. LISTA DE COMENTARIOS */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {isLoadingComments ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                </div>
              ) : comments.length === 0 ? (
                <div className="py-12 text-center text-zentry-text-2 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto opacity-30 text-purple-400" />
                  <p className="text-xs font-extrabold text-zentry-text-1">Aún no hay comentarios</p>
                  <p className="text-[11px]">¡Sé el primero en expresar tu opinión a {post.author}!</p>
                </div>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="p-3 bg-zentry-bg rounded-2xl border border-zentry-border/70 space-y-2 transition-all hover:border-zentry-border">
                    {/* Header del comentario */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <UserAvatar name={c.author} avatarUrl={c.avatar} cosmetics={c.cosmetics} size={28} showPet={false} />
                        <div className="truncate">
                          <span className="font-extrabold text-xs text-zentry-text-1 flex items-center gap-1 truncate">
                            {c.author} <UserTitleBadge cosmetics={c.cosmetics} />
                          </span>
                          <span className="text-[10px] text-zentry-text-2 font-mono block">{timeAgo(c.time)}</span>
                        </div>
                      </div>

                      {/* Botones de Editar / Eliminar Comentario */}
                      <div className="flex items-center gap-1 shrink-0">
                        {c.canEdit && (
                          <button
                            onClick={() => {
                              setEditingCommentId(c.id)
                              setEditingText(c.text)
                            }}
                            className="p-1 text-zentry-text-2 hover:text-purple-400 rounded-lg transition-colors cursor-pointer"
                            title="Editar comentario"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {c.canDelete && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="p-1 text-zentry-text-2 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar comentario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Contenido / Modo Edición Inline */}
                    {editingCommentId === c.id ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full bg-zentry-card border border-purple-500/50 rounded-xl p-2.5 text-xs text-zentry-text-1 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2 text-xs">
                          <button
                            onClick={() => setEditingCommentId(null)}
                            className="px-3 py-1 rounded-xl text-zentry-text-2 hover:text-zentry-text-1 font-bold text-[11px]"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveEdit(c.id)}
                            disabled={isSavingEdit}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {isSavingEdit ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-zentry-text-1 leading-relaxed pl-9">
                        {c.text}
                      </p>
                    )}

                    {/* Reacciones al Comentario */}
                    <div className="flex justify-end pt-1 pl-9">
                      <button
                        onClick={() => handleToggleLikeComment(c.id)}
                        className={`flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer ${c.liked ? 'text-red-500' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${c.liked ? 'fill-red-500' : ''}`} />
                        <span>{c.likesCount || 0}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 5. FORMULARIO DE NUEVO COMENTARIO */}
            <form onSubmit={handleSendComment} className="p-3 border-t border-zentry-border bg-zentry-bg flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-purple-950/50 border border-purple-500/30 flex items-center justify-center text-[10px] font-black text-purple-300 shrink-0 overflow-hidden relative">
                {myAvatar ? (
                  <Image src={getImageUrl(myAvatar)} alt={user?.username || 'Usuario'} fill sizes="32px" className="object-cover" />
                ) : (
                  getInitials(user?.name || user?.username || 'Yo')
                )}
              </div>

              <input
                type="text"
                placeholder="Escribe tu comentario u opinión..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-zentry-card border border-zentry-border rounded-xl px-3.5 py-2.5 text-xs text-zentry-text-1 focus:outline-none focus:border-purple-500 transition-colors placeholder:text-zentry-text-2/60"
              />

              <button
                type="submit"
                disabled={isSubmitting || !commentText.trim()}
                className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer shrink-0 shadow-md"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        
      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN DE OBRA */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div 
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#18121a] border border-rose-500/40 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-base text-white">¿Eliminar publicación?</h4>
                <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                  &ldquo;{currentPost?.title || post.title}&rdquo; desaparecerá del Feed y de tu perfil junto con sus reacciones y comentarios. En tu Estudio quedará como borrador.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-zinc-300 bg-white/5 hover:bg-white/10 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isDeletingPost}
                  onClick={handleDeletePost}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isDeletingPost ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

</motion.div>
      </div>
    </AnimatePresence>
  )
}
