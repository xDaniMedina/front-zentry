// SISTEMA DINÁMICO DE GAMIFICACIÓN ZENTRY: MISIONES DIARIAS, LOGROS Y LOGROS MISTERIOSOS

export type MissionCategory = 'social' | 'creation' | 'community' | 'exploration' | 'streak';

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  category: MissionCategory;
  rewardCoins: number;
  currentProgress: number;
  targetProgress: number;
  isClaimed: boolean;
  iconName?: string;
}

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mysterious';

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  icon: string;
  rarity: AchievementRarity;
  category: 'creation' | 'social' | 'community' | 'reputation' | 'mastery' | 'mystery';
  isUnlocked: boolean;
  unlockedDate?: string;
  progress?: number;
  maxProgress?: number;
  isSecret?: boolean;
  secretHint?: string;
}

// 1. BANCO GENERAL DE MISIONES DIARIAS (Pool aleatorio)
export const DAILY_MISSIONS_POOL: Omit<DailyMission, 'currentProgress' | 'isClaimed'>[] = [
  {
    id: 'm_like_feed',
    title: 'Explorador del Feed',
    description: 'Reacciona a 5 publicaciones de otros creadores en el feed',
    category: 'social',
    rewardCoins: 10,
    targetProgress: 5,
    iconName: 'Heart'
  },
  {
    id: 'm_comment_art',
    title: 'Crítica Constructiva',
    description: 'Comenta en 2 obras para dar feedback a compañeros creadores',
    category: 'social',
    rewardCoins: 15,
    targetProgress: 2,
    iconName: 'MessageCircle'
  },
  {
    id: 'm_follow_creators',
    title: 'Amplía tu Círculo',
    description: 'Sigue a 3 nuevos artistas desde la pestaña Explorar',
    category: 'exploration',
    rewardCoins: 15,
    targetProgress: 3,
    iconName: 'UserPlus'
  },
  {
    id: 'm_create_studio',
    title: 'Chispa de Creación',
    description: 'Abre el Estudio Creativo y genera un nuevo lienzo o proyecto',
    category: 'creation',
    rewardCoins: 30,
    targetProgress: 1,
    iconName: 'Sparkles'
  },
  {
    id: 'm_send_direct_msg',
    title: 'Conexión Creativa',
    description: 'Envía un mensaje directo a un amigo o colaborador',
    category: 'social',
    rewardCoins: 15,
    targetProgress: 1,
    iconName: 'Send'
  },
  {
    id: 'm_visit_community',
    title: 'Voz Comunitaria',
    description: 'Visita y participa en al menos una comunidad artística',
    category: 'community',
    rewardCoins: 20,
    targetProgress: 1,
    iconName: 'Users'
  },
  {
    id: 'm_save_project',
    title: 'Inspiración en Galería',
    description: 'Explora y guarda o reacciona a proyectos destacados',
    category: 'exploration',
    rewardCoins: 15,
    targetProgress: 3,
    iconName: 'Bookmark'
  },
  {
    id: 'm_share_creation',
    title: 'Difusión Artística',
    description: 'Comparte un enlace de tu perfil u obra con la comunidad',
    category: 'creation',
    rewardCoins: 25,
    targetProgress: 1,
    iconName: 'Share2'
  },
  {
    id: 'm_daily_presence',
    title: 'Presencia Activa',
    description: 'Mantén tu estado en línea y revisa tus notificaciones diarias',
    category: 'streak',
    rewardCoins: 10,
    targetProgress: 1,
    iconName: 'Flame'
  },
  {
    id: 'm_explore_disciplines',
    title: 'Mente Multimodal',
    description: 'Filtra y visualiza contenido de 2 disciplinas artísticas distintas',
    category: 'exploration',
    rewardCoins: 20,
    targetProgress: 2,
    iconName: 'Compass'
  },
  {
    id: 'm_post_feed',
    title: 'Lanza tu Visión',
    description: 'Crea una nueva publicación en el feed principal',
    category: 'creation',
    rewardCoins: 35,
    targetProgress: 1,
    iconName: 'Upload'
  },
  {
    id: 'm_friend_request',
    title: 'Lazos de Co-Creación',
    description: 'Envía o responde a una solicitud de amistad/colaboración',
    category: 'social',
    rewardCoins: 20,
    targetProgress: 1,
    iconName: 'UserCheck'
  },
  {
    id: 'm_complete_profile',
    title: 'Toque de Identidad',
    description: 'Actualiza o verifica tu biografía y disciplina en tu perfil',
    category: 'creation',
    rewardCoins: 20,
    targetProgress: 1,
    iconName: 'User'
  },
  {
    id: 'm_explore_feed_tab',
    title: 'Inmersión Total',
    description: 'Explora las pestañas de Destacados, Para Ti y Siguiendo en el feed',
    category: 'exploration',
    rewardCoins: 15,
    targetProgress: 3,
    iconName: 'Compass'
  }
];

