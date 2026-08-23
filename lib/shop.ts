// SISTEMA DE TIENDA Y PERSONALIZACIÓN CON ZENTRY COINS (ZC)

export interface ShopItem {
  id: string;
  name: string;
  category: 'themes' | 'frames' | 'pets' | 'banners' | 'titles';
  description: string;
  price: number;
  icon: string;
  previewClass?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  assetUrl?: string;
}

export interface UserEquipped {
  theme?: string;
  frame?: string;
  pet?: string;
  banner?: string;
  title?: string;
}

export const SHOP_CATALOG: ShopItem[] = [
  // 1. MARCOS DE AVATAR
  {
    id: 'frame_gold_aura',
    name: 'Aura Dorada Radiante',
    category: 'frames',
    description: 'Aura resplandeciente en oro de 24k para tu avatar en toda la plataforma.',
    price: 150,
    icon: '✨',
    rarity: 'rare',
    previewClass: 'ring-4 ring-amber-400 shadow-lg shadow-amber-400/50 animate-pulse'
  },
  {
    id: 'frame_crimson_flame',
    name: 'Fuego Carmesí',
    category: 'frames',
    description: 'Llamas ardientes de energía para creadores apasionados.',
    price: 300,
    icon: '🔥',
    rarity: 'epic',
    previewClass: 'ring-4 ring-orange-500 shadow-xl shadow-orange-600/60 ring-offset-2 ring-offset-black'
  },
  {
    id: 'frame_synthwave_neon',
    name: 'Neón Synthwave',
    category: 'frames',
    description: 'Borde cian y magenta neón futurista con efecto retro.',
    price: 220,
    icon: '⚡',
    rarity: 'rare',
    previewClass: 'ring-4 ring-pink-500 shadow-lg shadow-cyan-400/50'
  },
  {
    id: 'frame_legendary_dragon',
    name: 'Dragón Astral',
    category: 'frames',
    description: 'Marco legendario forjado con aliento de dragón cósmico.',
    price: 550,
    icon: '🐉',
    rarity: 'legendary',
    previewClass: 'ring-4 ring-purple-500 shadow-2xl shadow-purple-600/80 ring-offset-2 ring-offset-black'
  },
  {
    id: 'frame_royal_crown',
    name: 'Corona Imperial',
    category: 'frames',
    description: 'Distintivo de la realeza de Zentry para los creadores más influyentes.',
    price: 450,
    icon: '👑',
    rarity: 'epic',
    previewClass: 'ring-4 ring-amber-300 shadow-lg shadow-amber-300/40'
  },

  // 2. MASCOTAS VIRTUALES
  {
    id: 'pet_pixel_cat',
    name: 'Pixel Cat 🐱',
    category: 'pets',
    description: 'Un gatito pixel art que te acompaña en tus publicaciones y mensajes.',
    price: 120,
    icon: '🐱',
    rarity: 'common'
  },
  {
    id: 'pet_cyber_bot',
    name: 'Cyber Bot 🤖',
    category: 'pets',
    description: 'Droide de asistencia con IA para inspirar tus mejores proyectos.',
    price: 240,
    icon: '🤖',
    rarity: 'rare'
  },
  {
    id: 'pet_baby_dragon',
    name: 'Baby Dragon 🐉',
    category: 'pets',
    description: 'Cría de dragón elemental que escupe chispas doradas.',
    price: 480,
    icon: '🐉',
    rarity: 'epic'
  },
  {
    id: 'pet_astral_phoenix',
    name: 'Fénix Astral 🦅',
    category: 'pets',
    description: 'Ave inmortal de luz cósmica. Concede aura de prestigio permanente.',
    price: 600,
    icon: '🦅',
    rarity: 'legendary'
  },
  {
    id: 'pet_zentry_ghost',
    name: 'Zentry Ghost 👻',
    category: 'pets',
    description: 'Espíritu travieso de código y diseño.',
    price: 180,
    icon: '👻',
    rarity: 'common'
  },

  // 3. FONDOS DE PERFIL Y BANNERS
  {
    id: 'banner_future_city',
    name: 'Metrópolis Cyberpunk HD',
    category: 'banners',
    description: 'Ilustración panorámica nocturna de una megaciudad futurista.',
    price: 250,
    icon: '🏙️',
    rarity: 'rare',
    previewClass: 'bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900'
  },
  {
    id: 'banner_space_nebula',
    name: 'Nebulosa Cósmica',
    category: 'banners',
    description: 'Espacio profundo con polvo estelar y auroras boreales violetas.',
    price: 320,
    icon: '🌌',
    rarity: 'epic',
    previewClass: 'bg-gradient-to-r from-purple-950 via-pink-900 to-indigo-950'
  },
  {
    id: 'banner_samurai_temple',
    name: 'Templo Samurái & Cerezos',
    category: 'banners',
    description: 'Paz y honor tradicional con caída de pétalos de sakura.',
    price: 280,
    icon: '⛩️',
    rarity: 'rare',
    previewClass: 'bg-gradient-to-r from-rose-900 via-red-950 to-amber-950'
  },
  {
    id: 'banner_matrix_code',
    name: 'Matrix Code Rain',
    category: 'banners',
    description: 'Lluvia de caracteres binarios verdes para hackers del diseño.',
    price: 200,
    icon: '💻',
    rarity: 'common',
    previewClass: 'bg-gradient-to-r from-emerald-950 via-green-900 to-black'
  },
  {
    id: 'banner_synth_sunset',
    name: 'Atardecer Synthwave',
    category: 'banners',
    description: 'Sol gigante ocre en el horizonte con rejilla de neón 80s.',
    price: 290,
    icon: '🌅',
    rarity: 'epic',
    previewClass: 'bg-gradient-to-r from-orange-950 via-pink-900 to-purple-950'
  },

  // 4. TEMAS DE INTERFAZ
  {
    id: 'theme_cyberpunk',
    name: 'Tema Cyberpunk Neón',
    category: 'themes',
    description: 'Paleta electrizante cian y magenta de alto impacto.',
    price: 250,
    icon: '🎨',
    rarity: 'rare'
  },
  {
    id: 'theme_eclipse',
    name: 'Tema Eclipse Solar',
    category: 'themes',
    description: 'Negro ónix profundo con detalles en oro puro.',
    price: 350,
    icon: '🌑',
    rarity: 'epic'
  },
  {
    id: 'theme_mystic_forest',
    name: 'Tema Bosque Esmeralda',
    category: 'themes',
    description: 'Verdes profundos y tonos tierra relajantes.',
    price: 200,
    icon: '🌲',
    rarity: 'common'
  },
  {
    id: 'theme_imperial_gold',
    name: 'Tema Oro Imperial',
    category: 'themes',
    description: 'Lujo absoluto en dorado champagne y platino.',
    price: 500,
    icon: '👑',
    rarity: 'legendary'
  },

  // 5. TÍTULOS DE REPUTACIÓN
  {
    id: 'title_code_master',
    name: 'Maestro del Código ⚡',
    category: 'titles',
    description: 'Muestra tu maestría en ingeniería y desarrollo.',
    price: 300,
    icon: '⚡',
    rarity: 'rare'
  },
  {
    id: 'title_legend_designer',
    name: 'Diseñador Legendario 🎨',
    category: 'titles',
    description: 'Corona tu perfil con el máximo título visual.',
    price: 300,
    icon: '🎨',
    rarity: 'rare'
  },
  {
    id: 'title_cosmic_creator',
    name: 'Creador Cósmico 🌌',
    category: 'titles',
    description: 'El título más prestigioso de toda la red Zentry.',
    price: 450,
    icon: '🌌',
    rarity: 'legendary'
  }
];

