'use server'

import { fetchAPI } from '@/lib/api'
import { revalidatePath } from 'next/cache'

export async function updateProfileAction(formData: FormData) {
  try {
    const res = await fetchAPI('/api/core/profiles/me', {
      method: 'PUT',
      body: JSON.stringify({
        name: formData.get('name'),
        discipline: formData.get('discipline'),
        location: formData.get('location'),
        bio: formData.get('bio'),
      }),
    })

    if (!res) {
      return { success: false, message: 'Error al actualizar el perfil' }
    }

    revalidatePath('/profile/[username]', 'page')
    return { success: true, data: res }
  } catch (error) {
    console.error('Error actualizando perfil:', error)
    return { success: false, message: 'Error de conexión' }
  }
}

export async function followUserAction(targetUsername: string) {
  try {
    const res = await fetchAPI(`/api/core/profiles/${targetUsername}/follow`, {
      method: 'POST',
    })
    revalidatePath(`/profile/${targetUsername}`)
    return { success: !!res, data: res }
  } catch (error) {
    console.error('Error al seguir usuario:', error)
    return { success: false }
  }
}

export async function updateProfileWithFilesAction(formData: FormData) {
  try {
    const res = await fetchAPI('/api/core/profiles/me', {
      method: 'PUT',
      body: formData,
    })
    if (!res) {
      return { success: false, message: 'Error al actualizar el perfil' }
    }
    revalidatePath('/profile/[username]', 'page')
    return { success: true, data: res }
  } catch (error) {
    console.error('Error actualizando perfil con archivos:', error)
    return { success: false, message: 'Error de conexión' }
  }
}

export async function getProfileByUserIdAction(userId: number) {
  try {
    const res = await fetchAPI(`/api/core/profiles/by-user-id/${userId}`)
    if (!res) {
      return { success: false as const }
    }
    return { success: true as const, data: res }
  } catch (error) {
    console.error(`Error al obtener perfil del usuario ${userId}:`, error)
    return { success: false as const }
  }
}

export async function searchProfilesAction(query: string) {
  try {
    const res = await fetchAPI(`/api/core/profiles/search?q=${encodeURIComponent(query)}`)
    return { success: true, data: Array.isArray(res) ? res : [] }
  } catch (error) {
    console.error('Error al buscar perfiles:', error)
    return { success: false, data: [] }
  }
}
