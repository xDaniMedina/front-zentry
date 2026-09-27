"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Image as ImageIcon, Video, Music, FileText, X, Sparkles, 
  Upload, Send, Loader2, Film
} from "lucide-react"
import { toast } from "sonner"
import { createPostAction, createPostWithMediaAction } from "@/lib/actions/feed"
import PublishCelebration from "@/components/shared/PublishCelebration"
import { PostType } from "@/components/feed/FeedCard"

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
  // El archivo se envía tal cual (multipart); la vista previa usa una URL local del navegador
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSizeText, setFileSizeText] = useState<string | null>(null);

  const [publishedPost, setPublishedPost] = useState<PostType | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Liberar la URL local de la vista previa al cambiarla o cerrar
  useEffect(() => {
    return () => {
      if (previewData?.startsWith('blob:')) URL.revokeObjectURL(previewData);
    };
  }, [previewData]);

  const clearMedia = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setMediaUrl("");
    setFileName(null);
    setFileSizeText(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxMb = 150;
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`El archivo supera el límite de ${maxMb}MB. Selecciona uno más liviano.`);
      return;
    }

    const expected = mediaType === 'image' ? 'image/' : mediaType === 'video' ? 'video/' : 'audio/';
    if (file.type && !file.type.startsWith(expected)) {
      toast.error(`Ese archivo no es de tipo ${mediaType === 'image' ? 'imagen' : mediaType === 'video' ? 'video' : 'audio'}.`);
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    setFileSizeText(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    setMediaUrl("");
    setPreviewData(URL.createObjectURL(file));
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Por favor escribe un título para tu publicación");
      return;
    }
    if (mediaType !== 'text' && !selectedFile && !mediaUrl.trim()) {
      toast.error("Sube un archivo o pega una URL para esta obra");
      return;
    }

    setIsUploading(true);
    try {
      const tags = tagsInput
        .split(' ')
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .map(t => t.startsWith('#') ? t : `#${t}`);
      const finalTags = tags.length > 0 ? tags : ['#Zentry', '#Creatividad'];

      let res;
      if (selectedFile && mediaType !== 'text') {
        const formData = new FormData();
        formData.set('title', title.trim());
        formData.set('contenido', description.trim());
        formData.set('contentType', mediaType);
        formData.set('tools', finalTags.join(','));
        formData.set('image', selectedFile, selectedFile.name);
        res = await createPostWithMediaAction(formData);
      } else {
        res = await createPostAction({
          title: title.trim(),
          description: description.trim(),
          contentType: mediaType,
          mediaUrl: mediaType !== 'text' ? mediaUrl.trim() || undefined : undefined,
          tags: finalTags
        });
      }

      if (res.success && res.data) {
        setPublishedPost(res.data);
        onPostCreated(res.data);
        setTitle("");
        setDescription("");
        clearMedia();
      } else {
        toast.error(res.error || "Error al publicar");
      }
    } catch {
      toast.error("Error al publicar la obra. Verifica el tamaño del archivo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFinishCelebration = () => {
    setPublishedPost(null);
    onClose();
  };

  if (!isOpen && !publishedPost) return null;

  return (
    <>
    <PublishCelebration
      open={Boolean(publishedPost)}
      title={publishedPost?.title}
      mediaType={publishedPost?.media_type}
      mediaUrl={publishedPost?.media_url}
      onClose={handleFinishCelebration}
    />
    {isOpen && !publishedPost && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <AnimatePresence>
          <motion.div 
            key="modal-form"
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
                        setMediaType(tab.id as 'image' | 'video' | 'audio' | 'text');
                        clearMedia();
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
                  <div className="flex items-center justify-between text-xs font-extrabold text-zentry-text-1">
                    <span>
                      Archivo {mediaType === 'image' ? 'de Imagen (JPG, PNG, WebP)' : mediaType === 'video' ? 'de Video (MP4, WebM, MOV, MKV)' : 'de Audio (MP3, WAV)'}
                    </span>
                    <span className="text-[10px] text-zentry-text-2 font-normal">Máx 150MB</span>
                  </div>

                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept={
                      mediaType === 'image' 
                        ? 'image/*' 
                        : mediaType === 'video' 
                          ? 'video/mp4,video/webm,video/quicktime,video/x-matroska,video/*' 
                          : 'audio/*'
                    } 
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
                        setSelectedFile(null);
                        setFileName(null);
                        setFileSizeText(null);
                        setMediaUrl(e.target.value);
                        setPreviewData(e.target.value || null);
                      }}
                      placeholder="https://... (URL pública de imagen/video/audio)" 
                      className="flex-1 bg-zentry-bg border border-zentry-border rounded-2xl py-2.5 px-4 text-xs text-zentry-text-1 placeholder:text-zentry-text-2/60 focus:outline-none focus:border-zentry-accent transition-colors" 
                    />
                  </div>

                  {/* Previsualización del medio interactivo */}
                  {previewData && (
                    <div className="p-3 bg-zentry-bg rounded-2xl border border-zentry-border space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Film className="w-4 h-4 text-zentry-accent shrink-0" />
                          <span className="text-xs text-zentry-text-1 font-bold truncate">
                            {fileName || 'Archivo multimedia cargado'}
                          </span>
                          {fileSizeText && (
                            <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                              ({fileSizeText})
                            </span>
                          )}
                        </div>

                        <button 
                          type="button" 
                          onClick={clearMedia}
                          className="text-red-400 p-1 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Reproductor interactivo de previsualización */}
                      {mediaType === 'image' && (
                        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-zentry-border/50 bg-black/40">
                          {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:) */}
                          <img src={previewData} alt="Vista previa" className="w-full h-full object-contain" />
                        </div>
                      )}

                      {mediaType === 'video' && (
                        <div className="w-full rounded-xl overflow-hidden border border-zentry-border/50 bg-black">
                          <video 
                            src={previewData} 
                            controls 
                            playsInline 
                            className="w-full max-h-56 object-contain" 
                          />
                        </div>
                      )}

                      {mediaType === 'audio' && (
                        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-purple-300 text-xs font-bold">
                            <Music className="w-4 h-4" /> Audio listo para reproducción
                          </div>
                          <audio src={previewData} controls className="w-full h-8" />
                        </div>
                      )}
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
                      <Loader2 className="w-4 h-4 animate-spin" /> {selectedFile && mediaType === 'video' ? 'Subiendo video...' : 'Publicando...'}
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
      </AnimatePresence>
    </div>
    )}
    </>
  );
}
