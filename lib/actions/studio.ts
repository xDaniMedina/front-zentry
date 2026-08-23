'use server'

import { fetchAPI } from '@/lib/api'
import { revalidatePath } from 'next/cache'
import { StudioProject } from '@/types'

export async function getStudioProjects(): Promise<{ success: boolean; data?: StudioProject[]; error?: string }> {
  try {
    const res = await fetchAPI('/api/core/posts?scope=my')
    if (!res) {
      return { success: false, error: 'No se pudieron cargar los proyectos del estudio' }
    }
    const posts = Array.isArray(res) ? res : (res.content || res.data || [])
    const mapped: StudioProject[] = posts.map((p: any) => ({
      id: String(p.id),
      title: p.title || 'Proyecto sin título',
      type: p.contentType || p.content_type || p.type || 'canvas',
      lastEdited: p.updatedAt || p.createdAt || p.created_at 
        ? new Date(p.updatedAt || p.createdAt || p.created_at).toLocaleDateString() 
        : 'Recientemente',
      reward: p.reward || 50,
      content: p.contenido || p.content || '',
      thumbnail_url: p.thumbnailUrl || p.thumbnail_url || p.imageUrl || p.image_url || null,
      metadata: p.metadata || {}
    }))
    return { success: true, data: mapped }
  } catch (error) {
    console.error('Error al obtener proyectos del estudio:', error)
    return { success: false, error: 'Error al conectar con el servidor' }
  }
}

export async function getStudioProjectById(id: string): Promise<{ success: boolean; data?: StudioProject; error?: string }> {
  if (!id || id === 'new' || isNaN(Number(id))) {
    return { success: false, error: 'ID no válido o proyecto nuevo' }
  }
  try {
    const res = await fetchAPI(`/api/core/posts/${id}`)
    if (!res) {
      return { success: false, error: 'Proyecto no encontrado' }
    }
    return {
      success: true,
      data: {
        id: String(res.id || id),
        title: res.title || `Proyecto ${id}`,
        type: res.contentType || res.content_type || res.type || 'canvas',
        lastEdited: res.updatedAt 
          ? new Date(res.updatedAt).toLocaleDateString() 
          : (res.createdAt ? new Date(res.createdAt).toLocaleDateString() : 'Hoy'),
        reward: res.reward || 50,
        content: res.contenido || res.content || '',
        thumbnail_url: res.thumbnailUrl || res.thumbnail_url || res.imageUrl || res.image_url || null,
        metadata: res.metadata || {}
      }
    }
  } catch (error) {
    console.error(`Error al obtener proyecto ${id}:`, error)
    return { success: false, error: 'Error al cargar el proyecto' }
  }
}

export async function saveStudioProjectAction(payload: {
  id?: string
  title: string
  type: string
  content?: string
  imageBlob?: string
  metadata?: Record<string, any>
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const isNumericId = payload.id && !isNaN(Number(payload.id)) && Number(payload.id) > 0
    const endpoint = isNumericId ? `/api/core/posts/${payload.id}` : '/api/core/posts'
    const method = isNumericId ? 'PUT' : 'POST'

    const res = await fetchAPI(endpoint, {
      method,
      body: JSON.stringify({
        title: payload.title,
        contenido: payload.content || '',
        content: payload.content || '',
        contentType: payload.type,
        content_type: payload.type,
        type: payload.type,
        visibility: 'public',
        metadata: payload.metadata || {},
        thumbnailUrl: payload.imageBlob || null,
        thumbnail_url: payload.imageBlob || null,
      }),
    })

    if (!res) {
      return { success: false, error: 'No se pudo guardar el proyecto en el servidor' }
    }

    revalidatePath('/studio')
    if (isNumericId) {
      revalidatePath(`/studio/${payload.id}`)
    }

    return { success: true, data: res }
  } catch (error) {
    console.error('Error al guardar proyecto de estudio:', error)
    return { success: false, error: 'Error de servidor al guardar' }
  }
}

export async function deleteStudioProjectAction(id: string): Promise<{ success: boolean }> {
  if (!id || isNaN(Number(id))) {
    return { success: true }
  }
  try {
    const res = await fetchAPI(`/api/core/posts/${id}`, {
      method: 'DELETE',
    })
    revalidatePath('/studio')
    return { success: true }
  } catch (error) {
    console.error(`Error al eliminar proyecto ${id}:`, error)
    return { success: false }
  }
}
