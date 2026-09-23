"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, ArrowLeft, Check, Calendar, User, Briefcase, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { fetchAPI } from '@/lib/api'

interface OnboardingForm {
  display_name: string
  artistic_name: string
  username: string
  birth_date: string
  discipline: string
  specialties: string[]
  bio: string
  experience_level: string
}

const DISCIPLINES = [
  { value: 'ilastracion', label: 'Ilustración Digital', emoji: '🎨' },
  { value: '3d_design', label: 'Diseño 3D & VFX', emoji: '🎬' },
  { value: 'ui_ux', label: 'UI/UX & Product Design', emoji: '📱' },
  { value: 'animation', label: 'Animación 2D/3D', emoji: '✨' },
  { value: 'music_audio', label: 'Música & Producción Audio', emoji: '🎵' },
  { value: 'game_dev', label: 'Desarrollo de Videojuegos', emoji: '🎮' },
  { value: 'software_dev', label: 'Desarrollo Web & Código', emoji: '💻' },
  { value: 'photography', label: 'Fotografía & Arte Visual', emoji: '📷' }
]

const EXPERIENCE_LEVELS = [
  { value: 'principiante', label: 'Explorador / Principiante', desc: 'Empezando en el mundo creativo' },
  { value: 'intermedio', label: 'Creador Intermedio', desc: 'Con proyectos y portfolio en marcha' },
  { value: 'avanzado', label: 'Profesional / Avanzado', desc: 'Experto en la industria' }
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, updateUser } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState<OnboardingForm>({
    display_name: user?.name || '',
    artistic_name: '',
    username: user?.username ? user.username.replace(/^@/, '') : '',
    birth_date: '',
    discipline: 'ilastracion',
    specialties: ['Ilustración Digital'],
    bio: '',
    experience_level: 'intermedio'
  })

  const updateForm = (key: keyof OnboardingForm, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const toggleSpecialty = (label: string) => {
    setForm(prev => {
      const exists = prev.specialties.includes(label)
      const nextSpecialties = exists
        ? prev.specialties.filter(s => s !== label)
        : [...prev.specialties, label]
      return {
        ...prev,
        specialties: nextSpecialties.length > 0 ? nextSpecialties : [label]
      }
    })
  }

  const nextStep = () => {
    if (step === 1) {
      if (!form.username.trim()) {
        toast.error('El nombre de usuario es obligatorio')
        return
      }
      if (!form.birth_date) {
        toast.error('Por favor ingresa tu fecha de nacimiento')
        return
      }
    }
    setStep(prev => Math.min(prev + 1, 3))
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        name: form.display_name || form.username,
        artisticName: form.artistic_name,
        username: form.username.toLowerCase().replace(/\s/g, ''),
        birthDate: form.birth_date,
        discipline: form.discipline,
        specialties: form.specialties.join(', '),
        bio: form.bio,
        experienceLevel: form.experience_level,
        onboardingCompleted: true
      }

      await fetchAPI('/api/core/profiles/me', {
        method: 'PUT',
        body: JSON.stringify(payload)
      }).catch(async () => {
        return fetchAPI('/api/core/profiles', {
          method: 'POST',
          body: JSON.stringify(payload)
        })
      })

      updateUser({
        name: payload.name,
        username: payload.username,
        onboardingCompleted: true
      })

      toast.success('¡Perfil configurado con éxito! Bienvenido a Zentry 🚀')
      router.push('/feed')
    } catch (error) {
      console.error('Error al guardar perfil de onboarding:', error)
      toast.error('No se pudo guardar el perfil. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-xl bg-[#141416]/90 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span className="font-bold text-xl text-white tracking-tight">Zentry Onboarding</span>
          </div>
          <span className="text-xs text-zinc-400 font-medium bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            Paso {step} de 3
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800 h-2 rounded-full mb-8 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full"
            initial={{ width: '33%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* STEP 1: Identidad & Datos Básicos */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <User className="w-6 h-6 text-purple-400" /> Configura tu identidad
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                Ingresa tus datos básicos para darte a conocer en la red.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-300 text-xs font-semibold uppercase tracking-wider">Nombre de Usuario (@handle)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">@</span>
                <input
                  type="text"
                  placeholder="tu_nombre_usuario"
                  value={form.username}
                  onChange={e => updateForm('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
                  className="w-full bg-[#0a0a0c] border border-zinc-700 focus:border-purple-500 text-white rounded-xl pl-9 pr-4 py-3 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-zinc-300 text-xs font-semibold uppercase tracking-wider">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej: Sofía Ramírez"
                  value={form.display_name}
                  onChange={e => updateForm('display_name', e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-zinc-700 focus:border-purple-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 text-xs font-semibold uppercase tracking-wider">Nombre Artístico</label>
                <input
                  type="text"
                  placeholder="Ej: SofiArt 3D"
                  value={form.artistic_name}
                  onChange={e => updateForm('artistic_name', e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-zinc-700 focus:border-purple-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-300 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-400" /> Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={form.birth_date}
                onChange={e => updateForm('birth_date', e.target.value)}
                className="w-full bg-[#0a0a0c] border border-zinc-700 focus:border-purple-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-all"
              />
            </div>
          </motion.div>
        )}

        {/* STEP 2: Especialidades & Disciplinas */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-purple-400" /> Disciplinas y Especialidades
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                Selecciona una o más especialidades con las que te identifiques.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {DISCIPLINES.map(d => {
                const isSelected = form.specialties.includes(d.label)
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => {
                      updateForm('discipline', d.value)
                      toggleSpecialty(d.label)
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/15 text-white shadow-lg shadow-purple-500/10'
                        : 'border-zinc-800 bg-[#0a0a0c] text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{d.emoji}</span>
                      <span className="text-sm font-semibold">{d.label}</span>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-black">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* STEP 3: Biografía & Nivel de Experiencia */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-400" /> Tu Biografía y Experiencia
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                Preséntate a la comunidad de creadores de Zentry.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-300 text-xs font-semibold uppercase tracking-wider">Biografía</label>
              <textarea
                placeholder="Escribe un breve resumen sobre tus intereses, proyectos o estilo..."
                value={form.bio}
                onChange={e => updateForm('bio', e.target.value)}
                rows={4}
                className="w-full bg-[#0a0a0c] border border-zinc-700 focus:border-purple-500 text-white rounded-xl p-4 text-sm outline-none transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-zinc-300 text-xs font-semibold uppercase tracking-wider">Nivel de Experiencia</label>
              <div className="space-y-2">
                {EXPERIENCE_LEVELS.map(level => {
                  const isSel = form.experience_level === level.value
                  return (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => updateForm('experience_level', level.value)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        isSel ? 'border-purple-500 bg-purple-500/10' : 'border-zinc-800 bg-[#0a0a0c] hover:border-zinc-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSel ? 'border-purple-500 bg-purple-500' : 'border-zinc-600'
                      }`} />
                      <div>
                        <p className={`text-sm font-semibold ${isSel ? 'text-white' : 'text-zinc-400'}`}>{level.label}</p>
                        <p className="text-zinc-500 text-xs">{level.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Buttons Nav */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl py-3.5 text-sm transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Atrás
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl py-3.5 text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
            >
              Siguiente <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl py-3.5 text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-600/20"
            >
              {loading ? 'Guardando Perfil...' : '¡Completar y Entrar! 🚀'}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
