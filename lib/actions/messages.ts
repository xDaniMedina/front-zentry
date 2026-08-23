'use server'

import { fetchAPI } from '@/lib/api'
import { revalidatePath } from 'next/cache'
import { Conversation, Message } from '@/types'

export async function getConversations(): Promise<{ success: boolean; data?: Conversation[]; error?: string }> {
  try {
    let res = await fetchAPI('/api/core/messages/conversations')
    if (!res) {
      res = await fetchAPI('/api/v1/messages/conversations')
    }
    if (!res) {
      return { success: true, data: [] }
    }
    return { success: true, data: Array.isArray(res) ? res : res.data || res.content || [] }
  } catch (error) {
    console.warn('Backend de mensajería no disponible aún, usando sincronización en tiempo real:', error)
    return { success: true, data: [] }
  }
}

export async function getConversationMessages(chatId: string | number): Promise<{ success: boolean; data?: Message[]; error?: string }> {
  try {
    let res = await fetchAPI(`/api/core/messages/conversations/${chatId}`)
    if (!res) {
      res = await fetchAPI(`/api/v1/messages/conversations/${chatId}`)
    }
    if (!res) {
      return { success: true, data: [] }
    }
    return { success: true, data: Array.isArray(res) ? res : res.messages || res.data || [] }
  } catch (error) {
    console.warn(`Mensajes de conversación ${chatId} usando canal en tiempo real:`, error)
    return { success: true, data: [] }
  }
}

export async function sendMessageAction(
  chatId: string | number,
  content: string,
  extra?: { isImage?: boolean; fileUrl?: string }
): Promise<{ success: boolean; data?: Message; error?: string }> {
  try {
    let res = await fetchAPI(`/api/core/messages/conversations/${chatId}/send`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        is_image: extra?.isImage || false,
        file_url: extra?.fileUrl || null,
      }),
    })

    if (!res) {
      res = await fetchAPI(`/api/v1/messages/conversations/${chatId}/send`, {
        method: 'POST',
        body: JSON.stringify({
          content,
          is_image: extra?.isImage || false,
          file_url: extra?.fileUrl || null,
        }),
      })
    }

    if (!res) {
      return { success: false, error: 'Error al enviar mensaje al backend' }
    }

    revalidatePath('/messages')
    return { success: true, data: res }
  } catch (error) {
    console.error('Error enviando mensaje:', error)
    return { success: false, error: 'Error de conexión' }
  }
}
