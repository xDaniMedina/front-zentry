'use client'

import { useState, useRef } from 'react'
import { motion, Variants } from 'framer-motion'
import { Upload, FileText, ChevronDown, X, Save, ArrowRight, Image, Music, Video, Type, CheckCircle } from 'lucide-react'

const CATEGORIES = ['Ilustración', 'Música', 'Fotografía', 'Escritura', 'Diseño', 'Video', 'Escultura', 'Arquitectura', 'Performance', 'Otro']
const VISIBILITY  = ['Pública', 'Solo seguidores', 'Privada']

type ContentType = 'image' | 'video' | 'audio' | 'text'
type StudioStatus = 'idle' | 'draft_saved' | 'submitted'

const CONTENT_TYPES = [
  { key: 'image' as ContentType, label: 'Imagen',  icon: Image,    accept: 'image/*',      maxMB: 50  },
  { key: 'video' as ContentType, label: 'Video',   icon: Video,    accept: 'video/*',      maxMB: 500 },
  { key: 'audio' as ContentType, label: 'Audio',   icon: Music,    accept: 'audio/*',      maxMB: 100 },
  { key: 'text'  as ContentType, label: 'Texto',   icon: Type,     accept: '.txt,.md,.pdf', maxMB: 5  },
]

const FLOW_STEPS = [
  { n: 1, title: 'Subida',       desc: 'Sube tu archivo y completa los datos' },
  { n: 2, title: 'Revisión',     desc: 'El Algoritmo Ético evalúa tu obra' },
  { n: 3, title: 'Resultado',    desc: 'Aprobada o devuelta con feedback' },
  { n: 4, title: 'Publicación',  desc: 'Tu obra aparece en el feed' },
  { n: 5, title: 'Monetización', desc: 'Gana Zentry Coins y colaboraciones' },
]

const DRAFTS = [
  { id: 1, title: 'Boceto urbano III', saved: 'hace 2 días' },
  { id: 2, title: 'Paleta 2025',       saved: 'hace 5 días' },
]

