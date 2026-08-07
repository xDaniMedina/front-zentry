"use client"

import {fetchAPI} from "@/lib/api";
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Mail, Lock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { login } from '@/lib/actions/auth' // Tu server action actual
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const loginSchema = z.object({
  email: z.string().email({ message: "Ingresa un correo válido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null)
    
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)
    try {
      // Llamamos Server Action
      await login(formData) 
    } catch (error) {
      setServerError("Credenciales incorrectas o error de servidor.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-3 mb-4">
          {serverError}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-zinc-300 text-sm">
          Correo electrónico
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            disabled={isSubmitting}
            className={`pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl ${
              errors.email ? 'border-red-500 focus:border-red-500' : ''
            }`}
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
        )}
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
            type="password"
            placeholder="••••••••"
            disabled={isSubmitting}
            className={`pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl ${
              errors.password ? 'border-red-500 focus:border-red-500' : ''
            }`}
            {...register("password")}
          />
        </div>
        {errors.password && (
          <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl py-2.5 transition-all duration-200 mt-2 disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Iniciando...
          </>
        ) : (
          'Iniciar sesión'
        )}
      </Button>
    </form>
  )
}