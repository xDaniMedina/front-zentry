"use client"

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Loader2 } from "lucide-react";
import { logout } from "@/lib/actions/auth";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bloqueo de scroll y tecla Escape
  useEffect(() => {
    if (!isOpen || !mounted) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoggingOut) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, mounted, isLoggingOut, onClose]);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      document.cookie = "zentry_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax;";
      localStorage.removeItem("zentry_user");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
    setTimeout(() => {
      window.location.href = "/login";
    }, 700);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div 
          onClick={() => !isLoggingOut && onClose()}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-zentry-card border border-red-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden relative text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <LogOut className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <h3 className="text-lg font-black text-zentry-text-1">¿Cerrar Sesión?</h3>
              <p className="text-xs text-zentry-text-2 mt-1.5 leading-relaxed">
                Tu sesión actual en Zentry finalizará de manera segura.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoggingOut}
                className="flex-1 py-3 px-4 rounded-xl border border-zentry-border text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg text-xs font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black hover:opacity-90 transition-all shadow-lg shadow-red-600/25 flex items-center justify-center gap-2"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saliendo...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" /> Sí, Salir
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* PANTALLA ANIMADA DE SALIDA EN PANTALLA COMPLETA */}
      {isLoggingOut && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100000] bg-[#090912]/95 backdrop-blur-xl flex flex-col items-center justify-center space-y-4"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-500 to-orange-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-red-500/25"
          >
            Z
          </motion.div>
          <div className="text-center space-y-1">
            <h4 className="text-base font-extrabold text-white">Cerrando sesión de forma segura...</h4>
            <p className="text-xs text-zentry-text-2 font-mono">¡Hasta pronto, creador! 👋</p>
          </div>
          <div className="w-48 h-1.5 bg-zentry-border rounded-full overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-full h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
