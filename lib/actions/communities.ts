'use server'

import { fetchAPI, ApiError } from '@/lib/api'
import { revalidatePath } from 'next/cache'

// El backend responde en español (CommunityResponse.java): nombre/descripcion/categoria.
// Esta capa lo traduce a los campos en inglés que ya usa toda la UI (name/description/category).
type BackendCommunity = {
  id: number
  slug: string
  nombre: string
  descripcion: string | null
  imageUrl: string | null
  avatarUrl: string | null
  bannerUrl: string | null
  categoria: string | null
  creatorId: number
  ownerUsername: string | null
  rules: string[] | null
  membersCount: number
  isJoined: boolean
  createdAt: string
}

export type CommunityDTO = {
  id: string
  slug: string
  name: string
  description: string
  members: number
  isJoined: boolean
  ownerUsername?: string
  ownerId?: string
  category?: string
  avatarUrl?: string
  bannerUrl?: string
  rules: string[]
}

function toCommunityDTO(c: BackendCommunity): CommunityDTO {
  return {
    id: String(c.id),
    slug: c.slug,
    name: c.nombre,
    description: c.descripcion || '',
    members: c.membersCount ?? 0,
    isJoined: Boolean(c.isJoined),
    ownerUsername: c.ownerUsername || undefined,
    ownerId: c.creatorId != null ? String(c.creatorId) : undefined,
    category: c.categoria || undefined,
    avatarUrl: c.avatarUrl || c.imageUrl || undefined,
    bannerUrl: c.bannerUrl || undefined,
    rules: c.rules || [],
  }
}

export async function getCommunities(): Promise<{ success: boolean; data: CommunityDTO[]; error?: string }> {
  try {
    const data = await fetchAPI('/api/core/communities')
    if (!data) {
      return { success: false, data: [], error: 'No se pudieron cargar las comunidades' }
    }
    const list: BackendCommunity[] = data.content || data.data || (Array.isArray(data) ? data : [])
    return { success: true, data: list.map(toCommunityDTO) }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'Error de red'
    console.error('Error al obtener comunidades:', error)
    return { success: false, data: [], error: message }
  }
}

export async function getCommunityBySlug(slug: string): Promise<{ success: boolean; data?: CommunityDTO; error?: string }> {
  try {
    const data: BackendCommunity | null = await fetchAPI(`/api/core/communities/${slug}`)
    if (!data) {
      return { success: false, error: 'Comunidad no encontrada' }
    }
    return { success: true, data: toCommunityDTO(data) }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'Error al conectar con la comunidad'
    console.error(`Error al obtener comunidad ${slug}:`, error)
    return { success: false, error: message }
  }
}

export async function joinCommunityAction(identifier: string): Promise<{ success: boolean; data?: CommunityDTO; error?: string }> {
  try {
    const res: BackendCommunity | null = await fetchAPI(`/api/core/communities/${identifier}/join`, { method: 'POST' })
    revalidatePath('/communities')
    return { success: !!res, data: res ? toCommunityDTO(res) : undefined }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo unir a la comunidad'
    console.error('Error al unirse a la comunidad:', error)
    return { success: false, error: message }
  }
}

export async function leaveCommunityAction(identifier: string): Promise<{ success: boolean; data?: CommunityDTO; error?: string }> {
  try {
    const res: BackendCommunity | null = await fetchAPI(`/api/core/communities/${identifier}/leave`, { method: 'POST' })
    revalidatePath('/communities')
    return { success: !!res, data: res ? toCommunityDTO(res) : undefined }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo salir de la comunidad'
    console.error('Error al salir de la comunidad:', error)
    return { success: false, error: message }
  }
}

type CommunityPayload = { name: string; description: string; slug?: string; category?: string }

