"use client"

import Image from "next/image"
import { cn, getImageUrl, getInitials } from "@/lib/utils"
import { rarityRingClass, rarityRingClassSmall, toShopRarity, UserCosmetics } from "@/lib/shop"

interface UserAvatarProps {
  name: string
  avatarUrl?: string | null
  cosmetics?: UserCosmetics | null
  /** Tamaño en px */
  size?: number
  className?: string
  /** "rounded-full" por defecto; algunas vistas usan cuadrados redondeados */
  shape?: "circle" | "rounded"
  showPet?: boolean
}

/**
 * Avatar con los cosméticos equipados del usuario: marco (anillo según rareza) y mascota.
 * Se usa en feed, comentarios, mensajes y listas para que se vea igual en toda la plataforma.
 */
export default function UserAvatar({
  name, avatarUrl, cosmetics, size = 40, className, shape = "circle", showPet = true,
}: UserAvatarProps) {
  const rarity = toShopRarity(cosmetics?.frameRarity)
  const ring = rarity ? (size < 40 ? rarityRingClassSmall(rarity) : rarityRingClass(rarity)) : ""
  const radius = shape === "circle" ? "rounded-full" : "rounded-2xl"

  return (
    <span className={cn("relative inline-flex shrink-0", className)} style={{ width: size, height: size }}>
      <span
        className={cn(
          "relative w-full h-full overflow-hidden flex items-center justify-center bg-purple-950/40 border border-purple-500/30 font-black text-purple-300",
          radius,
          ring
        )}
        style={{ fontSize: Math.max(9, Math.round(size / 3.4)) }}
        title={cosmetics?.frameName ? `Marco: ${cosmetics.frameName}` : undefined}
      >
        {avatarUrl ? (
          <Image src={getImageUrl(avatarUrl)} alt={name} fill sizes={`${size}px`} className="object-cover" />
        ) : (
          getInitials(name)
        )}
      </span>
      {showPet && cosmetics?.petIcon && (
        <span
          className="absolute -bottom-1 -right-1.5 leading-none drop-shadow-md select-none"
          style={{ fontSize: Math.max(10, Math.round(size / 2.6)) }}
          title={cosmetics.petName ? `Mascota: ${cosmetics.petName}` : undefined}
          aria-hidden
        >
          {cosmetics.petIcon}
        </span>
      )}
    </span>
  )
}

/** Título equipado (ej. "⌨️ Maestro del Código") como pequeña insignia junto al nombre */
export function UserTitleBadge({ cosmetics, className }: { cosmetics?: UserCosmetics | null; className?: string }) {
  if (!cosmetics?.titleName) return null
  return (
    <span className={cn(
      "text-[9px] font-bold text-purple-300 bg-purple-950/70 px-1.5 py-0.5 rounded-md border border-purple-500/30 shrink-0 whitespace-nowrap",
      className
    )}>
      {cosmetics.titleIcon} {cosmetics.titleName}
    </span>
  )
}
