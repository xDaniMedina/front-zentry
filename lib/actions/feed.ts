'use server'

import { fetchAPI } from '@/lib/api'
import { revalidatePath } from 'next/cache'
import { Post } from '@/types'

export async function getFeedPosts(): Promise<{ success: boolean; data?: Post[]; error?: string }> {
  try {
    const data = await fetchAPI('/api/v1/posts')
    if (!data) {
      return { success: false, error: 'No se pudieron cargar los posts' }
    }
    return { success: true, data }
  } catch (error) {
    console.error('Error al obtener feed:', error)
    return { success: false, error: 'Error de conexión con el backend' }
  }
}

export async function createPostAction(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const contentType = formData.get('content_type') as string || 'image'

  try {
    const res = await fetchAPI('/api/v1/posts', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        content_type: contentType,
        visibility: 'public',
      }),
    })

    if (!res) {
      return { success: false, message: 'Error al publicar' }
    }

    revalidatePath('/feed')
    return { success: true, data: res }
  } catch (error) {
    console.error('Error al crear post:', error)
    return { success: false, message: 'Error en el servidor' }
  }
}

export async function likePostAction(postId: string) {
  try {
    const res = await fetchAPI(`/api/v1/posts/${postId}/like`, {
      method: 'POST',
    })
    revalidatePath('/feed')
    return { success: !!res }
  } catch (error) {
    console.error('Error al dar me gusta:', error)
    return { success: false }
  }
}