export function getUserInventory(username: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const cleanU = (username || '').replace(/^@/, '').toLowerCase().trim();
    const raw = localStorage.getItem(`zentry_inventory_${cleanU}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveUserInventory(username: string, inventory: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const cleanU = (username || '').replace(/^@/, '').toLowerCase().trim();
    localStorage.setItem(`zentry_inventory_${cleanU}`, JSON.stringify(inventory));
  } catch {}
}

export function getUserEquipped(username: string): UserEquipped {
  if (typeof window === 'undefined') return {};
  try {
    const cleanU = (username || '').replace(/^@/, '').toLowerCase().trim();
    const raw = localStorage.getItem(`zentry_equipped_${cleanU}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {}
  return {};
}

export function saveUserEquipped(username: string, equipped: UserEquipped): void {
  if (typeof window === 'undefined') return;
  try {
    const cleanU = (username || '').replace(/^@/, '').toLowerCase().trim();
    localStorage.setItem(`zentry_equipped_${cleanU}`, JSON.stringify(equipped));
    
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel('zentry_customization');
      bc.postMessage({ type: 'EQUIPPED_UPDATED', username: cleanU, equipped });
      bc.close();
    }
  } catch {}
}

export function buyShopItem(itemId: string, username: string, currentCoins: number): { success: boolean; newCoins: number; error?: string } {
  const item = SHOP_CATALOG.find(i => i.id === itemId);
  if (!item) return { success: false, newCoins: currentCoins, error: 'Artículo no encontrado' };

  if (currentCoins < item.price) {
    return { success: false, newCoins: currentCoins, error: `Saldo insuficiente. Necesitas ${item.price} ZC (Tienes ${currentCoins} ZC).` };
  }

  const inventory = getUserInventory(username);
  if (inventory.includes(itemId)) {
    return { success: false, newCoins: currentCoins, error: 'Ya posees este artículo en tu inventario.' };
  }

  const updatedInventory = [...inventory, itemId];
  saveUserInventory(username, updatedInventory);

  const newCoins = currentCoins - item.price;
  
  // Guardar balance actualizado del usuario
  try {
    const cleanU = (username || '').replace(/^@/, '').toLowerCase().trim();
    const storedUser = localStorage.getItem('zentry_user');
    if (storedUser) {
      const u = JSON.parse(storedUser);
      u.zentry_coins = newCoins;
      localStorage.setItem('zentry_user', JSON.stringify(u));
    }
    localStorage.setItem(`zentry_coins_${cleanU}`, String(newCoins));
  } catch {}

  return { success: true, newCoins };
}

export function equipShopItem(itemId: string, category: 'themes' | 'frames' | 'pets' | 'banners' | 'titles', username: string): UserEquipped {
  const current = getUserEquipped(username);
  
  const categoryKeyMap: Record<string, keyof UserEquipped> = {
    themes: 'theme',
    frames: 'frame',
    pets: 'pet',
    banners: 'banner',
    titles: 'title'
  };

  const key = categoryKeyMap[category];
  const updated: UserEquipped = {
    ...current,
    [key]: current[key] === itemId ? undefined : itemId // Si ya estaba equipado, desequipar
  };

  saveUserEquipped(username, updated);
  return updated;
}
