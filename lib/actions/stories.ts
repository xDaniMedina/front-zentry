'use server'

import { fetchAPI, ApiError } from '@/lib/api'
import { UserStoryGroup, StoryItem, StoryFontStyle } from '@/types/stories'

type BackendStory = {
  id: number
  user_id: number
  username: string | null
  user_name: string | null
  user_avatar: string | null
  media_url: string | null
  media_type: string
  text_content: string | null
  text_color: string | null
  background: string | null
  font_style: string | null
  caption: string | null
  music_title: string | null
  music_artist: string | null
  music_url: string | null
  link_url: string | null
  duration: number
  created_at: string
  view_count: number
  likes_count: number
  is_viewed: boolean
  is_liked: boolean
}

type BackendStoryGroup = {
  user_id: number
  username: string
  name: string
  avatar: string
  avatar_url: string | null
  is_user: boolean
  has_unseen: boolean
  last_updated: string
  items: BackendStory[]
}

function toStoryItem(s: BackendStory): StoryItem {
  return {
    id: String(s.id),
    type: (s.media_type || 'IMAGE').toLowerCase() as StoryItem['type'],
    media_url: s.media_url || undefined,
    text_content: s.text_content || undefined,
    text_color: s.text_color || undefined,
    background: s.background || undefined,
    font_style: (s.font_style || undefined) as StoryFontStyle | undefined,
    caption: s.caption || undefined,
    music: s.music_title ? { title: s.music_title, artist: s.music_artist || 'Zentry Music', url: s.music_url || undefined } : undefined,
    link_url: s.link_url || undefined,
    duration: s.duration || 5000,
    created_at: s.created_at,
    likes: s.likes_count || 0,
    liked: Boolean(s.is_liked),
  }
}

function toStoryGroup(g: BackendStoryGroup): UserStoryGroup {
  return {
    id: g.user_id,
    user_id: String(g.user_id),
    username: g.username,
    name: g.name,
    avatar: g.avatar,
    avatar_url: g.avatar_url || undefined,
    isUser: Boolean(g.is_user),
    hasUnseen: Boolean(g.has_unseen),
    last_updated: g.last_updated,
    items: (g.items || []).map(toStoryItem),
  }
}

export async function getStoryFeedAction(): Promise<{ success: boolean; data: UserStoryGroup[] }> {
  try {
    const res: BackendStoryGroup[] | null = await fetchAPI('/api/core/stories/feed')
    return { success: true, data: (res || []).map(toStoryGroup) }
  } catch (error) {
    console.error('Error al obtener historias:', error)
    return { success: false, data: [] }
  }
}

export type CreateStoryPayload = {
  type: 'image' | 'video' | 'text'
  mediaUrl?: string
  file?: File | null
  textContent?: string
  textColor?: string
  background?: string
  fontStyle?: StoryFontStyle
  caption?: string
  music?: { title: string; artist: string } | null
  duration?: number
}

export async function createStoryAction(payload: CreateStoryPayload): Promise<{ success: boolean; data?: StoryItem; error?: string }> {
  try {
    const meta = {
      mediaType: payload.type.toUpperCase(),
      mediaUrl: payload.file ? undefined : payload.mediaUrl,
      textContent: payload.textContent,
      textColor: payload.textColor,
      background: payload.background,
      fontStyle: payload.fontStyle,
      caption: payload.caption,
      musicTitle: payload.music?.title,
      musicArtist: payload.music?.artist,
      duration: payload.duration || 5000,
    }

    let res: BackendStory | null;

    if (payload.file) {
      const formData = new FormData()
      formData.append('story', new Blob([JSON.stringify(meta)], { type: 'application/json' }))
      formData.append('file', payload.file)
      res = await fetchAPI('/api/core/stories', { method: 'POST', body: formData })
    } else {
      res = await fetchAPI('/api/core/stories', {
        method: 'POST',
        body: JSON.stringify(meta),
      })
    }

    if (!res) {
      return { success: false, error: 'No se pudo publicar tu historia' }
    }
    return { success: true, data: toStoryItem(res) }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo publicar tu historia'
    console.error('Error al crear historia:', error)
    return { success: false, error: message }
  }
}

export async function viewStoryAction(storyId: string | number): Promise<void> {
  try {
    await fetchAPI(`/api/core/stories/${storyId}/view`, { method: 'POST' })
  } catch (error) {
    console.error('Error al registrar vista de historia:', error)
  }
}

export async function toggleStoryLikeAction(storyId: string | number): Promise<{ success: boolean; liked?: boolean }> {
  try {
    const res = await fetchAPI(`/api/core/stories/${storyId}/like`, { method: 'POST' })
    return { success: !!res, liked: res?.is_liked }
  } catch (error) {
    console.error('Error al reaccionar a la historia:', error)
    return { success: false }
  }
}

export async function replyToStoryAction(storyId: string | number, content: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetchAPI(`/api/core/stories/${storyId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
    return { success: !!res }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo enviar tu respuesta'
    console.error('Error al responder a la historia:', error)
    return { success: false, error: message }
  }
}

export async function deleteStoryAction(storyId: string | number): Promise<{ success: boolean; error?: string }> {
  try {
    await fetchAPI(`/api/core/stories/${storyId}`, { method: 'DELETE' })
    return { success: true }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo eliminar la historia'
    console.error('Error al eliminar historia:', error)
    return { success: false, error: message }
  }
}
