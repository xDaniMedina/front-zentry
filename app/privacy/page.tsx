import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-violet-400" />
            <span className="text-2xl font-bold text-white tracking-tight">Política de privacidad</span>
          </div>
          <p className="text-zinc-400 text-sm">Conoce cómo protegemos tu información personal.</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6 text-zinc-300">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">1. Qué datos recolectamos</h2>
            <p>Capturamos información básica como correo electrónico y datos de perfil para brindarte el servicio.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">2. Uso de la información</h2>
            <p>Utilizamos tus datos para autenticarte, mejorar la experiencia y enviarte notificaciones relevantes.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">3. Seguridad</h2>
            <p>Implementamos medidas para proteger tu información según buenas prácticas del sector.</p>
          </section>

          <div className="border-t border-zinc-800 pt-4 text-sm text-zinc-500">
            <p>Si deseas volver al inicio, puedes regresar al login.</p>
            <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
