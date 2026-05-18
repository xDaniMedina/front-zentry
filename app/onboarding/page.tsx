'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowRight, ArrowLeft, User, Palette, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { completeOnboarding } from '@/lib/actions/auth'

// Disciplinas artísticas disponibles
const DISCIPLINES = [
  { value: 'illustration', label: 'Ilustración', emoji: '🎨' },
  { value: 'music',        label: 'Música',       emoji: '🎵' },
  { value: 'photography',  label: 'Fotografía',   emoji: '📷' },
  { value: 'writing',      label: 'Escritura',    emoji: '✍️' },
  { value: 'design',       label: 'Diseño',       emoji: '🖌️' },
  { value: 'video',        label: 'Video',        emoji: '🎬' },
  { value: 'sculpture',    label: 'Escultura',    emoji: '🗿' },
  { value: 'architecture', label: 'Arquitectura', emoji: '🏛️' },
  { value: 'performance',  label: 'Performance',  emoji: '🎭' },
  { value: 'other',        label: 'Otro',         emoji: '✨' },
]

const EXPERIENCE_LEVELS = [
  { value: 'beginner',     label: 'Principiante', desc: 'Estoy comenzando mi camino creativo' },
  { value: 'intermediate', label: 'Intermedio',   desc: 'Tengo experiencia pero sigo aprendiendo' },
  { value: 'advanced',     label: 'Avanzado',     desc: 'Domino mi disciplina con soltura' },
  { value: 'professional', label: 'Profesional',  desc: 'Es mi medio de vida principal' },
]

// Pasos del onboarding
const STEPS = [
  { id: 1, title: 'Tu identidad',   icon: User,    desc: 'Cómo te conocerá la comunidad' },
  { id: 2, title: 'Tu disciplina',  icon: Palette, desc: 'Qué tipo de artista eres' },
  { id: 3, title: 'Sobre ti',       icon: FileText, desc: 'Cuéntanos tu historia' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Estado del formulario
  const [form, setForm] = useState({
    display_name:     '',
    artistic_name:    '',
    username:         '',
    discipline:       '',
    experience_level: '',
    bio:              '',
  })

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    // Validaciones por paso
    if (step === 1) {
      if (!form.display_name.trim()) {
        setError('El nombre es obligatorio')
        return
      }
      if (!form.username.trim()) {
        setError('El username es obligatorio')
        return
      }
    }
    if (step === 2 && !form.discipline) {
      setError('Selecciona tu disciplina')
      return
    }
    setError('')
    setStep(s => s + 1)
  }

  const prevStep = () => {
    setError('')
    setStep(s => s - 1)
  }

  const handleSubmit = async () => {
    if (!form.bio.trim()) {
      setError('La bio es obligatoria')
      return
    }
    if (!form.experience_level) {
      setError('Selecciona tu nivel de experiencia')
      return
    }

    setLoading(true)
    const formData = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value)
    })

    await completeOnboarding(formData)
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">

      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-violet-400" />
            <span className="text-2xl font-bold text-white">Zentry</span>
          </div>
          <h1 className="text-white font-semibold text-lg">
            Configura tu perfil creativo
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Solo toma 2 minutos — promesa de artista
          </p>
        </div>

        {/* Indicador de pasos */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 transition-all duration-300 ${
                step === s.id
                  ? 'opacity-100'
                  : step > s.id
                  ? 'opacity-60'
                  : 'opacity-30'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-300 ${
                  step > s.id
                    ? 'bg-violet-600 text-white'
                    : step === s.id
                    ? 'bg-violet-600 text-white ring-4 ring-violet-600/20'
                    : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {step > s.id ? '✓' : s.id}
                </div>
                <span className={`text-xs hidden sm:block ${
                  step === s.id ? 'text-white' : 'text-zinc-500'
                }`}>
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px transition-colors duration-300 ${
                  step > s.id ? 'bg-violet-600' : 'bg-zinc-800'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-3 mb-6">
              {error}
            </div>
          )}

          {/* ── PASO 1: Identidad ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-white font-semibold text-lg">
                  ¿Cómo te llamamos?
                </h2>
                <p className="text-zinc-500 text-sm mt-1">
                  Tu identidad en la comunidad de Zentry
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-sm">
                  Nombre completo o artístico
                </Label>
                <Input
                  placeholder="Ej: María González"
                  value={form.display_name}
                  onChange={e => updateForm('display_name', e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl focus:border-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-sm">
                  Nombre artístico{' '}
                  <span className="text-zinc-600">(opcional)</span>
                </Label>
                <Input
                  placeholder="Ej: Mari Arte"
                  value={form.artistic_name}
                  onChange={e => updateForm('artistic_name', e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl focus:border-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-sm">
                  Username
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                    @
                  </span>
                  <Input
                    placeholder="mariarte"
                    value={form.username}
                    onChange={e => updateForm('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
                    className="pl-8 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl focus:border-violet-500"
                  />
                </div>
                <p className="text-zinc-600 text-xs">
                  Solo letras, números y guiones bajos
                </p>
              </div>
            </div>
          )}

          {/* ── PASO 2: Disciplina ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-white font-semibold text-lg">
                  ¿Cuál es tu disciplina?
                </h2>
                <p className="text-zinc-500 text-sm mt-1">
                  Puedes cambiarla después desde tu perfil
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {DISCIPLINES.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => updateForm('discipline', d.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                      form.discipline === d.value
                        ? 'border-violet-500 bg-violet-500/10 text-white'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">{d.emoji}</span>
                    <span className="text-sm font-medium">{d.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── PASO 3: Sobre ti ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-white font-semibold text-lg">
                  Cuéntanos tu historia
                </h2>
                <p className="text-zinc-500 text-sm mt-1">
                  Esta será tu presentación ante la comunidad
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-sm">
                  Bio
                </Label>
                <Textarea
                  placeholder="Soy una artista visual apasionada por el color y las formas..."
                  value={form.bio}
                  onChange={e => updateForm('bio', e.target.value)}
                  rows={4}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl focus:border-violet-500 resize-none"
                />
                <p className="text-zinc-600 text-xs text-right">
                  {form.bio.length}/300 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">
                  Nivel de experiencia
                </Label>
                <div className="space-y-2">
                  {EXPERIENCE_LEVELS.map(level => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => updateForm('experience_level', level.value)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                        form.experience_level === level.value
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${
                        form.experience_level === level.value
                          ? 'border-violet-500 bg-violet-500'
                          : 'border-zinc-600'
                      }`} />
                      <div>
                        <p className={`text-sm font-medium ${
                          form.experience_level === level.value
                            ? 'text-white'
                            : 'text-zinc-400'
                        }`}>
                          {level.label}
                        </p>
                        <p className="text-zinc-600 text-xs">
                          {level.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navegación */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Atrás
              </Button>
            )}

            {step < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="flex-1 bg-violet-600 hover:bg-violet-500 text-white rounded-xl"
              >
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-violet-600 hover:bg-violet-500 text-white rounded-xl"
              >
                {loading ? 'Guardando...' : '¡Empezar en Zentry! 🎨'}
              </Button>
            )}
          </div>

        </div>
      </div>
    </main>
  )
}
