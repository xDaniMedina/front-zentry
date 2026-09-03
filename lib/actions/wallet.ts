'use server'

import { fetchAPI } from '@/lib/api'
import { revalidatePath } from 'next/cache'
import { Transaction } from '@/types'

export async function getWalletBalance(): Promise<{ success: boolean; coins?: number; transactions?: Transaction[]; error?: string }> {
  try {
    const data = await fetchAPI('/api/core/wallet')
    if (!data) {
      return { success: false, error: 'No se pudo obtener la información de la billetera' }
    }
    return { success: true, coins: data.zentry_coins || data.coins || 0, transactions: data.transactions || [] }
  } catch (error) {
    console.error('Error al obtener datos de billetera:', error)
    return { success: false, error: 'Error de servidor' }
  }
}

export async function claimMissionAction(missionId: string) {
  try {
    const res = await fetchAPI(`/api/core/missions/${missionId}/claim`, {
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

export async function subscribeToPlanAction(planId: string, cycle: string) {
  try {
    const res = await fetchAPI('/api/core/wallet/subscribe', {
      method: 'POST',
      body: JSON.stringify({ planId, cycle }),
    })
    revalidatePath('/wallet')
    return { success: !!res, data: res }
  } catch (error) {
    console.error('Error al suscribirse al plan:', error)
    return { success: false }
  }
}
export async function sendCoinsAction(recipient: string, amount: number) {
  try {
    const res = await fetchAPI('/api/core/wallet/send', {
      method: 'POST',
      body: JSON.stringify({ recipient, amount }),
    })
    revalidatePath('/wallet')
    return { success: !!res, data: res }
  } catch (error) {
    console.error('Error al enviar coins:', error)
    return { success: false }
  }
}

export async function topupCoinsAction(amount: number) {
  try {
    const res = await fetchAPI('/api/core/wallet/topup', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
    revalidatePath('/wallet')
    return { success: !!res, data: res }
  } catch (error) {
    console.error('Error al recargar coins:', error)
    return { success: false }
  }
}
