"use client"

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, Trophy, CheckCircle2, Sparkles, X, 
  Lock, Gift, Check, Award
} from "lucide-react";
import { toast } from "sonner";

export type Mission = {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  currentProgress: number;
  targetProgress: number;
  isClaimed: boolean;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  icon: string;
  isUnlocked: boolean;
  unlockedDate?: string;
};

const INITIAL_MISSIONS: Mission[] = [
  { id: 'm1', title: 'Dar 5 likes en el feed', description: 'Reacciona a 5 publicaciones de otros creadores', rewardCoins: 5, currentProgress: 3, targetProgress: 5, isClaimed: false },
  { id: 'm2', title: 'Crear 1 obra en el Estudio', description: 'Usa el lienzo o editor de texto para crear un nuevo proyecto', rewardCoins: 25, currentProgress: 1, targetProgress: 1, isClaimed: false },
  { id: 'm3', title: 'Publicar en una Comunidad', description: 'Comparte un post o duda en tu comunidad favorita', rewardCoins: 15, currentProgress: 0, targetProgress: 1, isClaimed: false },
  { id: 'm4', title: 'Seguir a 3 creadores', description: 'Conecta con otros artistas en la pestaña Explorar', rewardCoins: 10, currentProgress: 2, targetProgress: 3, isClaimed: false },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'Primer Lienzo 🎨', description: 'Crea tu primera obra en el Estudio Creativo Multimodal', rewardCoins: 100, icon: '🎨', isUnlocked: true, unlockedDate: 'Ayer' },
  { id: 'a2', title: 'Comunicador Social 💬', description: 'Envía 10 mensajes directos y comenta 5 publicaciones', rewardCoins: 50, icon: '💬', isUnlocked: true, unlockedDate: 'Hace 3 días' },
  { id: 'a3', title: 'Creador PRO ⚡', description: 'Suscríbete al plan Zentry PRO o acumula +1,000 ZC', rewardCoins: 250, icon: '⚡', isUnlocked: false },
  { id: 'a4', title: 'Leyenda de Zentry 👑', description: 'Consigue +100 seguidores y publica 20 obras en el feed', rewardCoins: 500, icon: '👑', isUnlocked: false },
];

