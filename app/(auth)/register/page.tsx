import Link from 'next/link'
import { Mail, Lock, Sparkles } from 'lucide-react'
import { register } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface RegisterPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
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
            La plataforma para artistas que crean con propósito
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

          <h1 className="text-xl font-semibold text-white mb-2">
            Crea tu cuenta
          </h1>
          <p className="text-zinc-500 text-sm mb-6">
            Únete a miles de artistas en Zentry
          </p>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-3 mb-6">
              {decodeURIComponent(error)}
            </div>
          )}

          {/* Formulario */}
          <form action={register} className="space-y-4">

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
              <Label htmlFor="password" className="text-zinc-300 text-sm">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-zinc-300 text-sm">
                Confirmar contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="Repite tu contraseña"
                  minLength={8}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl"
                />
              </div>
            </div>

            {/* Términos */}
            <p className="text-xs text-zinc-500 leading-relaxed">
              Al registrarte aceptas nuestros{' '}
              <Link href="/terms" className="text-violet-400 hover:text-violet-300 transition-colors">
                Términos de uso
              </Link>{' '}
              y{' '}
              <Link href="/privacy" className="text-violet-400 hover:text-violet-300 transition-colors">
                Política de privacidad
              </Link>
            </p>

            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl py-2.5 transition-all duration-200"
            >
              Crear cuenta gratis
            </Button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-zinc-600 text-xs">o</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Link a login */}
          <p className="text-center text-zinc-500 text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              Inicia sesión
            </Link>
          </p>

        </div>
      </div>
    </main>
  )
}