"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, Pause, Play, Heart, Send, 
  ChevronLeft, ChevronRight, Music, Share2,
  MoreHorizontal, Trash2
} from "lucide-react"
import { getInitials, getImageUrl, cn } from "@/lib/utils"
import { UserStoryGroup, StoryItem } from "@/types/stories"
import { toast } from "sonner"
import Image from "next/image"

interface StoryViewerProps {
  storyGroups: UserStoryGroup[];
  initialGroupIndex: number;
  initialItemIndex?: number;
  currentUserId?: string | number;
  onClose: () => void;
  onStoryGroupViewed?: (groupId: string | number) => void;
  onLikeStory?: (storyId: string, groupId: string | number) => void;
  onSendReply?: (groupId: string | number, storyId: string, message: string) => void;
  onDeleteStory?: (storyId: string, groupId: string | number) => void;
}

const QUICK_REACTIONS = ["🔥", "❤️", "😂", "😮", "😢", "👏", "🎉"];

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

export default function StoryViewer({
  storyGroups,
  initialGroupIndex,
  initialItemIndex = 0,
  currentUserId,
  onClose,
  onStoryGroupViewed,
  onLikeStory,
  onSendReply,
  onDeleteStory
}: StoryViewerProps) {
  const [currentGroupIdx, setCurrentGroupIdx] = useState(initialGroupIndex);
  const [currentItemIdx, setCurrentItemIdx] = useState(initialItemIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState("");
  const [particles, setParticles] = useState<Particle[]>([]);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const currentGroup = storyGroups[currentGroupIdx] || storyGroups[0];
  const items = currentGroup?.items || [];
  const currentStory: StoryItem | undefined = items[currentItemIdx];

  const duration = currentStory?.duration || 5000;

  // Marcar historia actual como vista
  useEffect(() => {
    if (currentGroup && onStoryGroupViewed) {
      onStoryGroupViewed(currentGroup.id);
    }
  }, [currentGroup, onStoryGroupViewed]);

  // Manejador para avanzar a la siguiente historia
  const nextStory = useCallback(() => {
    if (currentItemIdx < items.length - 1) {
      setCurrentItemIdx(prev => prev + 1);
      setProgress(0);
    } else if (currentGroupIdx < storyGroups.length - 1) {
      setCurrentGroupIdx(prev => prev + 1);
      setCurrentItemIdx(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentItemIdx, items.length, currentGroupIdx, storyGroups.length, onClose]);

  // Manejador para retroceder a la historia previa
  const prevStory = useCallback(() => {
    if (currentItemIdx > 0) {
      setCurrentItemIdx(prev => prev - 1);
      setProgress(0);
    } else if (currentGroupIdx > 0) {
      const prevGroup = storyGroups[currentGroupIdx - 1];
      setCurrentGroupIdx(prev => prev - 1);
      setCurrentItemIdx(prevGroup ? Math.max(0, prevGroup.items.length - 1) : 0);
      setProgress(0);
    } else {
      setProgress(0);
    }
  }, [currentItemIdx, currentGroupIdx, storyGroups]);

  // Control del temporizador de progreso (Pausado si isPaused o isHolding)
  useEffect(() => {
    if (isPaused || isHolding || !currentStory) return;

    const intervalTime = 50; // ms
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPaused, isHolding, currentStory, duration, nextStory]);

  // Manejo de eventos de teclado (Escape, Flechas, Espacio)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        nextStory();
      } else if (e.key === "ArrowLeft") {
        prevStory();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, nextStory, prevStory]);

  // Explosión de partículas de reacción estilo Instagram
  const triggerReaction = (emoji: string) => {
    const newParticles: Particle[] = Array.from({ length: 7 }).map((_, i) => ({
      id: Date.now() + i,
      emoji,
      x: (Math.random() - 0.5) * 180,
      y: -Math.random() * 220 - 90
    }));

    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 1200);

    toast(`Reaccionaste con ${emoji}`, {
      duration: 1500,
      icon: emoji
    });

    if (onSendReply && currentStory) {
      onSendReply(currentGroup.id, currentStory.id, emoji);
    }
  };

  // Like a la historia
  const handleLike = () => {
    if (!currentStory) return;
    const isCurrentlyLiked = likedMap[currentStory.id] ?? currentStory.liked ?? false;
    const nextLiked = !isCurrentlyLiked;
    
    setLikedMap(prev => ({ ...prev, [currentStory.id]: nextLiked }));
    if (nextLiked) {
      triggerReaction("❤️");
    }
    if (onLikeStory) {
      onLikeStory(currentStory.id, currentGroup.id);
    }
  };

  // Enviar mensaje de respuesta
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentStory) return;

    if (onSendReply) {
      onSendReply(currentGroup.id, currentStory.id, replyText.trim());
    }

    toast.success(`Mensaje enviado a @${currentGroup.username}`);
    setReplyText("");
    setIsPaused(false);
  };

  // Compartir historia
  const handleShare = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/feed?story=${currentGroup.username}`;
      navigator.clipboard.writeText(url);
      toast.success("🔗 Enlace a la historia copiado");
    }
  };

  // Eliminar historia
  const handleDelete = () => {
    if (!currentStory) return;
    if (onDeleteStory) {
      onDeleteStory(currentStory.id, currentGroup.id);
    }
    toast.success("Historia eliminada");
    setShowOptionsMenu(false);
    nextStory();
  };

  if (!currentGroup || !currentStory) return null;

  const isCurrentStoryLiked = likedMap[currentStory.id] ?? currentStory.liked ?? false;
  const isOwner = currentGroup.isUser || (currentUserId && String(currentGroup.id) === String(currentUserId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl select-none animate-in fade-in duration-200">
      {/* Botón de cierre en esquina superior derecha */}
      <button 
        onClick={onClose}
        aria-label="Cerrar historias"
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all hover:scale-110 active:scale-95"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Flecha grupo anterior (Desktop) */}
      {currentGroupIdx > 0 && (
        <button 
          onClick={() => {
            setCurrentGroupIdx(prev => prev - 1);
            setCurrentItemIdx(0);
            setProgress(0);
          }}
          aria-label="Creador anterior"
          className="hidden md:flex absolute left-6 lg:left-12 top-1/2 -translate-y-1/2 z-40 p-3.5 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all hover:scale-110 shadow-xl"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Flecha grupo siguiente (Desktop) */}
      {currentGroupIdx < storyGroups.length - 1 && (
        <button 
          onClick={() => {
            setCurrentGroupIdx(prev => prev + 1);
            setCurrentItemIdx(0);
            setProgress(0);
          }}
          aria-label="Creador siguiente"
          className="hidden md:flex absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 z-40 p-3.5 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all hover:scale-110 shadow-xl"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Tarjeta Principal de la Historia (Proporción 9:16 estilo Instagram) */}
      <div 
        className="relative w-full max-w-[420px] h-[92vh] max-h-[840px] rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-950 shadow-2xl shadow-black/90 flex flex-col justify-between border border-white/15"
        onMouseDown={() => setIsHolding(true)}
        onMouseUp={() => setIsHolding(false)}
        onTouchStart={() => setIsHolding(true)}
        onTouchEnd={() => setIsHolding(false)}
      >
        {/* ================= HEADER (Se oculta suavemente al mantener presionado) ================= */}
        <div className={cn(
          "absolute top-0 inset-x-0 z-30 p-3.5 sm:p-4 bg-gradient-to-b from-black/85 via-black/45 to-transparent space-y-2.5 transition-opacity duration-200",
          isHolding ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
          {/* Barras de Progreso Segmentadas */}
          <div className="flex items-center gap-1.5 w-full">
            {items.map((item, idx) => {
              let fillWidth = 0;
              if (idx < currentItemIdx) fillWidth = 100;
              else if (idx === currentItemIdx) fillWidth = progress;

              return (
                <div 
                  key={item.id || idx} 
                  className="h-1 sm:h-1.5 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm"
                >
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-75 ease-linear"
                    style={{ width: `${fillWidth}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Información del Creador y Acciones */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-9 h-9 rounded-full ring-2 ring-gradient-to-tr from-amber-400 to-purple-600 p-0.5 shrink-0 overflow-hidden bg-zinc-900 shadow-md">
                {currentGroup.avatar_url ? (
                  <Image 
                    src={getImageUrl(currentGroup.avatar_url)} 
                    alt={currentGroup.name || "avatar"} 
                    fill sizes="40px"
                    className="object-cover rounded-full" 
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-zentry-card flex items-center justify-center text-xs font-black text-white">
                    {currentGroup.avatar || getInitials(currentGroup.name || currentGroup.username)}
                  </div>
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white truncate drop-shadow-sm">
                    {currentGroup.name || currentGroup.username}
                  </span>
                  <span className="text-xs text-white/70 font-medium shrink-0">
                    • {currentStory.created_at || "Reciente"}
                  </span>
                </div>

                {/* Música / Tag */}
                {currentStory.music && (
                  <div className="flex items-center gap-1 text-[11px] text-white/85 truncate">
                    <Music className="w-3 h-3 text-cyan-400 animate-pulse shrink-0" />
                    <span className="truncate">{currentStory.music.title} — {currentStory.music.artist}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Controles: Pausa, Silenciar y Menú */}
            <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => setIsPaused(prev => !prev)}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/90 hover:text-white transition-colors"
                title={isPaused ? "Reanudar" : "Pausar"}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>

              <button 
                onClick={handleShare}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/90 hover:text-white transition-colors"
                title="Compartir historia"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {isOwner && (
                <div className="relative">
                  <button 
                    onClick={() => setShowOptionsMenu(prev => !prev)}
                    className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/90 hover:text-white transition-colors"
                    title="Opciones de historia"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {showOptionsMenu && (
                    <div className="absolute right-0 top-8 w-44 rounded-xl bg-zinc-900/95 border border-white/15 backdrop-blur-xl shadow-2xl py-1.5 z-50 text-xs text-white">
                      <button 
                        onClick={handleDelete}
                        className="w-full px-3 py-2 text-left hover:bg-red-500/20 text-red-400 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar historia
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= CONTENIDO DE LA HISTORIA ================= */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
          {/* Zonas de Toque para Navegación (Izquierda 35%, Derecha 65%) */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              prevStory();
            }} 
            className="absolute left-0 top-16 bottom-20 w-[35%] z-20 cursor-pointer"
            title="Historia anterior"
          />
          <div 
            onClick={(e) => {
              e.stopPropagation();
              nextStory();
            }} 
            className="absolute right-0 top-16 bottom-20 w-[65%] z-20 cursor-pointer"
            title="Historia siguiente"
          />

          {/* Render según tipo de contenido */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentStory.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              {currentStory.type === 'image' && currentStory.media_url && (
                <Image 
                  src={getImageUrl(currentStory.media_url)} 
                  alt={currentStory.caption || "Historia"} 
                  fill sizes="100vw"
                  className="object-cover select-none pointer-events-none" 
                />
              )}

              {currentStory.type === 'video' && currentStory.media_url && (
                <video 
                  src={currentStory.media_url} 
                  autoPlay 
                  playsInline 
                  muted={isMuted}
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
              )}

              {currentStory.type === 'text' && (
                <div 
                  className="w-full h-full flex items-center justify-center p-8 text-center"
                  style={{ background: currentStory.background || 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #4c1d95 100%)' }}
                >
                  <div className="max-w-xs space-y-4">
                    <p 
                      className={cn(
                        "text-xl sm:text-2xl font-bold leading-relaxed whitespace-pre-wrap drop-shadow-md",
                        currentStory.font_style === 'serif' && 'font-serif italic',
                        currentStory.font_style === 'mono' && 'font-mono tracking-wide uppercase',
                        currentStory.font_style === 'impact' && 'font-black tracking-tight uppercase text-2xl sm:text-3xl',
                        currentStory.font_style === 'handwriting' && 'font-sans italic font-medium'
                      )}
                      style={{ color: currentStory.text_color || '#ffffff' }}
                    >
                      {currentStory.text_content}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Caption opcional (si tiene imagen o video) */}
          {currentStory.caption && currentStory.type !== 'text' && (
            <div className={cn(
              "absolute bottom-24 inset-x-4 z-25 p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs sm:text-sm font-medium shadow-lg transition-opacity duration-200",
              isHolding ? "opacity-0" : "opacity-100"
            )}>
              {currentStory.caption}
            </div>
          )}

          {/* Partículas de Reacciones Flotantes */}
          <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
            {particles.map(particle => (
              <motion.div
                key={particle.id}
                initial={{ opacity: 1, scale: 0.5, x: 0, y: 150 }}
                animate={{ 
                  opacity: 0, 
                  scale: 2.2, 
                  x: particle.x, 
                  y: particle.y 
                }}
                transition={{ duration: 1.1, ease: "easeOut" }}
                className="absolute text-4xl select-none"
              >
                {particle.emoji}
              </motion.div>
            ))}
          </div>
        </div>

        {/* ================= FOOTER (Interacción estilo Instagram) ================= */}
        <div 
          className={cn(
            "relative z-30 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/55 to-transparent space-y-2.5 transition-opacity duration-200",
            isHolding ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
          onClick={e => e.stopPropagation()}
        >
          {/* Barra de Reacciones Rápidas */}
          <div className="flex items-center justify-around py-1">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => triggerReaction(emoji)}
                className="text-2xl hover:scale-135 active:scale-95 transition-transform p-1 select-none"
                title={`Reaccionar con ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Formulario de Respuesta y Botón Like */}
          <form onSubmit={handleSendReply} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input 
                type="text"
                value={replyText}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Enviar mensaje a @${currentGroup.username}...`}
                className="w-full h-10 px-4 pr-10 rounded-full bg-white/15 border border-white/20 text-white placeholder:text-white/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white/40 backdrop-blur-md"
              />
              {replyText.trim() && (
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-zentry-accent text-white hover:scale-110 active:scale-90 transition-transform"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Botón de Like interactivo */}
            <button 
              type="button"
              onClick={handleLike}
              className={cn(
                "p-2.5 rounded-full border transition-all active:scale-75 shrink-0",
                isCurrentStoryLiked 
                  ? "bg-rose-500/20 border-rose-500 text-rose-500 scale-110" 
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105"
              )}
              title="Me gusta"
            >
              <Heart className={cn("w-5 h-5", isCurrentStoryLiked && "fill-rose-500 animate-pulse")} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}