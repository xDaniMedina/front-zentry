'use server'

import { fetchAPI } from '@/lib/api'
import { revalidatePath } from 'next/cache'
import { Transaction } from '@/types'

export async function getWalletBalance(): Promise<{ success: boolean; coins?: number; transactions?: Transaction[]; error?: string }> {
  try {
    const data = await fetchAPI('/api/v1/wallet')
    if (!data) {
      return { success: false, error: 'No se pudo obtener la información de la billetera' }
    }
    return { success: true, coins: data.zentry_coins, transactions: data.transactions }
  } catch (error) {
    console.error('Error al obtener datos de billetera:', error)
    return { success: false, error: 'Error de servidor' }
  }
}

export async function claimMissionAction(missionId: string) {
  try {
    const res = await fetchAPI(`/api/v1/missions/${missionId}/claim`, {
      method: 'POST',
    })
    revalidatePath('/wallet')
    revalidatePath('/feed')
    return { success: !!res, data: res }
  } catch (error) {
    console.error('Error al reclamar misión:', error)
    return { success: false }
  }
}
