'use server'

import { fetchAPI } from '@/lib/api'
import { revalidatePath } from 'next/cache'
import { Community } from '@/types'

export async function getCommunities(): Promise<{ success: boolean; data?: Community[]; error?: string }> {
  try {
    const data = await fetchAPI('/api/core/communities')
    if (!data) {
      return { success: false, error: 'No se pudieron cargar las comunidades' }
    }
    const communities = data.content || data.data || (Array.isArray(data) ? data : [])
    return { success: true, data: communities }
  } catch (error) {
    console.error('Error al obtener comunidades:', error)
    return { success: false, error: 'Error de red' }
  }
}

export async function getCommunityBySlug(slug: string): Promise<{ success: boolean; data?: Community; error?: string }> {
  try {
    const data = await fetchAPI(`/api/core/communities/${slug}`)
    if (!data) {
      return { success: false, error: 'Comunidad no encontrada' }
    }
    return { success: true, data }
  } catch (error) {
    console.error(`Error al obtener comunidad ${slug}:`, error)
    return { success: false, error: 'Error al conectar con la comunidad' }
  }
}

export async function joinCommunityAction(communityId: string) {
  try {
    const res = await fetchAPI(`/api/core/communities/${communityId}/join`, {
      method: 'POST',
    })
    revalidatePath('/communities')
    return { success: !!res }
  } catch (error) {
    console.error('Error al unirse a la comunidad:', error)
    return { success: false }
  }
}

export async function leaveCommunityAction(communityId: string) {
  try {
    const res = await fetchAPI(`/api/core/communities/${communityId}/leave`, {
      method: 'POST',
    })
    revalidatePath('/communities')
    return { success: !!res }
  } catch (error) {
    console.error('Error al salir de la comunidad:', error)
    return { success: false }
  }
}

type CommunityPayload = { name: string; description: string; slug: string; category: string }

export async function createCommunityAction(payload: CommunityPayload) {
  try {
    const res = await fetchAPI('/api/core/communities', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    revalidatePath('/communities')
    return { success: !!res, data: res }
  } catch (error) {
    console.error('Error al crear la comunidad:', error)
    return { success: false }
  }
}

export async function updateCommunityAction(communityId: string, payload: CommunityPayload) {
  try {
    const res = await fetchAPI(`/api/core/communities/${communityId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    revalidatePath('/communities')
    return { success: !!res, data: res }
  } catch (error) {
    console.error('Error al actualizar la comunidad:', error)
    return { success: false }
  }
}

export async function deleteCommunityAction(communityId: string) {
  try {
    const res = await fetchAPI(`/api/core/communities/${communityId}`, {
      method: 'DELETE',
    })
    revalidatePath('/communities')
    return { success: !!res }
  } catch (error) {
    console.error('Error al eliminar la comunidad:', error)
    return { success: false }
  }
}

export async function updateCommunityConfigAction(communityId: string, formData: FormData) {
  try {
    const res = await fetchAPI(`/api/core/communities/${communityId}`, {
      method: 'PUT',
      body: formData,
    })
    revalidatePath(`/communities/${communityId}`)
    return { success: !!res, data: res }
  } catch (error) {
    console.error('Error al guardar configuración de la comunidad:', error)
    return { success: false }
  }
}
