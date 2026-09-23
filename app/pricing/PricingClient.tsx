"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles, Zap, Crown } from 'lucide-react'
import { toast } from 'sonner'

interface Plan {
  id: string
  name: string
  price: string
  period: string
  badge?: string
  popular?: boolean
  description: string
  features: string[]
  buttonText: string
  buttonVariant: 'default' | 'gradient' | 'pro'
}

const PLANS: Plan[] = [
  {
    id: 'gratuito',
    name: 'Gratuito',
    price: '$0',
    period: 'para siempre',
    description: 'Empieza a compartir tu arte y conectar con la comunidad.',
    features: [
      'Crear y personalizar tu perfil básico',
      'Publicar contenido e inspiraciones',
      'Explorar artistas y portafolios',
      'Unirse a comunidades públicas',
      'Interacción social básica (likes, comentarios)'
    ],
    buttonText: 'Plan Actual',
    buttonVariant: 'default'
  },
  {
    id: 'premium_creador',
    name: 'Premium Creador',
    price: '$9.99',
    period: '/ mes',
    badge: 'Popular entre Creadores',
    popular: true,
    description: 'Aumenta tu alcance, monetiza tu arte y obtén herramientas profesionales.',
    features: [
      'Mayor alcance y visibilidad en el feed',
      'Monetización directa de contenido',
      'Más Zentry Coins diarias (+50% bonus)',
      'Estadísticas y analíticas avanzadas',
      'Herramientas creativas desbloqueadas',
      'Colaboración directa con marcas y proyectos',
      'Perfil con Insignia de Verificado ✓',
      'Acceso anticipado a futuras funciones'
    ],
    buttonText: 'Obtener Premium Creador',
    buttonVariant: 'gradient'
  },
  {
    id: 'premium_pro',
    name: 'Premium PRO',
    price: '$19.99',
    period: '/ mes',
    badge: 'Suite Completa IA',
    description: 'Potencia máxima con IA generativa, colaboraciones exclusivas y promoción.',
    features: [
      'Todo lo incluido en el Plan Creador',
      'Herramientas avanzadas potenciadas con IA',
      'Colaboraciones exclusivas de alto nivel',
      'Acceso prioritario a eventos y concursos',
      'Bolsa mensual máxima de Zentry Coins',
      'Promoción destacada en la portada de Zentry',
      'Soporte técnico y creativo dedicado 24/7'
    ],
    buttonText: 'Desbloquear Premium PRO 🚀',
    buttonVariant: 'pro'
  }
]

export default function PricingClient() {
  // const { user } = useAuth()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleSelectPlan = (plan: Plan) => {
    if (plan.id === 'gratuito') {
      toast.info('Ya estás disfrutando del plan Gratuito.')
      return
    }
    setLoadingPlan(plan.id)
    setTimeout(() => {
      setLoadingPlan(null)
      toast.success(`¡Suscripción a ${plan.name} procesada con éxito!`)
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-[400px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Planes de Suscripción Zentry
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Elige el plan ideal para <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">
              impulsar tu carrera creativa
            </span>
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Sin contratos obligatorios. Cancela o cambia de plan en cualquier momento.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {PLANS.map(plan => {
            const isPro = plan.buttonVariant === 'pro'
            const isGrad = plan.buttonVariant === 'gradient'

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between border transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-b from-[#1c132c] via-[#141220] to-[#0c0a14] border-purple-500/50 shadow-2xl shadow-purple-500/10'
                    : isPro
                    ? 'bg-gradient-to-b from-[#1f1a10] via-[#14120e] to-[#0c0b08] border-amber-500/40 shadow-2xl shadow-amber-500/10'
                    : 'bg-[#121216]/80 border-white/10 backdrop-blur-xl'
                }`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-lg ${
                    isPro
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {isPro && <Crown className="w-5 h-5 text-amber-400" />}
                      {isGrad && <Zap className="w-5 h-5 text-purple-400" />}
                      {plan.name}
                    </h3>
                    <p className="text-zinc-400 text-xs mt-1 min-h-[36px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1 border-b border-white/5 pb-6">
                    <span className="text-4xl sm:text-5xl font-black text-white font-mono">{plan.price}</span>
                    <span className="text-zinc-400 text-sm font-medium">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 text-sm text-zinc-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isPro
                            ? 'bg-amber-500/20 text-amber-400'
                            : isGrad
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={loadingPlan === plan.id}
                    className={`w-full py-4 rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 ${
                      isPro
                        ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-amber-500/20'
                        : isGrad
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/25'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                    }`}
                  >
                    {loadingPlan === plan.id ? 'Procesando...' : plan.buttonText}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
