import Link from 'next/link'
import { ArrowLeft, Mail, Sparkles } from 'lucide-react'

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-violet-400" />
            <span className="text-2xl font-bold text-white tracking-tight">Zentry</span>
          </div>
          <p className="text-zinc-400 text-sm">Recupera el acceso a tu cuenta</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h1 className="text-xl font-semibold text-white mb-4">¿Olvidaste tu contraseña?</h1>
          <p className="text-zinc-500 text-sm mb-6">
            Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña.
          </p>

          <form className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-zinc-300 text-sm block">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="tu@email.com"
                  className="w-full pl-10 bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl py-3 focus:border-violet-500 focus:ring-violet-500/20 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl py-3 transition-all duration-200"
            >
              Enviar instrucciones
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-500">
            <Link href="/login" className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Volver al login
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
