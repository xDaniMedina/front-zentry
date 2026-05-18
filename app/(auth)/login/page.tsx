import Link from 'next/link'
import { Mail, Lock, Sparkles } from 'lucide-react'
import { login } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const error = params.error

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">

      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-violet-400" />
            <span className="text-2xl font-bold text-white tracking-tight">
              Zentry
            </span>
          </div>
          <p className="text-zinc-400 text-sm">
            Bienvenido de vuelta, artista
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

          <h1 className="text-xl font-semibold text-white mb-6">
            Inicia sesión
          </h1>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-3 mb-6">
              {decodeURIComponent(error)}
            </div>
          )}

          {/* Formulario */}
          <form action={login} className="space-y-4">

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-zinc-300 text-sm">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="tu@email.com"
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-300 text-sm">
                  Contraseña
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-zinc-500 hover:text-violet-400 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl py-2.5 transition-all duration-200 mt-2"
            >
              Iniciar sesión
            </Button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-zinc-600 text-xs">o</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Link a registro */}
          <p className="text-center text-zinc-500 text-sm">
            ¿No tienes cuenta?{' '}
            <Link
              href="/register"
              className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              Regístrate gratis
            </Link>
          </p>

        </div>

        {/* Footer */}
        <p className="text-center text-zinc-600 text-xs mt-6">
          Al continuar aceptas nuestros{' '}
          <Link href="/terms" className="hover:text-zinc-400 transition-colors">
            Términos de uso
          </Link>
        </p>

      </div>
    </main>
  )
}