export async function createCommunityAction(payload: CommunityPayload): Promise<{ success: boolean; data?: CommunityDTO; error?: string }> {
  try {
    const res: BackendCommunity | null = await fetchAPI('/api/core/communities', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (!res) {
      return { success: false, error: 'No se pudo crear la comunidad' }
    }
    revalidatePath('/communities')
    return { success: true, data: toCommunityDTO(res) }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo crear la comunidad'
    console.error('Error al crear la comunidad:', error)
    return { success: false, error: message }
  }
}

export async function deleteCommunityAction(communityId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await fetchAPI(`/api/core/communities/${communityId}`, { method: 'DELETE' })
    revalidatePath('/communities')
    return { success: true }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo eliminar la comunidad'
    console.error('Error al eliminar la comunidad:', error)
    return { success: false, error: message }
  }
}

// El backend solo expone UN endpoint de actualización (PUT .../{identifier}, multipart),
// que espera un part llamado "data" con el JSON de CommunityRequest — nunca campos sueltos.
export async function updateCommunityConfigAction(
  identifier: string,
  payload: { name?: string; description?: string; category?: string; rules?: string[] },
  files?: { avatar?: File | null; banner?: File | null }
): Promise<{ success: boolean; data?: CommunityDTO; error?: string }> {
  try {
    const formData = new FormData()
    formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
    if (files?.avatar) formData.append('avatar', files.avatar)
    if (files?.banner) formData.append('banner', files.banner)

    const res: BackendCommunity | null = await fetchAPI(`/api/core/communities/${identifier}`, {
      method: 'PUT',
      body: formData,
    })
    if (!res) {
      return { success: false, error: 'No se pudo guardar la configuración' }
    }
    revalidatePath(`/communities/${identifier}`)
    return { success: true, data: toCommunityDTO(res) }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo guardar la configuración de la comunidad'
    console.error('Error al guardar configuración de la comunidad:', error)
    return { success: false, error: message }
  }
}

type BackendPost = {
  id: number
  authorUsername: string | null
  authorName: string | null
  title: string
  contenido: string | null
  imageUrl: string | null
  likesCount: number
  commentsCount: number
  createdAt: string
}

export type CommunityPostDTO = {
  id: number
  author: string
  handle: string
  avatar: string
  title: string
  description?: string
  media_url?: string
  likes: number
  comments: number
  created_at: string
}

function toCommunityPost(p: BackendPost): CommunityPostDTO {
  const author = p.authorName || p.authorUsername || 'Usuario Zentry'
  return {
    id: p.id,
    author,
    handle: `@${p.authorUsername || author}`,
    avatar: author.substring(0, 2).toUpperCase(),
    title: p.title,
    description: p.contenido || undefined,
    media_url: p.imageUrl || undefined,
    likes: p.likesCount ?? 0,
    comments: p.commentsCount ?? 0,
    created_at: p.createdAt,
  }
}

export async function getCommunityPostsAction(identifier: string): Promise<{ success: boolean; data: CommunityPostDTO[] }> {
  try {
    const res = await fetchAPI(`/api/core/communities/${identifier}/posts?size=30`)
    const list: BackendPost[] = res?.content || []
    return { success: true, data: list.map(toCommunityPost) }
  } catch (error) {
    console.error(`Error al obtener publicaciones de la comunidad ${identifier}:`, error)
    return { success: false, data: [] }
  }
}

export async function createCommunityPostAction(
  identifier: string,
  content: string,
  image?: File | null
): Promise<{ success: boolean; data?: CommunityPostDTO; error?: string }> {
  try {
    const formData = new FormData()
    const title = content.trim().slice(0, 80) || 'Publicación'
    formData.append('title', title)
    formData.append('contenido', content)
    if (image) formData.append('image', image)
    const res: BackendPost | null = await fetchAPI(`/api/core/communities/${identifier}/posts`, {
      method: 'POST',
      body: formData,
    })
    if (!res) {
      return { success: false, error: 'No se pudo publicar en la comunidad' }
    }
    revalidatePath(`/communities/${identifier}`)
    return { success: true, data: toCommunityPost(res) }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo publicar en la comunidad'
    console.error('Error al publicar en la comunidad:', error)
    return { success: false, error: message }
  }
}

