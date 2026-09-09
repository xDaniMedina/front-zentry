'use server'

import { fetchAPI, ApiError } from '@/lib/api'
import { revalidatePath } from 'next/cache'
import { WalletTransaction } from '@/types'

type BackendWalletTransaction = {
  id: number
  username: string
  type: 'INGRESO' | 'EGRESO' | 'RECARGA'
  amount: number
  description: string
  createdAt: string
}

type BackendWallet = {
  id: number
  username: string
  balance: number
  activePlanId: string
  nextBillingDate: string | null
  transactions: BackendWalletTransaction[]
}

function toWalletTransaction(t: BackendWalletTransaction): WalletTransaction {
  return {
    id: String(t.id),
    type: t.type.toLowerCase() as WalletTransaction['type'],
    amount: t.amount,
    description: t.description,
    date: t.createdAt ? new Date(t.createdAt).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '',
  }
}

export async function getWalletBalance(): Promise<{
  success: boolean
  coins?: number
  planId?: string
  nextBillingDate?: string | null
  transactions?: WalletTransaction[]
  error?: string
}> {
  try {
    const data: BackendWallet | null = await fetchAPI('/api/core/wallet')
    if (!data) {
      return { success: false, error: 'No se pudo obtener la información de la billetera' }
    }
    return {
      success: true,
      coins: data.balance ?? 0,
      planId: data.activePlanId,
      nextBillingDate: data.nextBillingDate
        ? new Date(data.nextBillingDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
        : null,
      transactions: (data.transactions || []).map(toWalletTransaction),
    }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'Error de servidor'
    console.error('Error al obtener datos de billetera:', error)
    return { success: false, error: message }
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
    const message = error instanceof ApiError ? error.message : 'No se pudo cambiar de plan'
    console.error('Error al suscribirse al plan:', error)
    return { success: false, error: message }
  }
}

export async function sendCoinsAction(recipientUsername: string, amount: number) {
  try {
    const res = await fetchAPI('/api/core/wallet/transfer', {
      method: 'POST',
      body: JSON.stringify({ recipientUsername, amount }),
    })
    revalidatePath('/wallet')
    return { success: !!res, data: res }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo enviar Zentry Coins'
    console.error('Error al enviar coins:', error)
    return { success: false, error: message }
  }
}

export async function topupCoinsAction(amount: number) {
  try {
    const res = await fetchAPI('/api/core/wallet/recharge', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
    revalidatePath('/wallet')
    return { success: !!res, data: res }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo recargar Zentry Coins'
    console.error('Error al recargar coins:', error)
    return { success: false, error: message }
  }
}
