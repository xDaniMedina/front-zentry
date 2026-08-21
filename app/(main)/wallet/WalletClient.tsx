"use client"

import { useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, Send, Plus, History, 
  Zap, CreditCard, X, CheckCircle2, Crown, Sparkles, ShieldCheck, 
  Tv, Film, AlertCircle, RefreshCw, Check, Star, Lock
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export type Transaction = { 
  id: string; 
  type: 'ingreso' | 'egreso' | 'recarga'; 
  amount: number; 
  description: string; 
  date: string; 
}

export type SubscriptionPlan = {
  id: string;
  name: string;
  tagline: string;
  monthlyCost: number;
  annualCost: number;
  badge?: string;
  isPopular?: boolean;
  color: string;
  features: string[];
}

export type WalletData = { 
  balance: number; 
  activePlanId: string;
  nextBillingDate: string;
  transactions: Transaction[]; 
}

const FALLBACK_WALLET: WalletData = {
  balance: 1250.50,
  activePlanId: 'pro',
  nextBillingDate: '15 de Septiembre, 2026',
  transactions: [
    { id: 't1', type: 'recarga', amount: 500, description: 'Recarga de Zentry Coins', date: 'Hoy, 10:30 AM' },
    { id: 't2', type: 'egreso', amount: 15, description: 'Suscripción Zentry PRO (Mensual)', date: 'Ayer, 14:00 PM' },
    { id: 't3', type: 'ingreso', amount: 350, description: 'Venta de Obra: Raíces Cyberpunk', date: 'Hace 3 días' },
    { id: 't4', type: 'egreso', amount: 45, description: 'Remezcla de Arte 3D', date: 'Hace 1 semana' },
  ]
};

const PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Zentry Free',
    tagline: 'Para creadores casuales y exploradores',
    monthlyCost: 0,
    annualCost: 0,
    color: 'from-gray-800 to-gray-900 border-zentry-border',
    features: [
      'Acceso básico al Estudio (1 proyecto activo)',
      'Exportación en resolución estándar (720p/HD)',
      'Soporte comunitario',
      'Comisión del 10% en ventas de obras'
    ]
  },
  {
    id: 'pro',
    name: 'Zentry PRO',
    tagline: 'Experiencia ilimitada para creadores digitales',
    monthlyCost: 15,
    annualCost: 12,
    badge: 'MÁS POPULAR ⚡',
    isPopular: true,
    color: 'from-purple-900/60 via-zentry-card to-blue-900/60 border-zentry-accent',
    features: [
      'Proyectos e Historias Ilimitadas (Canva / Word)',
      'Exportación en 4K Ultra HD sin marca de agua',
      'Insignia de Creador Verificado ⚡ en tu perfil',
      '+500 ZC de bonificación de registro mensual',
      '0% de comisiones por venta en la plataforma',
      'Acceso a plantillas exclusivas y herramientas de IA'
    ]
  },
  {
    id: 'vip',
    name: 'Studio VIP',
    tagline: 'Para estudios profesionales y equipos creativos',
    monthlyCost: 45,
    annualCost: 36,
    badge: 'RECOMENDADO VIP 👑',
    color: 'from-amber-900/60 via-zentry-card to-purple-900/60 border-amber-500/80',
    features: [
      'Todo lo incluido en el Plan Zentry PRO',
      'Editor de Video & Audio ilimitado (YouTube Studio / DAW)',
      'Insignia Dorada VIP 👑 en tu perfil y comentarios',
      'Espacios de trabajo colaborativos (hasta 5 miembros)',
      'Soporte prioritario 24/7 con atención personalizada',
      'Remezclas ilimitadas y derechos comerciales completos'
    ]
  }
];

const containerVariants: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }

