'use server'

import { fetchAPI, ApiError } from '@/lib/api'
import { revalidatePath } from 'next/cache'
import { PostType, CommentItem } from '@/components/feed/FeedCard'
import { mapBackendPost, mapBackendComment, type BackendPost, type BackendComment } from '@/lib/mappers/post'

export async function getFeedPosts(page: number = 0): Promise<{ success: boolean; data?: PostType[]; hasMore?: boolean; error?: string }> {
  try {
    const data = await fetchAPI(`/api/core/posts?page=${page}&size=20`)
    if (!data) {
      return { success: false, error: 'No se pudieron cargar los posts' }
    }
    const raw: BackendPost[] = data.content || data.data || (Array.isArray(data) ? data : [])
    const hasMore = typeof data.last === 'boolean' ? !data.last : false
    return { success: true, data: raw.map(mapBackendPost), hasMore }
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
    revalidatePath('/studio')
    return { success: true, data: mapBackendPost(res) }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'Error en el servidor al publicar'
    console.error('Error al crear post:', error)
    return { success: false, error: message }
  }
}

/**
 * Publicación con archivo (imagen/video/audio) vía multipart: evita convertir el archivo a base64
 * (bloqueaba el navegador con videos) y usa un timeout largo para subidas pesadas.
 * formData: title, contenido, contentType, tools, image (File)
 */
export async function createPostWithMediaAction(formData: FormData): Promise<{ success: boolean; data?: PostType; error?: string }> {
  try {
    formData.set('visibility', 'public')
    const res: BackendPost | null = await fetchAPI('/api/core/posts', {
      method: 'POST',
      body: formData,
      timeoutMs: 5 * 60 * 1000,
    })
    if (!res || !res.id) {
      return { success: false, error: 'No se pudo subir tu obra. Revisa tu sesión e inténtalo de nuevo.' }
    }
    revalidatePath('/feed')
    revalidatePath('/studio')
    return { success: true, data: mapBackendPost(res) }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'Error en el servidor al subir el archivo'
    console.error('Error al crear post con archivo:', error)
    return { success: false, error: message }
  }
}

export async function toggleLikePostAction(postId: string | number): Promise<{ success: boolean; liked?: boolean; likes?: number; data?: PostType; error?: string }> {
  try {
    const res: BackendPost | null = await fetchAPI(`/api/core/posts/${postId}/like`, {
      method: 'POST',
    })
    if (!res || !res.id) {
      return { success: false, error: 'No se pudo procesar tu reacción' }
    }
    return { success: true, liked: res.liked, likes: res.likesCount, data: mapBackendPost(res) }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo dar me gusta'
    console.error('Error al dar me gusta:', error)
    return { success: false, error: message }
  }
}

export async function toggleBookmarkAction(postId: string | number): Promise<{ success: boolean; saved?: boolean; error?: string }> {
  try {
    const res: { saved: boolean } | null = await fetchAPI(`/api/core/posts/${postId}/bookmark`, {
      method: 'POST',
    })
    if (!res) {
      return { success: false, error: 'No se pudo guardar la publicación' }
    }
    revalidatePath('/profile/[username]', 'page')
    return { success: true, saved: res.saved }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo guardar la publicación'
    console.error('Error al guardar publicación:', error)
    return { success: false, error: message }
  }
}

export async function getPostsByUsernameAction(username: string): Promise<{ success: boolean; data: PostType[]; error?: string }> {
  try {
    const res: BackendPost[] | null = await fetchAPI(`/api/core/posts/by-user/${encodeURIComponent(username)}`)
    return { success: true, data: (res || []).map(mapBackendPost) }
  } catch (error) {
    console.error('Error al obtener publicaciones del usuario:', error)
    return { success: false, data: [] }
  }
}

export async function getLikedPostsAction(username: string): Promise<{ success: boolean; data: PostType[]; hidden?: boolean; error?: string }> {
  try {
    const res: BackendPost[] | null = await fetchAPI(`/api/core/posts/liked/${encodeURIComponent(username)}`)
    if (res === null) {
      return { success: true, data: [], hidden: true }
    }
    return { success: true, data: res.map(mapBackendPost) }
  } catch (error) {
    console.error('Error al obtener publicaciones con me gusta:', error)
    return { success: false, data: [] }
  }
}

