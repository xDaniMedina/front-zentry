"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, 
  Flag, Link as LinkIcon, Play, Pause, Volume2, VolumeX, 
  Maximize2, Sparkles, Music, Video, Image as ImageIcon,
  Check, Send, CornerDownRight, X
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { getImageUrl, getInitials } from "@/lib/utils"
import { FeedPost } from "@/app/api/posts/route"

export type PostType = FeedPost;

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
  currentUsername, 
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

  const handleAudioEnded = () => {
    setIsPlayingAudio(false);
    setAudioProgress(0);
    setAudioCurrentTime("0:00");
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

  // Doble click para dar like
  const handleDoubleClick = () => {
    if (!isLiked) {
      onLike(post.id);
    }
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 800);
  };

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Publicación eliminada de guardados" : "✨ Publicación guardada en tu colección");
    setIsMenuOpen(false);
  };

  return (
    <motion.div 
      layout 
      className={`break-inside-avoid bg-zentry-card border border-zentry-border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative group/card ${
        isListMode ? 'mb-6 max-w-2xl mx-auto w-full' : 'mb-6'
      }`}
    >
      {/* 1. Cabecera del Autor */}
      <div className="p-4 flex items-center justify-between relative bg-zentry-card/80 backdrop-blur-sm">
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

        {/* Menú de Opciones */}
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
                <div className="fixed inset-0 z-20" onClick={() => setIsMenuOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-11 w-48 bg-zentry-card border border-zentry-border rounded-2xl shadow-2xl z-30 py-1.5 text-xs overflow-hidden"
                >
                  <button 
                    onClick={handleToggleSave} 
                    className="w-full px-4 py-2.5 text-left text-zentry-text-1 hover:bg-zentry-bg flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'text-amber-400 fill-amber-400' : 'text-zentry-text-2'}`} /> 
                    {isSaved ? 'Guardado' : 'Guardar publicación'}
                  </button>
                  <button 
                    onClick={() => { onShare?.(post); setIsMenuOpen(false); }} 
                    className="w-full px-4 py-2.5 text-left text-zentry-text-1 hover:bg-zentry-bg flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <LinkIcon className="w-4 h-4 text-zentry-text-2" /> Copiar enlace
                  </button>
                  <div className="h-px bg-zentry-border my-1 w-full" />
                  <button 
                    onClick={() => {
                      toast.info("Reporte enviado al equipo de moderación.");
                      setIsMenuOpen(false);
                    }} 
                    className="w-full px-4 py-2.5 text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Flag className="w-4 h-4" /> Reportar
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. Contenido Multimedia Dinámico (Imagen, Video, Audio o Texto) */}
      <div 
        onDoubleClick={handleDoubleClick} 
        className="w-full relative overflow-hidden bg-black/40 select-none"
      >
        {/* Burst de Corazón en Doble Click */}
        <AnimatePresence>
          {showHeartBurst && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.3, opacity: 1 }}
              exit={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
            >
              <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* CASO A: IMAGEN */}
        {post.media_type === 'image' && post.media_url && (
          <div className="relative group/img cursor-pointer max-h-[550px] flex items-center justify-center bg-black/30 overflow-hidden">
            <img 
              src={post.media_url} 
              alt={post.title} 
              className="w-full h-auto max-h-[550px] object-cover hover:scale-102 transition-transform duration-500"
              onClick={() => setIsFullscreenImage(true)}
            />
            <button 
              onClick={() => setIsFullscreenImage(true)}
              className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-xl opacity-0 group-hover/img:opacity-100 transition-opacity"
              title="Ampliar imagen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* CASO B: VIDEO */}
        {post.media_type === 'video' && post.media_url && (
          <div className="relative group/vid bg-black aspect-video flex items-center justify-center overflow-hidden">
            <video 
              ref={videoRef}
              src={post.media_url} 
              poster={post.thumbnail_url}
              muted={isVideoMuted}
              loop
              playsInline
              className="w-full h-full object-cover"
              onClick={togglePlayVideo}
            />
            
            {/* Controles de Video */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover/vid:opacity-100 transition-opacity flex flex-col justify-between p-4 pointer-events-none">
              <div className="flex justify-end pointer-events-auto">
                <button 
                  onClick={() => setIsVideoMuted(!isVideoMuted)}
                  className="p-2 bg-black/60 text-white rounded-xl hover:bg-black transition-colors"
                >
                  {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-center pointer-events-auto">
                <button 
                  onClick={togglePlayVideo}
                  className="p-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full transition-transform active:scale-95 shadow-xl"
                >
                  {isPlayingVideo ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-white ml-1" />}
                </button>
              </div>

              <div className="text-[10px] text-zinc-300 font-mono pointer-events-auto flex items-center justify-between">
                <span>Reproduciendo video HD</span>
                <span>Zentry Player</span>
              </div>
            </div>
          </div>
        )}

        {/* CASO C: AUDIO / MÚSICA */}
        {post.media_type === 'audio' && (
          <div className="p-6 bg-gradient-to-br from-purple-950/80 via-[#131124] to-indigo-950/80 border-y border-purple-500/20 space-y-4">
            <audio 
              ref={audioRef} 
              src={post.media_url || post.audio_url} 
              onTimeUpdate={handleAudioTimeUpdate} 
              onEnded={handleAudioEnded}
            />

            <div className="flex items-center gap-4">
              {/* Carátula del Track */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-purple-900/40 border border-purple-500/40 overflow-hidden shadow-lg shrink-0 flex items-center justify-center">
                {post.thumbnail_url ? (
                  <img src={post.thumbnail_url} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <Music className="w-8 h-8 text-purple-300" />
                )}
                <div className={`absolute inset-0 bg-black/30 flex items-center justify-center ${isPlayingAudio ? 'animate-pulse' : ''}`}>
                  <button 
                    onClick={togglePlayAudio}
                    className="w-10 h-10 rounded-full bg-zentry-accent text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all"
                  >
                    {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5 fill-white" />}
                  </button>
                </div>
              </div>

              {/* Título del Track y Ondas */}
              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <h4 className="font-extrabold text-sm text-white truncate">{post.title}</h4>
                  <p className="text-xs text-purple-300 font-medium">Por {post.author}</p>
                </div>

                {/* Simulador de Onda de Audio */}
                <div className="flex items-center gap-1 h-6">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <span 
                      key={i} 
                      className={`flex-1 rounded-full transition-all duration-200 ${
                        (i / 28) * 100 <= audioProgress ? 'bg-zentry-accent' : 'bg-zinc-700'
                      }`}
                      style={{
                        height: isPlayingAudio ? `${Math.max(20, Math.sin(i + Date.now() / 200) * 100)}%` : `${(i % 5 + 1) * 15}%`
                      }}
                    />
                  ))}
                </div>

                {/* Barra de Progreso y Tiempo */}
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                  <span>{audioCurrentTime}</span>
                  <span className="text-purple-300 font-bold">{post.audio_duration || '3:30'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CASO D: TEXTO / ARTÍCULO */}
        {post.media_type === 'text' && (
          <div className="p-6 bg-gradient-to-br from-indigo-950/30 via-zentry-card to-purple-950/30 border-y border-zentry-border space-y-3">
            <h3 className="font-black text-base sm:text-lg text-zentry-text-1 leading-snug">
              {post.title}
            </h3>
            {post.description && (
              <p className="text-xs sm:text-sm text-zentry-text-2 leading-relaxed whitespace-pre-line font-medium">
                {post.description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 3. Título, Descripción y Tags de la Publicación */}
      <div className="p-4 sm:p-5 space-y-3">
        {post.media_type !== 'text' && (
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm sm:text-base text-zentry-text-1 leading-snug">
              {post.title}
            </h3>
            {post.description && (
              <p className="text-xs text-zentry-text-2 leading-relaxed">
                {post.description}
              </p>
            )}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map(tag => (
              <span 
                key={tag} 
                className="text-[10px] font-bold text-zentry-accent bg-zentry-accent/10 px-2 py-0.5 rounded-lg border border-zentry-accent/20 hover:bg-zentry-accent/20 transition-colors cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 4. Barra de Acciones e Interacciones (Facebook / Instagram style) */}
        <div className="flex items-center justify-between pt-2 border-t border-zentry-border/60">
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Botón Like */}
            <button 
              onClick={() => onLike(post.id)} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                isLiked 
                  ? 'bg-red-500/15 text-red-500 border border-red-500/30' 
                  : 'text-zentry-text-2 hover:text-red-500 hover:bg-zentry-bg'
              }`}
            >
              <motion.div whileTap={{ scale: 1.3 }}>
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </motion.div>
              <span>{post.likes}</span>
            </button>
            
            {/* Botón Comentarios */}
            <button 
              onClick={() => onComment?.(post)} 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-zentry-text-2 hover:text-blue-400 hover:bg-zentry-bg transition-colors active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments}</span>
            </button>

            {/* Botón Compartir */}
            <button 
              onClick={() => onShare?.(post)} 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-zentry-text-2 hover:text-emerald-400 hover:bg-zentry-bg transition-colors active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Compartir</span>
            </button>
          </div>

          {/* Botón Guardar Rápido */}
          <button 
            onClick={handleToggleSave} 
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isSaved ? 'text-amber-400 bg-amber-500/10' : 'text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg'
            }`}
            title={isSaved ? "Guardado" : "Guardar"}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* 5. Comentarios Destacados y Vista Previa */}
        {post.comments_list && post.comments_list.length > 0 && (
          <div className="space-y-1.5 pt-2">
            {post.comments_list.slice(0, 2).map((com) => (
              <div key={com.id} className="text-xs text-zentry-text-2 flex items-start gap-2 bg-zentry-bg/40 p-2 rounded-xl border border-zentry-border/40">
                <span className="font-bold text-zentry-text-1 shrink-0">{com.handle}:</span>
                <span className="flex-1">{com.text}</span>
              </div>
            ))}
            {post.comments_list.length > 2 && (
              <button 
                onClick={() => onComment?.(post)} 
                className="text-[11px] font-bold text-zentry-accent hover:underline block pt-0.5 cursor-pointer"
              >
                Ver todos los {post.comments} comentarios →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de Imagen a Pantalla Completa */}
      {isFullscreenImage && post.media_url && (
        <div 
          onClick={() => setIsFullscreenImage(false)}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md cursor-pointer"
        >
          <div className="relative max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl">
            <img src={post.media_url} alt={post.title} className="w-full h-auto max-h-[90vh] object-contain" />
            <button 
              onClick={() => setIsFullscreenImage(false)}
              className="absolute top-4 right-4 p-2.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </motion.div>
  );
}
