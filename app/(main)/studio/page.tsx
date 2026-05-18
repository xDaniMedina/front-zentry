'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, ChevronDown, X, Save, ArrowRight, Image, Music, Video, Type } from 'lucide-react'

const CATEGORIES = ['Ilustracion', 'Musica', 'Fotografia', 'Escritura', 'Diseño', 'Video', 'Escultura', 'Arquitectura', 'Performance', 'Otro']
const VISIBILITY  = ['Publica', 'Solo seguidores', 'Privada']

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
  { n: 2, title: 'Revision',     desc: 'El Algoritmo Etico evalua tu obra' },
  { n: 3, title: 'Resultado',    desc: 'Aprobada o devuelta con feedback' },
  { n: 4, title: 'Publicacion',  desc: 'Tu obra aparece en el feed' },
  { n: 5, title: 'Monetizacion', desc: 'Gana Zentry Coins y colaboraciones' },
]

const DRAFTS = [
  { id: 1, title: 'Boceto urbano III', saved: 'hace 2 dias' },
  { id: 2, title: 'Paleta 2025',       saved: 'hace 5 dias' },
]

export default function StudioPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [contentType, setContentType] = useState<ContentType>('image')
  const [file,        setFile]        = useState<File | null>(null)
  const [preview,     setPreview]     = useState<string | null>(null)
  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [category,    setCategory]    = useState('Ilustracion')
  const [visibility,  setVisibility]  = useState('Publica')
  const [tags,        setTags]        = useState<string[]>([])
  const [tagInput,    setTagInput]    = useState('')
  const [status,      setStatus]      = useState<StudioStatus>('idle')
  const [dragOver,    setDragOver]    = useState(false)
  const [error,       setError]       = useState('')

  const currentType = CONTENT_TYPES.find(t => t.key === contentType)!

  const handleFile = (f: File) => {
    const maxBytes = currentType.maxMB * 1024 * 1024
    if (f.size > maxBytes) {
      setError(`El archivo supera el limite de ${currentType.maxMB}MB`)
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
      setError('El titulo es obligatorio')
      return false
    }
    setError('')
    return true
  }

  const saveDraft = () => {
    if (!title.trim()) {
      setError('Agrega un titulo para guardar el borrador')
      return
    }
    setStatus('draft_saved')
    setTimeout(() => setStatus('idle'), 3000)
  }

  const submitToAlgorithm = () => {
    if (!validate()) return
    setStatus('submitted')
  }

  if (status === 'submitted') {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-6">
          <ArrowRight className="w-8 h-8 text-violet-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          Obra enviada al Algoritmo Etico
        </h2>
        <p className="text-zinc-400 text-sm mb-2">
          Tu obra esta siendo evaluada. Te notificaremos el resultado en las proximas horas.
        </p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6 text-left">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-zinc-500">Obra</span>
            <span className="text-white font-medium">{title}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-zinc-500">Categoria</span>
            <span className="text-white">{category}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Coins potenciales</span>
            <span className="text-green-400 font-medium">+80 ZC</span>
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
          className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors"
        >
          Subir otra obra
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">

      {/* Columna principal */}
      <div className="flex flex-col gap-4">

        {/* Header */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-white">Nuevo Studio</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Sube tu obra y completa la informacion</p>
          </div>
          <span className="text-xs text-zinc-500 bg-zinc-800 px-3 py-1.5 rounded-full">
            Etapa 1 de 5
          </span>
        </div>

        {/* Tipo de contenido */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
            Tipo de contenido
          </p>
          <div className="grid grid-cols-4 gap-2">
            {CONTENT_TYPES.map(t => {
              const Icon = t.icon
              return (
                <button
                  key={t.key}
                  onClick={() => { setContentType(t.key); removeFile() }}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                    contentType === t.key
                      ? 'border-violet-500 bg-violet-500/10 text-violet-400'
                      : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Zona de subida */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
            Archivo
          </p>

          {/* Input oculto */}
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
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-violet-500 bg-violet-500/5'
                  : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50'
              }`}
            >
              <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-white mb-1">
                Arrastra tu archivo aqui
              </p>
              <p className="text-xs text-zinc-500 mb-4">
                o haz clic para abrir el explorador
              </p>
              <span className="text-xs bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-full transition-colors">
                Seleccionar archivo
              </span>
              <p className="text-xs text-zinc-600 mt-3">
                {currentType.accept.toUpperCase().replace(/\*/g, '').replace(/,/g, ' ')} — Max {currentType.maxMB}MB
              </p>
            </div>
          ) : (
            <div className="border border-zinc-700 rounded-xl overflow-hidden">
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="preview" className="w-full h-48 object-cover" />
                  <button
                    onClick={removeFile}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-zinc-800">
                  <div className="w-10 h-10 bg-zinc-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                    <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button onClick={removeFile} className="text-zinc-500 hover:text-red-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-xs text-red-400 mt-2">{error}</p>
          )}
        </div>

        {/* Formulario */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-4">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Informacion de la obra
          </p>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Titulo <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Serie Raices — Identidad I"
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 text-white placeholder:text-zinc-600 text-sm rounded-xl px-4 py-2.5 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Descripcion
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe el proceso y la historia detras de tu obra..."
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 text-white placeholder:text-zinc-600 text-sm rounded-xl px-4 py-2.5 outline-none transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Categoria</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 text-white text-sm rounded-xl px-4 py-2.5 outline-none appearance-none transition-colors"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Visibilidad</label>
              <div className="relative">
                <select
                  value={visibility}
                  onChange={e => setVisibility(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 text-white text-sm rounded-xl px-4 py-2.5 outline-none appearance-none transition-colors"
                >
                  {VISIBILITY.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Etiquetas <span className="text-zinc-600">(max 5, presiona Enter)</span>
            </label>
            <div className="bg-zinc-800 border border-zinc-700 focus-within:border-violet-500 rounded-xl px-3 py-2 flex flex-wrap gap-2 transition-colors">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 bg-violet-500/15 text-violet-400 text-xs px-2.5 py-1 rounded-full">
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {tags.length < 5 && (
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder={tags.length === 0 ? 'ilustracion, color, abstracto...' : '+ etiqueta'}
                  className="bg-transparent text-white placeholder:text-zinc-600 text-xs outline-none flex-1 min-w-24"
                />
              )}
            </div>
          </div>
        </div>

        {/* Acciones */}
        {status === 'draft_saved' && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl px-4 py-3 text-center">
            Borrador guardado correctamente
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={saveDraft}
            className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium py-3 rounded-xl transition-colors"
          >
            <Save className="w-4 h-4" />
            Guardar borrador
          </button>
          <button
            onClick={submitToAlgorithm}
            className="flex-2 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-sm font-medium py-3 px-6 rounded-xl transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            Enviar al Algoritmo Etico
          </button>
        </div>

      </div>

      {/* Sidebar derecho */}
      <div className="flex flex-col gap-4">

        {/* Flujo de publicacion */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">
            Flujo de publicacion
          </p>
          <div className="flex flex-col gap-2">
            {FLOW_STEPS.map((step, i) => (
              <div key={step.n}>
                <div className={`flex gap-3 items-start ${step.n > 1 ? 'opacity-40' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                    step.n === 1
                      ? 'bg-violet-500/20 text-violet-400'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {step.n}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">{step.title}</p>
                    <p className="text-xs text-zinc-500">{step.desc}</p>
                  </div>
                </div>
                {i < FLOW_STEPS.length - 1 && (
                  <div className="ml-3 w-px h-3 bg-zinc-800 my-1" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Coins potenciales */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
            Coins por publicar
          </p>
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400">Obra aprobada</span>
              <span className="text-xs font-medium text-green-400">+50 ZC</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400">Score mayor a 4.5</span>
              <span className="text-xs font-medium text-green-400">+20 ZC</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400">Primera obra del dia</span>
              <span className="text-xs font-medium text-green-400">+10 ZC</span>
            </div>
            <div className="border-t border-zinc-800 pt-2.5 flex justify-between items-center">
              <span className="text-xs font-medium text-white">Potencial maximo</span>
              <span className="text-sm font-semibold text-violet-400">+80 ZC</span>
            </div>
          </div>
        </div>

        {/* Borradores */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
            Mis borradores
          </p>
          <div className="flex flex-col gap-2">
            {DRAFTS.map(draft => (
              <button
                key={draft.id}
                className="flex items-center gap-3 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors text-left w-full"
              >
                <div className="w-8 h-8 bg-zinc-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{draft.title}</p>
                  <p className="text-xs text-zinc-600">{draft.saved}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}