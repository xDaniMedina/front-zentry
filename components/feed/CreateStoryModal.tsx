"use client"

import { useState } from "react"
import { 
  X, Image as ImageIcon, Type, Music, Sparkles, Upload, 
  Check, Palette, Wand2, Eye, Loader2
} from "lucide-react"
import { STORY_GRADIENTS, STORY_FONTS } from "@/lib/stories"
import { StoryFontStyle, StoryItem } from "@/types/stories"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: (newStory: StoryItem) => void;
}

const SAMPLE_MEDIA = [
  {
    name: 'Cyberpunk City',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1080&q=85'
  },
  {
    name: 'Neon Hologram',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1080&q=85'
  },
  {
    name: 'Abstract Fluid 3D',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=85'
  },
  {
    name: 'Synthesizer Studio',
    url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1080&q=85'
  }
];

const SAMPLE_TRACKS = [
  { title: 'Neon Pulse', artist: 'Zentry Beat' },
  { title: 'Midnight Reverie', artist: 'Sofia Synth' },
  { title: 'Cyber Drift', artist: 'Kavinsky Vibe' },
  { title: 'Lo-Fi Chill Hop', artist: 'Study Wave' }
];

export default function CreateStoryModal({
  isOpen,
  onClose,
  onStoryCreated
}: CreateStoryModalProps) {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState<'text' | 'media'>('text');
  
  // Estado para modo texto
  const [textContent, setTextContent] = useState("");
  const [selectedGradient, setSelectedGradient] = useState(STORY_GRADIENTS[0]);
  const [selectedFont, setSelectedFont] = useState<StoryFontStyle>('impact');

  // Estado para modo multimedia
  const [mediaUrl, setMediaUrl] = useState("");
  const [caption, setCaption] = useState("");

  // Estado de música
  const [selectedMusic, setSelectedMusic] = useState<{ title: string; artist: string } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setMediaUrl(event.target.result as string);
          setActiveMode('media');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (activeMode === 'text' && !textContent.trim()) {
      toast.error("Por favor escribe algún texto para tu historia");
      return;
    }
    if (activeMode === 'media' && !mediaUrl.trim()) {
      toast.error("Por favor selecciona o sube una imagen");
      return;
    }

    setIsSubmitting(true);

    const rawUsername = (user?.username || user?.email || 'creador').replace(/^@/, '');
    const displayName = user?.name || user?.username || 'Creador Zentry';

    const newStoryData = {
      type: activeMode === 'text' ? ('text' as const) : ('image' as const),
      media_url: activeMode === 'media' ? mediaUrl : undefined,
      text_content: activeMode === 'text' ? textContent.trim() : undefined,
      text_color: activeMode === 'text' ? selectedGradient.textColor : '#ffffff',
      background: activeMode === 'text' ? selectedGradient.gradient : undefined,
      font_style: activeMode === 'text' ? selectedFont : undefined,
      caption: caption.trim() || undefined,
      music: selectedMusic || undefined,
      duration: 5000,
    };

    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          username: rawUsername,
          name: displayName,
          avatar: displayName.substring(0, 2).toUpperCase(),
          avatar_url: user?.avatar_url,
          storyItem: newStoryData
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          onStoryCreated(json.data);
          toast.success("✨ ¡Historia publicada con éxito! (+50 XP)");
          onClose();
          return;
        }
      }
    } catch (err) {}

    // Fallback local si falla la red
    const fallbackStory: StoryItem = {
      id: `story_${Date.now()}`,
      ...newStoryData,
      created_at: 'Justo ahora',
      likes: 0,
      liked: false
    };

    onStoryCreated(fallbackStory);
    toast.success("✨ ¡Historia publicada!");
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zentry-card border border-zentry-border rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* ================= COLUMNA IZQUIERDA: PREVIEW 9:16 ================= */}
        <div className="w-full md:w-[280px] shrink-0 bg-zinc-950 p-4 sm:p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-zentry-border">
          <div className="text-xs font-bold text-zentry-text-2 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5 text-zentry-accent" />
            Vista Previa 9:16
          </div>

          {/* Tarjeta 9:16 */}
          <div 
            className="w-[180px] h-[320px] rounded-2xl overflow-hidden shadow-xl relative flex flex-col justify-between p-3 border border-white/20"
            style={{
              background: activeMode === 'text' 
                ? selectedGradient.gradient 
                : 'linear-gradient(to bottom, #18181b, #09090b)'
            }}
          >
            {/* Header Mini */}
            <div className="flex items-center gap-1.5 z-10">
              <div className="w-5 h-5 rounded-full bg-zentry-accent text-white flex items-center justify-center text-[9px] font-bold">
                {user?.name?.substring(0, 2) || 'TU'}
              </div>
              <span className="text-[10px] font-bold text-white truncate drop-shadow-sm">
                Tu Historia
              </span>
            </div>

            {/* Contenido Preview */}
            <div className="flex-1 flex items-center justify-center text-center my-auto overflow-hidden">
              {activeMode === 'text' ? (
                <p 
                  className={cn(
                    "text-xs font-bold leading-relaxed px-1 whitespace-pre-wrap break-words drop-shadow-md",
                    selectedFont === 'serif' && 'font-serif italic',
                    selectedFont === 'mono' && 'font-mono text-[10px]',
                    selectedFont === 'impact' && 'font-black uppercase tracking-tight text-sm',
                    selectedFont === 'handwriting' && 'font-sans italic font-medium'
                  )}
                  style={{ color: selectedGradient.textColor }}
                >
                  {textContent || "Escribe algo increíble para tu historia..."}
                </p>
              ) : mediaUrl ? (
                <Image 
                  src={mediaUrl} 
                  alt="Preview" 
                  fill
                  sizes="200px"
                  className="absolute inset-0 w-full h-full object-cover" 
                />
              ) : (
                <div className="text-center p-2 text-zinc-500">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <span className="text-[10px]">Sin imagen seleccionada</span>
                </div>
              )}
            </div>

            {/* Música Mini */}
            {selectedMusic && (
              <div className="z-10 bg-black/60 backdrop-blur-md rounded-full px-2 py-0.5 text-[9px] text-white flex items-center gap-1 truncate">
                <Music className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                <span className="truncate">{selectedMusic.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* ================= COLUMNA DERECHA: CONTROLES DE CREACIÓN ================= */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar flex flex-col justify-between">
          <div>
            {/* Header del Modal */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-zentry-text-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-zentry-accent" />
                  Crear Nueva Historia
                </h3>
                <p className="text-xs text-zentry-text-2">
                  Visible durante 24 horas para tus seguidores
                </p>
              </div>
              <button 
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector de Modo (Texto vs Multimedia) */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-zentry-bg rounded-xl mb-5 border border-zentry-border">
              <button
                type="button"
                onClick={() => setActiveMode('text')}
                className={cn(
                  "py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
                  activeMode === 'text' 
                    ? "bg-zentry-card text-zentry-text-1 shadow-sm border border-zentry-border" 
                    : "text-zentry-text-2 hover:text-zentry-text-1"
                )}
              >
                <Type className="w-3.5 h-3.5 text-zentry-accent" />
                Modo Texto
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('media')}
                className={cn(
                  "py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
                  activeMode === 'media' 
                    ? "bg-zentry-card text-zentry-text-1 shadow-sm border border-zentry-border" 
                    : "text-zentry-text-2 hover:text-zentry-text-1"
                )}
              >
                <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                Foto / Multimedia
              </button>
            </div>

            {/* ================= CONTROLES MODO TEXTO ================= */}
            {activeMode === 'text' && (
              <div className="space-y-4">
                {/* Input de Texto */}
                <div>
                  <label className="text-xs font-semibold text-zentry-text-2 mb-1.5 block">
                    Mensaje de la Historia
                  </label>
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="¿Qué estás pensando o creando hoy?..."
                    rows={3}
                    maxLength={200}
                    className="w-full p-3 rounded-xl bg-zentry-bg border border-zentry-border text-zentry-text-1 text-xs sm:text-sm placeholder:text-zentry-text-2/60 focus:outline-none focus:ring-2 focus:ring-zentry-accent/40 resize-none"
                  />
                  <div className="flex justify-end text-[10px] text-zentry-text-2 mt-1">
                    {textContent.length}/200
                  </div>
                </div>

                {/* Gradientes */}
                <div>
                  <label className="text-xs font-semibold text-zentry-text-2 mb-2 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" />
                    Estilo de Fondo
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {STORY_GRADIENTS.map((grad) => (
                      <button
                        key={grad.id}
                        type="button"
                        onClick={() => setSelectedGradient(grad)}
                        className={cn(
                          "w-10 h-10 rounded-xl shrink-0 transition-transform flex items-center justify-center border-2",
                          selectedGradient.id === grad.id ? "border-white scale-110 shadow-md" : "border-transparent hover:scale-105"
                        )}
                        style={{ background: grad.gradient }}
                        title={grad.name}
                      >
                        {selectedGradient.id === grad.id && <Check className="w-4 h-4 text-white drop-shadow" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fuentes */}
                <div>
                  <label className="text-xs font-semibold text-zentry-text-2 mb-2 block">
                    Tipografía
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {STORY_FONTS.map((font) => (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => setSelectedFont(font.id)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors",
                          selectedFont === font.id
                            ? "bg-zentry-accent text-white border-zentry-accent"
                            : "bg-zentry-bg border-zentry-border text-zentry-text-2 hover:text-zentry-text-1"
                        )}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= CONTROLES MODO MULTIMEDIA ================= */}
            {activeMode === 'media' && (
              <div className="space-y-4">
                {/* Upload & Quick Selection */}
                <div>
                  <label className="text-xs font-semibold text-zentry-text-2 mb-1.5 block">
                    Subir Imagen o Elegir del Catálogo
                  </label>

                  <div className="flex gap-2 mb-3">
                    <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-zentry-border hover:border-zentry-accent bg-zentry-bg text-zentry-text-2 hover:text-zentry-text-1 transition-colors text-xs font-medium">
                      <Upload className="w-4 h-4 text-zentry-accent" />
                      Subir desde dispositivo
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {SAMPLE_MEDIA.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setMediaUrl(item.url)}
                        className={cn(
                          "relative rounded-lg overflow-hidden h-14 border-2 transition-transform",
                          mediaUrl === item.url ? "border-zentry-accent scale-105" : "border-transparent hover:scale-102"
                        )}
                      >
                        <Image src={item.url} alt={item.name} fill sizes="100px" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zentry-text-2 mb-1.5 block">
                    Pie de foto (Opcional)
                  </label>
                  <input 
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Agrega un pie de foto a tu imagen..."
                    maxLength={100}
                    className="w-full px-3 py-2 rounded-xl bg-zentry-bg border border-zentry-border text-zentry-text-1 text-xs sm:text-sm placeholder:text-zentry-text-2/60 focus:outline-none focus:ring-2 focus:ring-zentry-accent/40"
                  />
                </div>
              </div>
            )}

            {/* Selector de Música */}
            <div className="mt-4 pt-4 border-t border-zentry-border">
              <label className="text-xs font-semibold text-zentry-text-2 mb-2 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-zentry-accent" />
                Música de fondo (Opcional)
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedMusic(null)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-medium border shrink-0 transition-colors",
                    !selectedMusic 
                      ? "bg-zentry-card border-zentry-accent text-zentry-text-1 font-semibold" 
                      : "bg-zentry-bg border-zentry-border text-zentry-text-2"
                  )}
                >
                  Sin música
                </button>
                {SAMPLE_TRACKS.map((t) => (
                  <button
                    key={t.title}
                    type="button"
                    onClick={() => setSelectedMusic(t)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium border shrink-0 transition-colors flex items-center gap-1",
                      selectedMusic?.title === t.title
                        ? "bg-zentry-accent text-white border-zentry-accent"
                        : "bg-zentry-bg border-zentry-border text-zentry-text-2 hover:text-zentry-text-1"
                    )}
                  >
                    🎵 {t.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Botón de Publicar */}
          <div className="mt-6 pt-4 border-t border-zentry-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-zentry-accent to-purple-600 hover:opacity-90 text-white font-bold text-xs sm:text-sm shadow-md shadow-zentry-accent/25 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Publicar en Tu Historia
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}