export async function toggleCommunityNotificationsAction(identifier: string): Promise<{ success: boolean; notificationsEnabled?: boolean }> {
  try {
    const res = await fetchAPI(`/api/core/communities/${identifier}/notifications/toggle`, { method: 'POST' })
    return { success: !!res, notificationsEnabled: res?.notificationsEnabled }
  } catch (error) {
    console.error('Error al cambiar notificaciones de la comunidad:', error)
    return { success: false }
  }
}

type BackendForumThread = {
  id: number
  communityId: number
  authorUserId: number
  authorUsername: string | null
  authorAvatarUrl: string | null
  title: string
  content: string
  repliesCount: number
  createdAt: string
  updatedAt: string
}

export type ForumThreadDTO = {
  id: number
  communityId: number
  author: string
  authorAvatarUrl?: string
  title: string
  content: string
  repliesCount: number
  createdAt: string
  updatedAt: string
}

function toForumThreadDTO(t: BackendForumThread): ForumThreadDTO {
  return {
    id: t.id,
    communityId: t.communityId,
    author: t.authorUsername || 'usuario',
    authorAvatarUrl: t.authorAvatarUrl || undefined,
    title: t.title,
    content: t.content,
    repliesCount: t.repliesCount ?? 0,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }
}

type BackendForumReply = {
  id: number
  threadId: number
  authorUserId: number
  authorUsername: string | null
  authorAvatarUrl: string | null
  content: string
  createdAt: string
}

export type ForumReplyDTO = {
  id: number
  threadId: number
  author: string
  authorAvatarUrl?: string
  content: string
  createdAt: string
}

function toForumReplyDTO(r: BackendForumReply): ForumReplyDTO {
  return {
    id: r.id,
    threadId: r.threadId,
    author: r.authorUsername || 'usuario',
    authorAvatarUrl: r.authorAvatarUrl || undefined,
    content: r.content,
    createdAt: r.createdAt,
  }
}

export async function getCommunityForumThreadsAction(identifier: string): Promise<{ success: boolean; data: ForumThreadDTO[] }> {
  try {
    const res = await fetchAPI(`/api/core/communities/${identifier}/forum-threads?size=50`)
    const list: BackendForumThread[] = res?.content || []
    return { success: true, data: list.map(toForumThreadDTO) }
  } catch (error) {
    console.error(`Error al obtener hilos de foro de ${identifier}:`, error)
    return { success: false, data: [] }
  }
}

export async function createForumThreadAction(
  identifier: string,
  title: string,
  content: string
): Promise<{ success: boolean; data?: ForumThreadDTO; error?: string }> {
  try {
    const res: BackendForumThread | null = await fetchAPI(`/api/core/communities/${identifier}/forum-threads`, {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    })
    if (!res) {
      return { success: false, error: 'No se pudo abrir el hilo' }
    }
    revalidatePath(`/communities/${identifier}`)
    return { success: true, data: toForumThreadDTO(res) }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo abrir el hilo'
    console.error('Error al crear hilo de foro:', error)
    return { success: false, error: message }
  }
}

export async function getForumThreadRepliesAction(threadId: number): Promise<{ success: boolean; data: ForumReplyDTO[] }> {
  try {
    const res: BackendForumReply[] | null = await fetchAPI(`/api/core/forum-threads/${threadId}/replies`)
    return { success: true, data: (res || []).map(toForumReplyDTO) }
  } catch (error) {
    console.error(`Error al obtener respuestas del hilo ${threadId}:`, error)
    return { success: false, data: [] }
  }
}

export async function createForumReplyAction(
  threadId: number,
  content: string
): Promise<{ success: boolean; data?: ForumReplyDTO; error?: string }> {
  try {
    const res: BackendForumReply | null = await fetchAPI(`/api/core/forum-threads/${threadId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
    if (!res) {
      return { success: false, error: 'No se pudo publicar tu respuesta' }
    }
    return { success: true, data: toForumReplyDTO(res) }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo publicar tu respuesta'
    console.error('Error al responder en el hilo:', error)
    return { success: false, error: message }
  }
}
