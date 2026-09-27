// TIPOS DE LA TIENDA — el catálogo real vive en el backend (lib/actions/shop.ts)

export type ShopCategory = 'themes' | 'frames' | 'pets' | 'banners' | 'titles';
export type ShopRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ShopItem {
  id: number;
  name: string;
  category: ShopCategory;
  description: string;
  price: number;
  icon: string;
  rarity: ShopRarity;
  owned: boolean;
}

// Estilo genérico derivado solo de la rareza (el backend no guarda CSS por ítem)
export function rarityRingClass(rarity: ShopRarity): string {
  return {
    common: 'ring-2 ring-zinc-600',
    rare: 'ring-4 ring-blue-400 shadow-lg shadow-blue-400/40',
    epic: 'ring-4 ring-purple-500 shadow-xl shadow-purple-600/50 ring-offset-2 ring-offset-black',
    legendary: 'ring-4 ring-amber-400 shadow-2xl shadow-amber-400/60 ring-offset-2 ring-offset-black animate-pulse',
  }[rarity];
}

export function rarityGradientClass(rarity: ShopRarity): string {
  return {
    common: 'bg-gradient-to-r from-zinc-800 via-zinc-900 to-black',
    rare: 'bg-gradient-to-r from-blue-950 via-indigo-900 to-purple-950',
    epic: 'bg-gradient-to-r from-purple-950 via-pink-900 to-indigo-950',
    legendary: 'bg-gradient-to-r from-amber-950 via-orange-900 to-purple-950',
  }[rarity];
}

/** Cosméticos equipados de un usuario (espejo de CosmeticsResponse del backend) */
export interface UserCosmetics {
  frameRarity?: string | null;
  frameName?: string | null;
  petIcon?: string | null;
  petName?: string | null;
  titleIcon?: string | null;
  titleName?: string | null;
}

/** Anillo más fino para avatares pequeños (comentarios, listas) */
export function rarityRingClassSmall(rarity: ShopRarity): string {
  return {
    common: 'ring-2 ring-zinc-500',
    rare: 'ring-2 ring-blue-400 shadow-md shadow-blue-400/40',
    epic: 'ring-2 ring-purple-500 shadow-md shadow-purple-600/50',
    legendary: 'ring-2 ring-amber-400 shadow-lg shadow-amber-400/60 animate-pulse',
  }[rarity];
}

export function toShopRarity(value?: string | null): ShopRarity | null {
  const v = value?.toLowerCase();
  return v === 'common' || v === 'rare' || v === 'epic' || v === 'legendary' ? v : null;
}
