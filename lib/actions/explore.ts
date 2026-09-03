'use server'

import { fetchAPI } from '@/lib/api'

export async function fetchExplorePosts() {
  try {
    const response = await fetchAPI('/api/posts')
    return { success: true, data: response?.data || [] }
  } catch (error) {
    console.error('Error fetching explore posts:', error)
    return { success: false, data: [] }
  }
}

export async function searchExplore(query: string) {
  try {
    const response = await fetchAPI(`/api/core/search?query=${encodeURIComponent(query)}`)
    return { success: true, users: response?.users || [], arts: response?.arts || [] }
  } catch (error) {
    console.error('Error searching explore:', error)
    return { success: false, users: [], arts: [] }
  }
}