// 2. BANCO EXPANDIDO DE LOGROS (24 Logros con Logros Misteriosos y Secretos)
export const ACHIEVEMENTS_POOL: AchievementItem[] = [
  // --- LOGROS COMUNES Y DE BIENVENIDA ---
  {
    id: 'ach_first_canvas',
    title: 'Primer Trazo 🎨',
    description: 'Crea tu primera obra o boceto en el Estudio Creativo Multimodal',
    rewardCoins: 50,
    icon: '🎨',
    rarity: 'common',
    category: 'creation',
    isUnlocked: true,
    unlockedDate: 'Completado',
    progress: 1,
    maxProgress: 1
  },
  {
    id: 'ach_social_starter',
    title: 'Voz en Zentry 💬',
    description: 'Envía tus primeros 5 mensajes directos y comenta publicaciones',
    rewardCoins: 50,
    icon: '💬',
    rarity: 'common',
    category: 'social',
    isUnlocked: true,
    unlockedDate: 'Completado',
    progress: 5,
    maxProgress: 5
  },
  {
    id: 'ach_curator',
    title: 'Ojo Curador 👁️',
    description: 'Reacciona con likes a más de 25 obras en la plataforma',
    rewardCoins: 75,
    icon: '👁️',
    rarity: 'common',
    category: 'social',
    isUnlocked: false,
    progress: 14,
    maxProgress: 25
  },
  {
    id: 'ach_security_pro',
    title: 'Identidad Blindada 🛡️',
    description: 'Completa tu perfil, avatar, biografía y personaliza tu seguridad',
    rewardCoins: 80,
    icon: '🛡️',
    rarity: 'common',
    category: 'reputation',
    isUnlocked: true,
    unlockedDate: 'Completado',
    progress: 1,
    maxProgress: 1
  },

  // --- LOGROS RAROS ---
  {
    id: 'ach_community_builder',
    title: 'Alma de la Comunidad 🏛️',
    description: 'Únete a 3 comunidades y publica un tema de debate',
    rewardCoins: 100,
    icon: '🏛️',
    rarity: 'rare',
    category: 'community',
    isUnlocked: false,
    progress: 1,
    maxProgress: 3
  },
  {
    id: 'ach_studio_master',
    title: 'Arquitecto Digital ⚡',
    description: 'Crea y exporta 5 proyectos completos desde el Estudio',
    rewardCoins: 150,
    icon: '⚡',
    rarity: 'rare',
    category: 'creation',
    isUnlocked: false,
    progress: 2,
    maxProgress: 5
  },
  {
    id: 'ach_networker',
    title: 'Conexión Creativa 🤝',
    description: 'Consigue 10 amigos o seguidores en tu red social',
    rewardCoins: 120,
    icon: '🤝',
    rarity: 'rare',
    category: 'social',
    isUnlocked: false,
    progress: 4,
    maxProgress: 10
  },
  {
    id: 'ach_streak_hero',
    title: 'En Llamas 🔥',
    description: 'Completa todas las misiones diarias durante 3 días seguidos',
    rewardCoins: 200,
    icon: '🔥',
    rarity: 'rare',
    category: 'mastery',
    isUnlocked: false,
    progress: 1,
    maxProgress: 3
  },
  {
    id: 'ach_night_owl',
    title: 'Inspiración Nocturna 🌙',
    description: 'Crea o edita contenido en el Estudio durante la noche (00:00 - 05:00)',
    rewardCoins: 100,
    icon: '🌙',
    rarity: 'rare',
    category: 'creation',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1
  },

  // --- LOGROS ÉPICOS ---
  {
    id: 'ach_coin_hoarder',
    title: 'Billetera Dorada 🪙',
    description: 'Alcanza un saldo acumulado de más de 500 Zentry Coins (ZC)',
    rewardCoins: 250,
    icon: '🪙',
    rarity: 'epic',
    category: 'reputation',
    isUnlocked: false,
    progress: 180,
    maxProgress: 500
  },
  {
    id: 'ach_multimodal_mind',
    title: 'Maestro Polímata 🎭',
    description: 'Publica proyectos que involucren al menos 3 disciplinas diferentes',
    rewardCoins: 250,
    icon: '🎭',
    rarity: 'epic',
    category: 'mastery',
    isUnlocked: false,
    progress: 1,
    maxProgress: 3
  },
  {
    id: 'ach_viral_hit',
    title: 'Obra Maestra 🌟',
    description: 'Consigue que una de tus obras alcance 30 reacciones de la comunidad',
    rewardCoins: 300,
    icon: '🌟',
    rarity: 'epic',
    category: 'reputation',
    isUnlocked: false,
    progress: 12,
    maxProgress: 30
  },
  {
    id: 'ach_collaborator',
    title: 'Sinergia Co-Creativa 🚀',
    description: 'Trabaja como colaborador en un proyecto compartido',
    rewardCoins: 200,
    icon: '🚀',
    rarity: 'epic',
    category: 'community',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1
  },

  // --- LOGROS LEGENDARIOS ---
  {
    id: 'ach_legend',
    title: 'Leyenda de Zentry 👑',
    description: 'Alcanza más de 50 seguidores, 15 obras publicadas y 1,000 ZC',
    rewardCoins: 500,
    icon: '👑',
    rarity: 'legendary',
    category: 'reputation',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'ach_grandmaster',
    title: 'Gran Maestro de Misiones 🏆',
    description: 'Completa exitosamente 25 misiones diarias del portal',
    rewardCoins: 400,
    icon: '🏆',
    rarity: 'legendary',
    category: 'mastery',
    isUnlocked: false,
    progress: 7,
    maxProgress: 25
  },
  {
    id: 'ach_pioneer',
    title: 'Pionero Multiversal 🌌',
    description: 'Forma parte de la primera generación de creadores Zentry 2026',
    rewardCoins: 350,
    icon: '🌌',
    rarity: 'legendary',
    category: 'reputation',
    isUnlocked: true,
    unlockedDate: '2026',
    progress: 1,
    maxProgress: 1
  },

  // --- LOGROS SECRETOS & MISTERIOSOS (??? Desbloqueables por Acciones Ocultas) ---
  {
    id: 'ach_secret_cosmic_portal',
    title: 'El Secreto de Zentry 🔮',
    description: 'Descubriste el portal cuántico y activaste el tema secreto de la red.',
    rewardCoins: 500,
    icon: '🔮',
    rarity: 'mysterious',
    category: 'mystery',
    isSecret: true,
    secretHint: 'Una puerta dimensional espera a quienes exploren más allá de lo visible...',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'ach_secret_void_hacker',
    title: 'Infiltrado del Vacío 🕶️',
    description: 'Enviaste un mensaje directo encriptado en el canal seguro.',
    rewardCoins: 300,
    icon: '🕶️',
    rarity: 'mysterious',
    category: 'mystery',
    isSecret: true,
    secretHint: 'Los mensajes nocturnos transmiten más que simples palabras...',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'ach_secret_multiverse_decoder',
    title: 'Decodificador Cósmico 🧩',
    description: 'Exploraste creadores de 5 categorías artísticas en una sola sesión.',
    rewardCoins: 350,
    icon: '🧩',
    rarity: 'mysterious',
    category: 'mystery',
    isSecret: true,
    secretHint: 'Solo quien camina por todos los mundos artísticos revela este sello.',
    isUnlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'ach_secret_speed_crafter',
    title: 'Sobrecarga de Inspiración ⚡',
    description: 'Completaste 4 misiones diarias en tiempo récord antes del mediodía.',
    rewardCoins: 400,
    icon: '⚡',
    rarity: 'mysterious',
    category: 'mystery',
    isSecret: true,
    secretHint: 'La velocidad del relámpago premia a la mente sin descanso.',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'ach_secret_astral_traveler',
    title: 'Viajero Astral 🌠',
    description: 'Mantuviste tu presencia en línea durante 7 días consecutivos en Zentry.',
    rewardCoins: 600,
    icon: '🌠',
    rarity: 'mysterious',
    category: 'mystery',
    isSecret: true,
    secretHint: 'La constancia infinita forja los lazos con las estrellas.',
    isUnlocked: false,
    progress: 1,
    maxProgress: 7
  },
  {
    id: 'ach_secret_holographic_mask',
    title: 'Metamorfosis Digital 🎭',
    description: 'Personalizaste completamente tu foto de perfil, portada y biografía.',
    rewardCoins: 200,
    icon: '🎭',
    rarity: 'mysterious',
    category: 'mystery',
    isSecret: true,
    secretHint: 'Cambia tu rostro, revela tu verdadera aura creativa.',
    isUnlocked: true,
    unlockedDate: 'Descubierto',
    progress: 1,
    maxProgress: 1
  },
  {
    id: 'ach_secret_master_key',
    title: 'Llave de los Secretos 🗝️',
    description: 'Reclamaste más de 3 recompensas de misiones en un solo día.',
    rewardCoins: 250,
    icon: '🗝️',
    rarity: 'mysterious',
    category: 'mystery',
    isSecret: true,
    secretHint: 'Tres cofres abiertos revelan la llave oculta.',
    isUnlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: 'ach_secret_harmonic_resonance',
    title: 'Resonancia Armónica 🎵',
    description: 'Conectaste con amigos y recibiste solicitudes de co-creación.',
    rewardCoins: 300,
    icon: '🎵',
    rarity: 'mysterious',
    category: 'mystery',
    isSecret: true,
    secretHint: 'Cuando dos frecuencias creativas vibran juntas, la melodía despierta.',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1
  }
];

