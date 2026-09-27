'use server'

import { fetchAPI } from '@/lib/api'
import type { PostType } from '@/components/feed/FeedCard'
import { mapBackendPost, type BackendPost } from '@/lib/mappers/post'
import type { UserCosmetics } from '@/lib/shop'
import { getImageUrl } from '@/lib/utils'

type BackendTrending = {
  id: number
  hashtag: string
  category: string
  postsCount: number
  isHot: boolean
  year: number
}

export type TrendingDTO = {
  id: string
  hashtag: string
  category: string
  postsCount: number
  isHot: boolean
  year: number
}

type BackendProfile = {
  username: string
  name: string
  discipline: string | null
  bio: string | null
  avatarUrl?: string | null
  avatar_url?: string | null
  followersCount: number | null
  isFollowing?: boolean
  cosmetics?: UserCosmetics | null
}

export type UserDTO = {
  username: string
  name: string
  discipline?: string
  bio?: string
  avatarUrl?: string
  followers: number
  isFollowing: boolean
  cosmetics?: UserCosmetics | null
}

export type ExploreProjectDTO = {
  id: string
  title: string
  description: string
  projectType: string
  coverUrl?: string
  ownerUsername?: string
  membersCount: number
  likesCount: number
}

export type ExploreCommunityDTO = {
  id: string
  slug: string
  name: string
  description: string
  members: number
  avatarUrl?: string
  privacy: 'public' | 'private'
}

function toTrending(t: BackendTrending): TrendingDTO {
  return { id: String(t.id), hashtag: t.hashtag, category: t.category, postsCount: Number(t.postsCount || 0), isHot: Boolean(t.isHot), year: t.year }
}

function toUser(u: BackendProfile): UserDTO {
  const avatar = u.avatarUrl || u.avatar_url
  return {
    username: u.username,
    name: u.name || u.username,
    discipline: u.discipline || undefined,
    bio: u.bio || undefined,
    avatarUrl: avatar ? getImageUrl(avatar) : undefined,
    followers: Number(u.followersCount || 0),
    isFollowing: Boolean(u.isFollowing),
    cosmetics: u.cosmetics ?? null,
  }
}

export async function fetchTrending(): Promise<{ success: boolean; data: TrendingDTO[] }> {
  try {
    const res: BackendTrending[] | null = await fetchAPI('/api/core/explore/trending')
    return { success: Array.isArray(res), data: (res || []).map(toTrending) }
  } catch {
    return { success: false, data: [] }
  }
}

export async function fetchTrendingHistory(year: number): Promise<{ success: boolean; data: TrendingDTO[] }> {
  try {
    const res: BackendTrending[] | null = await fetchAPI(`/api/core/explore/history?year=${year}`)
    return { success: Array.isArray(res), data: (res || []).map(toTrending) }
  } catch {
    return { success: false, data: [] }
  }
}

/** Obras con más reacciones del último mes (con reacciones, marcos y permisos igual que en el feed) */
export async function fetchPopularPosts(page = 0): Promise<{ success: boolean; data: PostType[] }> {
  try {
    const res: BackendPost[] | null = await fetchAPI(`/api/core/explore/popular?page=${page}`)
    return { success: Array.isArray(res), data: (res || []).map(mapBackendPost) }
  } catch {
    return { success: false, data: [] }
  }
}

export async function fetchSuggestedCreators(): Promise<{ success: boolean; data: UserDTO[] }> {
  try {
    const res: BackendProfile[] | null = await fetchAPI('/api/core/explore/creators')
    return { success: Array.isArray(res), data: (res || []).map(toUser) }
  } catch {
    return { success: false, data: [] }
  }
}

export async function searchExplore(query: string): Promise<{
  success: boolean
  users: UserDTO[]
  arts: PostType[]
  projects: ExploreProjectDTO[]
  communities: ExploreCommunityDTO[]
  trending: TrendingDTO[]
}> {
  const empty = { users: [], arts: [], projects: [], communities: [], trending: [] }
  try {
    const res = await fetchAPI(`/api/core/search?query=${encodeURIComponent(query)}`)
    if (!res) return { success: false, ...empty }
    return {
      success: true,
      users: (res.users || []).map(toUser),
      arts: (res.arts || []).map(mapBackendPost),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      projects: (res.projects || []).map((p: any) => ({
        id: String(p.id),
        title: p.title,
        description: p.description || '',
        projectType: p.projectType || 'general',
        coverUrl: p.coverUrl ? getImageUrl(p.coverUrl) : undefined,
        ownerUsername: p.ownerUsername || undefined,
        membersCount: Number(p.membersCount || 0),
        likesCount: Number(p.likesCount || 0),
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      communities: (res.communities || []).map((c: any) => ({
        id: String(c.id),
        slug: c.slug,
        name: c.nombre,
        description: c.descripcion || '',
        members: Number(c.membersCount || 0),
        avatarUrl: c.avatarUrl ? getImageUrl(c.avatarUrl) : undefined,
        privacy: c.privacy === 'private' ? 'private' : 'public',
      })),
      trending: (res.trending || []).map(toTrending),
    }
  } catch {
    return { success: false, ...empty }
  }
}
