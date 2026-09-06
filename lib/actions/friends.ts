'use server'

import { fetchAPI } from '@/lib/api'
import { revalidatePath } from 'next/cache'
import { FriendUser } from '@/types'

export async function getFriendsAction(onlineOnly: boolean = false): Promise<{ success: boolean; data?: FriendUser[]; error?: string }> {
  try {
    const endpoint = onlineOnly ? '/api/core/friends/online' : '/api/core/friends'
    const res = await fetchAPI(endpoint)
    if (!res) {
      return { success: true, data: [] }
    }
    const list = Array.isArray(res) ? res : (res.data || res.content || [])
    return { success: true, data: list }
  } catch (error) {
    console.error('Error al obtener amigos:', error)
    return { success: false, error: 'Error al conectar con la red de amigos' }
  }
}

export async function getPendingFriendRequestsAction(): Promise<{ success: boolean; data?: FriendUser[]; error?: string }> {
  try {
    const res = await fetchAPI('/api/core/friends/requests/pending')
    if (!res) {
      return { success: true, data: [] }
    }
    const list = Array.isArray(res) ? res : (res.data || res.content || [])
    return { success: true, data: list }
  } catch (error) {
    console.error('Error al obtener solicitudes de amistad:', error)
    return { success: false, error: 'Error al cargar solicitudes' }
  }
}

export async function sendFriendRequestAction(
  targetUserIdOrUsername: number | string,
  message?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
     
    const body: Record<string, any> = { message: message || '' }
    if (typeof targetUserIdOrUsername === 'number' || !isNaN(Number(targetUserIdOrUsername))) {
      body.target_user_id = Number(targetUserIdOrUsername)
    } else {
      body.target_username = String(targetUserIdOrUsername)
    }

    const res = await fetchAPI('/api/core/friends/requests/send', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    if (!res) {
      return { success: false, error: 'No se pudo enviar la solicitud' }
    }

    revalidatePath('/')
    return { success: true, message: res.message || 'Solicitud enviada' }
  } catch (error) {
    console.error('Error enviando solicitud:', error)
    return { success: false, error: 'Error de red' }
  }
}

export async function acceptFriendRequestAction(requestId: number): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetchAPI(`/api/core/friends/requests/${requestId}/accept`, {
      method: 'POST',
    })

    revalidatePath('/')
    return { success: !!res, message: res?.message || '¡Ahora son amigos!' }
  } catch (error) {
    console.error(`Error aceptando solicitud ${requestId}:`, error)
    return { success: false }
  }
}

export async function rejectFriendRequestAction(requestId: number): Promise<{ success: boolean }> {
  try {
    const res = await fetchAPI(`/api/core/friends/requests/${requestId}/reject`, {
      method: 'POST',
    })

    revalidatePath('/')
    return { success: !!res }
  } catch (error) {
    console.error(`Error rechazando solicitud ${requestId}:`, error)
    return { success: false }
  }
}

export async function removeFriendAction(friendId: number): Promise<{ success: boolean }> {
  try {
    const res = await fetchAPI(`/api/core/friends/${friendId}`, {
      method: 'DELETE',
    })

    revalidatePath('/')
    return { success: !!res }
  } catch (error) {
    console.error(`Error eliminando amigo ${friendId}:`, error)
    return { success: false }
  }
}

export async function pingPresenceAction(status: string = 'online'): Promise<void> {
  try {
    await fetchAPI(`/api/core/friends/presence/ping?status=${encodeURIComponent(status)}`, {
      method: 'POST',
    })
  } catch { /* ignore */ }
}


export interface UserSocialStats {
  user_id: number;
  username: string;
  posts_count: number;
  followers_count: number;
  following_count: number;
  friends_count: number;
  zentry_coins: number;
  coins_today: number;
  reputation_score: number;
  current_streak?: number;
}

export async function getUserStatsAction(): Promise<{ success: boolean; data?: UserSocialStats; error?: string }> {
  try {
    const res = await fetchAPI('/api/core/friends/stats')
    if (!res) {
      return { success: false, error: 'No se pudieron cargar las estadísticas' }
    }
    return { success: true, data: res }
  } catch (error) {
    console.error('Error al obtener estadísticas del usuario:', error)
    return { success: false, error: 'Error al conectar con el servidor' }
  }
}

export async function getFollowersAction(username: string) {
  try {
    const res = await fetchAPI(`/api/core/follows/followers/${username}`);
    return { success: true, data: res }; // Asumiendo que res es un array de perfiles
  } catch (error: any) {
    console.error("Error fetching followers:", error);
    return { success: false, data: [] };
  }
}

export async function getFollowingAction(username: string) {
  try {
    const res = await fetchAPI(`/api/core/follows/following/${username}`);
    return { success: true, data: res };
  } catch (error: any) {
    console.error("Error fetching following:", error);
    return { success: false, data: [] };
  }
}