// 3. GENERADOR DETERMINISTA DE FECHA
function getDailySeed(dateStr: string, userKey: string = 'global'): number {
  const combined = `${dateStr}_${userKey}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getTodayDateString(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

// 4. OBTENER MISIONES ESPECÍFICAS PARA EL USUARIO CONECTADO
export function getUserDailyMissions(userIdentifier?: string | number): DailyMission[] {
  const dateStr = getTodayDateString();
  const userKey = userIdentifier ? String(userIdentifier) : 'guest';
  const seed = getDailySeed(dateStr, userKey);
  const pool = [...DAILY_MISSIONS_POOL];

  let currentSeed = seed;
  const pseudoRandom = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(pseudoRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const selected = shuffled.slice(0, 4);

  // Cargar estado guardado del usuario específico de hoy
  if (typeof window !== 'undefined') {
    try {
      const storageKey = `zentry_user_missions_${userKey}_${dateStr}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, { currentProgress: number; isClaimed: boolean }>;
        return selected.map(m => {
          const state = parsed[m.id];
          return {
            ...m,
            currentProgress: state ? state.currentProgress : (m.id === selected[0].id ? 1 : 0),
            isClaimed: state ? state.isClaimed : false
          };
        });
      }
    } catch {
      // fallback
    }
  }

  return selected.map((m, idx) => ({
    ...m,
    currentProgress: idx === 0 ? 1 : 0,
    isClaimed: false
  }));
}

