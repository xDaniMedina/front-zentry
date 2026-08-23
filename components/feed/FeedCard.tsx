"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, 
  Play, Pause, Volume2, VolumeX, Sparkles, Music, Maximize2,
  CheckCircle, Copy, Link as LinkIcon, Flag, Eye
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { getImageUrl, getInitials } from "@/lib/utils"

export type CommentItem = {
  id: string;
  author: string;
  handle: string;
  text: string;
  time: string;
};

export type PostType = {
  id: string | number;
  author: string;
  handle: string;
  avatar?: string;
  avatar_url?: string;
  discipline?: string;
  created_at: string;
  title: string;
  description?: string;
  media_type: 'image' | 'video' | 'audio' | 'text';
  media_url?: string;
  likes: number;
  comments: number;
  tags?: string[];
  comments_list?: CommentItem[];
  liked_by?: string[];
  saved_by?: string[];
};

interface FeedCardProps {
  post: PostType;
  currentUsername?: string;
  isLiked?: boolean;
  onLike: (postId: string | number) => void;
  onComment?: (post: PostType) => void;
  onShare?: (post: PostType) => void;
  isListMode?: boolean;
}

export function FeedCard({ 
  post, 
  currentUsername = 'creador', 
  isLiked = false, 
  onLike, 
  onComment, 
  onShare, 
  isListMode 
}: FeedCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);

  // Estados de Reproducción de Audio
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState("0:00");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Estados de Reproducción de Video
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const rawHandle = post.handle || '@creador';
  const cleanUsername = rawHandle.replace(/^@/, '');

  // Cargar estado de guardado
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedKey = `zentry_saved_posts_${currentUsername.toLowerCase()}`;
        const savedList = JSON.parse(localStorage.getItem(savedKey) || '[]');
        if (Array.isArray(savedList) && savedList.includes(String(post.id))) {
          setIsSaved(true);
        }
      } catch {}
    }
  }, [post.id, currentUsername]);

  // Manejo de Guardar en Perfil (TikTok / Instagram style)
  const handleToggleSave = () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    if (typeof window !== 'undefined') {
      try {
        const savedKey = `zentry_saved_posts_${currentUsername.toLowerCase()}`;
        let savedList: string[] = JSON.parse(localStorage.getItem(savedKey) || '[]');
        const pIdStr = String(post.id);

        if (nextSaved) {
          if (!savedList.includes(pIdStr)) savedList.push(pIdStr);
          toast.success("🔖 Publicación guardada en tu perfil");
        } else {
          savedList = savedList.filter(id => id !== pIdStr);
          toast.info("Publicación eliminada de guardados");
        }
        localStorage.setItem(savedKey, JSON.stringify(savedList));
      } catch {}
    }
  };

  // Manejo de Audio
  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingAudio(true);
      }).catch(err => {
        console.warn("Autoplay bloqueado:", err);
      });
    }
  };

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const duration = audioRef.current.duration || 1;
    setAudioProgress((current / duration) * 100);

    const mins = Math.floor(current / 60);
    const secs = Math.floor(current % 60);
    setAudioCurrentTime(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
  };

  // Manejo de Video
  const togglePlayVideo = () => {
    if (!videoRef.current) return;
    if (isPlayingVideo) {
      videoRef.current.pause();
      setIsPlayingVideo(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlayingVideo(true);
      }).catch(() => {});
    }
  };

  // Doble click para dar like estilo Instagram
  const handleDoubleClickImage = () => {
    if (!isLiked) {
      onLike(post.id);
    }
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 800);
  };

  // Copiar Enlace
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/feed?post=${post.id}`;
      navigator.clipboard.writeText(url);
      toast.success("🔗 Enlace copiado al portapapeles");
      setIsMenuOpen(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`break-inside-avoid bg-zentry-card border border-zentry-border rounded-3xl relative transition-all hover:border-zentry-border/80 shadow-md ${
        isListMode ? 'mb-6 max-w-2xl mx-auto w-full' : 'mb-6'
      }`}
    >
      {/* 1. Cabecera del Autor (Sin overflow-hidden para que el menú de 3 puntos no se corte) */}
      <div className="p-4 flex items-center justify-between relative bg-zentry-card rounded-t-3xl border-b border-zentry-border/40 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <Link 
            href={`/profile/${encodeURIComponent(cleanUsername)}`} 
            className="w-10 h-10 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-xs font-black text-purple-300 hover:border-zentry-accent hover:scale-105 transition-all shrink-0 overflow-hidden shadow-sm"
          >
            {post.avatar_url ? (
              <img src={getImageUrl(post.avatar_url)} alt={post.author} className="w-full h-full object-cover" />
            ) : (
              post.avatar || getInitials(post.author || cleanUsername)
            )}
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Link 
                href={`/profile/${encodeURIComponent(cleanUsername)}`} 
                className="text-xs sm:text-sm font-extrabold text-zentry-text-1 leading-tight hover:text-zentry-accent transition-colors truncate block"
              >
                {post.author}
              </Link>
              {post.discipline && (
                <span className="text-[9px] font-bold text-zentry-accent bg-zentry-accent/10 px-2 py-0.5 rounded-full border border-zentry-accent/20 shrink-0 hidden sm:inline-block">
                  {post.discipline}
                </span>
              )}
            </div>
            <p className="text-[11px] text-zentry-text-2 truncate">
              {post.handle} • <span className="font-mono text-[10px]">{post.created_at}</span>
            </p>
          </div>
        </div>

        {/* Menú de 3 Puntos con Dropdown Corregido (Z-Index alto y posicionado sobre todo) */}
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="text-zentry-text-2 hover:text-zentry-text-1 p-2 rounded-xl hover:bg-zentry-bg transition-colors cursor-pointer"
            title="Opciones de publicación"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          <AnimatePresence>
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  className="absolute right-0 top-10 w-52 bg-[#181826] border border-zinc-700/80 rounded-2xl shadow-2xl z-50 py-2 text-xs overflow-hidden backdrop-blur-xl"
                >
                  <button 
                    onClick={() => {
                      handleToggleSave();
                      setIsMenuOpen(false);
                    }} 
                    className="w-full px-4 py-2.5 text-left hover:bg-purple-950/40 text-zentry-text-1 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'text-amber-400 fill-amber-400' : 'text-zentry-text-2'}`} />
                    <span>{isSaved ? 'Quitar de guardados' : 'Guardar publicación'}</span>
                  </button>

                  <button 
                    onClick={handleCopyLink} 
                    className="w-full px-4 py-2.5 text-left hover:bg-purple-950/40 text-zentry-text-1 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-zentry-text-2" />
                    <span>Copiar enlace</span>
                  </button>

                  {post.media_url && (
                    <a
                      href={post.media_url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full px-4 py-2.5 text-left hover:bg-purple-950/40 text-zentry-text-1 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-zentry-text-2" />
                      <span>Ver original en HD</span>
                    </a>
                  )}

                  <div className="my-1 border-t border-zinc-800" />

                  <button 
                    onClick={() => {
                      toast.info("Publicación reportada para revisión del equipo de moderación.");
                      setIsMenuOpen(false);
                    }} 
                    className="w-full px-4 py-2 text-left hover:bg-red-500/20 text-red-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Flag className="w-4 h-4" />
                    <span>Reportar publicación</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. Área Multimedia (Imágenes, Videos, Audio o Texto) */}
      <div className="relative overflow-hidden bg-black/40">

        {/* 🖼️ IMAGEN */}
        {post.media_type === 'image' && post.media_url && (
          <div 
            className="relative w-full overflow-hidden cursor-pointer select-none group bg-zinc-950"
            onDoubleClick={handleDoubleClickImage}
          >
            <img 
              src={post.media_url} 
              alt={post.title} 
              className="w-full max-h-[500px] object-cover transition-transform duration-500 group-hover:scale-[1.01]"
              loading="lazy"
            />

            {/* Botón de Zoom Pantalla Completa */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreenImage(true);
              }}
              className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg cursor-pointer"
              title="Ver en pantalla completa"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Animación de Corazón al hacer Doble Click */}
            <AnimatePresence>
              {showHeartBurst && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.3, opacity: 1 }}
                  exit={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* 🎥 VIDEO */}
        {post.media_type === 'video' && post.media_url && (
          <div className="relative w-full bg-black aspect-video flex items-center justify-center group select-none">
            <video 
              ref={videoRef}
              src={post.media_url}
              loop
              muted={isVideoMuted}
              playsInline
              className="w-full h-full object-cover"
              onClick={togglePlayVideo}
            />

            {/* Controles de Video Flotantes */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2 rounded-2xl bg-black/60 backdrop-blur-md opacity-90 group-hover:opacity-100 transition-opacity text-white text-xs">
              <button 
                onClick={togglePlayVideo}
                className="p-1.5 rounded-xl hover:bg-white/20 transition-colors flex items-center gap-1.5 font-bold cursor-pointer"
              >
                {isPlayingVideo ? <Pause className="w-4 h-4 text-zentry-accent" /> : <Play className="w-4 h-4 text-emerald-400" />}
                <span>{isPlayingVideo ? "Pausar" : "Reproducir"}</span>
              </button>

              <button 
                onClick={() => setIsVideoMuted(!isVideoMuted)}
                className="p-1.5 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
                title={isVideoMuted ? "Activar sonido" : "Silenciar"}
              >
                {isVideoMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          </div>
        )}

        {/* 🎵 AUDIO / MÚSICA */}
        {post.media_type === 'audio' && (
          <div className="p-5 bg-gradient-to-br from-purple-950/60 via-indigo-950/40 to-zentry-card border-y border-purple-500/20 relative overflow-hidden">
            <audio 
              ref={audioRef}
              src={post.media_url || "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg"}
              onTimeUpdate={handleAudioTimeUpdate}
              onEnded={() => setIsPlayingAudio(false)}
            />

            <div className="flex items-center gap-4">
              {/* Botón de Play Circular con Ondas */}
              <button
                onClick={togglePlayAudio}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all cursor-pointer ${
                  isPlayingAudio 
                    ? 'bg-gradient-to-tr from-purple-600 to-pink-600 text-white scale-105 shadow-purple-500/40' 
                    : 'bg-zentry-text-1 text-zentry-bg hover:scale-105'
                }`}
              >
                {isPlayingAudio ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </button>

              {/* Información de la Pista */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 flex items-center gap-1">
                    <Music className="w-3 h-3" /> Master Audio
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-zentry-text-1 truncate mt-1">{post.title}</h4>
                <p className="text-xs text-zentry-text-2 truncate">{post.author}</p>
              </div>
            </div>

            {/* Barra de Progreso y Ecualizador Animado */}
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-zentry-text-2">
                <span>{audioCurrentTime}</span>
                <span>3:45</span>
              </div>

              <div className="w-full bg-zinc-800/60 h-2 rounded-full overflow-hidden relative cursor-pointer">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-150"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>

              {/* Visualizador de Ondas */}
              <div className="flex items-center justify-between gap-1 pt-1 h-6">
                {[12, 24, 18, 30, 15, 28, 20, 14, 32, 22, 16, 26, 19, 30, 12, 25, 18].map((height, i) => (
                  <div 
                    key={i}
                    className={`flex-1 rounded-full transition-all duration-300 ${
                      isPlayingAudio ? 'bg-purple-400 animate-pulse' : 'bg-zinc-700'
                    }`}
                    style={{ 
                      height: isPlayingAudio ? `${Math.max(6, (height * (i % 3 + 1)) % 24)}px` : '6px',
                      opacity: isPlayingAudio ? 0.9 : 0.4
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 3. Contenido de Texto, Título y Tags */}
      <div className="p-4 sm:p-5 space-y-3">
        <h3 className="text-sm sm:text-base font-extrabold text-zentry-text-1 leading-snug">
          {post.title}
        </h3>

        {post.description && (
          <p className="text-xs sm:text-sm text-zentry-text-2 leading-relaxed line-clamp-3">
            {post.description}
          </p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.tags.map((tag, i) => (
              <span 
                key={i} 
                className="text-[11px] font-bold text-zentry-accent bg-zentry-accent/10 px-2.5 py-0.5 rounded-xl border border-zentry-accent/20 hover:bg-zentry-accent/20 transition-colors cursor-pointer"
              >
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 4. Barra de Acciones e Interacciones */}
      <div className="px-4 py-3 border-t border-zentry-border/50 bg-zentry-card rounded-b-3xl flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-4">
          {/* Like */}
          <button 
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-90 ${
              isLiked 
                ? 'text-rose-500 bg-rose-500/10' 
                : 'text-zentry-text-2 hover:text-rose-400 hover:bg-zentry-bg'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{post.likes}</span>
          </button>

          {/* Comentarios */}
          <button 
            onClick={() => onComment?.(post)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{post.comments}</span>
          </button>

          {/* Compartir */}
          <button 
            onClick={() => {
              if (onShare) onShare(post);
              else handleCopyLink();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Compartir</span>
          </button>
        </div>

        {/* Guardar Post */}
        <button 
          onClick={handleToggleSave}
          className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-90 ${
            isSaved 
              ? 'text-amber-400 bg-amber-500/10' 
              : 'text-zentry-text-2 hover:text-amber-400 hover:bg-zentry-bg'
          }`}
          title={isSaved ? "Guardado en tu perfil" : "Guardar en tu perfil"}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Modal de Imagen a Pantalla Completa */}
      <AnimatePresence>
        {isFullscreenImage && post.media_url && (
          <div 
            className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setIsFullscreenImage(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
            >
              <img 
                src={post.media_url} 
                alt={post.title} 
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              />
              <div className="mt-3 text-center text-white">
                <h4 className="font-extrabold text-sm">{post.title}</h4>
                <p className="text-xs text-zinc-400">Por {post.author} ({post.handle})</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}
