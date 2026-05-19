"use client"

import { useState } from "react";
import { Coins, Trophy, CreditCard, ArrowUpRight, CheckCircle2, Lock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<'coins' | 'subs' | 'achievements'>('coins');

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Coins className="text-yellow-500" /> Billetera y Activos
        </h1>
        <p className="text-zinc-400">Gestiona tus Zentry Coins, suscripciones y logros desbloqueados.</p>
      </header>

      {/* Navegación de Pestañas */}
      <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-zinc-800 w-fit">
        <button 
          onClick={() => setActiveTab('coins')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'coins' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Coins className="w-4 h-4" /> Monedas
        </button>
        <button 
          onClick={() => setActiveTab('subs')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'subs' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <CreditCard className="w-4 h-4" /> Suscripciones
        </button>
        <button 
          onClick={() => setActiveTab('achievements')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'achievements' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Trophy className="w-4 h-4" /> Logros
        </button>
      </div>

      {/* CONTENIDO: PESTAÑA DE MONEDAS */}
      {activeTab === 'coins' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-gradient-to-br from-violet-600 to-fuchsia-700 rounded-3xl p-8 shadow-xl shadow-violet-500/10">
              <p className="text-violet-100 text-sm font-medium mb-1">Balance Total</p>
              <h2 className="text-5xl font-black text-white">1,250 <span className="text-2xl font-normal opacity-80">ZC</span></h2>
              <div className="flex gap-3 mt-6">
                <Button 
                  onClick={() => toast.loading("Conectando con pasarela de pago...", { duration: 2000 })}
                  variant="secondary" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 border transition-all"
                >
                  Recargar
                </Button>
                <Button 
                  onClick={() => toast.error("Debes verificar tu identidad (KYC) antes de retirar fondos.")}
                  variant="secondary" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 border transition-all"
                >
                  Retirar
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h3 className="text-white font-semibold">Actividad Reciente</h3>
            </div>
            <div className="divide-y divide-zinc-800">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-full"><ArrowUpRight className="text-emerald-500 w-4 h-4" /></div>
                    <div>
                      <p className="text-white text-sm font-medium">Recompensa de Proyecto</p>
                      <p className="text-zinc-500 text-xs">Hace 2 horas</p>
                    </div>
                  </div>
                  <p className="text-emerald-400 font-bold">+50 ZC</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO: PESTAÑA DE SUSCRIPCIONES */}
      {activeTab === 'subs' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-zinc-900 border border-violet-500/30 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="flex justify-between items-start relative z-10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold mb-4 uppercase tracking-wider">
                  <Zap className="w-3 h-3" /> Plan Activo
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Zentry Pro</h2>
                <p className="text-zinc-400 text-sm">Próximo cobro: $9.99 el 15 de Junio</p>
              </div>
              <Button 
                onClick={() => toast.success("Enlace de gestión enviado a tu correo.")}
                variant="outline" 
                className="border-zinc-700 text-white hover:bg-zinc-800"
              >
                Gestionar
              </Button>
            </div>
            
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {['Proyectos ilimitados', 'Insignia Pro en tu perfil', 'Soporte prioritario 24/7', 'Sin comisiones en retiros'].map((perk, i) => (
                <div key={i} className="flex items-center gap-3 text-zinc-300 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-violet-500" /> {perk}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO: PESTAÑA DE LOGROS */}
      {activeTab === 'achievements' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
            <h3 className="text-white font-bold mb-1">Primer Paso</h3>
            <p className="text-zinc-500 text-xs mb-4">Completa tu perfil al 100%</p>
            <div className="flex items-center gap-2 text-xs font-medium text-yellow-500 bg-yellow-500/10 w-fit px-2 py-1 rounded-md">
              Desbloqueado
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden opacity-60">
            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-zinc-500" />
            </div>
            <h3 className="text-white font-bold mb-1">Creador Estrella</h3>
            <p className="text-zinc-500 text-xs mb-4">Obtén 1,000 likes en un proyecto</p>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2">
              <div className="bg-zinc-600 h-1.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <p className="text-right text-[10px] text-zinc-500 mt-1">450 / 1,000</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden opacity-60">
            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-zinc-500" />
            </div>
            <h3 className="text-white font-bold mb-1">Networker</h3>
            <p className="text-zinc-500 text-xs mb-4">Únete a 5 comunidades</p>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2">
              <div className="bg-zinc-600 h-1.5 rounded-full" style={{ width: '20%' }}></div>
            </div>
            <p className="text-right text-[10px] text-zinc-500 mt-1">1 / 5</p>
          </div>

        </div>
      )}

    </div>
  );
}