import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-violet-400" />
            <span className="text-2xl font-bold text-white tracking-tight">Términos de uso</span>
          </div>
          <p className="text-zinc-400 text-sm">Lee los términos que rigen el uso de Zentry.</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6 text-zinc-300">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">1. Uso de la plataforma</h2>
            <p>Al registrarte en Zentry aceptas utilizar la plataforma de forma responsable y cumplir con nuestras políticas.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">2. Contenido del usuario</h2>
            <p>El contenido que publiques es tu responsabilidad. Debe cumplir con las leyes aplicables y no infringir derechos de terceros.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">3. Privacidad</h2>
            <p>Recolectamos información básica para operar el servicio. Consulta nuestra Política de privacidad para más detalles.</p>
          </section>

          <div className="border-t border-zinc-800 pt-4 text-sm text-zinc-500">
            <p>Si necesitas más información, puedes volver a la página de inicio de sesión.</p>
            <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
