"use client"
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { fetchAPI, ApiError } from "@/lib/api";
import Link from "next/link";
import { Suspense } from "react";
import { useAuth } from "@/context/AuthContext";

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginState } = useAuth();
  const emailParam = searchParams.get("email") || "";
  
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value !== "" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && code[index] === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    const newCode = [...code];
    pastedData.forEach((char, i) => {
      if (/^\d$/.test(char) && i < 6) {
        newCode[i] = char;
      }
    });
    setCode(newCode);
    const lastFilledIndex = pastedData.length < 6 ? pastedData.length : 5;
    inputsRef.current[lastFilledIndex]?.focus();
  };

  const verifyOTP = async () => {
    const otpString = code.join("");
    if (otpString.length !== 6) {
      toast.error("Por favor ingresa el código completo de 6 dígitos.");
      return;
    }

    setIsLoading(true);
    try {
      // Llamamos a la ruta local (nunca al backend directo desde el navegador):
      // ella lee NEXT_PUBLIC_API_URL en el servidor y deja el JWT en una cookie HTTP-Only.
      const response = await fetch("/api/auth/verify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailParam, code: otpString })
      });
      const data = await response.json();

      if (response.ok && data.token) {
        loginState({ username: data.username, id: data.id, email: emailParam });
        toast.success("¡Cuenta verificada exitosamente!");
        router.push("/feed");
      } else {
        toast.error(data.message || "Código incorrecto o expirado");
      }
    } catch (error) {
      console.error("Error verificando OTP:", error);
      toast.error("Error conectando con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    if (countdown > 0) return;
    setIsResending(true);
    try {
      // Plantilla de reenvío
      await fetchAPI('/api/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email: emailParam })
      });
      toast.success("Nuevo código enviado a tu correo.");
      setCountdown(60);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "No se pudo reenviar el código.";
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] font-sans p-4 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#141416]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10"
      >
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-8 shadow-inner shadow-purple-500/10">
          <ShieldCheck className="w-8 h-8 text-purple-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">Verifica tu cuenta</h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          Hemos enviado un código de 6 dígitos a <br/>
          <span className="text-white font-medium">{emailParam || "tu correo electrónico"}</span>
        </p>

        {/* Inputs del OTP */}
        <div className="flex justify-between gap-2 mb-8">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputsRef.current[index] = el }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-14 sm:w-14 sm:h-16 bg-[#0a0a0c] border border-white/10 rounded-xl text-center text-xl font-black text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all shadow-inner"
            />
          ))}
        </div>

        <button 
          onClick={verifyOTP}
          disabled={isLoading || code.some(d => d === "")}
          className="w-full bg-white text-black font-bold rounded-2xl py-4 hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group mb-6"
        >
          {isLoading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Verificando...</>
          ) : (
            <>Verificar Código <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">¿No recibiste el código?</p>
          <button 
            onClick={resendOTP}
            disabled={countdown > 0 || isResending}
            className="text-purple-400 text-sm font-bold hover:text-purple-300 disabled:text-gray-600 transition-colors flex items-center justify-center gap-1.5 mx-auto"
          >
            {isResending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {countdown > 0 ? `Reenviar código en ${countdown}s` : "Reenviar código"}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <Link href="/login" className="text-xs text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-1">
            Volver al inicio de sesión
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}
