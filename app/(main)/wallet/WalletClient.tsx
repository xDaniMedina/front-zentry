"use client"

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { Wallet, ArrowUpRight, ArrowDownLeft, Send, Plus, History, Zap, CreditCard, X, CheckCircle2 } from "lucide-react";

export type Transaction = { id: string; type: 'ingreso' | 'egreso'; amount: number; description: string; date: string; }
export type Subscription = { id: string; name: string; cost: number; cycle: string; nextBilling: string; features: string[] }

export type WalletData = { balance: number; transactions: Transaction[]; subscriptions: Subscription[]; }

const FALLBACK_WALLET: WalletData = {
  balance: 1250.50,
  transactions: [
    { id: 't1', type: 'ingreso', amount: 350, description: 'Venta de obra: Raíces', date: 'Hoy, 10:30 AM' },
    { id: 't2', type: 'egreso', amount: 15, description: 'Suscripción Zentry Pro', date: 'Ayer, 14:00 PM' },
  ],
  subscriptions: [
    { id: 's1', name: 'Zentry Pro', cost: 15, cycle: 'Mensual', nextBilling: '12 Sep 2026', features: ['Sin comisiones por venta', 'Insignia de perfil Pro', 'Soporte prioritario 24/7', 'Almacenamiento ilimitado'] },
  ]
};

const containerVariants: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }

