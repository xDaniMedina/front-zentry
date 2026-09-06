"use client"

import { useState } from "react"
import { Sparkles, Coins, CheckCircle2, Flame } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { ShopItem, rarityRingClass, rarityGradientClass } from "@/lib/shop"
import { getStoreCatalogAction, getEquippedItemsAction, buyShopItemAction, equipShopItemAction } from "@/lib/actions/shop"
import { getWalletBalance } from "@/lib/actions/wallet"
import useSWR from "swr"
import { getInitials, getImageUrl } from "@/lib/utils"
import MissionsModal from "@/components/feed/MissionsModal"
import Image from "next/image"

export default function ShopClient() {
  const { user } = useAuth();
  const rawUsername = user?.username || user?.email || 'creador';
  const cleanUsername = rawUsername.replace(/^@/, '').toLowerCase().trim();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);

  const { data: walletRes } = useSWR('walletBalance', getWalletBalance, { refreshInterval: 15000 });
  const { data: catalogRes, mutate: mutateCatalog } = useSWR('storeCatalog', getStoreCatalogAction);
  const { data: equippedRes, mutate: mutateEquipped } = useSWR('equippedItems', getEquippedItemsAction);

  const items = catalogRes?.items || [];
  const equipped = equippedRes?.equipped || {};
  const coins = walletRes?.coins ?? user?.zentry_coins ?? 0;
  const ownedCount = items.filter(i => i.owned).length;

  const handleBuy = async (item: ShopItem) => {
    const res = await buyShopItemAction(item.id);
    if (!res.success) {
      toast.error(res.message || "No se pudo comprar el artículo");
      return;
    }
    await mutateCatalog();

    const equipRes = await equipShopItemAction(item.id);
    if (equipRes.equipped) mutateEquipped({ success: true, equipped: equipRes.equipped }, { revalidate: false });

    toast.success(`🎉 ¡Compraste "${item.name}" con éxito y se ha equipado!`);
  };

  const handleToggleEquip = async (item: ShopItem) => {
    const res = await equipShopItemAction(item.id);
    if (res.success) {
      if (res.equipped) mutateEquipped({ success: true, equipped: res.equipped }, { revalidate: false });
      toast.success(`Cambios aplicados para "${item.name}".`);
    } else {
      toast.error(res.message || "Error al equipar");
    }
  };

  const filteredItems = items.filter(item => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'inventory') return item.owned;
    return item.category === selectedCategory;
  });

  const equippedFrameItem = items.find(i => i.id === equipped.frames);
  const equippedPetItem = items.find(i => i.id === equipped.pets);
  const equippedTitleItem = items.find(i => i.id === equipped.titles);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-28 space-y-8">

      {/* 1. HERO BANNER DE LA TIENDA */}
      <div className="relative rounded-3xl p-6 sm:p-10 overflow-hidden border border-zentry-border bg-gradient-to-r from-purple-950 via-[#151528] to-amber-950/80 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5" /> Tienda Exclusiva Zentry
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Personaliza tu Perfil con <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Zentry Coins</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300">
              Desbloquea marcos de avatar con auras, mascotas de compañía, temas cósmicos y fondos legendarios.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#0a0a14]/80 p-4 sm:p-5 rounded-3xl border border-zinc-700/60 shadow-xl backdrop-blur-md">
            <div className="relative flex items-center justify-center">
              <div className={`w-16 h-16 rounded-full bg-purple-900/50 border-2 border-purple-500 flex items-center justify-center font-black text-lg text-purple-300 shadow-md relative overflow-hidden ${equippedFrameItem ? rarityRingClass(equippedFrameItem.rarity) : ''}`}>
                {user?.avatar_url ? (
                  <Image src={getImageUrl(user.avatar_url)} alt="Avatar" fill sizes="64px" className="object-cover rounded-full" />
                ) : (
                  getInitials(user?.name || cleanUsername)
                )}
              </div>
              {equippedPetItem && (
                <span className="absolute -bottom-2 -right-2 text-2xl filter drop-shadow-md animate-bounce" title={`Mascota: ${equippedPetItem.name}`}>
                  {equippedPetItem.icon}
                </span>
              )}
            </div>

            <div className="text-center sm:text-left space-y-1">
              <div className="text-[10px] uppercase font-black tracking-wider text-zinc-400">Tu Saldo Disponible</div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Coins className="w-6 h-6 text-amber-400 animate-pulse" />
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {coins.toLocaleString()} <span className="text-xs text-amber-300">ZC</span>
                </span>
              </div>
              {equippedTitleItem && (
                <div className="text-[10px] font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-500/30 inline-block">
                  {equippedTitleItem.name}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMissionsOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white text-xs font-black rounded-2xl shadow-lg shadow-orange-500/25 flex items-center gap-1.5 transition-transform active:scale-95 shrink-0"
            >
              <Flame className="w-4 h-4" /> Ganar ZC
            </button>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE CATEGORÍAS */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 custom-scrollbar">
        {[
          { id: 'all', label: '🌟 Todos los Artículos' },
          { id: 'frames', label: '🖼️ Marcos de Avatar' },
          { id: 'pets', label: '🐾 Mascotas & Compañeros' },
          { id: 'banners', label: '🌄 Fondos de Perfil' },
          { id: 'themes', label: '🎨 Temas Visuales' },
          { id: 'titles', label: '👑 Títulos Honoríficos' },
          { id: 'inventory', label: `🎒 Mi Inventario (${ownedCount})` }
        ].map(cat => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 scale-105 border border-purple-400/50'
                  : 'bg-[#141424] hover:bg-[#1e1e34] text-zinc-300 border border-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 3. GRID DE ARTÍCULOS DE LA TIENDA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredItems.map(item => {
          const isEquipped = Object.values(equipped).includes(item.id);

          const rarityStyles = {
            common: 'border-zinc-800 bg-[#12121e]',
            rare: 'border-blue-500/40 bg-gradient-to-b from-blue-950/30 via-[#12121e] to-[#12121e] shadow-lg shadow-blue-500/5',
            epic: 'border-purple-500/40 bg-gradient-to-b from-purple-950/30 via-[#12121e] to-[#12121e] shadow-lg shadow-purple-500/5',
            legendary: 'border-amber-500/50 bg-gradient-to-b from-amber-950/40 via-[#12121e] to-[#12121e] shadow-xl shadow-amber-500/10'
          }[item.rarity];

          const rarityBadge = {
            common: 'text-zinc-400 bg-zinc-800 border-zinc-700',
            rare: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
            epic: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
            legendary: 'text-amber-400 bg-amber-500/20 border-amber-500/40'
          }[item.rarity];

          return (
            <div
              key={item.id}
              className={`rounded-3xl border p-5 flex flex-col justify-between space-y-4 transition-all duration-300 hover:scale-[1.02] hover:border-zinc-600 relative overflow-hidden ${rarityStyles}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full border ${rarityBadge}`}>
                  {item.rarity}
                </span>

                {isEquipped ? (
                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 animate-pulse">
                    <CheckCircle2 className="w-3 h-3" /> Equipado
                  </span>
                ) : item.owned ? (
                  <span className="text-[10px] font-black text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                    Comprado
                  </span>
                ) : (
                  <span className="text-xs font-black text-amber-400 font-mono bg-amber-500/15 px-2.5 py-0.5 rounded-xl border border-amber-500/30 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" /> {item.price} ZC
                  </span>
                )}
              </div>

              <div className="h-32 rounded-2xl bg-[#0a0a14] border border-zinc-800/80 flex items-center justify-center relative overflow-hidden group">
                {item.category === 'frames' ? (
                  <div className={`relative overflow-hidden w-16 h-16 rounded-full bg-purple-900/40 border border-purple-400/50 flex items-center justify-center font-black text-xl text-purple-300 ${rarityRingClass(item.rarity)}`}>
                    {user?.avatar_url ? (
                      <Image src={getImageUrl(user.avatar_url)} alt="Preview" fill sizes="64px" className="object-cover rounded-full" />
                    ) : (
                      getInitials(user?.name || cleanUsername)
                    )}
                  </div>
                ) : item.category === 'banners' ? (
                  <div className={`w-full h-full rounded-2xl flex items-center justify-center p-3 text-center ${rarityGradientClass(item.rarity)}`}>
                    <span className="text-3xl filter drop-shadow-md">{item.icon}</span>
                  </div>
                ) : (
                  <span className="text-5xl filter drop-shadow-xl group-hover:scale-125 transition-transform duration-300">
                    {item.icon}
                  </span>
                )}
              </div>

              <div className="space-y-1.5 flex-1">
                <h3 className="font-black text-sm text-white">{item.name}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800/80">
                {item.owned ? (
                  <button
                    onClick={() => handleToggleEquip(item)}
                    className={`w-full py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isEquipped
                        ? 'bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 border border-zinc-700'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 active:scale-95'
                    }`}
                  >
                    {isEquipped ? 'Desequipar' : '✨ Equipar en Perfil'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={coins < item.price}
                    className={`w-full py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md ${
                      coins >= item.price
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black active:scale-95 cursor-pointer'
                        : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    {coins >= item.price ? `Comprar por ${item.price} ZC` : `Insuficiente (${item.price} ZC)`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <MissionsModal isOpen={isMissionsOpen} onClose={() => setIsMissionsOpen(false)} />

    </div>
  );
}
