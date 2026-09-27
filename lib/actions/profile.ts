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
        specialties: formData.get('specialties'),
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

export async function getMyProfileAction() {
  try {
    const res = await fetchAPI('/api/core/profiles/me')
    if (!res) {
      return { success: false as const }
    }
    return { success: true as const, data: res }
  } catch (error) {
    console.error('Error al obtener mi perfil:', error)
    return { success: false as const }
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

// Se ejecuta en el servidor: la cookie zentry_token es HTTP-Only y el navegador no puede leerla
export async function saveOnboardingProfileAction(payload: {
  name: string
  artisticName: string
  username: string
  birthDate: string
  discipline: string
  specialties: string
  bio: string
  experienceLevel: string
}) {
  try {
    const res = await fetchAPI('/api/core/profiles/me', {
      method: 'PUT',
      body: JSON.stringify({ ...payload, onboardingCompleted: true }),
    })
    if (!res) {
      return { success: false as const, message: 'Tu sesión expiró. Inicia sesión de nuevo.' }
    }
    revalidatePath('/', 'layout')
    return { success: true as const, data: res }
  } catch (error) {
    console.error('Error guardando onboarding:', error)
    const message = error instanceof Error ? error.message : 'Error de conexión'
    return { success: false as const, message }
  }
}

export async function getProfileByUsernameAction(username: string) {
  try {
    const res = await fetchAPI(`/api/core/profiles/${encodeURIComponent(username.replace(/^@/, ''))}`)
    if (!res) return { success: false as const }
    return { success: true as const, data: res }
  } catch {
    return { success: false as const }
  }
}