export default function WalletClient({ initialData }: { initialData: WalletData | null }) {
  const [data, setData] = useState<WalletData>(initialData || FALLBACK_WALLET);
  
  // Nuevo estado para las pestañas
  const [activeTab, setActiveTab] = useState<'general' | 'subscriptions'>('general');
  const [activeModal, setActiveModal] = useState<'send' | 'topup' | 'cancelSub' | 'viewPlans' | null>(null);


  
  return (

    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-24">
      
      {/* Cabecera */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-zentry-text-1 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zentry-bg border border-zentry-border flex items-center justify-center">
            <Wallet className="w-5 h-5 text-zentry-text-1" />
          </div>
          Billetera
        </h1>
      </div>

      {/* Pestañas (Tabs) */}
      <div className="flex gap-6 border-b border-zentry-border mb-8">
        <button onClick={() => setActiveTab('general')} className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'general' ? 'text-zentry-text-1' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}>
          Balance e Historial
          {activeTab === 'general' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zentry-text-1 rounded-t-full" />}
        </button>
        <button onClick={() => setActiveTab('subscriptions')} className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'subscriptions' ? 'text-zentry-text-1' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}>
          Suscripciones Zentry
          {activeTab === 'subscriptions' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zentry-text-1 rounded-t-full" />}
        </button>
      </div>

      {activeTab === 'general' ? (
        <>
          {/* Tarjeta de Balance */}
          <div className="bg-zentry-card border border-zentry-border rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-zentry-text-2 mb-1">Balance Total</p>
              <div className="flex items-end gap-2">
                <h2 className="text-4xl sm:text-5xl font-bold text-zentry-text-1">{data.balance.toLocaleString()}</h2>
                <span className="text-xl font-medium text-zentry-text-2 mb-1">ZC</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setActiveModal('send')} className="flex items-center gap-2 bg-zentry-text-1 text-zentry-bg font-semibold px-6 py-3 rounded-xl hover:opacity-90">
                <Send className="w-4 h-4" /> Enviar
              </button>
              <button onClick={() => setActiveModal('topup')} className="flex items-center gap-2 bg-zentry-bg border border-zentry-border text-zentry-text-1 font-semibold px-6 py-3 rounded-xl hover:bg-zentry-border">
                <Plus className="w-4 h-4" /> Recargar
              </button>
            </div>
          </div>

          {/* Historial */}
          <div className="bg-zentry-card border border-zentry-border rounded-3xl p-6">
            <h3 className="font-bold text-zentry-text-1 mb-6 flex items-center gap-2"><History className="w-5 h-5" /> Actividad Reciente</h3>
            <div className="flex flex-col gap-4">
              {data.transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl border border-zentry-border hover:bg-zentry-bg transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${tx.type === 'ingreso' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-zentry-card border-zentry-border text-zentry-text-1'}`}>
                      {tx.type === 'ingreso' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zentry-text-1">{tx.description}</p>
                      <p className="text-xs text-zentry-text-2">{tx.date}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold ${tx.type === 'ingreso' ? 'text-green-500' : 'text-zentry-text-1'}`}>
                    {tx.type === 'ingreso' ? '+' : '-'}{tx.amount} ZC
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Pestaña de Suscripciones */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.subscriptions.map(sub => (
            <div key={sub.id} className="bg-zentry-card border-2 border-zentry-accent/50 relative rounded-3xl p-6 overflow-hidden">
              <div className="absolute top-0 right-0 bg-zentry-accent text-white text-xs font-bold px-4 py-1 rounded-bl-xl">ACTIVA</div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-zentry-accent/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-zentry-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-zentry-text-1 text-xl">{sub.name}</h3>
                  <p className="text-sm text-zentry-text-2">Tu plan actual</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-zentry-text-1">{sub.cost}</span>
                <span className="text-zentry-text-2"> ZC / {sub.cycle}</span>
                <p className="text-xs text-zentry-text-2 mt-2">Próximo cobro automático: <span className="text-zentry-text-1">{sub.nextBilling}</span></p>
              </div>

              <div className="flex flex-col gap-3 mb-8">
                {sub.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-zentry-text-1">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> {feature}
                  </div>
                ))}
              </div>

              <button onClick={() => setActiveModal ('cancelSub')}  className="w-full py-3 bg-zentry-bg border border-zentry-border text-red-500 rounded-xl font-medium hover:bg-red-500/10 transition-colors">
                Cancelar Suscripción
              </button>
            </div>
          ))}
          
          {/* Tarjeta Promocional para otro Plan */}
          <div className="bg-zentry-card border border-zentry-border rounded-3xl p-6 flex flex-col justify-center items-center text-center">
            <CreditCard className="w-12 h-12 text-zentry-text-2 mb-4" />
            <h3 className="font-bold text-zentry-text-1 mb-2">Zentry Teams</h3>
            <p className="text-sm text-zentry-text-2 mb-6">Para estudios creativos y equipos. Herramientas avanzadas de colaboración.</p>
            <button onClick={() => setActiveModal('viewPlans') }  className="px-6 py-2 bg-zentry-text-1 text-zentry-bg rounded-xl font-bold">Ver Planes</button>
          </div>
        </div>
      )}

      {activeModal === 'cancelSub' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 p-6">
            <h3 className="text-xl font-bold text-zentry-text-1 mb-2">¿Cancelar Zentry Pro?</h3>
            <p className="text-sm text-zentry-text-2 mb-6">
              Perderás acceso a tus beneficios Pro, como el almacenamiento ilimitado y 0% de comisiones, al final de tu ciclo de facturación actual. ¿Estás seguro?
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setActiveModal(null)} className="w-full py-3 font-semibold text-zentry-bg bg-zentry-text-1 rounded-xl hover:opacity-90">
                Conservar mi plan
              </button>
              <button onClick={() => { setActiveModal(null); alert('Suscripción cancelada'); }} className="w-full py-3 font-semibold text-red-500 bg-zentry-bg border border-zentry-border rounded-xl hover:bg-red-500/10 transition-colors">
                Sí, cancelar suscripción
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VER PLANES */}
      {activeModal === 'viewPlans' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zentry-border flex justify-between items-center bg-zentry-bg">
              <h3 className="text-xl font-bold text-zentry-text-1">Planes Zentry</h3>
              <button onClick={() => setActiveModal(null)} className="text-zentry-text-2 hover:text-zentry-text-1"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
               {/* Plan Actual */}
               <div className="border border-zentry-border rounded-3xl p-6 bg-zentry-bg flex flex-col">
                  <h4 className="font-bold text-xl text-zentry-text-1">Zentry Pro</h4>
                  <p className="text-3xl font-bold text-zentry-text-1 my-3">15 <span className="text-base font-normal text-zentry-text-2">ZC / mes</span></p>
                  <ul className="text-sm text-zentry-text-2 space-y-3 mb-6 flex-1">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> 0% Comisiones por venta</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Insignia de perfil Pro</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Almacenamiento ilimitado</li>
                  </ul>
                  <button disabled className="w-full py-3 bg-zentry-card border border-zentry-border rounded-xl text-zentry-text-2 font-medium cursor-not-allowed">
                    Plan Actual
                  </button>
               </div>

               {/* Plan Teams */}
               <div className="border-2 border-zentry-accent rounded-3xl p-6 bg-zentry-card relative flex flex-col shadow-lg shadow-zentry-accent/5">
                  <div className="absolute top-0 right-6 bg-zentry-accent text-white text-xs font-bold px-3 py-1 rounded-b-lg">RECOMENDADO</div>
                  <h4 className="font-bold text-xl text-zentry-text-1">Zentry Teams</h4>
                  <p className="text-3xl font-bold text-zentry-text-1 my-3">45 <span className="text-base font-normal text-zentry-text-2">ZC / mes</span></p>
                  <ul className="text-sm text-zentry-text-2 space-y-3 mb-6 flex-1">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-zentry-accent"/> Hasta 5 colaboradores</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-zentry-accent"/> Espacios de trabajo compartidos</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-zentry-accent"/> Soporte dedicado 24/7</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-zentry-accent"/> Estadísticas avanzadas</li>
                  </ul>
                  <button className="w-full py-3 bg-zentry-text-1 text-zentry-bg rounded-xl font-bold hover:opacity-90 transition-opacity">
                    Actualizar a Teams
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}



    </motion.div>
  );
}

