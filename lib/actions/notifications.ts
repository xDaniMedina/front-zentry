'use server'

import { fetchAPI } from '@/lib/api'
import { revalidatePath } from 'next/cache'
import { Notification } from '@/types'

export async function getNotificationsAction(): Promise<{ success: boolean; data?: Notification[]; error?: string }> {
  try {
    let res = await fetchAPI('/api/core/notifications')
    if (!res) {
      res = await fetchAPI('/api/v1/notifications')
    }
    if (!res) {
      return { success: false, error: 'No se pudieron cargar las notificaciones' }
    }
    return { success: true, data: Array.isArray(res) ? res : res.data || res.content || [] }
  } catch (error) {
    console.error('Error al obtener notificaciones:', error)
    return { success: false, error: 'Error al conectar con el servidor' }
  }
}

export async function markNotificationReadAction(notificationId: string | number): Promise<{ success: boolean }> {
  try {
    let res = await fetchAPI(`/api/core/notifications/${notificationId}/read`, {
      method: 'PUT',
    })
    if (!res) {
      res = await fetchAPI(`/api/v1/notifications/${notificationId}/read`, {
        method: 'PUT',
      })
    }
    revalidatePath('/notifications')
    return { success: !!res }
  } catch (error) {
    console.error(`Error al marcar notificación ${notificationId} como leída:`, error)
    return { success: false }
  }
}

export async function markAllNotificationsReadAction(): Promise<{ success: boolean }> {
  try {
    let res = await fetchAPI('/api/core/notifications/read-all', {
      method: 'PUT',
    })
    if (!res) {
      res = await fetchAPI('/api/v1/notifications/read-all', {
        method: 'PUT',
      })
    }
    revalidatePath('/notifications')
    return { success: !!res }
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error)
    return { success: false }
  }
}

export async function clearNotificationsAction(): Promise<{ success: boolean }> {
  try {
    let res = await fetchAPI('/api/core/notifications', {
      method: 'DELETE',
    })
    if (!res) {
      res = await fetchAPI('/api/v1/notifications', {
        method: 'DELETE',
      })
    }
    revalidatePath('/notifications')
    return { success: !!res }
  } catch (error) {
    console.error('Error al vaciar notificaciones:', error)
    return { success: false }
  }
}
