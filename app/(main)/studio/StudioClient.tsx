"use client"

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants, AnimatePresence } from "framer-motion";
import {
  Wand2, Plus, FileEdit, FolderOpen, Image as ImageIcon,
  MoreVertical, Video, Music, Coins, X, UploadCloud, CheckCircle2,
  FileText, Search, Trash2, Loader2, Sparkles, Grid
} from "lucide-react";
import { toast } from "sonner";
import { StudioProject } from "@/types";
import { getImageUrl } from "@/lib/utils";
import { saveStudioProjectAction, deleteStudioProjectAction } from "@/lib/actions/studio";

export type ContentType = 'canvas' | 'document' | 'image' | 'video' | 'audio';

const containerVariants: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const itemVariants: Variants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } }

export default function StudioClient({ initialFiles }: { initialFiles: StudioProject[] | null }) {
  const [files, setFiles] = useState<StudioProject[]>(() => initialFiles || []);
  const router = useRouter();

  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selectedType, setSelectedType] = useState<ContentType>('canvas');

  const [isDragging, setIsDragging] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contentOptions = [
    { id: 'canvas', label: 'Lienzo Digital & Pixel Art', icon: Grid, reward: 50, desc: 'Pintura, Pixel Art, Dibujo y capas' },
    { id: 'document', label: 'Documento de Texto', icon: FileText, reward: 40, desc: 'Articulos, Guiones de Video y Notas de diseño' },
    { id: 'image', label: 'Editor de Imagen & Recorte', icon: ImageIcon, reward: 20, desc: 'Filtros, Recorte libre/aspect ratio y ajustes' },
    { id: 'video', label: 'Editor de Video & Recorte', icon: Video, reward: 100, desc: 'Línea de tiempo, Corte de clips, Shorts y formatos' },
    { id: 'audio', label: 'Pista de Audio & DAW', icon: Music, reward: 80, desc: 'Edición de Audio, Ecualizador y Mezcla' },
  ];

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (selectedType === 'canvas' || selectedType === 'document') {
      finalizeCreation();
    } else {
      setStep(2);
    }
  };

  const finalizeCreation = async () => {
    const titleVal = newTitle.trim();
    const typeVal = selectedType;
    const descVal = newDesc.trim();
    const rewardValue = contentOptions.find(c => c.id === selectedType)?.reward || 50;

    resetModal();
    setIsSubmitting(true);

    try {
      const res = await saveStudioProjectAction({
        title: titleVal,
        type: typeVal,
        content: descVal,
        metadata: { reward: rewardValue }
      });

      if (res.success && res.data?.id) {
        const createdId = String(res.data.id);
        const createdProject: StudioProject = {
          id: createdId,
          title: res.data.title || titleVal,
          type: res.data.contentType || res.data.content_type || typeVal,
          lastEdited: 'Justo ahora',
          reward: rewardValue,
          content: res.data.contenido || res.data.content || descVal
        };

        setFiles(prev => [createdProject, ...prev.filter(p => p.id !== createdId)]);
        toast.success(`Â¡Proyecto "${titleVal}" creado con Ã©xito!`);
        router.push(`/studio/${createdId}?type=${typeVal}&title=${encodeURIComponent(titleVal)}`);
      } else {
        const tempId = `temp-${Date.now()}`;
        router.push(`/studio/${tempId}?type=${typeVal}&title=${encodeURIComponent(titleVal)}`);
      }
    } catch (error) {
      console.warn("CreaciÃ³n fallback:", error);
      const tempId = `temp-${Date.now()}`;
      router.push(`/studio/${tempId}?type=${typeVal}&title=${encodeURIComponent(titleVal)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setStep(1);
    setNewTitle("");
    setNewDesc("");
    setUploadFile(null);
  };

  const handleDeleteFile = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles(prev => prev.filter(f => f.id !== id));
    toast.success(`"${title}" eliminado del estudio`);

    startTransition(async () => {
      await deleteStudioProjectAction(id);
    });
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFile(e.dataTransfer.files[0]);
    }
  };
  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const getIconForType = (type: ContentType) => {
    switch (type) {
      case 'canvas': return Grid;
      case 'document': return FileText;
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'audio': return Music;
    }
  };

  const filteredFiles = files.filter(f => {
    const matchesFilter = filterType === 'all' || f.type === filterType;
    const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="w-full space-y-8 pb-20 mt-2 sm:mt-4">

      {/* Banner Principal del Estudio */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-purple-950/40 via-zentry-card to-blue-950/40 border border-zentry-border overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_var(--tw-gradient-stops))] from-zentry-accent/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-mono font-black tracking-wider text-zentry-accent uppercase bg-zentry-accent/10 px-3 py-1 rounded-full border border-zentry-accent/30 flex items-center gap-1.5 w-fit">
              <Sparkles className="w-3.5 h-3.5" /> Suite Creativa Zentry
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-zentry-text-1 tracking-tight">
              Crea, DiseÃƒÂ±a y Produce
            </h1>
            <p className="text-sm text-zentry-text-2 leading-relaxed font-medium">
              Herramientas de ediciÃƒÂ³n multimodal: Lienzo Digital & Pixel Art con cuadrÃƒÂ­cula, Editor de ImÃƒÂ¡genes con recorte y filtros, Documentos redactables y Suite de Video/Audio con lÃƒÂ­nea de tiempo y divisiÃƒÂ³n de clips.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3.5 bg-zentry-text-1 text-zentry-bg rounded-2xl font-black text-sm hover:opacity-90 transition-all shadow-xl flex items-center justify-center gap-2 shrink-0 group hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Nuevo Proyecto
          </button>
        </div>
      </div>

      {/* Barra de Filtros y BÃƒÂºsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">

        {/* Chips de CategorÃƒÂ­as */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 custom-scrollbar">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'canvas', label: 'Lienzo / Pixel Art' },
            { id: 'document', label: 'Documentos' },
            { id: 'image', label: 'ImÃƒÂ¡genes / Fotos' },
            { id: 'video', label: 'Videos' },
            { id: 'audio', label: 'Audios' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${filterType === tab.id
                ? 'bg-zentry-accent text-white shadow-lg shadow-zentry-accent/25 border border-zentry-accent'
                : 'bg-zentry-card border border-zentry-border text-zentry-text-2 hover:text-zentry-text-1 hover:border-zentry-border/80'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* BÃƒÂºsqueda */}
        <div className="relative w-full sm:w-80 shrink-0">
          <Search className="w-4 h-4 text-zentry-text-2 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar proyectos por nombre..."
            className="w-full bg-zentry-card border border-zentry-border rounded-2xl pl-10 pr-4 py-2.5 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors shadow-sm"
          />
        </div>

      </div>

      {/* Grid de Archivos del Estudio */}
      {filteredFiles.length === 0 ? (
        <div className="bg-zentry-card border border-zentry-border rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <FolderOpen className="w-12 h-12 text-zentry-text-2 mx-auto opacity-40" />
          <h3 className="text-lg font-black text-zentry-text-1">No tienes proyectos creados aÃƒÂºn</h3>
          <p className="text-xs text-zentry-text-2 max-w-sm mx-auto">
            Comienza creando tu primera ilustraciÃƒÂ³n, documento, ediciÃƒÂ³n de foto o pista multimedia.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-zentry-accent text-white rounded-2xl text-xs font-black hover:opacity-90 transition-opacity shadow-md"
          >
            + Crear Primer Proyecto
          </button>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
        >
          {filteredFiles.map((file) => {
            const Icon = getIconForType(file.type as ContentType);
            return (
              <motion.div
                key={file.id}
                variants={itemVariants}
                onClick={() => router.push(`/studio/${file.id}?type=${file.type}`)}
                className="group bg-zentry-card border border-zentry-border rounded-3xl p-5 hover:border-zentry-accent/60 transition-all cursor-pointer shadow-sm hover:shadow-xl relative flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-zentry-bg border border-zentry-border flex items-center justify-center text-zentry-accent group-hover:scale-110 transition-transform shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-black text-zentry-text-2 bg-zentry-bg border border-zentry-border px-2.5 py-1 rounded-xl">
                        {file.type}
                      </span>
                      <button
                        onClick={(e) => handleDeleteFile(file.id, file.title, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-400 transition-opacity text-zentry-text-2 rounded-xl hover:bg-red-500/10"
                        title="Eliminar proyecto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {file.thumbnail_url && (
                    <div className="mb-3 rounded-xl overflow-hidden aspect-video bg-zentry-bg border border-zentry-border">
                      <img src={getImageUrl(file.thumbnail_url)} alt={file.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <h3 className="font-extrabold text-zentry-text-1 text-sm group-hover:text-zentry-accent transition-colors line-clamp-2">
                    {file.title}
                  </h3>
                </div>

                <div className="pt-4 border-t border-zentry-border/60 mt-4 flex items-center justify-between text-xs text-zentry-text-2">
                  <span className="font-mono text-[11px] font-semibold">{file.lastEdited}</span>
                  <span className="flex items-center gap-1 text-amber-400 font-black">
                    <Coins className="w-3.5 h-3.5" /> +{file.reward || 50}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Modal de CreaciÃƒÂ³n */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-zentry-border flex justify-between items-center bg-zentry-bg">
                <h3 className="text-lg font-black text-zentry-text-1 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-zentry-accent" /> Nuevo Proyecto en Estudio
                </h3>
                <button onClick={resetModal} className="text-zentry-text-2 hover:text-zentry-text-1 p-1 rounded-xl hover:bg-zentry-card transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">

                {step === 1 ? (
                  <form onSubmit={handleNextStep} className="space-y-5">

                    <div>
                      <label className="block text-xs font-black text-zentry-text-2 mb-2 uppercase tracking-wider">Selecciona la Modalidad de EdiciÃƒÂ³n</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {contentOptions.map(opt => {
                          const IconComp = opt.icon;
                          return (
                            <button
                              type="button"
                              key={opt.id}
                              onClick={() => setSelectedType(opt.id as ContentType)}
                              className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${selectedType === opt.id
                                ? 'border-zentry-accent bg-zentry-accent/10 text-zentry-text-1 shadow-md'
                                : 'border-zentry-border bg-zentry-bg text-zentry-text-2 hover:border-zentry-accent/40'
                                }`}
                            >
                              <IconComp className={`w-5 h-5 mt-0.5 shrink-0 ${selectedType === opt.id ? 'text-zentry-accent' : ''}`} />
                              <div>
                                <div className="font-bold text-xs text-zentry-text-1 flex items-center justify-between">
                                  <span>{opt.label}</span>
                                  <span className="text-[10px] text-amber-400 font-black flex items-center gap-0.5">
                                    <Coins className="w-3 h-3" /> +{opt.reward}
                                  </span>
                                </div>
                                <p className="text-[10px] text-zentry-text-2 mt-0.5">{opt.desc}</p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-zentry-text-2 mb-1.5 uppercase tracking-wider">TÃƒÂ­tulo del Proyecto</label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Ej: IlustraciÃƒÂ³n Cyberpunk, GuiÃƒÂ³n de Video..."
                        className="w-full bg-zentry-bg border border-zentry-border rounded-2xl px-4 py-3 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent font-semibold transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-zentry-text-2 mb-1.5 uppercase tracking-wider">DescripciÃƒÂ³n o Notas</label>
                      <textarea
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        rows={3} data-gramm="false" data-gramm_editor="false" data-enable-grammarly="false" spellCheck={false}
                        placeholder="Detalles sobre el proyecto..."
                        className="w-full bg-zentry-bg border border-zentry-border rounded-2xl px-4 py-3 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent resize-none font-medium transition-colors"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-3 border-t border-zentry-border">
                      <button type="button" onClick={resetModal} className="px-4 py-2.5 rounded-2xl text-xs font-bold text-zentry-text-2 hover:text-zentry-text-1 transition-colors">
                        Cancelar
                      </button>
                      <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-zentry-text-1 text-zentry-bg rounded-2xl text-xs font-black hover:opacity-90 transition-opacity shadow-md flex items-center gap-2 disabled:opacity-50">{isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {selectedType === 'canvas' || selectedType === 'document' ? 'Crear y Abrir Editor' : 'Siguiente'}
                      </button>
                    </div>

                  </form>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-black text-zentry-text-2 mb-2 uppercase tracking-wider">Subir Archivo de {selectedType.toUpperCase()}</label>
                      <div
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${isDragging ? 'border-zentry-accent bg-zentry-accent/10' :
                          uploadFile ? 'border-emerald-500 bg-emerald-500/10' : 'border-zentry-border bg-zentry-bg hover:border-zentry-accent'
                          }`}
                      >
                        <UploadCloud className="w-10 h-10 text-zentry-accent mx-auto mb-2" />
                        <p className="text-xs font-bold text-zentry-text-1">Haz clic para seleccionar o arrastra tu archivo</p>
                        <p className="text-[10px] text-zentry-text-2 mt-1">Soporta PNG, JPG, WEBP, MP4, MP3, WAV</p>
                        {uploadFile && (
                          <div className="mt-4 bg-zentry-card p-2.5 rounded-2xl text-xs font-bold text-emerald-400 flex items-center justify-center gap-2 border border-emerald-500/30">
                            <CheckCircle2 className="w-4 h-4" /> {uploadFile.name}
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={onFileSelect}
                        accept={selectedType === 'video' ? 'video/*' : selectedType === 'audio' ? 'audio/*' : 'image/*'}
                        className="hidden"
                      />
                    </div>

                    <div className="pt-2 flex justify-between gap-3 border-t border-zentry-border">
                      <button type="button" onClick={() => setStep(1)} className="px-4 py-2.5 rounded-2xl text-xs font-bold text-zentry-text-2 hover:text-zentry-text-1 transition-colors">
                        AtrÃƒÂ¡s
                      </button>
                      <button
                        type="button"
                        onClick={finalizeCreation}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-zentry-text-1 text-zentry-bg rounded-2xl text-xs font-black hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shadow-md"
                      >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isSubmitting ? 'Creando...' : 'Crear y Entrar al Editor'}
                      </button>
                    </div>

                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}