export default function WalletClient({ initialData }: { initialData: WalletData | null }) {
  const { user } = useAuth();
  const [data, setData] = useState<WalletData>(initialData || FALLBACK_WALLET);
  
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [activeTab, setActiveTab] = useState<'plans' | 'balance' | 'history'>('plans');
  const [activeModal, setActiveModal] = useState<'send' | 'topup' | 'confirmSub' | 'cancelSub' | null>(null);
  
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<SubscriptionPlan | null>(null);
  const [sendRecipient, setSendRecipient] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [topupAmount, setTopupAmount] = useState(500);

  const activePlan = PLANS.find(p => p.id === data.activePlanId) || PLANS[1];

  // Acción para cambiar de plan de suscripción
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.id === data.activePlanId) {
      toast.info(`Ya tienes activo el plan ${plan.name}`);
      return;
    }
    setSelectedPlanForModal(plan);
    setActiveModal('confirmSub');
  };

  const handleConfirmSubscription = async () => {
    if (!selectedPlanForModal) return;

    const cost = billingCycle === 'annual' ? selectedPlanForModal.annualCost * 12 : selectedPlanForModal.monthlyCost;

    if (cost > data.balance && selectedPlanForModal.id !== 'free') {
      toast.error(`Saldo insuficiente (${data.balance} ZC). Necesitas ${cost} ZC para este plan.`);
      setActiveModal('topup');
      return;
    }

    try {
      const tokenMatch = document.cookie.match(new RegExp('(^| )zentry_token=([^;]+)'));
      const clientToken = tokenMatch ? tokenMatch[2] : null;
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, "");

      await fetch(`${apiBase}/api/core/wallet/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(clientToken ? { 'Authorization': `Bearer ${clientToken}` } : {})
        },
        body: JSON.stringify({ planId: selectedPlanForModal.id, cycle: billingCycle })
      });

      setData(prev => ({
        ...prev,
        activePlanId: selectedPlanForModal.id,
        balance: Math.max(0, prev.balance - cost),
        transactions: [
          {
            id: `t-${Date.now()}`,
            type: 'egreso',
            amount: cost,
            description: `Suscripción ${selectedPlanForModal.name} (${billingCycle === 'annual' ? 'Anual' : 'Mensual'})`,
            date: 'Justo ahora'
          },
          ...prev.transactions
        ]
      }));

      toast.success(`¡Felicidades! Ahora estás suscrito a ${selectedPlanForModal.name}`);
      setActiveModal(null);
    } catch (err) {
      console.error("Error al actualizar suscripción:", err);
      setData(prev => ({ ...prev, activePlanId: selectedPlanForModal.id }));
      toast.success(`Plan ${selectedPlanForModal.name} activado`);
      setActiveModal(null);
    }
  };

  // Enviar Zentry Coins
  const handleSendCoins = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(sendAmount);
    if (!sendRecipient || !amountNum || amountNum <= 0) {
      toast.error("Por favor, ingresa un destinatario y monto válido.");
      return;
    }
    if (amountNum > data.balance) {
      toast.error("Saldo insuficiente en tu billetera.");
      return;
    }

    setData(prev => ({
      ...prev,
      balance: prev.balance - amountNum,
      transactions: [
        {
          id: `t-${Date.now()}`,
          type: 'egreso',
          amount: amountNum,
          description: `Transferencia enviada a @${sendRecipient.replace('@', '')}`,
          date: 'Justo ahora'
        },
        ...prev.transactions
      ]
    }));

    toast.success(`¡Enviados ${amountNum} ZC a @${sendRecipient}!`);
    setSendRecipient("");
    setSendAmount("");
    setActiveModal(null);
  };

  // Recargar Saldo
  const handleTopup = () => {
    setData(prev => ({
      ...prev,
      balance: prev.balance + topupAmount,
      transactions: [
        {
          id: `t-${Date.now()}`,
          type: 'recarga',
          amount: topupAmount,
          description: `Recarga de saldo en Billetera`,
          date: 'Justo ahora'
        },
        ...prev.transactions
      ]
    }));

    toast.success(`¡Recarga exitosa! Se añadieron +${topupAmount} ZC a tu balance`);
    setActiveModal(null);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-24 space-y-8">
      
      {/* BANNER ESTILO PLATAFORMA STREAMING / NETFLIX / CRUNCHYROLL */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-purple-950 via-zentry-card to-indigo-950 border border-zentry-border overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zentry-accent/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-extrabold tracking-wider text-zentry-accent uppercase bg-zentry-accent/20 px-3 py-1 rounded-full border border-zentry-accent/30 inline-flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" /> PLAN ACTUAL: {activePlan.name.toUpperCase()}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-zentry-text-1 tracking-tight">
              Billetera & Membresías Zentry
            </h1>

            <p className="text-xs sm:text-sm text-zentry-text-2 leading-relaxed">
              Disfruta de ventajas exclusivas como en tus plataformas de streaming favoritas: Exportaciones en 4K, 0% comisiones, bonificaciones mensuales y almacenamiento ilimitado.
            </p>
          </div>

          {/* Tarjeta de Saldo Rápido */}
          <div className="bg-zentry-bg/80 border border-zentry-border/80 backdrop-blur-md rounded-2xl p-5 shrink-0 space-y-3 min-w-[260px] shadow-lg">
            <span className="text-xs font-bold text-zentry-text-2 uppercase tracking-wider block">Saldo Disponible</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-zentry-text-1">{data.balance.toLocaleString()}</span>
              <span className="text-sm font-extrabold text-zentry-accent font-mono">ZC</span>
            </div>

            <div className="flex gap-2 pt-1">
              <button 
                onClick={() => setActiveModal('topup')}
                className="flex-1 py-2 bg-zentry-text-1 text-zentry-bg rounded-xl text-xs font-extrabold hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Recargar
              </button>
              <button 
                onClick={() => setActiveModal('send')}
                className="flex-1 py-2 bg-zentry-card border border-zentry-border text-zentry-text-1 rounded-xl text-xs font-extrabold hover:bg-zentry-border transition-colors flex items-center justify-center gap-1"
              >
                <Send className="w-3.5 h-3.5 text-zentry-accent" /> Enviar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN */}
      <div className="flex items-center gap-4 border-b border-zentry-border pb-1">
        {[
          { id: 'plans', label: 'Planes & Membresías', icon: Zap },
          { id: 'balance', label: 'Balance & Recargas', icon: Wallet },
          { id: 'history', label: 'Historial de Transacciones', icon: History },
        ].map(tab => {
          const IconComp = tab.icon;
          const tabId = tab.id as 'plans' | 'balance' | 'history';
          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tabId)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                activeTab === tab.id 
                  ? 'bg-zentry-accent text-white shadow-md shadow-zentry-accent/20' 
                  : 'text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-card'
              }`}
            >
              <IconComp className="w-4 h-4" /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* SECCIÓN 1: PLANES & MEMBRESÍAS ESTILO NETFLIX / CRUNCHYROLL */}
      {activeTab === 'plans' && (
        <div className="space-y-8">
          
          {/* Selector de Ciclo de Facturación (Mensual vs Anual) */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-zentry-text-1' : 'text-zentry-text-2'}`}>
              Facturación Mensual
            </span>
            
            <button 
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
              className="w-14 h-8 bg-zentry-card border border-zentry-border rounded-full p-1 transition-colors relative"
            >
              <div className={`w-6 h-6 rounded-full bg-zentry-accent transition-transform ${billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>

            <span className={`text-xs font-bold flex items-center gap-1.5 ${billingCycle === 'annual' ? 'text-zentry-text-1' : 'text-zentry-text-2'}`}>
              Facturación Anual 
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                Ahorra 20%
              </span>
            </span>
          </div>

          {/* Grid de Tarifas estilo SaaS Streaming */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => {
              const isCurrent = data.activePlanId === plan.id;
              const costDisplay = billingCycle === 'annual' ? plan.annualCost : plan.monthlyCost;

              return (
                <div 
                  key={plan.id}
                  className={`bg-gradient-to-b ${plan.color} border-2 rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative shadow-xl transition-all ${
                    plan.isPopular ? 'scale-105 z-10' : 'hover:border-zentry-accent/60'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute top-0 right-6 bg-zentry-accent text-white font-black text-[10px] px-3 py-1 rounded-b-xl uppercase tracking-wider shadow-md">
                      {plan.badge}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-black text-zentry-text-1">{plan.name}</h3>
                      <p className="text-xs text-zentry-text-2 mt-1 leading-relaxed">{plan.tagline}</p>
                    </div>

                    <div className="py-2 border-y border-zentry-border/60">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-zentry-text-1">{costDisplay}</span>
                        <span className="text-sm font-bold text-zentry-accent font-mono">ZC / mes</span>
                      </div>
                      <span className="text-[10px] text-zentry-text-2">
                        {billingCycle === 'annual' ? `Cobrado anualmente (${costDisplay * 12} ZC/año)` : 'Facturado mes a mes'}
                      </span>
                    </div>

                    {/* Ventajas del Plan */}
                    <div className="space-y-2.5 pt-2">
                      <span className="text-xs font-bold text-zentry-text-1 uppercase tracking-wider block">Ventajas Incluidas:</span>
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-zentry-text-2 leading-tight">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-zentry-border/60">
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isCurrent}
                      className={`w-full py-3.5 rounded-2xl text-xs font-black transition-all shadow-md ${
                        isCurrent 
                          ? 'bg-zentry-card border border-zentry-border text-emerald-400 cursor-default flex items-center justify-center gap-2' 
                          : plan.isPopular
                            ? 'bg-zentry-accent text-white hover:opacity-90'
                            : 'bg-zentry-text-1 text-zentry-bg hover:opacity-90'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <Check className="w-4 h-4" /> Plan Activo
                        </>
                      ) : (
                        `Seleccionar ${plan.name}`
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* SECCIÓN 2: BALANCE & ACCIONES */}
      {activeTab === 'balance' && (
        <div className="space-y-6">
          <div className="bg-zentry-card border border-zentry-border rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="font-extrabold text-zentry-text-1 text-lg flex items-center gap-2">
              <Wallet className="w-5 h-5 text-zentry-accent" /> Resumen de Balance
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zentry-bg p-5 rounded-2xl border border-zentry-border space-y-1">
                <span className="text-xs text-zentry-text-2 font-bold uppercase">Balance Zentry Coins</span>
                <p className="text-3xl font-black text-zentry-text-1">{data.balance.toLocaleString()} ZC</p>
                <p className="text-[11px] text-zentry-text-2">Equivalente aprox: ${(data.balance * 0.02).toFixed(2)} USD</p>
              </div>

              <div className="bg-zentry-bg p-5 rounded-2xl border border-zentry-border space-y-1">
                <span className="text-xs text-zentry-text-2 font-bold uppercase">Próximo Cobro de Membresía</span>
                <p className="text-lg font-extrabold text-zentry-accent">{data.nextBillingDate}</p>
                <p className="text-[11px] text-zentry-text-2">Plan {activePlan.name} ({activePlan.monthlyCost} ZC)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 3: HISTORIAL DE TRANSACCIONES */}
      {activeTab === 'history' && (
        <div className="bg-zentry-card border border-zentry-border rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="font-extrabold text-zentry-text-1 text-lg flex items-center gap-2">
            <History className="w-5 h-5 text-zentry-accent" /> Historial de Movimientos
          </h3>

          <div className="space-y-3">
            {data.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl border border-zentry-border bg-zentry-bg/60 hover:bg-zentry-bg transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    tx.type === 'ingreso' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    tx.type === 'recarga' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {tx.type === 'ingreso' ? <ArrowDownLeft className="w-5 h-5" /> :
                     tx.type === 'recarga' ? <Plus className="w-5 h-5" /> :
                     <ArrowUpRight className="w-5 h-5" />}
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm font-extrabold text-zentry-text-1">{tx.description}</p>
                    <p className="text-[10px] text-zentry-text-2">{tx.date}</p>
                  </div>
                </div>

                <span className={`text-xs sm:text-sm font-black font-mono ${
                  tx.type === 'ingreso' || tx.type === 'recarga' ? 'text-emerald-400' : 'text-zentry-text-1'
                }`}>
                  {tx.type === 'ingreso' || tx.type === 'recarga' ? '+' : '-'}{tx.amount} ZC
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR PLAN */}
      {activeModal === 'confirmSub' && selectedPlanForModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-zentry-border">
              <h3 className="text-lg font-extrabold text-zentry-text-1 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" /> Cambiar a {selectedPlanForModal.name}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-zentry-text-2 hover:text-zentry-text-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zentry-text-2">
              <p className="leading-relaxed">
                Estás por suscribirte al plan <strong className="text-zentry-text-1">{selectedPlanForModal.name}</strong> con facturación {billingCycle === 'annual' ? 'Anual' : 'Mensual'}.
              </p>

              <div className="bg-zentry-bg p-4 rounded-2xl border border-zentry-border space-y-2">
                <div className="flex justify-between">
                  <span>Costo del plan:</span>
                  <span className="font-bold text-zentry-text-1">
                    {billingCycle === 'annual' ? selectedPlanForModal.annualCost * 12 : selectedPlanForModal.monthlyCost} ZC
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tu saldo actual:</span>
                  <span className="font-bold text-emerald-400">{data.balance} ZC</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-3 font-bold text-xs bg-zentry-bg border border-zentry-border rounded-xl text-zentry-text-1 hover:bg-zentry-card">
                Cancelar
              </button>
              <button onClick={handleConfirmSubscription} className="flex-1 py-3 font-bold text-xs bg-zentry-accent text-white rounded-xl hover:opacity-90">
                Confirmar Suscripción
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RECARGAR ZENTRY COINS */}
      {activeModal === 'topup' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-zentry-border">
              <h3 className="text-lg font-extrabold text-zentry-text-1 flex items-center gap-2">
                <Plus className="w-5 h-5 text-zentry-accent" /> Recargar Zentry Coins
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-zentry-text-2 hover:text-zentry-text-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold text-zentry-text-2 uppercase">Selecciona el paquete de recarga</label>
              <div className="grid grid-cols-3 gap-3">
                {[100, 500, 1000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopupAmount(amt)}
                    className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all ${
                      topupAmount === amt 
                        ? 'border-zentry-accent bg-zentry-accent/20 text-zentry-accent' 
                        : 'border-zentry-border bg-zentry-bg text-zentry-text-1 hover:border-zentry-border/80'
                    }`}
                  >
                    +{amt} ZC
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-3 font-bold text-xs bg-zentry-bg border border-zentry-border rounded-xl text-zentry-text-1">
                Cancelar
              </button>
              <button onClick={handleTopup} className="flex-1 py-3 font-bold text-xs bg-zentry-text-1 text-zentry-bg rounded-xl hover:opacity-90">
                Confirmar Recarga
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ENVIAR COINS */}
      {activeModal === 'send' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-zentry-border">
              <h3 className="text-lg font-extrabold text-zentry-text-1 flex items-center gap-2">
                <Send className="w-5 h-5 text-zentry-accent" /> Enviar Zentry Coins
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-zentry-text-2 hover:text-zentry-text-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendCoins} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zentry-text-2 mb-1.5 uppercase">Destinatario (Usuario)</label>
                <input 
                  type="text"
                  value={sendRecipient}
                  onChange={(e) => setSendRecipient(e.target.value)}
                  placeholder="@usuario_zentry"
                  className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zentry-text-2 mb-1.5 uppercase">Monto en ZC</label>
                <input 
                  type="number"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="Ej: 150"
                  min={1}
                  className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-3 font-bold text-xs bg-zentry-bg border border-zentry-border rounded-xl text-zentry-text-1">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-3 font-bold text-xs bg-zentry-accent text-white rounded-xl hover:opacity-90">
                  Enviar ZC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </motion.div>
  );
}