export default function MissionsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'missions' | 'achievements'>('missions');
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Manejo de tecla Escape y bloqueo de scroll en body
  useEffect(() => {
    if (!isOpen || !mounted) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow || "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, mounted, onClose]);

  const claimMissionReward = (id: string, coins: number) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, isClaimed: true } : m));
    toast.success(`¡Recompensa reclamada! +${coins} Zentry Coins añadidos a tu billetera 🎉`);
  };

  const totalMissionsCompleted = missions.filter(m => m.currentProgress >= m.targetProgress).length;
  const totalAchievementsUnlocked = achievements.filter(a => a.isUnlocked).length;

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <AnimatePresence>
      <div 
        onClick={onClose}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-zentry-text-1"
        >
          {/* Header Banner */}
          <div className="p-5 sm:p-6 border-b border-zentry-border bg-gradient-to-r from-orange-950/80 via-[#161626] to-purple-950/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-extrabold shadow-inner shrink-0">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white">Portal de Misiones & Logros</h2>
                <p className="text-xs text-zentry-text-2">Gana Zentry Coins (ZC) completando desafíos diarios.</p>
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="p-2 text-zentry-text-2 hover:text-white hover:bg-white/10 rounded-xl transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Pestañas de Navegación del Portal */}
          <div className="flex gap-2 p-3 sm:p-4 border-b border-zentry-border bg-[#0a0a12]">
            <button
              onClick={() => setActiveTab('missions')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'missions'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-zentry-text-2 hover:text-white hover:bg-[#161626]'
              }`}
            >
              <Flame className="w-4 h-4" /> Misiones Diarias ({totalMissionsCompleted}/{missions.length})
            </button>

            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'achievements'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-zentry-text-2 hover:text-white hover:bg-[#161626]'
              }`}
            >
              <Trophy className="w-4 h-4" /> Sistema de Logros ({totalAchievementsUnlocked}/{achievements.length})
            </button>
          </div>

          {/* Cuerpo del Portal */}
          <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-4 flex-1 bg-[#12121c]">
            
            {/* PESTAÑA MISIONES DIARIAS */}
            {activeTab === 'missions' && (
              <div className="space-y-4">
                {missions.map(mission => {
                  const isCompleted = mission.currentProgress >= mission.targetProgress;
                  const progressPercent = Math.min(100, Math.round((mission.currentProgress / mission.targetProgress) * 100));

                  return (
                    <div 
                      key={mission.id} 
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        mission.isClaimed 
                          ? 'bg-[#0a0a12]/60 border-zentry-border/50 opacity-60' 
                          : isCompleted 
                            ? 'bg-orange-500/10 border-orange-500/40' 
                            : 'bg-[#181828] border-zentry-border'
                      }`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-white">{mission.title}</h4>
                          <span className="text-xs font-black text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            +{mission.rewardCoins} ZC
                          </span>
                        </div>

                        <p className="text-xs text-zentry-text-2">{mission.description}</p>

                        {/* Barra de Progreso */}
                        <div className="space-y-1 pt-1 max-w-md">
                          <div className="flex justify-between text-[10px] text-zentry-text-2 font-mono">
                            <span>Progreso:</span>
                            <span>{mission.currentProgress} / {mission.targetProgress} ({progressPercent}%)</span>
                          </div>
                          <div className="w-full bg-[#0a0a12] border border-zentry-border rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${progressPercent}%` }} 
                            />
                          </div>
                        </div>
                      </div>

                      {/* Botón Acción */}
                      <div className="shrink-0">
                        {mission.isClaimed ? (
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Reclamado
                          </span>
                        ) : isCompleted ? (
                          <button
                            onClick={() => claimMissionReward(mission.id, mission.rewardCoins)}
                            className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-black hover:opacity-90 transition-opacity shadow-md shadow-orange-500/20 flex items-center gap-1.5"
                          >
                            <Gift className="w-4 h-4" /> Reclamar +{mission.rewardCoins} ZC
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-zentry-text-2 bg-[#0a0a12] px-3 py-1.5 rounded-xl border border-zentry-border">
                            En curso ({mission.currentProgress}/{mission.targetProgress})
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* PESTAÑA SISTEMA DE LOGROS */}
            {activeTab === 'achievements' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievements.map(ach => (
                  <div 
                    key={ach.id} 
                    className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                      ach.isUnlocked 
                        ? 'bg-gradient-to-br from-purple-950/40 via-[#181828] to-indigo-950/40 border-purple-500/50 shadow-md' 
                        : 'bg-[#0a0a12]/60 border-zentry-border/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-2 bg-[#0a0a12] rounded-2xl border border-zentry-border shrink-0">
                          {ach.icon}
                        </span>
                        <div>
                          <h4 className="font-extrabold text-sm text-white">{ach.title}</h4>
                          <span className="text-[10px] font-mono text-purple-400 font-bold">
                            {ach.isUnlocked ? `Desbloqueado (${ach.unlockedDate})` : 'Bloqueado 🔒'}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-black text-amber-400 font-mono bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 shrink-0">
                        +{ach.rewardCoins} ZC
                      </span>
                    </div>

                    <p className="text-xs text-zentry-text-2 leading-relaxed">
                      {ach.description}
                    </p>

                    <div className="pt-2 border-t border-zentry-border/60 flex items-center justify-between text-xs">
                      {ach.isUnlocked ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Recompensa Otorgada
                        </span>
                      ) : (
                        <span className="text-zentry-text-2 flex items-center gap-1 font-mono text-[11px]">
                          <Lock className="w-3.5 h-3.5" /> Completa el objetivo
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Footer Modal */}
          <div className="p-4 border-t border-zentry-border bg-[#0a0a12] flex justify-between items-center text-xs">
            <span className="text-zentry-text-2">Las misiones se reinician cada 24 horas a las 00:00 UTC.</span>
            <button 
              onClick={onClose} 
              className="px-5 py-2 bg-white text-black rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Cerrar
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
