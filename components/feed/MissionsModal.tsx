"use client"

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Trophy, CheckCircle2, X,
  Lock, Gift, Filter, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  DailyMission,
  AchievementItem,
  getTodayDateString
} from "@/lib/gamification";
import { fetchDailyMissions, fetchAchievements, claimMission } from "@/lib/actions/gamification";

export default function MissionsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, updateUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'missions' | 'achievements'>('missions');
  const [selectedAchievementCategory, setSelectedAchievementCategory] = useState<string>('all');
  
  // Estado dinámico de misiones y logros para el usuario en sesión
  const userKey = user?.id ? String(user.id) : (user?.username || 'guest');
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const loadGamification = async () => {
        const [missionsRes, achievementsRes] = await Promise.all([
          fetchDailyMissions(),
          fetchAchievements()
        ]);
        if (missionsRes.success) setMissions(missionsRes.missions);
        if (achievementsRes.success) setAchievements(achievementsRes.achievements);
      };
      loadGamification();
    }
  }, [mounted, userKey]);

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

  const claimMissionReward = async (id: number, coins: number) => {
    const res = await claimMission(id);
    if (res.success) {
      const updated = missions.map(m => m.id === id ? { ...m, isClaimed: true } : m);
      setMissions(updated);

      const newBalance = (user?.zentry_coins || 0) + coins;
      updateUser({ zentry_coins: newBalance });

      toast.success(`¡Recompensa reclamada! +${coins} Zentry Coins para @${user?.username || 'ti'} 🎉`);
    } else {
      toast.error(res.error || "Hubo un problema al reclamar tu recompensa.");
    }
  };

  const totalMissionsCompleted = missions.filter(m => m.currentProgress >= m.targetProgress).length;
  const totalAchievementsUnlocked = achievements.filter(a => a.isUnlocked).length;
  const mysteriousCount = achievements.filter(a => a.rarity === 'mysterious').length;
  const mysteriousUnlockedCount = achievements.filter(a => a.rarity === 'mysterious' && a.isUnlocked).length;

  const filteredAchievements = achievements.filter(ach => {
    if (selectedAchievementCategory === 'all') return true;
    if (selectedAchievementCategory === 'mysterious') return ach.rarity === 'mysterious';
    if (selectedAchievementCategory === 'unlocked') return ach.isUnlocked;
    if (selectedAchievementCategory === 'locked') return !ach.isUnlocked;
    return ach.category === selectedAchievementCategory;
  });

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <AnimatePresence>
      <div 
        onClick={onClose}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-zentry-text-1"
        >
          {/* Header Banner Dinámico con Datos del Usuario */}
          <div className="p-5 sm:p-6 border-b border-zentry-border bg-gradient-to-r from-purple-950/90 via-[#141424] to-amber-950/80 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/30 to-purple-500/30 border border-orange-500/40 flex items-center justify-center text-orange-400 font-extrabold shadow-inner shrink-0">
                <Flame className="w-6 h-6 animate-pulse text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-white">Centro de Misiones & Logros</h2>
                  <span className="text-[10px] font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Nivel Creador
                  </span>
                </div>
                <p className="text-xs text-zentry-text-2">
                  Progreso activo de <span className="text-white font-bold">@{user?.username || 'Creador'}</span> • Gana Zentry Coins (ZC)
                </p>
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="p-2 text-zentry-text-2 hover:text-white hover:bg-white/10 rounded-xl transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Pestañas Principales del Portal */}
          <div className="flex gap-2 p-3 sm:p-4 border-b border-zentry-border bg-[#0a0a12]">
            <button
              onClick={() => setActiveTab('missions')}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'missions'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 scale-[1.01]'
                  : 'text-zinc-400 hover:text-white hover:bg-[#181828] border border-transparent'
              }`}
            >
              <Flame className="w-4 h-4" /> Misiones Diarias ({totalMissionsCompleted}/{missions.length})
            </button>

            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'achievements'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/25 scale-[1.01]'
                  : 'text-zinc-400 hover:text-white hover:bg-[#181828] border border-transparent'
              }`}
            >
              <Trophy className="w-4 h-4" /> Banco de Logros ({totalAchievementsUnlocked}/{achievements.length})
            </button>
          </div>

          {/* Cuerpo del Portal con Scroll Suave */}
          <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1 bg-[#12121c]">
            
            {/* PESTAÑA 1: MISIONES DIARIAS DINÁMICAS */}
            {activeTab === 'missions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-zentry-text-2 px-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <RefreshCw className="w-3.5 h-3.5 text-orange-400 animate-spin-slow" /> 
                    Misiones activas de hoy ({getTodayDateString()}) para @{user?.username || 'creador'}
                  </span>
                  <span className="font-mono text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    {totalMissionsCompleted === missions.length ? '🎉 ¡Todas completadas!' : `${totalMissionsCompleted} de ${missions.length} listas`}
                  </span>
                </div>

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
                            ? 'bg-gradient-to-r from-orange-950/30 via-zentry-card to-amber-950/20 border-orange-500/50 shadow-md' 
                            : 'bg-[#181828] border-zentry-border'
                      }`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-sm text-white">{mission.title}</h4>
                          <span className="text-xs font-black text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            +{mission.rewardCoins} ZC
                          </span>
                          <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded-full border border-zinc-700">
                            {mission.category}
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
                      <div className="shrink-0 flex items-center gap-2">
                        {mission.isClaimed ? (
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                            <CheckCircle2 className="w-4 h-4" /> Reclamado
                          </span>
                        ) : isCompleted ? (
                          <button
                            onClick={() => claimMissionReward(mission.id, mission.rewardCoins)}
                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-black hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/30 flex items-center gap-1.5 hover:scale-105 active:scale-95"
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

            {/* PESTAÑA 2: BANCO DE LOGROS (CON CATEGORÍAS BIEN VISIBLES) */}
            {activeTab === 'achievements' && (
              <div className="space-y-5">
                
                {/* 1. Resumen Superior de Métricas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#151524] p-4 rounded-2xl border border-zentry-border shadow-inner">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">Total Desafíos</span>
                    <span className="text-base font-black text-white">{achievements.length} Logros</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">Desbloqueados</span>
                    <span className="text-base font-black text-emerald-400">{totalAchievementsUnlocked} / {achievements.length}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">Misterios Revelados</span>
                    <span className="text-base font-black text-pink-400">{mysteriousUnlockedCount} / {mysteriousCount}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">Recompensas ZC</span>
                    <span className="text-base font-black text-amber-400 font-mono">
                      +{achievements.filter(a => a.isUnlocked).reduce((sum, a) => sum + a.rewardCoins, 0)} ZC
                    </span>
                  </div>
                </div>

                {/* 2. Barra de Categorías y Filtros (LEGIBLE Y CON ALTO CONTRASTE) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-extrabold text-zinc-300 px-1">
                    <span className="flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-purple-400" /> Filtrar por categoría:
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      Mostrando {filteredAchievements.length} de {achievements.length}
                    </span>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2 pt-1 text-xs custom-scrollbar">
                    {[
                      { id: 'all', label: `Todos (${achievements.length})` },
                      { id: 'mysterious', label: `🔮 Misteriosos (${mysteriousUnlockedCount}/${mysteriousCount})` },
                      { id: 'unlocked', label: `✨ Desbloqueados (${totalAchievementsUnlocked})` },
                      { id: 'locked', label: `🔒 Bloqueados (${achievements.length - totalAchievementsUnlocked})` },
                      { id: 'creation', label: '🎨 Creación' },
                      { id: 'social', label: '💬 Social' },
                      { id: 'community', label: '🏛️ Comunidad' },
                      { id: 'reputation', label: '👑 Reputación' },
                      { id: 'mastery', label: '⚡ Maestría' }
                    ].map(cat => {
                      const isSelected = selectedAchievementCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedAchievementCategory(cat.id)}
                          className={`px-3.5 py-2 rounded-xl font-black shrink-0 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                            isSelected
                              ? cat.id === 'mysterious'
                                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-lg shadow-pink-600/30 scale-105 border border-pink-400/50'
                                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 scale-105 border border-purple-400/50'
                              : 'bg-[#1c1c2e] hover:bg-[#282842] text-zinc-200 border border-zinc-700/80 hover:text-white'
                          }`}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Grid de Tarjetas de Logros */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredAchievements.map(ach => {
                    const isMysterious = ach.rarity === 'mysterious';
                    const isSecretAndLocked = isMysterious && !ach.isUnlocked;

                    const rarityBadge = {
                      common: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
                      rare: 'border-blue-500/50 bg-blue-500/20 text-blue-300',
                      epic: 'border-purple-500/50 bg-purple-500/20 text-purple-300',
                      legendary: 'border-amber-500/50 bg-amber-500/20 text-amber-300',
                      mysterious: 'border-pink-500/60 bg-pink-500/20 text-pink-200 shadow-sm shadow-pink-500/30'
                    }[ach.rarity];

                    return (
                      <div 
                        key={ach.id} 
                        className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all relative overflow-hidden ${
                          ach.isUnlocked 
                            ? isMysterious 
                              ? 'bg-gradient-to-br from-purple-950/70 via-[#1e1536] to-pink-950/50 border-pink-500/70 shadow-xl shadow-pink-500/10'
                              : 'bg-gradient-to-br from-purple-950/50 via-[#19192c] to-indigo-950/50 border-purple-500/60 shadow-lg' 
                            : isMysterious
                              ? 'bg-gradient-to-br from-[#160b2c] via-[#100c1e] to-[#1c0c32] border-pink-900/60 hover:border-pink-500/60'
                              : 'bg-[#10101c] border-zinc-800 opacity-75 hover:opacity-100 hover:border-zinc-700'
                        }`}
                      >
                        {/* Efecto de aura para logros misteriosos */}
                        {isMysterious && (
                          <div className="absolute -top-10 -right-10 w-28 h-28 bg-pink-500/15 rounded-full blur-2xl pointer-events-none" />
                        )}

                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className={`text-3xl p-2.5 rounded-2xl border shrink-0 shadow-inner ${
                              isSecretAndLocked 
                                ? 'bg-purple-950/70 border-pink-500/40 text-pink-400 animate-pulse'
                                : 'bg-[#0a0a12] border-zinc-700'
                            }`}>
                              {isSecretAndLocked ? '🔮' : ach.icon}
                            </span>
                            <div>
                              <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                                {isSecretAndLocked ? '??? (Logro Oculto)' : ach.title}
                              </h4>
                              <span className="text-[11px] font-mono text-purple-400 font-bold">
                                {ach.isUnlocked 
                                  ? `Desbloqueado (${ach.unlockedDate || '2026'})` 
                                  : isMysterious 
                                    ? 'Enigma por descifrar 🗝️' 
                                    : 'Bloqueado 🔒'}
                              </span>
                            </div>
                          </div>

                          <span className="text-xs font-black text-amber-400 font-mono bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/30 shrink-0 shadow-sm">
                            +{ach.rewardCoins} ZC
                          </span>
                        </div>

                        <p className={`text-xs leading-relaxed ${isSecretAndLocked ? 'text-pink-300 font-medium italic' : 'text-zinc-300'}`}>
                          {isSecretAndLocked 
                            ? (ach.secretHint || 'Pista: Realiza acciones extraordinarias en la red para revelar este misterio...')
                            : ach.description}
                        </p>

                        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                          {ach.isUnlocked ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Desbloqueado
                            </span>
                          ) : (
                            <span className="text-zinc-400 flex items-center gap-1 font-mono text-[11px]">
                              <Lock className="w-3.5 h-3.5" /> {isMysterious ? 'Por descubrir' : 'Bloqueado'}
                            </span>
                          )}
                          <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border ${rarityBadge}`}>
                            {ach.rarity}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Footer Modal */}
          <div className="p-4 border-t border-zentry-border bg-[#0a0a12] flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
            <span className="text-zinc-400 text-center sm:text-left font-medium">
              Las misiones rotan cada 24 horas a las 00:00 UTC • Progreso guardado para @{user?.username || 'usuario'}
            </span>
            <button 
              onClick={onClose} 
              className="w-full sm:w-auto px-6 py-2 bg-white text-black rounded-xl font-bold hover:opacity-90 transition-opacity"
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