export async function getSavedPostsAction(username: string): Promise<{ success: boolean; data: PostType[]; hidden?: boolean; error?: string }> {
  try {
    const res: BackendPost[] | null = await fetchAPI(`/api/core/posts/saved/${encodeURIComponent(username)}`)
    if (res === null) {
      return { success: true, data: [], hidden: true }
    }
    return { success: true, data: res.map(mapBackendPost) }
  } catch (error) {
    console.error('Error al obtener publicaciones guardadas:', error)
    return { success: false, data: [] }
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

export async function editPostCommentAction(commentId: string | number, content: string): Promise<{ success: boolean; data?: CommentItem; error?: string }> {
  try {
    const res: BackendComment | null = await fetchAPI(`/api/core/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    })
    if (!res) {
      return { success: false, error: 'No se pudo actualizar el comentario' }
    }
    return { success: true, data: mapBackendComment(res) }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo editar el comentario'
    console.error('Error al editar comentario:', error)
    return { success: false, error: message }
  }
}

export async function deletePostCommentAction(commentId: string | number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetchAPI(`/api/core/comments/${commentId}`, {
      method: 'DELETE',
    })
    if (!res) {
      return { success: false, error: 'No tienes permiso para eliminar este comentario' }
    }
    return { success: true }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo eliminar el comentario'
    console.error('Error al eliminar comentario:', error)
    return { success: false, error: message }
  }
}

export async function toggleLikeCommentAction(commentId: string | number): Promise<{ success: boolean; data?: CommentItem; error?: string }> {
  try {
    const res: BackendComment | null = await fetchAPI(`/api/core/comments/${commentId}/like`, {
      method: 'POST',
    })
    if (!res) {
      return { success: false, error: 'No se pudo reaccionar al comentario' }
    }
    return { success: true, data: mapBackendComment(res) }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo reaccionar al comentario'
    console.error('Error al dar me gusta al comentario:', error)
    return { success: false, error: message }
  }
}


export async function updatePostAction(
  postId: string | number,
  payload: { title: string; description?: string }
): Promise<{ success: boolean; data?: PostType; error?: string }> {
  try {
    const res: BackendPost | null = await fetchAPI(`/api/core/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: payload.title,
        contenido: payload.description,
      }),
    })
    if (!res) {
      return { success: false, error: 'No se pudo actualizar la publicación' }
    }
    revalidatePath('/feed')
    revalidatePath('/studio')
    return { success: true, data: mapBackendPost(res) }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'Error al actualizar la publicación'
    console.error('Error al actualizar publicación:', error)
    return { success: false, error: message }
  }
}

export async function deletePostAction(
  postId: string | number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetchAPI(`/api/core/posts/${postId}`, {
      method: 'DELETE',
    })
    if (!res) {
      return { success: false, error: 'No tienes permiso para eliminar esta publicación' }
    }
    revalidatePath('/feed')
    revalidatePath('/studio')
    return { success: true }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'Error al eliminar la publicación'
    console.error('Error al eliminar publicación:', error)
    return { success: false, error: message }
  }
}

/** Reacción con emoji: repetir la misma la quita, otra distinta la reemplaza. Devuelve la obra actualizada. */
export async function reactToPostAction(postId: string | number, type: string): Promise<{ success: boolean; data?: PostType; error?: string }> {
  try {
    const res: BackendPost | null = await fetchAPI(`/api/core/posts/${postId}/react`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    })
    if (!res || !res.id) {
      return { success: false, error: 'No se pudo registrar tu reacción' }
    }
    return { success: true, data: mapBackendPost(res) }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo registrar tu reacción'
    console.error('Error al reaccionar:', error)
    return { success: false, error: message }
  }
}

export async function getPostByIdAction(postId: string | number): Promise<{ success: boolean; data?: PostType }> {
  try {
    const res: BackendPost | null = await fetchAPI(`/api/core/posts/${postId}`)
    if (!res || !res.id) return { success: false }
    return { success: true, data: mapBackendPost(res) }
  } catch (error) {
    console.error('Error al obtener la publicación:', error)
    return { success: false }
  }
}
