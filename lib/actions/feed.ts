'use server'

import { fetchAPI, ApiError } from '@/lib/api'
import { revalidatePath } from 'next/cache'
import { PostType, CommentItem } from '@/components/feed/FeedCard'

type BackendPost = {
  id: number
  authorUsername: string | null
  authorAvatar: string | null
  authorName: string | null
  authorDiscipline: string | null
  title: string
  contenido: string | null
  content_type: string | null
  thumbnail_url: string | null
  image_url: string | null
  visibility: string
  communityId: number | null
  tools: string[] | null
  likesCount: number
  commentsCount: number
  liked: boolean
  createdAt: string
  updatedAt: string | null
}

type BackendComment = {
  id: number
  postId: number
  userId: number
  authorUsername: string | null
  authorAvatarUrl: string | null
  content: string
  createdAt: string
}

function mapBackendPost(p: BackendPost): PostType {
  const mediaType = (p.content_type === 'image' || p.content_type === 'video' || p.content_type === 'audio' || p.content_type === 'text')
    ? p.content_type
    : 'text'

  return {
    id: p.id,
    author: p.authorName || p.authorUsername || 'Creador Zentry',
    handle: `@${p.authorUsername || 'creador'}`,
    avatar_url: p.authorAvatar || undefined,
    discipline: p.authorDiscipline || undefined,
    created_at: p.createdAt,
    title: p.title,
    description: p.contenido || undefined,
    media_type: mediaType,
    media_url: p.image_url || p.thumbnail_url || undefined,
    likes: p.likesCount || 0,
    comments: p.commentsCount || 0,
    tags: p.tools || [],
    liked: Boolean(p.liked),
  }
}

function mapBackendComment(c: BackendComment): CommentItem {
  return {
    id: String(c.id),
    author: c.authorUsername || 'Creador',
    handle: `@${c.authorUsername || 'creador'}`,
    text: c.content,
    time: c.createdAt,
  }
}

export async function getFeedPosts(): Promise<{ success: boolean; data?: PostType[]; error?: string }> {
  try {
    const data = await fetchAPI('/api/core/posts')
    if (!data) {
      return { success: false, error: 'No se pudieron cargar los posts' }
    }
    const raw: BackendPost[] = data.content || data.data || (Array.isArray(data) ? data : [])
    return { success: true, data: raw.map(mapBackendPost) }
  } catch (error) {
    console.error('Error al obtener feed:', error)
    return { success: false, error: 'Error de conexión con el backend' }
  }
}

export async function createPostAction(payload: {
  title: string
  description?: string
  contentType: 'image' | 'video' | 'audio' | 'text'
  mediaUrl?: string
  tags?: string[]
}): Promise<{ success: boolean; data?: PostType; error?: string }> {
  try {
    const res: BackendPost | null = await fetchAPI('/api/core/posts', {
      method: 'POST',
      body: JSON.stringify({
        title: payload.title,
        contenido: payload.description || '',
        content_type: payload.contentType,
        visibility: 'public',
        thumbnailUrl: payload.mediaUrl,
        imageUrl: payload.mediaUrl,
        tools: payload.tags?.join(','),
      }),
    })

    if (!res) {
      return { success: false, error: 'No se pudo publicar tu obra' }
    }

    revalidatePath('/feed')
    return { success: true, data: mapBackendPost(res) }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'Error en el servidor al publicar'
    console.error('Error al crear post:', error)
    return { success: false, error: message }
  }
}

export async function toggleLikePostAction(postId: string | number): Promise<{ success: boolean; liked?: boolean; likes?: number; error?: string }> {
  try {
    const res: BackendPost | null = await fetchAPI(`/api/core/posts/${postId}/like`, {
      method: 'POST',
    })
    if (!res) {
      return { success: false, error: 'No se pudo procesar tu reacción' }
    }
    revalidatePath('/feed')
    return { success: true, liked: res.liked, likes: res.likesCount }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo dar me gusta'
    console.error('Error al dar me gusta:', error)
    return { success: false, error: message }
  }
}

export async function getPostCommentsAction(postId: string | number): Promise<{ success: boolean; data: CommentItem[] }> {
  try {
    const res: BackendComment[] | null = await fetchAPI(`/api/core/comments/post/${postId}`)
    return { success: true, data: (res || []).map(mapBackendComment) }
  } catch (error) {
    console.error('Error al obtener comentarios:', error)
    return { success: false, data: [] }
  }
}

export async function addPostCommentAction(postId: string | number, content: string): Promise<{ success: boolean; data?: CommentItem; error?: string }> {
  try {
    const res: BackendComment | null = await fetchAPI(`/api/core/comments/post/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
    if (!res) {
      return { success: false, error: 'No se pudo publicar tu comentario' }
    }
    return { success: true, data: mapBackendComment(res) }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo publicar tu comentario'
    console.error('Error al comentar:', error)
    return { success: false, error: message }
  }
}
