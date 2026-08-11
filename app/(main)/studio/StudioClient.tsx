"use client"

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { 
  Wand2, Plus, FileEdit, FolderOpen, Image as ImageIcon, 
  MoreVertical, Video, Music, Coins, X, UploadCloud, CheckCircle2, Loader2
} from "lucide-react";

export type ContentType = 'canvas' | 'image' | 'video' | 'audio';

export type StudioFile = {
  id: string;
  title: string;
  type: ContentType;
  lastEdited: string;
}

const containerVariants: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
const itemVariants: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } }

export default function StudioClient({ initialFiles }: { initialFiles: StudioFile[] | null }) {
  const [files, setFiles] = useState<StudioFile[]>(initialFiles || []);
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selectedType, setSelectedType] = useState<ContentType>('image'); 
  
  const [tools, setTools] = useState<string[]>([]);
  const [toolInput, setToolInput] = useState("");

  const [isDragging, setIsDragging] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contentOptions = [
    { id: 'canvas', label: 'Lienzo Digital', icon: FileEdit, reward: 50, desc: 'Editor integrado' },
    { id: 'image', label: 'Fotografía/Arte', icon: ImageIcon, reward: 20, desc: 'Sube tu imagen' },
    { id: 'video', label: 'Video', icon: Video, reward: 100, desc: 'MP4, WebM' },
    { id: 'audio', label: 'Pista de Audio', icon: Music, reward: 80, desc: 'MP3, WAV' },
  ];

  // Manejo de herramientas
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

    if (selectedType === 'canvas') {
      finalizeCreation();
    } else {
      setStep(2); 
    }
  };

  const finalizeCreation = async () => {
    if (selectedType !== 'canvas' && !uploadFile) {
      alert("Por favor, selecciona un archivo.");
      return;
    }

    setIsSubmitting(true);

    try {
      const tokenMatch = document.cookie.match(new RegExp('(^| )zentry_token=([^;]+)'));
      const clientToken = tokenMatch ? tokenMatch[2] : null;

      const formData = new FormData();
      formData.append('title', newTitle);
      formData.append('contenido', newDesc);
      
      if (tools.length > 0) {
        formData.append('tools', tools.join(','));
      }
      
      if (uploadFile) {
        formData.append('image', uploadFile);
      }

      const response = await fetch('http://localhost:8080/api/core/posts', {
        method: 'POST',
        headers: {
          ...(clientToken ? { 'Authorization': `Bearer ${clientToken}` } : {})
        },
        body: formData
      });

      if (response.ok) {
        const createdPost = await response.json();
        
        const newFile: StudioFile = {
          id: createdPost.id.toString(),
          title: createdPost.title,
          type: selectedType,
          lastEdited: 'Justo ahora'
        };
        setFiles([newFile, ...files]);
        resetModal();
        router.refresh();
      } else {
        alert("Hubo un error al crear la obra en el servidor.");
      }
    } catch (error) {
      console.error("Error al guardar post:", error);
      alert("Error de conexión con el backend.");
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
    switch(type) {
      case 'video': return <Video className="w-5 h-5 text-purple-400" />;
      case 'audio': return <Music className="w-5 h-5 text-blue-400" />;
      case 'image': return <ImageIcon className="w-5 h-5 text-green-400" />;
      default: return <FileEdit className="w-5 h-5 text-zentry-text-1" />;
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 transition-colors duration-300 pb-24 relative">
      
      {/* Cabecera */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zentry-text-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zentry-bg border border-zentry-border flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-zentry-text-1" />
            </div>
            Estudio
          </h1>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-zentry-text-1 text-zentry-bg font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Nueva Creación
        </button>
      </motion.div>

      {/* Grid de Archivos Reales */}
      {files.length === 0 ? (
        <motion.div variants={itemVariants} className="text-center py-20 bg-zentry-card border border-zentry-border border-dashed rounded-3xl">
          <Wand2 className="w-12 h-12 text-zentry-text-2 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-zentry-text-1 mb-2">Tu estudio está vacío</h3>
          <p className="text-zentry-text-2">Haz clic en Nueva Creación para subir tu primera obra.</p>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {files.map((file) => (
            <div key={file.id} onClick={() => router.push(`/studio/${file.id}`)} className="bg-zentry-card border border-zentry-border rounded-3xl p-5 hover:border-zentry-text-2 transition-colors group cursor-pointer flex flex-col h-48">
              <div className="flex justify-between items-start mb-auto">
                <div className="w-10 h-10 rounded-lg bg-zentry-bg border border-zentry-border flex items-center justify-center">
                  {getIconForType(file.type)}
                </div>
                <button className="text-zentry-text-2 hover:text-zentry-text-1 p-1 rounded-full relative z-10" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              <div>
                <h3 className="font-bold text-zentry-text-1 text-lg truncate mb-1 group-hover:underline">{file.title}</h3>
                <p className="text-xs text-zentry-text-2 flex items-center gap-1"><FolderOpen className="w-3 h-3" /> {file.lastEdited}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* MODAL MULTIPASO */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              
              <div className="p-6 border-b border-zentry-border flex justify-between items-center bg-zentry-bg">
                <div>
                  <h3 className="text-xl font-bold text-zentry-text-1">
                    {step === 1 ? '¿Qué vas a crear hoy?' : 'Sube tu archivo'}
                  </h3>
                  <p className="text-sm text-zentry-text-2 mt-1">
                    {step === 1 ? 'Sube tu arte y obtén recompensas.' : `Paso 2: Adjunta tu ${selectedType}`}
                  </p>
                </div>
                <button onClick={resetModal} className="text-zentry-text-2 hover:text-zentry-text-1 p-2 rounded-full hover:bg-zentry-card transition-colors"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar">
                {step === 1 ? (
                  <form id="step1-form" onSubmit={handleNextStep} className="flex flex-col gap-6">
                    <div>
                      <label className="block text-sm font-bold text-zentry-text-1 mb-3">Formato de la obra</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {contentOptions.map((option) => (
                          <div key={option.id} onClick={() => setSelectedType(option.id as ContentType)} className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-2 ${selectedType === option.id ? 'bg-zentry-accent/10 border-zentry-accent' : 'bg-zentry-bg border-zentry-border hover:border-zentry-text-2'}`}>
                            <option.icon className={`w-6 h-6 ${selectedType === option.id ? 'text-zentry-accent' : 'text-zentry-text-2'}`} />
                            <div>
                              <p className={`text-xs font-bold ${selectedType === option.id ? 'text-zentry-accent' : 'text-zentry-text-1'}`}>{option.label}</p>
                              <p className="text-[10px] text-zentry-text-2 mt-0.5">{option.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-zentry-text-2 mb-1">Título de tu obra *</label>
                        <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ej. Diseño de landing page..." className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-zentry-text-2 mb-1">Descripción</label>
                        <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Cuéntanos sobre tu proceso creativo..." className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors resize-none h-24" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zentry-text-2 mb-1">Herramientas (Tags)</label>
                        <div className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-3 py-2 focus-within:border-zentry-accent transition-colors flex flex-wrap gap-2 items-center min-h-[50px]">
                          {tools.map(tool => (
                            <span key={tool} className="flex items-center gap-1 bg-zentry-accent/20 text-zentry-accent px-2 py-1 rounded-lg text-xs font-bold">
                              {tool}
                              <button type="button" onClick={() => removeTool(tool)} className="hover:text-white"><X className="w-3 h-3"/></button>
                            </span>
                          ))}
                          <input
                            type="text"
                            value={toolInput}
                            onChange={e => setToolInput(e.target.value)}
                            onKeyDown={handleAddTool}
                            placeholder={tools.length === 0 ? "Ej. Next.js, Figma (Enter)" : "Agregar..."}
                            className="bg-transparent border-none text-sm text-zentry-text-1 focus:outline-none flex-1 min-w-[150px]"
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  // PASO 2: DRAG AND DROP
                  <div className="flex flex-col gap-6">
                    <div 
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                      onClick={() => !uploadFile && fileInputRef.current?.click()}
                      className={`w-full h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isDragging ? 'border-zentry-accent bg-zentry-accent/5' : 
                        uploadFile ? 'border-green-500 bg-green-500/5' : 'border-zentry-border bg-zentry-bg hover:border-zentry-text-2'
                      }`}
                    >
                      <input type="file" ref={fileInputRef} onChange={onFileSelect} className="hidden" accept={selectedType === 'video' ? 'video/*' : selectedType === 'audio' ? 'audio/*' : 'image/*'} />
                      
                      {uploadFile ? (
                        <>
                          <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
                          <p className="font-bold text-zentry-text-1">{uploadFile.name}</p>
                          <p className="text-xs text-zentry-text-2 mt-1">Archivo listo para subir</p>
                        </>
                      ) : (
                        <>
                          <UploadCloud className={`w-10 h-10 mb-3 ${isDragging ? 'text-zentry-accent' : 'text-zentry-text-2'}`} />
                          <p className="font-bold text-zentry-text-1">Arrastra tu archivo aquí</p>
                          <p className="text-sm text-zentry-text-2 mt-1">o haz clic para explorar</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 pt-0 mt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-4 py-2 rounded-xl">
                  <Coins className="w-5 h-5" />
                  <span className="text-sm font-bold">
                    +{contentOptions.find(o => o.id === selectedType)?.reward} ZC <span className="font-normal opacity-80">al publicar</span>
                  </span>
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                  {step === 2 && (
                    <button type="button" onClick={() => setStep(1)} className="flex-1 sm:flex-none py-2.5 px-6 font-semibold text-zentry-text-1 bg-zentry-bg border border-zentry-border rounded-xl hover:bg-zentry-border transition-colors">
                      Atrás
                    </button>
                  )}
                  {step === 1 ? (
                    <button type="submit" form="step1-form" className="flex-1 sm:flex-none py-2.5 px-6 font-semibold text-zentry-bg bg-zentry-text-1 rounded-xl hover:opacity-90 transition-opacity">
                      {selectedType === 'canvas' ? 'Abrir Lienzo' : 'Siguiente'}
                    </button>
                  ) : (
                    <button type="button" onClick={finalizeCreation} disabled={!uploadFile || isSubmitting} className="flex-1 sm:flex-none py-2.5 px-6 font-semibold text-zentry-bg bg-zentry-text-1 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2">
                      {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</> : 'Publicar Obra'}
                    </button>
                  )}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}