// Mapeo backend → UI de publicaciones y comentarios (compartido por Feed, Explorar, Perfil y Comunidades).
// Módulo normal (no 'use server') para poder importarlo desde varias acciones de servidor.
import type { PostType, CommentItem } from '@/components/feed/FeedCard'
import { getImageUrl } from '@/lib/utils'
import type { UserCosmetics } from '@/lib/shop'

export type BackendPost = {
  id: number
  userId?: number
  canEdit?: boolean
  canDelete?: boolean
  myReaction?: string | null
  reactionCounts?: Record<string, number>
  authorCosmetics?: UserCosmetics | null
  authorUsername: string | null
  authorAvatar: string | null
  authorName: string | null
  authorDiscipline: string | null
  title: string
  contenido: string | null
  content_type: string | null
  thumbnail_url: string | null
  image_url: string | null
  mediaUrls?: string[] | null
  visibility: string
  communityId: number | null
  tools: string[] | null
  likesCount: number
  commentsCount: number
  liked: boolean
  saved: boolean
  createdAt: string
  updatedAt: string | null
}

export type BackendComment = {
  id: number
  postId: number
  userId: number
  authorUsername: string | null
  authorAvatarUrl: string | null
  authorCosmetics?: UserCosmetics | null
  content: string
  likesCount?: number
  liked?: boolean
  canEdit?: boolean
  canDelete?: boolean
  createdAt: string
}

export function mapBackendPost(p: BackendPost): PostType {
  const rawUrl = p.image_url || p.thumbnail_url || (p.mediaUrls && p.mediaUrls.length > 0 ? p.mediaUrls[0] : undefined);
  const mediaUrl = rawUrl ? getImageUrl(rawUrl) : undefined;
  const avatarUrl = p.authorAvatar ? getImageUrl(p.authorAvatar) : undefined;

  let mediaType = p.content_type || 'image';

  if (rawUrl) {
    const lowerUrl = rawUrl.toLowerCase();
    if (lowerUrl.match(/\.(mp4|webm|mov|mkv)(\?|$)/i) || lowerUrl.startsWith('data:video/')) {
      mediaType = 'video';
    } else if (lowerUrl.match(/\.(mp3|wav|ogg|m4a|aac)(\?|$)/i) || lowerUrl.startsWith('data:audio/')) {
      mediaType = 'audio';
    } else if (lowerUrl.match(/\.(jpg|jpeg|png|webp|gif|svg|bmp)(\?|$)/i) || lowerUrl.startsWith('data:image/')) {
      mediaType = 'image';
    }
  }

  if (mediaType !== 'image' && mediaType !== 'video' && mediaType !== 'audio' && mediaType !== 'text') {
    mediaType = rawUrl ? 'image' : 'text';
  }

  return {
    id: p.id,
    userId: p.userId,
    canEdit: Boolean(p.canEdit),
    canDelete: Boolean(p.canDelete),
    author: p.authorName || p.authorUsername || 'Creador',
    handle: `@${p.authorUsername || 'creador'}`,
    avatar: avatarUrl,
    avatar_url: avatarUrl,
    discipline: p.authorDiscipline || 'Creador Zentry',
    created_at: p.createdAt,
    title: p.title,
    description: p.contenido || undefined,
    media_type: mediaType as 'image' | 'video' | 'audio' | 'text',
    media_url: mediaUrl,
    likes: p.likesCount || 0,
    comments: p.commentsCount || 0,
    liked: Boolean(p.liked),
    saved: Boolean(p.saved),
    myReaction: p.myReaction ?? null,
    authorCosmetics: p.authorCosmetics ?? null,
    reactionCounts: p.reactionCounts || {},
    tags: p.tools || [],
  }
}

export function mapBackendComment(c: BackendComment): CommentItem {
  return {
    id: String(c.id),
    author: c.authorUsername || 'Creador',
    handle: `@${c.authorUsername || 'creador'}`,
    avatar: c.authorAvatarUrl ? getImageUrl(c.authorAvatarUrl) : undefined,
    cosmetics: c.authorCosmetics ?? null,
    text: c.content,
    time: c.createdAt,
    likesCount: c.likesCount || 0,
    liked: Boolean(c.liked),
    canEdit: Boolean(c.canEdit),
    canDelete: Boolean(c.canDelete),
    userId: c.userId,
  }
}
