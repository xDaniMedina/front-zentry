'use server'

import { fetchAPI, ApiError } from '@/lib/api'

type BackendTrending = {
  id: number
  hashtag: string
  category: string
  postsCount: number
  isHot: boolean
  year: number
  updatedAt: string
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

type BackendProfile = {
  username: string
  name: string | null
  bio: string | null
  avatarUrl: string | null
  followersCount: number
  isFollowing: boolean
}

export type TrendingDTO = {
  rank: number
  hashtag: string
  category: string
  postsCount: string
  isHot: boolean
  year: number
}

export type ArtDTO = {
  id: string
  title: string
  author: string
  handle: string
  likes: number
  comments: number
  imageUrl?: string
  year: number
  color: string
}

export type UserDTO = {
  id: string
  name: string
  username: string
  avatar: string
  bio: string
  followers: number
  isFollowing: boolean
}

const CARD_COLORS = [
  'from-purple-600/30 to-pink-600/30',
  'from-blue-600/30 to-cyan-600/30',
  'from-emerald-600/30 to-teal-600/30',
  'from-amber-600/30 to-orange-600/30',
];

function toTrendingDTO(t: BackendTrending, index: number): TrendingDTO {
  return {
    rank: index + 1,
    hashtag: t.hashtag,
    category: t.category,
    postsCount: `${t.postsCount.toLocaleString()} publicaciones`,
    isHot: Boolean(t.isHot),
    year: t.year,
  }
}

function toArtDTO(p: BackendPost, index: number): ArtDTO {
  const author = p.authorName || p.authorUsername || 'Usuario Zentry'
  return {
    id: String(p.id),
    title: p.title,
    author,
    handle: `@${p.authorUsername || author}`,
    likes: p.likesCount ?? 0,
    comments: p.commentsCount ?? 0,
    imageUrl: p.imageUrl || undefined,
    year: new Date(p.createdAt).getFullYear(),
    color: CARD_COLORS[index % CARD_COLORS.length],
  }
}

function toUserDTO(p: BackendProfile): UserDTO {
  return {
    id: p.username,
    name: p.name || p.username,
    username: p.username,
    avatar: (p.name || p.username).substring(0, 2).toUpperCase(),
    bio: p.bio || '',
    followers: p.followersCount ?? 0,
    isFollowing: Boolean(p.isFollowing),
  }
}

export async function fetchTrending(): Promise<{ success: boolean; data: TrendingDTO[] }> {
  try {
    const res: BackendTrending[] | null = await fetchAPI('/api/core/explore/trending')
    return { success: true, data: (res || []).map(toTrendingDTO) }
  } catch (error) {
    console.error('Error fetching trending:', error)
    return { success: false, data: [] }
  }
}

export async function fetchTrendingHistory(year: number): Promise<{ success: boolean; data: TrendingDTO[] }> {
  try {
    const res: BackendTrending[] | null = await fetchAPI(`/api/core/explore/history?year=${year}`)
    return { success: true, data: (res || []).map(toTrendingDTO) }
  } catch (error) {
    console.error(`Error fetching trending history for ${year}:`, error)
    return { success: false, data: [] }
  }
}

export async function fetchExplorePosts(): Promise<{ success: boolean; data: ArtDTO[] }> {
  try {
    const res = await fetchAPI('/api/core/posts?size=24')
    const list: BackendPost[] = res?.content || (Array.isArray(res) ? res : [])
    return { success: true, data: list.map(toArtDTO) }
  } catch (error) {
    console.error('Error fetching explore posts:', error)
    return { success: false, data: [] }
  }
}

export async function likePostAction(postId: string): Promise<{ success: boolean; likes?: number }> {
  try {
    const res: BackendPost | null = await fetchAPI(`/api/core/posts/${postId}/like`, { method: 'POST' })
    return { success: !!res, likes: res?.likesCount }
  } catch (error) {
    console.error(`Error al dar me gusta a la publicación ${postId}:`, error)
    return { success: false }
  }
}

export async function searchExplore(query: string): Promise<{ success: boolean; users: UserDTO[]; arts: ArtDTO[] }> {
  try {
    const response = await fetchAPI(`/api/core/search?query=${encodeURIComponent(query)}`)
    const users: BackendProfile[] = response?.users || []
    const arts: BackendPost[] = response?.arts || []
    return { success: true, users: users.map(toUserDTO), arts: arts.map(toArtDTO) }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'Error de búsqueda'
    console.error('Error searching explore:', message)
    return { success: false, users: [], arts: [] }
  }
}
