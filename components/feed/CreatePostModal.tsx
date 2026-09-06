"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { 
  Image as ImageIcon, Video, Music, FileText, X, Sparkles, 
  Upload, Send, Loader2
} from "lucide-react"
import { toast } from "sonner"
import { createPostAction } from "@/lib/actions/feed"
import { PostType } from "@/components/feed/FeedCard"
import Image from "next/image"

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: PostType) => void;
}

export default function CreatePostModal({ isOpen, onClose, onPostCreated }: CreatePostModalProps) {
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | 'text'>('image');
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("#Zentry #Creatividad");
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewData(reader.result as string);
        setMediaUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Por favor escribe un título para tu publicación");
      return;
    }

    setIsUploading(true);
    try {
      const tags = tagsInput
        .split(' ')
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .map(t => t.startsWith('#') ? t : `#${t}`);

      const res = await createPostAction({
        title: title.trim(),
        description: description.trim(),
        contentType: mediaType,
        mediaUrl: previewData || mediaUrl || undefined,
        tags: tags.length > 0 ? tags : ['#Zentry', '#Creatividad']
      });

      if (res.success && res.data) {
        onPostCreated(res.data);
        toast.success("🎉 ¡Tu obra ha sido publicada en el Feed!");
        setTitle("");
        setDescription("");
        setMediaUrl("");
        setPreviewData(null);
        onClose();
      } else {
        toast.error(res.error || "Error al publicar");
      }
    } catch (err) {
      toast.error("Error al publicar la obra");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Cabecera del Modal */}
        <div className="p-4 sm:p-5 border-b border-zentry-border flex justify-between items-center bg-zentry-bg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-zentry-accent" />
            <h3 className="text-base sm:text-lg font-black text-zentry-text-1">Crear Nueva Publicación</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-card rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handlePublish} className="p-5 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar">
          
          {/* Selector de Tipo de Contenido */}
          <div className="grid grid-cols-4 gap-2 p-1.5 bg-zentry-bg rounded-2xl border border-zentry-border text-xs font-bold">
            {[
              { id: 'image', label: 'Imagen', icon: ImageIcon },
              { id: 'video', label: 'Video', icon: Video },
              { id: 'audio', label: 'Música', icon: Music },
              { id: 'text', label: 'Texto', icon: FileText }
            ].map(tab => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setMediaType(tab.id as any);
                    setPreviewData(null);
                  }}
                  className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    mediaType === tab.id
                      ? 'bg-zentry-accent text-white shadow-md'
                      : 'text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-card'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Título */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-zentry-text-1">Título de la Obra</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Exploración Cyberpunk 3D / Nuevo Beat Lo-Fi" 
              className="w-full bg-zentry-bg border border-zentry-border rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-zentry-text-1 placeholder:text-zentry-text-2/60 focus:outline-none focus:border-zentry-accent transition-colors" 
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-zentry-text-1">Descripción / Historia creativa</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Comparte el proceso, software utilizado, inspiración o detalles de tu creación..." 
              rows={3}
              className="w-full bg-zentry-bg border border-zentry-border rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-zentry-text-1 placeholder:text-zentry-text-2/60 focus:outline-none focus:border-zentry-accent transition-colors resize-none" 
            />
          </div>

          {/* Carga de Archivo / URL Multimedia */}
          {mediaType !== 'text' && (
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-zentry-text-1 flex items-center justify-between">
                <span>Archivo {mediaType === 'image' ? 'de Imagen' : mediaType === 'video' ? 'de Video' : 'de Audio'}</span>
                <span className="text-[10px] text-zentry-text-2 font-normal">Subir archivo o pegar enlace</span>
              </label>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept={mediaType === 'image' ? 'image/*' : mediaType === 'video' ? 'video/*' : 'audio/*'} 
                className="hidden" 
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-zentry-bg hover:bg-zentry-card border border-zentry-border text-zentry-text-1 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-zentry-accent" /> Subir Archivo
                </button>

                <input 
                  type="url" 
                  value={mediaUrl}
                  onChange={(e) => {
                    setMediaUrl(e.target.value);
                    setPreviewData(e.target.value);
                  }}
                  placeholder="https://... (URL pública de imagen/video/audio)" 
                  className="flex-1 bg-zentry-bg border border-zentry-border rounded-2xl py-2.5 px-4 text-xs text-zentry-text-1 placeholder:text-zentry-text-2/60 focus:outline-none focus:border-zentry-accent transition-colors" 
                />
              </div>

              {/* Previsualización del medio */}
              {previewData && (
                <div className="p-3 bg-zentry-bg rounded-2xl border border-zentry-border flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {mediaType === 'image' && (
                      <Image src={previewData} alt="Preview" width={48} height={48} className="w-12 h-12 rounded-xl object-cover border border-zentry-border shrink-0" />
                    )}
                    {mediaType === 'video' && (
                      <video src={previewData} className="w-12 h-12 rounded-xl object-cover border border-zentry-border shrink-0" />
                    )}
                    {mediaType === 'audio' && (
                      <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                        <Music className="w-6 h-6" />
                      </div>
                    )}
                    <span className="text-xs text-zentry-text-1 font-bold truncate">Archivo listo para publicar</span>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => {
                      setPreviewData(null);
                      setMediaUrl("");
                    }} 
                    className="text-red-400 p-1 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-zentry-text-1">Etiquetas (Tags)</label>
            <input 
              type="text" 
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="#Arte3D #Musica #Ilustracion #VFX" 
              className="w-full bg-zentry-bg border border-zentry-border rounded-2xl py-2.5 px-4 text-xs text-zentry-text-1 placeholder:text-zentry-text-2/60 focus:outline-none focus:border-zentry-accent transition-colors" 
            />
          </div>

          {/* Botón de Publicar */}
          <div className="pt-3 border-t border-zentry-border flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-zentry-text-2 hover:text-zentry-text-1 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Publicando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Publicar en el Feed
                </>
              )}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
