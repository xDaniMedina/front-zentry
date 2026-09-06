"use client"

import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, Send, Plus, History, 
  Zap, X, CheckCircle2, Crown, Check, CreditCard, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { subscribeToPlanAction, sendCoinsAction, topupCoinsAction, getWalletBalance } from "@/lib/actions/wallet";
import useSWR from "swr";

export type WalletTransaction = { 
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
  transactions: WalletTransaction[]; 
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
  
  const { data: swrRes } = useSWR(
    'walletBalance',
    async () => await getWalletBalance(),
    { refreshInterval: 15000 }
  );

  const [data, setData] = useState<WalletData>(initialData || FALLBACK_WALLET);

  useEffect(() => {
    if (swrRes && swrRes.success) {
      setData(prev => ({
        ...prev,
        balance: swrRes.coins ?? prev.balance,
        transactions: (swrRes.transactions && swrRes.transactions.length > 0) ? (swrRes.transactions as unknown as WalletTransaction[]) : prev.transactions,
      }));
    }
  }, [swrRes]);
  
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [activeTab, setActiveTab] = useState<'plans' | 'balance' | 'history'>('plans');
  const [activeModal, setActiveModal] = useState<'send' | 'topup' | 'confirmSub' | 'cancelSub' | null>(null);
  
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<SubscriptionPlan | null>(null);
  const [sendRecipient, setSendRecipient] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [topupAmount, setTopupAmount] = useState(500);

  // Estados de Tarjeta de Crédito
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'success'>('details');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [subPaymentMethod, setSubPaymentMethod] = useState<'balance' | 'card'>('balance');

  const activePlan = PLANS.find(p => p.id === data.activePlanId) || PLANS[1];

  const resetPaymentForm = () => {
    setPaymentStep('details');
    setCardNumber('');
    setCardName('');
    setCardExpiry('');
    setCardCvc('');
    setSubPaymentMethod('balance');
  }

  const handleCloseModal = () => {
    setActiveModal(null);
    resetPaymentForm();
  }

  // Formato para tarjeta de crédito
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || ''
    const parts = []
    for (let i=0, len=match.length; i<len; i+=4) {
      parts.push(match.substring(i, i+4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return value
    }
  }

  // Acción para cambiar de plan de suscripción
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.id === data.activePlanId) {
      toast.info(`Ya tienes activo el plan ${plan.name}`);
      return;
    }
    setSelectedPlanForModal(plan);
    setActiveModal('confirmSub');
  };

  const processSubscription = async () => {
    if (!selectedPlanForModal) return;
    const cost = billingCycle === 'annual' ? selectedPlanForModal.annualCost * 12 : selectedPlanForModal.monthlyCost;
    
    // Validación de tarjeta si se eligió ese método y no es plan gratuito
    if (selectedPlanForModal.id !== 'free' && subPaymentMethod === 'card') {
      if (cardNumber.length < 16 || cardName.length < 3 || cardExpiry.length < 4 || cardCvc.length < 3) {
        toast.error("Por favor completa los datos de tu tarjeta correctamente.");
        return;
      }
    }

    if (subPaymentMethod === 'balance' && cost > data.balance && selectedPlanForModal.id !== 'free') {
      toast.error(`Saldo insuficiente (${data.balance} ZC).`);
      return;
    }

    setPaymentStep('processing');

    try {
      // Simular delay de pasarela de pagos
      await new Promise(r => setTimeout(r, 2000));
      await subscribeToPlanAction(selectedPlanForModal.id, billingCycle);

      const balanceDeduction = subPaymentMethod === 'balance' ? cost : 0;
      const paymentDesc = subPaymentMethod === 'card' ? ` (Pago con Tarjeta **${cardNumber.slice(-4)})` : '';

      setData(prev => ({
        ...prev,
        activePlanId: selectedPlanForModal.id,
        balance: Math.max(0, prev.balance - balanceDeduction),
        transactions: [
          {
            id: `t-${Date.now()}`,
            type: 'egreso',
            amount: cost,
            description: `Suscripción ${selectedPlanForModal.name} (${billingCycle === 'annual' ? 'Anual' : 'Mensual'})${paymentDesc}`,
            date: 'Justo ahora'
          },
          ...prev.transactions
        ]
      }));

      setPaymentStep('success');
      setTimeout(() => {
        toast.success(`¡Felicidades! Ahora estás suscrito a ${selectedPlanForModal.name}`);
        handleCloseModal();
      }, 1500);

    } catch (err) {
      console.error("Error al actualizar suscripción:", err);
      toast.error("Ocurrió un error al procesar el pago.");
      setPaymentStep('details');
    }
  };

  // Enviar Zentry Coins
  const handleSendCoins = async (e: React.FormEvent) => {
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

    const res = await sendCoinsAction(sendRecipient, amountNum);
    if (res.success) {
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
      handleCloseModal();
    } else {
      toast.error("Error al enviar monedas. Intenta de nuevo.");
    }
  };

  // Recargar Saldo
  const handleTopup = async () => {
    if (cardNumber.length < 16 || cardName.length < 3 || cardExpiry.length < 4 || cardCvc.length < 3) {
      toast.error("Por favor completa los datos de tu tarjeta correctamente.");
      return;
    }

    setPaymentStep('processing');

    try {
      // Simular delay pasarela
      await new Promise(r => setTimeout(r, 2000));
      const res = await topupCoinsAction(topupAmount);

      if (res.success) {
        setData(prev => ({
          ...prev,
          balance: prev.balance + topupAmount,
          transactions: [
            {
              id: `t-${Date.now()}`,
              type: 'recarga',
              amount: topupAmount,
              description: `Recarga de saldo en Billetera (Tarjeta **${cardNumber.slice(-4)})`,
              date: 'Justo ahora'
            },
            ...prev.transactions
          ]
        }));

        setPaymentStep('success');
        setTimeout(() => {
          toast.success(`¡Recarga exitosa! Se añadieron +${topupAmount} ZC a tu balance`);
          handleCloseModal();
        }, 1500);
      } else {
        toast.error("Error al recargar saldo. Intenta de nuevo.");
        setPaymentStep('details');
      }
    } catch (e) {
      toast.error("Ocurrió un error en el servidor.");
      setPaymentStep('details');
    }
  };

  const renderCardForm = () => (
    <div className="space-y-4 pt-4 border-t border-zentry-border">
      {/* Visualización de la Tarjeta Premium */}
      <div className="relative w-full h-44 rounded-2xl bg-gradient-to-tr from-gray-900 via-gray-800 to-black border border-gray-700 p-5 shadow-2xl overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/5 blur-2xl"></div>
        <div className="flex justify-between items-start z-10">
          <div className="w-10 h-8 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-600 opacity-80"></div>
          <span className="font-bold text-white/50 italic text-xl">VISA</span>
        </div>
        <div className="z-10 mt-2">
          <div className="text-xl font-mono text-white/90 tracking-widest min-h-7">
            {cardNumber || '•••• •••• •••• ••••'}
          </div>
        </div>
        <div className="flex justify-between items-end z-10">
          <div className="flex flex-col">
            <span className="text-[9px] text-white/50 uppercase tracking-widest">Card Holder</span>
            <span className="text-xs text-white/90 font-bold uppercase tracking-wider min-h-4">
              {cardName || 'YOUR NAME'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-white/50 uppercase tracking-widest">Expires</span>
            <span className="text-xs text-white/90 font-bold font-mono min-h-4">
              {cardExpiry || 'MM/YY'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <input 
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
            placeholder="Número de Tarjeta"
            className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-2.5 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors"
          />
        </div>
        <div>
          <input 
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value.toUpperCase())}
            placeholder="Nombre en la Tarjeta"
            className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-2.5 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors"
          />
        </div>
        <div className="flex gap-3">
          <input 
            type="text"
            value={cardExpiry}
            onChange={(e) => {
              let val = e.target.value.replace(/[^0-9]/g, '');
              if (val.length > 2) val = val.substring(0,2) + '/' + val.substring(2,4);
              setCardExpiry(val);
            }}
            maxLength={5}
            placeholder="MM/YY"
            className="w-1/2 bg-zentry-bg border border-zentry-border rounded-xl px-4 py-2.5 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors"
          />
          <input 
            type="text"
            value={cardCvc}
            onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/g, ''))}
            maxLength={4}
            placeholder="CVC"
            className="w-1/2 bg-zentry-bg border border-zentry-border rounded-xl px-4 py-2.5 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors"
          />
        </div>
      </div>
    </div>
  );

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
      <div className="flex items-center gap-4 border-b border-zentry-border pb-1 overflow-x-auto">
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
              className={`flex shrink-0 items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
        <div className="bg-zentry-card border border-zentry-border rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
          <div className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200 relative">
            
            {paymentStep === 'processing' && (
              <div className="absolute inset-0 z-50 bg-zentry-card/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl">
                <Loader2 className="w-10 h-10 text-zentry-accent animate-spin mb-4" />
                <p className="text-sm font-bold text-zentry-text-1">Procesando pago...</p>
              </div>
            )}
            
            {paymentStep === 'success' && (
              <div className="absolute inset-0 z-50 bg-emerald-900/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl text-center p-6">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
                <h3 className="text-xl font-black text-white">¡Pago Exitoso!</h3>
                <p className="text-sm font-bold text-emerald-200 mt-2">Disfruta de tu suscripción a {selectedPlanForModal.name}</p>
              </div>
            )}

            <div className="flex justify-between items-center pb-3 border-b border-zentry-border">
              <h3 className="text-lg font-extrabold text-zentry-text-1 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" /> Confirmar Suscripción
              </h3>
              <button onClick={handleCloseModal} className="text-zentry-text-2 hover:text-zentry-text-1 disabled:opacity-50" disabled={paymentStep !== 'details'}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zentry-text-2">
              <div className="bg-zentry-bg p-4 rounded-2xl border border-zentry-border space-y-2">
                <div className="flex justify-between">
                  <span>Plan Seleccionado:</span>
                  <span className="font-bold text-zentry-text-1">{selectedPlanForModal.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ciclo de facturación:</span>
                  <span className="font-bold text-zentry-text-1">{billingCycle === 'annual' ? 'Anual' : 'Mensual'}</span>
                </div>
                <div className="flex justify-between border-t border-zentry-border/50 pt-2 mt-2">
                  <span>Total a Pagar:</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {billingCycle === 'annual' ? selectedPlanForModal.annualCost * 12 : selectedPlanForModal.monthlyCost} ZC
                  </span>
                </div>
              </div>
            </div>

            {selectedPlanForModal.id !== 'free' && (
              <div className="space-y-4">
                <label className="block text-xs font-bold text-zentry-text-2 uppercase">Método de Pago</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSubPaymentMethod('balance')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      subPaymentMethod === 'balance' 
                        ? 'border-zentry-accent bg-zentry-accent/10 text-zentry-accent' 
                        : 'border-zentry-border bg-zentry-bg text-zentry-text-2 hover:bg-zentry-border/50'
                    }`}
                  >
                    <Wallet className="w-4 h-4" /> Billetera ({data.balance} ZC)
                  </button>
                  <button
                    onClick={() => setSubPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      subPaymentMethod === 'card' 
                        ? 'border-zentry-accent bg-zentry-accent/10 text-zentry-accent' 
                        : 'border-zentry-border bg-zentry-bg text-zentry-text-2 hover:bg-zentry-border/50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" /> Tarjeta Nueva
                  </button>
                </div>

                {subPaymentMethod === 'card' && renderCardForm()}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-zentry-border mt-2">
              <button onClick={handleCloseModal} disabled={paymentStep !== 'details'} className="flex-1 py-3 font-bold text-xs bg-zentry-bg border border-zentry-border rounded-xl text-zentry-text-1 hover:bg-zentry-card disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={processSubscription} disabled={paymentStep !== 'details'} className="flex-1 py-3 font-bold text-xs bg-zentry-accent text-white rounded-xl hover:opacity-90 disabled:opacity-50">
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RECARGAR ZENTRY COINS */}
      {activeModal === 'topup' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 relative animate-in fade-in zoom-in-95 duration-200">
            
            {paymentStep === 'processing' && (
              <div className="absolute inset-0 z-50 bg-zentry-card/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl">
                <Loader2 className="w-10 h-10 text-zentry-accent animate-spin mb-4" />
                <p className="text-sm font-bold text-zentry-text-1">Procesando pago seguro...</p>
              </div>
            )}
            
            {paymentStep === 'success' && (
              <div className="absolute inset-0 z-50 bg-emerald-900/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl text-center p-6">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
                <h3 className="text-xl font-black text-white">¡Recarga Exitosa!</h3>
                <p className="text-sm font-bold text-emerald-200 mt-2">Se han acreditado +{topupAmount} ZC a tu billetera.</p>
              </div>
            )}

            <div className="flex justify-between items-center pb-3 border-b border-zentry-border">
              <h3 className="text-lg font-extrabold text-zentry-text-1 flex items-center gap-2">
                <Plus className="w-5 h-5 text-zentry-accent" /> Recargar Zentry Coins
              </h3>
              <button onClick={handleCloseModal} disabled={paymentStep !== 'details'} className="text-zentry-text-2 hover:text-zentry-text-1">
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
                        ? 'border-zentry-accent bg-zentry-accent/20 text-zentry-accent shadow-md shadow-zentry-accent/20' 
                        : 'border-zentry-border bg-zentry-bg text-zentry-text-1 hover:border-zentry-border/80'
                    }`}
                  >
                    +{amt} ZC
                    <span className="block mt-1 text-[10px] font-normal opacity-70">
                      ${(amt * 0.02).toFixed(2)} USD
                    </span>
                  </button>
                ))}
              </div>

              {renderCardForm()}
            </div>

            <div className="flex gap-3 pt-2 border-t border-zentry-border mt-4">
              <button onClick={handleCloseModal} disabled={paymentStep !== 'details'} className="flex-1 py-3 font-bold text-xs bg-zentry-bg border border-zentry-border rounded-xl text-zentry-text-1 disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={handleTopup} disabled={paymentStep !== 'details'} className="flex-1 py-3 font-bold text-xs bg-zentry-text-1 text-zentry-bg rounded-xl hover:opacity-90 disabled:opacity-50">
                Pagar ${(topupAmount * 0.02).toFixed(2)} USD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ENVIAR COINS */}
      {activeModal === 'send' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-zentry-border">
              <h3 className="text-lg font-extrabold text-zentry-text-1 flex items-center gap-2">
                <Send className="w-5 h-5 text-zentry-accent" /> Enviar Zentry Coins
              </h3>
              <button onClick={handleCloseModal} className="text-zentry-text-2 hover:text-zentry-text-1">
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
                <button type="button" onClick={handleCloseModal} className="flex-1 py-3 font-bold text-xs bg-zentry-bg border border-zentry-border rounded-xl text-zentry-text-1">
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
