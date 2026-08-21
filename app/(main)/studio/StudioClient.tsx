"use client"

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { 
  Wand2, Plus, FileEdit, FolderOpen, Image as ImageIcon, 
  MoreVertical, Video, Music, Coins, X, UploadCloud, CheckCircle2,
  FileText, Search, Trash2
} from "lucide-react";
import { toast } from "sonner";

export type ContentType = 'canvas' | 'document' | 'image' | 'video' | 'audio';

export type StudioFile = {
  id: string;
  title: string;
  type: ContentType;
  lastEdited: string;
  reward?: number;
}

const containerVariants: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const itemVariants: Variants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } }

export default function StudioClient({ initialFiles }: { initialFiles: StudioFile[] | null }) {
  const [files, setFiles] = useState<StudioFile[]>(initialFiles && initialFiles.length > 0 ? initialFiles : [
    { id: '1', title: 'Ilustración Cyberpunk 2099', type: 'canvas', lastEdited: 'Hace 2 horas', reward: 50 },
    { id: '2', title: 'Guión para Video Ensayo IA', type: 'document', lastEdited: 'Ayer', reward: 40 },
    { id: '3', title: 'Concept Art - Templo Antiguo', type: 'image', lastEdited: 'Hace 3 días', reward: 20 },
    { id: '4', title: 'Zentry Trailer Teaser v1', type: 'video', lastEdited: 'Hace 5 días', reward: 100 },
    { id: '5', title: 'Pista de Sintetizador Lo-Fi', type: 'audio', lastEdited: 'Hace 1 semana', reward: 80 }
  ]);
  const router = useRouter();

  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selectedType, setSelectedType] = useState<ContentType>('canvas'); 
  
  const [tools, setTools] = useState<string[]>([]);
  const [toolInput, setToolInput] = useState("");

  const [isDragging, setIsDragging] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contentOptions = [
    { id: 'canvas', label: 'Lienzo Digital', icon: FileEdit, reward: 50, desc: 'Pintura y Dibujo (Canva / Pixel Art)' },
    { id: 'document', label: 'Documento de Texto', icon: FileText, reward: 40, desc: 'Artículos y Guiones (Word / Notion)' },
    { id: 'image', label: 'Fotografía/Arte', icon: ImageIcon, reward: 20, desc: 'Editor de fotos e imágenes' },
    { id: 'video', label: 'Video', icon: Video, reward: 100, desc: 'Línea de tiempo de Video (YouTube Studio)' },
    { id: 'audio', label: 'Pista de Audio', icon: Music, reward: 80, desc: 'Edición de Audio (Audacity / DAW)' },
  ];

  const handleAddTool = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && toolInput.trim() !== '') {
      e.preventDefault();
      if (!tools.includes(toolInput.trim())) setTools([...tools, toolInput.trim()]);
      setToolInput("");
    }
  };

  const removeTool = (toolToRemove: string) => setTools(tools.filter(t => t !== toolToRemove));

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
    if (selectedType !== 'canvas' && selectedType !== 'document' && !uploadFile) {
      toast.error("Por favor, selecciona o sube un archivo.");
      return;
    }

    setIsSubmitting(true);

    try {
      const tokenMatch = document.cookie.match(new RegExp('(^| )zentry_token=([^;]+)'));
      const clientToken = tokenMatch ? tokenMatch[2] : null;

      const formData = new FormData();
      formData.append('title', newTitle);
      formData.append('contenido', newDesc);
      
      if (tools.length > 0) formData.append('tools', tools.join(','));
      if (uploadFile) formData.append('image', uploadFile);

      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, "");
      const response = await fetch(`${apiBase}/api/core/posts`, {
        method: 'POST',
        headers: {
          ...(clientToken ? { 'Authorization': `Bearer ${clientToken}` } : {})
        },
        body: formData
      });

      const newId = response.ok ? (await response.json()).id.toString() : Date.now().toString();

      const newFile: StudioFile = {
        id: newId,
        title: newTitle,
        type: selectedType,
        lastEdited: 'Justo ahora',
        reward: contentOptions.find(c => c.id === selectedType)?.reward || 50
      };

      setFiles([newFile, ...files]);
      toast.success(`¡Estudio "${newTitle}" creado con éxito!`);
      resetModal();
      router.push(`/studio/${newId}?type=${selectedType}`);
    } catch (error) {
      console.error("Error al crear estudio:", error);
      const fallbackId = Date.now().toString();
      const newFile: StudioFile = {
        id: fallbackId,
        title: newTitle,
        type: selectedType,
        lastEdited: 'Justo ahora',
        reward: contentOptions.find(c => c.id === selectedType)?.reward || 50
      };
      setFiles([newFile, ...files]);
      toast.success(`Estudio creado en modo local`);
      resetModal();
      router.push(`/studio/${fallbackId}?type=${selectedType}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setStep(1);
    setNewTitle("");
    setNewDesc("");
    setTools([]);
    setUploadFile(null);
  };

  const handleDeleteFile = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles(files.filter(f => f.id !== id));
    toast.success(`"${title}" eliminado del estudio`);
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
      case 'canvas': return FileEdit;
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
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Banner Principal del Estudio */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-purple-900/60 via-zentry-card to-blue-900/60 border border-zentry-border overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_var(--tw-gradient-stops))] from-zentry-accent/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-mono font-bold tracking-wider text-zentry-accent uppercase bg-zentry-accent/10 px-3 py-1 rounded-full border border-zentry-accent/20">
              Estudio Creativo Zentry
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zentry-text-1 tracking-tight">
              Crea, Diseña y Produce
            </h1>
            <p className="text-sm text-zentry-text-2 leading-relaxed">
              Herramientas de edición multimodal: Lienzo digital (Canva / Pixel Art), Documentos redactables (Word), Línea de tiempo de Video (YouTube Studio) y Pistas de Audio.
            </p>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3.5 bg-zentry-text-1 text-zentry-bg rounded-2xl font-extrabold text-sm hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Nuevo Proyecto
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Chips de Categorías */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 custom-scrollbar">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'canvas', label: 'Lienzos' },
            { id: 'document', label: 'Documentos' },
            { id: 'image', label: 'Imágenes' },
            { id: 'video', label: 'Videos' },
            { id: 'audio', label: 'Audios' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                filterType === tab.id 
                  ? 'bg-zentry-accent text-white shadow-md shadow-zentry-accent/20' 
                  : 'bg-zentry-card border border-zentry-border text-zentry-text-2 hover:text-zentry-text-1'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Búsqueda */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="w-4 h-4 text-zentry-text-2 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar proyectos..."
            className="w-full bg-zentry-card border border-zentry-border rounded-2xl pl-10 pr-4 py-2 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors"
          />
        </div>

      </div>

      {/* Grid de Archivos del Estudio */}
      {filteredFiles.length === 0 ? (
        <div className="bg-zentry-card border border-zentry-border rounded-3xl p-12 text-center space-y-4">
          <FolderOpen className="w-12 h-12 text-zentry-text-2 mx-auto opacity-50" />
          <h3 className="text-lg font-bold text-zentry-text-1">No se encontraron proyectos</h3>
          <p className="text-xs text-zentry-text-2 max-w-sm mx-auto">
            Crea tu primer proyecto o cambia el filtro de búsqueda para explorar tus contenidos.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-zentry-accent text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
          >
            + Crear Nuevo Proyecto
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
            const Icon = getIconForType(file.type);
            return (
              <motion.div 
                key={file.id}
                variants={itemVariants}
                onClick={() => router.push(`/studio/${file.id}?type=${file.type}`)}
                className="group bg-zentry-card border border-zentry-border rounded-3xl p-5 hover:border-zentry-accent/60 transition-all cursor-pointer shadow-sm hover:shadow-xl relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-zentry-bg border border-zentry-border flex items-center justify-center text-zentry-accent group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-zentry-text-2 bg-zentry-bg border border-zentry-border px-2 py-0.5 rounded-lg">
                        {file.type}
                      </span>
                      <button 
                        onClick={(e) => handleDeleteFile(file.id, file.title, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-400 transition-opacity text-zentry-text-2"
                        title="Eliminar proyecto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-zentry-text-1 text-sm group-hover:text-zentry-accent transition-colors line-clamp-2">
                    {file.title}
                  </h3>
                </div>

                <div className="pt-4 border-t border-zentry-border/60 mt-4 flex items-center justify-between text-xs text-zentry-text-2">
                  <span>{file.lastEdited}</span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Coins className="w-3.5 h-3.5" /> +{file.reward || 50}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Modal de Creación de Nuevo Proyecto */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-zentry-border flex justify-between items-center bg-zentry-bg">
                <h3 className="text-lg font-bold text-zentry-text-1 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-zentry-accent" /> Nuevo Proyecto en Estudio
                </h3>
                <button onClick={resetModal} className="text-zentry-text-2 hover:text-zentry-text-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                
                {step === 1 ? (
                  <form onSubmit={handleNextStep} className="space-y-5">
                    
                    {/* Selector de Tipo de Contenido */}
                    <div>
                      <label className="block text-xs font-bold text-zentry-text-2 mb-2 uppercase tracking-wider">Selecciona la Modalidad</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {contentOptions.map(opt => {
                          const IconComp = opt.icon;
                          return (
                            <button
                              type="button"
                              key={opt.id}
                              onClick={() => setSelectedType(opt.id as ContentType)}
                              className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                                selectedType === opt.id 
                                  ? 'border-zentry-accent bg-zentry-accent/10 text-zentry-text-1 shadow-md' 
                                  : 'border-zentry-border bg-zentry-bg text-zentry-text-2 hover:border-zentry-border/80'
                              }`}
                            >
                              <IconComp className={`w-5 h-5 mt-0.5 shrink-0 ${selectedType === opt.id ? 'text-zentry-accent' : ''}`} />
                              <div>
                                <div className="font-bold text-xs text-zentry-text-1 flex items-center justify-between">
                                  <span>{opt.label}</span>
                                  <span className="text-[10px] text-amber-400 font-extrabold flex items-center gap-0.5">
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

                    {/* Título del Proyecto */}
                    <div>
                      <label className="block text-xs font-bold text-zentry-text-2 mb-1.5 uppercase tracking-wider">Título del Proyecto</label>
                      <input 
                        type="text" 
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Ej: Ilustración Cyberpunk, Guión de Video..."
                        className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
                        required
                      />
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="block text-xs font-bold text-zentry-text-2 mb-1.5 uppercase tracking-wider">Descripción o Notas</label>
                      <textarea 
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        rows={3}
                        placeholder="Detalles sobre el proyecto..."
                        className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent resize-none"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-3 border-t border-zentry-border">
                      <button type="button" onClick={resetModal} className="px-4 py-2.5 rounded-xl text-xs font-bold text-zentry-text-2 hover:text-zentry-text-1">
                        Cancelar
                      </button>
                      <button type="submit" className="px-6 py-2.5 bg-zentry-text-1 text-zentry-bg rounded-xl text-xs font-bold hover:opacity-90">
                        {selectedType === 'canvas' || selectedType === 'document' ? 'Abrir Editor' : 'Siguiente'}
                      </button>
                    </div>

                  </form>
                ) : (
                  <div className="space-y-5">
                    
                    {/* Zona de Arrastre para Subir Archivo */}
                    <div>
                      <label className="block text-xs font-bold text-zentry-text-2 mb-2 uppercase tracking-wider">Subir Archivo de {selectedType.toUpperCase()}</label>
                      <div 
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                          isDragging ? 'border-zentry-accent bg-zentry-accent/10' : 
                          uploadFile ? 'border-emerald-500 bg-emerald-500/10' : 'border-zentry-border bg-zentry-bg hover:border-zentry-accent'
                        }`}
                      >
                        <UploadCloud className="w-10 h-10 text-zentry-accent mx-auto mb-2" />
                        <p className="text-xs font-bold text-zentry-text-1">Haz clic para seleccionar o arrastra tu archivo</p>
                        <p className="text-[10px] text-zentry-text-2 mt-1">Soporta PNG, JPG, MP4, MP3, WAV</p>
                        {uploadFile && (
                          <div className="mt-4 bg-zentry-card p-2.5 rounded-xl text-xs font-bold text-emerald-400 flex items-center justify-center gap-2 border border-emerald-500/30">
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
                      <button type="button" onClick={() => setStep(1)} className="px-4 py-2.5 rounded-xl text-xs font-bold text-zentry-text-2 hover:text-zentry-text-1">
                        Atrás
                      </button>
                      <button 
                        type="button" 
                        onClick={finalizeCreation}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-zentry-text-1 text-zentry-bg rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-50"
                      >
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