'use client'

import { use } from 'react'
import Link from 'next/link'
import { Mail, Lock, Sparkles } from 'lucide-react'
import { motion, Variants } from 'framer-motion'
import { register } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface RegisterPageProps {
  searchParams: Promise<{ error?: string }>
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = use(searchParams)
  const error = params.error

  return (
    <main className="min-h-screen bg-zentry-bg flex items-center justify-center p-4 transition-colors duration-300 overflow-hidden">

      {/* Fondo decorativo animado */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-zentry-accent/10 rounded-full blur-3xl" />
      </motion.div>

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-zentry-accent" />
            <span className="text-2xl font-bold text-zentry-text-1 tracking-tight">
              Zentry
            </span>
          </div>
          <p className="text-zentry-text-2 text-sm">
            La plataforma para artistas que crean con propósito
          </p>
        </motion.div>

        {/* Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-zentry-card border border-zentry-border rounded-2xl p-8 shadow-2xl shadow-black/10 transition-colors duration-300"
        >
          <h1 className="text-xl font-semibold text-zentry-text-1 mb-2">
            Crea tu cuenta
          </h1>
          <p className="text-zentry-text-2 text-sm mb-6">
            Únete a miles de artistas en Zentry
          </p>

          {/* Error */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-3 mb-6"
            >
              {decodeURIComponent(error)}
            </motion.div>
          )}

          {/* Formulario animado */}
          <motion.form 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            action={register} 
            className="space-y-4"
          >
            <motion.div variants={itemVariants} className="space-y-1.5">
              <Label htmlFor="email" className="text-zentry-text-2 text-sm">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zentry-text-2/70" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="tu@email.com"
                  className="pl-10 bg-zentry-bg border-zentry-border text-zentry-text-1 placeholder:text-zentry-text-2/50 focus:border-zentry-accent focus:ring-zentry-accent/20 rounded-xl transition-colors"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1.5">
              <Label htmlFor="password" className="text-zentry-text-2 text-sm">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zentry-text-2/70" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  className="pl-10 bg-zentry-bg border-zentry-border text-zentry-text-1 placeholder:text-zentry-text-2/50 focus:border-zentry-accent focus:ring-zentry-accent/20 rounded-xl transition-colors"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-zentry-text-2 text-sm">
                Confirmar contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zentry-text-2/70" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="Repite tu contraseña"
                  minLength={8}
                  className="pl-10 bg-zentry-bg border-zentry-border text-zentry-text-1 placeholder:text-zentry-text-2/50 focus:border-zentry-accent focus:ring-zentry-accent/20 rounded-xl transition-colors"
                />
              </div>
            </motion.div>

            {/* Términos animados */}
            <motion.p variants={itemVariants} className="text-xs text-zentry-text-2 leading-relaxed">
              Al registrarte aceptas nuestros{' '}
              <Link href="/terms" className="text-zentry-accent hover:opacity-80 transition-colors">
                Términos de uso
              </Link>{' '}
              y{' '}
              <Link href="/privacy" className="text-zentry-accent hover:opacity-80 transition-colors">
                Política de privacidad
              </Link>
            </motion.p>

            <motion.div variants={itemVariants} className="pt-2">
              <Button
                type="submit"
                className="w-full bg-zentry-accent hover:opacity-90 text-white font-semibold rounded-xl py-2.5 transition-all duration-200"
              >
                Crear cuenta gratis
              </Button>
            </motion.div>
          </motion.form>

          {/* Divider */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.6 }}
            className="flex items-center gap-3 my-6"
          >
            <div className="flex-1 h-px bg-zentry-border" />
            <span className="text-zentry-text-2 text-xs">o</span>
            <div className="flex-1 h-px bg-zentry-border" />
          </motion.div>

          {/* Link a login */}
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.7 }}
            className="text-center text-zentry-text-2 text-sm"
          >
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="text-zentry-accent hover:opacity-80 font-medium transition-colors"
            >
              Inicia sesión
            </Link>
          </motion.p>

        </motion.div>
      </div>
    </main>
  )
}