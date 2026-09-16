'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Sparkles, KeyRound, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<'request' | 'reset'>('request')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await fetch('http://localhost:8080/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()
      if (res.ok) {
        setSuccessMsg(data.message || 'Código de recuperación enviado a tu correo.')
        toast.success("Código enviado a tu correo")
        setStep('reset')
      } else {
        setErrorMsg(data.message || 'No se pudo enviar el código. Verifica tu correo.')
      }
    } catch {
      setErrorMsg('No se pudo conectar con el servidor.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')

    try {
      const res = await fetch('http://localhost:8080/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      })

      const data = await res.json()
      if (res.ok) {
        toast.success("Contraseña restablecida con éxito")
        router.push('/login?reset=success')
      } else {
        setErrorMsg(data.message || 'Código incorrecto o expirado.')
      }
    } catch {
      setErrorMsg('No se pudo conectar con el servidor.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
            <span className="text-3xl font-bold text-white tracking-tight">Zentry</span>
          </div>
          <p className="text-gray-400 text-sm">Recupera el acceso a tu cuenta</p>
        </div>

        <div className="bg-[#141416] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-xl font-bold text-white mb-2">
            {step === 'request' ? '¿Olvidaste tu contraseña?' : 'Restablecer Contraseña'}
          </h1>
          <p className="text-gray-400 text-xs mb-6 leading-relaxed">
            {step === 'request'
              ? 'Ingresa tu correo electrónico y te enviaremos un código de verificación para restablecer tu contraseña.'
              : `Ingresa el código enviado a ${email} y tu nueva contraseña.`}
          </p>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl p-4 mb-6">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-2xl p-4 mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {step === 'request' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-[#09090b] border border-white/10 text-white placeholder:text-gray-600 rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:border-white/30 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black font-bold rounded-2xl py-3.5 hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isLoading ? 'Enviando código...' : 'Enviar código de recuperación'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Código de 6 dígitos"
                  className="w-full bg-[#09090b] border border-white/10 text-white placeholder:text-gray-600 rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:border-white/30 transition-all tracking-widest font-mono"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                  className="w-full bg-[#09090b] border border-white/10 text-white placeholder:text-gray-600 rounded-2xl pl-12 pr-12 py-3.5 text-sm outline-none focus:border-white/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black font-bold rounded-2xl py-3.5 hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
              </button>

              <button
                type="button"
                onClick={() => setStep('request')}
                className="w-full text-xs text-gray-400 hover:text-white transition-colors py-1"
              >
                Solicitar un nuevo código
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-sm text-gray-500">
            <Link href="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