// 5. GUARDAR ESTADO DE MISIONES POR USUARIO
export function saveUserDailyMissionsState(missions: DailyMission[], userIdentifier?: string | number) {
  if (typeof window === 'undefined') return;
  try {
    const dateStr = getTodayDateString();
    const userKey = userIdentifier ? String(userIdentifier) : 'guest';
    const storageKey = `zentry_user_missions_${userKey}_${dateStr}`;
    const stateMap: Record<string, { currentProgress: number; isClaimed: boolean }> = {};
    missions.forEach(m => {
      stateMap[m.id] = {
        currentProgress: m.currentProgress,
        isClaimed: m.isClaimed
      };
    });
    localStorage.setItem(storageKey, JSON.stringify(stateMap));
  } catch (e) {
    console.warn('No se pudo guardar el progreso de misiones:', e);
  }
}

// 6. OBTENER Y GUARDAR LOGROS POR USUARIO
export function getUserAchievements(userIdentifier?: string | number): AchievementItem[] {
  const userKey = userIdentifier ? String(userIdentifier) : 'guest';
  if (typeof window !== 'undefined') {
    try {
      const storageKey = `zentry_user_achievements_${userKey}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, { isUnlocked: boolean; progress?: number; unlockedDate?: string }>;
        return ACHIEVEMENTS_POOL.map(ach => {
          const state = parsed[ach.id];
          if (state) {
            return {
              ...ach,
              isUnlocked: state.isUnlocked,
              progress: state.progress !== undefined ? state.progress : ach.progress,
              unlockedDate: state.unlockedDate || ach.unlockedDate
            };
          }
          return ach;
        });
      }
    } catch {
      // fallback
    }
  }
  return ACHIEVEMENTS_POOL;
}

export function saveUserAchievementsState(achievements: AchievementItem[], userIdentifier?: string | number) {
  if (typeof window === 'undefined') return;
  try {
    const userKey = userIdentifier ? String(userIdentifier) : 'guest';
    const storageKey = `zentry_user_achievements_${userKey}`;
    const stateMap: Record<string, { isUnlocked: boolean; progress?: number; unlockedDate?: string }> = {};
    achievements.forEach(a => {
      stateMap[a.id] = {
        isUnlocked: a.isUnlocked,
        progress: a.progress,
        unlockedDate: a.unlockedDate
      };
    });
    localStorage.setItem(storageKey, JSON.stringify(stateMap));
  } catch (e) {
    console.warn('No se pudo guardar el progreso de logros:', e);
  }
}