// Animaciones
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export default function StudioPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [contentType, setContentType] = useState<ContentType>('image')
  const [file,        setFile]        = useState<File | null>(null)
  const [preview,     setPreview]     = useState<string | null>(null)
  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [category,    setCategory]    = useState('Ilustración')
  const [visibility,  setVisibility]  = useState('Pública')
  const [tags,        setTags]        = useState<string[]>([])
  const [tagInput,    setTagInput]    = useState('')
  const [status,      setStatus]      = useState<StudioStatus>('idle')
  const [dragOver,    setDragOver]    = useState(false)
  const [error,       setError]       = useState('')

  const currentType = CONTENT_TYPES.find(t => t.key === contentType)!

  const handleFile = (f: File) => {
    const maxBytes = currentType.maxMB * 1024 * 1024
    if (f.size > maxBytes) {
      setError(`El archivo supera el límite de ${currentType.maxMB}MB`)
      return
    }
    setError('')
    setFile(f)
    if (contentType === 'image') {
      const url = URL.createObjectURL(f)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  const removeFile = () => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim() && tags.length < 5) {
      setTags([...tags, tagInput.trim().toLowerCase()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const validate = () => {
    if (!file && contentType !== 'text') {
      setError('Debes subir un archivo')
      return false
    }
    if (!title.trim()) {
      setError('El título es obligatorio')
      return false
    }
    setError('')
    return true
  }

  const saveDraft = () => {
    if (!title.trim()) {
      setError('Agrega un título para guardar el borrador')
      return
    }
    setStatus('draft_saved')
    setTimeout(() => setStatus('idle'), 3000)
  }

  const submitToAlgorithm = () => {
    if (!validate()) return
    setStatus('submitted')
  }

  // Vista de Éxito / Envío
  if (status === 'submitted') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto py-16 px-4 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-zentry-accent/10 flex items-center justify-center mx-auto mb-6 border border-zentry-accent/20">
          <CheckCircle className="w-10 h-10 text-zentry-accent" />
        </div>
        <h2 className="text-2xl font-bold text-zentry-text-1 mb-2">
          Obra enviada al Algoritmo Ético
        </h2>
        <p className="text-zentry-text-2 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
          Tu obra está siendo evaluada. Te notificaremos el resultado en las próximas horas.
        </p>

        <div className="bg-zentry-card border border-zentry-border rounded-2xl p-5 mb-8 text-left shadow-lg">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-zentry-text-2">Obra</span>
            <span className="text-zentry-text-1 font-medium truncate max-w-[200px]">{title}</span>
          </div>
          <div className="flex justify-between text-sm mb-3">
            <span className="text-zentry-text-2">Categoría</span>
            <span className="text-zentry-text-1">{category}</span>
          </div>
          <div className="flex justify-between text-sm pt-3 border-t border-zentry-border">
            <span className="text-zentry-text-2">Coins potenciales</span>
            <span className="text-green-500 font-medium">+80 ZC</span>
          </div>
        </div>

        <button
          onClick={() => {
            setStatus('idle')
            setFile(null)
            setPreview(null)
            setTitle('')
            setDescription('')
            setTags([])
          }}
          className="bg-zentry-accent hover:opacity-90 text-white text-sm font-medium px-8 py-3 rounded-full transition-all shadow-lg shadow-zentry-accent/20"
        >
          Subir otra obra
        </button>
      </motion.div>
    )
  }

  // Vista Principal de Studio
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 px-4 sm:px-0 py-6 max-w-6xl mx-auto transition-colors duration-300"
    >
      {/* ========================================== */}
      {/* Columna Principal: Editor                  */}
      {/* ========================================== */}
      <div className="flex flex-col gap-6 w-full overflow-hidden">
        
        {/* Header */}
        <motion.div variants={itemVariants} className="bg-zentry-card border border-zentry-border rounded-2xl p-4 sm:p-5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-zentry-text-1">Nuevo Studio</h1>
            <p className="text-xs sm:text-sm text-zentry-text-2 mt-1">Sube tu obra y completa la información</p>
          </div>
          <span className="text-xs font-medium text-zentry-text-2 bg-zentry-bg border border-zentry-border px-3 py-1.5 rounded-full whitespace-nowrap ml-4">
            Etapa 1 de 5
          </span>
        </motion.div>

        {/* Tipo de contenido */}
        <motion.div variants={itemVariants} className="bg-zentry-card border border-zentry-border rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-semibold text-zentry-text-2 uppercase tracking-wider mb-4">
            Tipo de contenido
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CONTENT_TYPES.map(t => {
              const Icon = t.icon
              return (
                <button
                  key={t.key}
                  onClick={() => { setContentType(t.key); removeFile() }}
                  className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all ${
                    contentType === t.key
                      ? 'border-zentry-accent bg-zentry-accent/10 text-zentry-accent shadow-sm'
                      : 'border-zentry-border bg-zentry-bg text-zentry-text-2 hover:border-zentry-accent/50 hover:text-zentry-text-1'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Zona de subida */}
        <motion.div variants={itemVariants} className="bg-zentry-card border border-zentry-border rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-semibold text-zentry-text-2 uppercase tracking-wider mb-4">
            Archivo
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept={currentType.accept}
            onChange={handleInputChange}
            className="hidden"
          />

          {!file ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
                dragOver
                  ? 'border-zentry-accent bg-zentry-accent/5'
                  : 'border-zentry-border hover:border-zentry-accent/50 hover:bg-zentry-bg'
              }`}
            >
              <Upload className={`w-10 h-10 mx-auto mb-4 transition-colors ${dragOver ? 'text-zentry-accent' : 'text-zentry-text-2'}`} />
              <p className="text-sm font-medium text-zentry-text-1 mb-2">
                Arrastra tu archivo aquí
              </p>
              <p className="text-xs text-zentry-text-2 mb-6">
                o haz clic para abrir el explorador
              </p>
              <span className="text-sm bg-zentry-accent hover:opacity-90 text-white font-medium px-6 py-2.5 rounded-full transition-colors inline-block shadow-md">
                Seleccionar archivo
              </span>
              <p className="text-xs text-zentry-text-2/70 mt-4">
                {currentType.accept.toUpperCase().replace(/\*/g, '').replace(/,/g, ' ')} — Max {currentType.maxMB}MB
              </p>
            </div>
          ) : (
            <div className="border border-zentry-border rounded-2xl overflow-hidden bg-zentry-bg">
              {preview ? (
                <div className="relative group">
                  <img src={preview} alt="preview" className="w-full h-64 sm:h-80 object-contain p-4" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile() }}
                      className="bg-red-500/90 hover:bg-red-500 text-white font-medium px-4 py-2 rounded-full flex items-center gap-2 transition-colors shadow-lg"
                    >
                      <X className="w-4 h-4" /> Cambiar archivo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-5">
                  <div className="w-12 h-12 bg-zentry-card border border-zentry-border rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-zentry-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zentry-text-1 truncate">{file.name}</p>
                    <p className="text-xs text-zentry-text-2 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button onClick={removeFile} className="w-8 h-8 rounded-full flex items-center justify-center text-zentry-text-2 hover:bg-red-500/10 hover:text-red-500 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 mt-4 font-medium flex items-center gap-2">
              <X className="w-4 h-4" /> {error}
            </motion.p>
          )}
        </motion.div>

        {/* Formulario */}
        <motion.div variants={itemVariants} className="bg-zentry-card border border-zentry-border rounded-2xl p-4 sm:p-5 flex flex-col gap-5">
          <p className="text-xs font-semibold text-zentry-text-2 uppercase tracking-wider mb-2">
            Información de la obra
          </p>

          <div>
            <label className="block text-sm font-medium text-zentry-text-1 mb-2">
              Título <span className="text-zentry-accent">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Serie Raíces — Identidad I"
              className="w-full bg-zentry-bg border border-zentry-border focus:border-zentry-accent text-zentry-text-1 placeholder:text-zentry-text-2/60 text-sm rounded-xl px-4 py-3 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zentry-text-1 mb-2">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe el proceso y la historia detrás de tu obra..."
              rows={4}
              className="w-full bg-zentry-bg border border-zentry-border focus:border-zentry-accent text-zentry-text-1 placeholder:text-zentry-text-2/60 text-sm rounded-xl px-4 py-3 outline-none transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-sm font-medium text-zentry-text-1 mb-2">Categoría</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-zentry-bg border border-zentry-border focus:border-zentry-accent text-zentry-text-1 text-sm rounded-xl px-4 py-3 outline-none appearance-none transition-colors cursor-pointer"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zentry-text-2 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zentry-text-1 mb-2">Visibilidad</label>
              <div className="relative">
                <select
                  value={visibility}
                  onChange={e => setVisibility(e.target.value)}
                  className="w-full bg-zentry-bg border border-zentry-border focus:border-zentry-accent text-zentry-text-1 text-sm rounded-xl px-4 py-3 outline-none appearance-none transition-colors cursor-pointer"
                >
                  {VISIBILITY.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zentry-text-2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zentry-text-1 mb-2">
              Etiquetas <span className="text-zentry-text-2 text-xs font-normal ml-1">(Máx 5, presiona Enter)</span>
            </label>
            <div className="bg-zentry-bg border border-zentry-border focus-within:border-zentry-accent rounded-xl px-3 py-2 flex flex-wrap gap-2 transition-colors min-h-[50px] items-center">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1.5 bg-zentry-accent/10 text-zentry-accent text-xs font-medium px-3 py-1.5 rounded-full border border-zentry-accent/20">
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {tags.length < 5 && (
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder={tags.length === 0 ? 'Ej: 3D, Cyberpunk...' : '+ Añadir etiqueta'}
                  className="bg-transparent text-zentry-text-1 placeholder:text-zentry-text-2/60 text-sm outline-none flex-1 min-w-[120px] py-1 px-2"
                />
              )}
            </div>
          </div>
        </motion.div>

        {/* Acciones */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 pt-2">
          {status === 'draft_saved' && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute -mt-14 left-1/2 -translate-x-1/2 bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-medium rounded-full px-6 py-2 shadow-lg backdrop-blur-md">
              Borrador guardado
            </motion.div>
          )}

          <button
            onClick={saveDraft}
            className="flex-1 flex items-center justify-center gap-2 bg-zentry-card border border-zentry-border hover:bg-zentry-bg text-zentry-text-1 text-sm font-medium py-3.5 rounded-xl transition-all shadow-sm"
          >
            <Save className="w-4 h-4 text-zentry-text-2" />
            Guardar borrador
          </button>
          
          <button
            onClick={submitToAlgorithm}
            className="flex-[2] flex items-center justify-center gap-2 bg-zentry-accent hover:opacity-90 active:scale-[0.98] text-white text-sm font-medium py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-zentry-accent/20"
          >
            Enviar al Algoritmo Ético
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

      </div>

      {/* Columna Lateral (Widgets)                  */}
   
      <div className="flex flex-col gap-6 w-full">

        {/* Flujo de publicación */}
        <motion.div variants={itemVariants} className="bg-zentry-card border border-zentry-border rounded-2xl p-5">
          <p className="text-xs font-semibold text-zentry-text-2 uppercase tracking-wider mb-5">
            Flujo de publicación
          </p>
          <div className="flex flex-col gap-1">
            {FLOW_STEPS.map((step, i) => (
              <div key={step.n}>
                <div className={`flex gap-4 items-start ${step.n > 1 ? 'opacity-50' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border ${
                    step.n === 1
                      ? 'bg-zentry-accent/10 border-zentry-accent/30 text-zentry-accent'
                      : 'bg-zentry-bg border-zentry-border text-zentry-text-2'
                  }`}>
                    {step.n}
                  </div>
                  <div className="pt-1">
                    <p className={`text-sm font-bold ${step.n === 1 ? 'text-zentry-text-1' : 'text-zentry-text-2'}`}>{step.title}</p>
                    <p className="text-xs text-zentry-text-2 mt-0.5">{step.desc}</p>
                  </div>
                </div>
                {i < FLOW_STEPS.length - 1 && (
                  <div className="ml-[13px] w-px h-5 bg-zentry-border my-1.5" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Coins potenciales */}
        <motion.div variants={itemVariants} className="bg-zentry-card border border-zentry-border rounded-2xl p-5">
          <p className="text-xs font-semibold text-zentry-text-2 uppercase tracking-wider mb-4">
            Coins por publicar
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-zentry-text-2">Obra aprobada</span>
              <span className="text-xs sm:text-sm font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-lg">+50 ZC</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-zentry-text-2">Score mayor a 4.5</span>
              <span className="text-xs sm:text-sm font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-lg">+20 ZC</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-zentry-text-2">Primera obra del día</span>
              <span className="text-xs sm:text-sm font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-lg">+10 ZC</span>
            </div>
            <div className="border-t border-zentry-border pt-4 mt-1 flex justify-between items-center">
              <span className="text-sm font-bold text-zentry-text-1">Potencial máximo</span>
              <span className="text-base font-black text-zentry-accent">+80 ZC</span>
            </div>
          </div>
        </motion.div>

        {/* Borradores */}
        <motion.div variants={itemVariants} className="bg-zentry-card border border-zentry-border rounded-2xl p-5">
          <p className="text-xs font-semibold text-zentry-text-2 uppercase tracking-wider mb-4">
            Mis borradores
          </p>
          <div className="flex flex-col gap-2">
            {DRAFTS.map(draft => (
              <button
                key={draft.id}
                className="flex items-center gap-3 p-3 bg-zentry-bg hover:bg-zentry-bg/70 border border-zentry-border/50 rounded-xl transition-colors text-left w-full group"
              >
                <div className="w-10 h-10 bg-zentry-card border border-zentry-border rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-zentry-text-2 group-hover:text-zentry-accent transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-zentry-text-1 truncate">{draft.title}</p>
                  <p className="text-xs text-zentry-text-2 mt-0.5">{draft.saved}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-zentry-text-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </button>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.div>
  )
}