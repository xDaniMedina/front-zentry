'use server'

import { fetchAPI, ApiError } from '@/lib/api'
import { revalidatePath } from 'next/cache'
import { ShopItem } from '@/lib/shop'

type BackendStoreItem = {
  id: number
  name: string
  description: string
  type: string
  rarity: string
  price: number
  imageUrl: string | null
  owned: boolean
}

function toShopItem(i: BackendStoreItem): ShopItem {
  return {
    id: i.id,
    name: i.name,
    category: i.type as ShopItem['category'],
    description: i.description,
    price: i.price,
    icon: i.imageUrl || '🎁',
    rarity: i.rarity.toLowerCase() as ShopItem['rarity'],
    owned: i.owned,
  }
}

export async function getStoreCatalogAction(): Promise<{ success: boolean; items: ShopItem[] }> {
  try {
    const res: BackendStoreItem[] | null = await fetchAPI('/api/core/store/items')
    return { success: true, items: (res || []).map(toShopItem) }
  } catch (error) {
    console.error('Error fetching store catalog:', error)
    return { success: false, items: [] }
  }
}

export async function getEquippedItemsAction(): Promise<{ success: boolean; equipped: Record<string, number> }> {
  try {
    const res: Record<string, number> | null = await fetchAPI('/api/core/store/equipped')
    return { success: true, equipped: res || {} }
  } catch (error) {
    console.error('Error fetching equipped items:', error)
    return { success: false, equipped: {} }
  }
}

export async function buyShopItemAction(itemId: number): Promise<{ success: boolean; message?: string }> {
  try {
    await fetchAPI(`/api/core/store/buy/${itemId}`, { method: 'POST' })
    revalidatePath('/shop')
    return { success: true, message: 'Compra exitosa' }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'Error al comprar el artículo'
    return { success: false, message }
  }
}

export async function equipShopItemAction(itemId: number): Promise<{ success: boolean; equipped?: Record<string, number>; message?: string }> {
  try {
    const res: Record<string, number> | null = await fetchAPI(`/api/core/store/equip/${itemId}`, { method: 'POST' })
    revalidatePath('/shop')
    return { success: true, equipped: res || {} }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'Error al equipar el artículo'
    return { success: false, message }
  }
}
