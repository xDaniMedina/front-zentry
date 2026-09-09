'use server'

import { fetchAPI, ApiError } from '@/lib/api'
import { revalidatePath } from 'next/cache'
import { StudioProject } from '@/types'

type BackendStudioProject = {
  id: number
  title: string
  description: string | null
  type: 'CANVAS' | 'DOCUMENT' | 'IMAGE' | 'VIDEO' | 'AUDIO'
  contentData: string | null
  mediaUrl: string | null
  tools: string[] | null
  rewardCoins: number | null
  ownerUsername: string
  published: boolean
  postId: number | null
  createdAt: string
  lastEditedAt: string
}

function typeToFrontend(type: BackendStudioProject['type']): StudioProject['type'] {
  return type.toLowerCase() as StudioProject['type']
}

function typeToBackend(type: StudioProject['type']): BackendStudioProject['type'] {
  return type.toUpperCase() as BackendStudioProject['type']
}

// Para documentos, contentData es el texto plano. Para el resto, es un JSON con
// metadatos del editor (zoom, modo pixel art, puntos de recorte, etc).
function decodeContentData(type: StudioProject['type'], raw: string | null): { content?: string; metadata?: Record<string, any> } {
  if (!raw) return {}
  if (type === 'document') return { content: raw }
  try {
    return { metadata: JSON.parse(raw) }
  } catch {
    return {}
  }
}

function toStudioProject(p: BackendStudioProject): StudioProject {
  const type = typeToFrontend(p.type)
  const { content, metadata } = decodeContentData(type, p.contentData)
  return {
    id: String(p.id),
    title: p.title,
    type,
    lastEdited: new Date(p.lastEditedAt || p.createdAt).toLocaleDateString(),
    reward: p.rewardCoins ?? 50,
    content,
    thumbnail_url: p.mediaUrl || null,
    metadata,
    created_at: p.createdAt,
    published: Boolean(p.published),
    postId: p.postId,
  }
}

export async function getStudioProjects(): Promise<{ success: boolean; data?: StudioProject[]; error?: string }> {
  try {
    const res: BackendStudioProject[] | null = await fetchAPI('/api/core/studio/projects')
    if (!res) {
      return { success: false, error: 'No se pudieron cargar los proyectos del estudio' }
    }
    return { success: true, data: res.map(toStudioProject) }
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
    const res: BackendStudioProject | null = await fetchAPI(`/api/core/studio/projects/${id}`)
    if (!res) {
      return { success: false, error: 'Proyecto no encontrado' }
    }
    return { success: true, data: toStudioProject(res) }
  } catch (error) {
    console.error(`Error al obtener proyecto ${id}:`, error)
    return { success: false, error: 'Error al cargar el proyecto' }
  }
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',')
  const mimeMatch = header.match(/data:(.*?);base64/)
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream'
  const buffer = Buffer.from(base64, 'base64')
  return new Blob([buffer], { type: mime })
}

export async function createStudioProjectAction(payload: {
  title: string
  type: StudioProject['type']
  description?: string
  content?: string
  metadata?: Record<string, any>
  file?: File | null
  imageDataUrl?: string
  rewardCoins?: number
}): Promise<{ success: boolean; data?: StudioProject; error?: string }> {
  try {
    const contentData = payload.type === 'document' ? (payload.content || '') : JSON.stringify(payload.metadata || {})

    const meta = {
      title: payload.title,
      description: payload.description,
      type: typeToBackend(payload.type),
      contentData,
      rewardCoins: payload.rewardCoins,
    }

    const formData = new FormData()
    formData.append('data', new Blob([JSON.stringify(meta)], { type: 'application/json' }))
    if (payload.file) {
      formData.append('file', payload.file)
    } else if (payload.imageDataUrl) {
      formData.append('file', dataUrlToBlob(payload.imageDataUrl), 'canvas.png')
    }

    const res: BackendStudioProject | null = await fetchAPI('/api/core/studio/projects', {
      method: 'POST',
      body: formData,
    })

    if (!res) {
      return { success: false, error: 'No se pudo crear el proyecto' }
    }

    revalidatePath('/studio')
    return { success: true, data: toStudioProject(res) }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo crear el proyecto'
    console.error('Error al crear proyecto de estudio:', error)
    return { success: false, error: message }
  }
}

export async function updateStudioProjectAction(id: string, payload: {
  title: string
  type: StudioProject['type']
  content?: string
  metadata?: Record<string, any>
  file?: File | null
  imageDataUrl?: string
}): Promise<{ success: boolean; data?: StudioProject; error?: string }> {
  try {
    const contentData = payload.type === 'document' ? (payload.content || '') : JSON.stringify(payload.metadata || {})

    const meta = {
      title: payload.title,
      type: typeToBackend(payload.type),
      contentData,
    }

    const formData = new FormData()
    formData.append('data', new Blob([JSON.stringify(meta)], { type: 'application/json' }))
    if (payload.file) {
      formData.append('file', payload.file)
    } else if (payload.imageDataUrl) {
      formData.append('file', dataUrlToBlob(payload.imageDataUrl), 'canvas.png')
    }

    const res: BackendStudioProject | null = await fetchAPI(`/api/core/studio/projects/${id}`, {
      method: 'PUT',
      body: formData,
    })

    if (!res) {
      return { success: false, error: 'No se pudo guardar el proyecto' }
    }

    revalidatePath('/studio')
    revalidatePath(`/studio/${id}`)
    return { success: true, data: toStudioProject(res) }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo guardar el proyecto'
    console.error('Error al actualizar proyecto de estudio:', error)
    return { success: false, error: message }
  }
}

export async function publishStudioProjectAction(id: string): Promise<{ success: boolean; data?: StudioProject; error?: string }> {
  try {
    const res: BackendStudioProject | null = await fetchAPI(`/api/core/studio/projects/${id}/publish`, {
      method: 'POST',
    })
    if (!res) {
      return { success: false, error: 'No se pudo publicar el proyecto en el feed' }
    }
    revalidatePath('/studio')
    revalidatePath('/feed')
    return { success: true, data: toStudioProject(res) }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo publicar el proyecto en el feed'
    console.error(`Error al publicar proyecto ${id}:`, error)
    return { success: false, error: message }
  }
}

export async function deleteStudioProjectAction(id: string): Promise<{ success: boolean; error?: string }> {
  if (!id || isNaN(Number(id))) {
    return { success: true }
  }
  try {
    await fetchAPI(`/api/core/studio/projects/${id}`, { method: 'DELETE' })
    revalidatePath('/studio')
    return { success: true }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo eliminar el proyecto'
    console.error(`Error al eliminar proyecto ${id}:`, error)
    return { success: false, error: message }
  }
}
