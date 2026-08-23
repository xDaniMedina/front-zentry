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
