"use client"
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { login } from "@/lib/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const { loginState } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const fd = new FormData();
      fd.set('email', formData.email);
      fd.set('password', formData.password);

      const result = await login(fd);

      if (result.success) {
        loginState(result.user);
        router.push('/feed');
      } else {
        setErrorMsg(result.message || "Credenciales incorrectas o error en el servidor.");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setErrorMsg("No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#09090b] font-sans">
      
      {/* LADO IZQUIERDO: Branding Zentry (Oculto en móviles) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#141416] border-r border-white/5 items-center justify-center p-12">
        {/* Efectos de luz traseros */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />
        
        <div className="relative z-10 w-full max-w-lg">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <Sparkles className="w-8 h-8 text-white" />
            <span className="text-3xl font-bold text-white tracking-tight">Zentry</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold text-white mb-6 leading-tight"
          >
            Bienvenido de vuelta,<br />creador.
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-lg leading-relaxed"
          >
            Continúa construyendo tu portafolio, colaborando con otros artistas y expandiendo tu alcance en la plataforma definitiva para el arte digital.
          </motion.p>
        </div>
      </div>

      {/* LADO DERECHO: Formulario de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-2xl font-bold text-white mb-2">Iniciar sesión</h1>
            <p className="text-gray-400 mb-8">Ingresa tus credenciales para acceder a tu cuenta.</p>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-4 mb-6">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="email" 
                  placeholder="Correo electrónico" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-[#141416] border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-sm text-white outline-none focus:border-white/20 transition-all placeholder:text-gray-600" 
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="password" 
                  placeholder="Contraseña" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-[#141416] border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-sm text-white outline-none focus:border-white/20 transition-all placeholder:text-gray-600" 
                  required
                />
              </div>

              <div className="flex justify-end mt-1 mb-2">
                <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-white transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black font-bold rounded-2xl py-4 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Conectando..." : "Ingresar"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-8">
              ¿No tienes cuenta? <Link href="/register" className="text-white hover:underline font-medium">Regístrate gratis</Link>
            </p>
          </motion.div>
        </div>
      </div>
      
    </div>
  )
}