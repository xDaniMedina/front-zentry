'use server'

import { fetchAPI, ApiError } from '@/lib/api'
import { revalidatePath } from 'next/cache'
import { Conversation, Message } from '@/types'

type BackendConversationSummary = {
  id: number
  isGroup: boolean
  name: string | null
  otherUserId: number | null
  lastMessageContent: string | null
  lastMessageSenderId: number | null
  lastMessageAt: string | null
  unreadCount: number
}

type Page<T> = { content: T[] }

type BackendProfile = { name?: string | null; avatarUrl?: string | null }

// El backend a veces solo tiene el email como "username" (sin username real definido) —
// nunca mostramos un email crudo como nombre en la UI de mensajes.
function looksLikeEmail(value: string) {
  return value.includes('@')
}

async function resolveOtherUserDisplay(otherUserId: number | null): Promise<{ displayName: string; displayAvatarUrl: string | null }> {
  if (otherUserId == null) {
    return { displayName: 'Usuario', displayAvatarUrl: null }
  }
  try {
    const profile: BackendProfile | null = await fetchAPI(`/api/core/profiles/by-user-id/${otherUserId}`)
    const name = profile?.name && !looksLikeEmail(profile.name) ? profile.name : null
    return {
      displayName: name || `Usuario #${otherUserId}`,
      displayAvatarUrl: profile?.avatarUrl || null,
    }
  } catch {
    return { displayName: `Usuario #${otherUserId}`, displayAvatarUrl: null }
  }
}

export async function getConversations(): Promise<{ success: boolean; data: Conversation[]; error?: string }> {
  try {
    const res: Page<BackendConversationSummary> | null = await fetchAPI('/api/realtime/conversations/mine?size=50')
    const content = res?.content || []
    const data: Conversation[] = await Promise.all(content.map(async c => {
      if (c.isGroup) {
        return { ...c, displayName: c.name || 'Grupo', displayAvatarUrl: null }
      }
      const { displayName, displayAvatarUrl } = await resolveOtherUserDisplay(c.otherUserId)
      return { ...c, displayName, displayAvatarUrl }
    }))
    return { success: true, data }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo cargar la bandeja de mensajes'
    console.error('Error al obtener conversaciones:', error)
    return { success: false, data: [], error: message }
  }
}

export async function startDirectConversation(otherUserId: number): Promise<{ success: boolean; data?: Conversation; error?: string }> {
  try {
    const res = await fetchAPI(`/api/realtime/conversations/direct/${otherUserId}`, { method: 'POST' })
    if (!res) {
      return { success: false, error: 'No se pudo iniciar la conversación' }
    }
    const data: Conversation = {
      ...res,
      displayName: `Usuario #${otherUserId}`,
      displayAvatarUrl: null,
    }
    return { success: true, data }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo iniciar la conversación'
    console.error('Error al iniciar conversación directa:', error)
    return { success: false, error: message }
  }
}

export async function getConversationMessages(conversationId: number): Promise<{ success: boolean; data: Message[]; error?: string }> {
  try {
    const res: Page<Message> | null = await fetchAPI(`/api/realtime/messages?conversationId=${conversationId}&size=50`)
    const content = res?.content || []
    // El backend devuelve del más reciente al más antiguo; para pintar el chat de arriba a abajo lo invertimos
    return { success: true, data: [...content].reverse() }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudieron cargar los mensajes'
    console.error(`Error al obtener mensajes de la conversación ${conversationId}:`, error)
    return { success: false, data: [], error: message }
  }
}

export async function sendMessageAction(
  conversationId: number,
  content: string
): Promise<{ success: boolean; data?: Message; error?: string }> {
  try {
    const res = await fetchAPI('/api/realtime/messages', {
      method: 'POST',
      body: JSON.stringify({ conversationId, content }),
    })

    if (!res) {
      return { success: false, error: 'No se pudo enviar el mensaje' }
    }

    revalidatePath('/messages')
    return { success: true, data: res }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'Error de conexión al enviar el mensaje'
    console.error('Error enviando mensaje:', error)
    return { success: false, error: message }
  }
}

export async function deleteMessageAction(messageId: number): Promise<{ success: boolean; error?: string }> {
  try {
    await fetchAPI(`/api/realtime/messages/${messageId}`, { method: 'DELETE' })
    revalidatePath('/messages')
    return { success: true }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo eliminar el mensaje'
    console.error(`Error eliminando mensaje ${messageId}:`, error)
    return { success: false, error: message }
  }
}

export async function markConversationReadAction(conversationId: number): Promise<{ success: boolean }> {
  try {
    await fetchAPI(`/api/realtime/conversations/${conversationId}/read`, { method: 'POST' })
    return { success: true }
  } catch (error) {
    console.error(`Error marcando como leída la conversación ${conversationId}:`, error)
    return { success: false }
  }
}
