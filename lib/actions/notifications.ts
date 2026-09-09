'use server'

import { fetchAPI } from '@/lib/api'
import { revalidatePath } from 'next/cache'
import { Notification } from '@/types'

export async function getNotificationsAction(): Promise<{ success: boolean; data?: Notification[]; error?: string }> {
  try {
    const res = await fetchAPI('/api/core/notifications?size=50')
    if (!res) {
      return { success: false, error: 'No se pudieron cargar las notificaciones' }
    }
    const data: Notification[] = Array.isArray(res) ? res : res.content || res.data || []
    return { success: true, data }
  } catch (error) {
    console.error('Error al obtener notificaciones:', error)
    return { success: false, error: 'Error al conectar con el servidor' }
  }
}

export async function markNotificationReadAction(notificationId: string | number): Promise<{ success: boolean }> {
  try {
    const res = await fetchAPI(`/api/core/notifications/${notificationId}/read`, {
      method: 'PUT',
    })
    revalidatePath('/notifications')
    return { success: !!res }
  } catch (error) {
    console.error(`Error al marcar notificación ${notificationId} como leída:`, error)
    return { success: false }
  }
}

export async function markAllNotificationsReadAction(): Promise<{ success: boolean }> {
  try {
    const res = await fetchAPI('/api/core/notifications/read-all', {
      method: 'PUT',
    })
    revalidatePath('/notifications')
    return { success: !!res }
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error)
    return { success: false }
  }
}

export async function clearNotificationsAction(): Promise<{ success: boolean }> {
  try {
    await fetchAPI('/api/core/notifications', {
      method: 'DELETE',
    })
    revalidatePath('/notifications')
    return { success: true }
  } catch (error) {
    console.error('Error al vaciar notificaciones:', error)
    return { success: false }
  }
}
