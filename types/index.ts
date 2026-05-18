// ============================================
// TIPOS GLOBALES DE ZENTRY
// ============================================

export type ArtisticDiscipline =
  | 'illustration'
  | 'music'
  | 'photography'
  | 'writing'
  | 'design'
  | 'video'
  | 'sculpture'
  | 'architecture'
  | 'performance'
  | 'other'

export type AccountType =
  | 'creative'
  | 'collector'
  | 'brand'
  | 'educator'
  | 'fan'

export type OnboardingStatus =
  | 'pending'
  | 'completed'

export type ContentStatus =
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'published'
  | 'rejected'

export interface Profile {
  id: string
  user_id: string
  display_name: string
  artistic_name: string | null
  bio: string | null
  avatar_url: string | null
  banner_url: string | null
  portfolio_url: string | null
  discipline: ArtisticDiscipline
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'professional'
  preferred_language: string
  onboarding_status: OnboardingStatus
  reputation_score: number
  zentry_coins: number
  social_links: Record<string, string>
  skills: string[]
  updated_at: string
}

export interface OnboardingFormData {
  display_name: string
  artistic_name: string
  bio: string
  discipline: ArtisticDiscipline
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'professional'
  skills: string[]
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface Post {
  id: string
  author_id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  content_type: 'image' | 'video' | 'audio' | 'text'
  status: ContentStatus
  visibility: 'public' | 'followers' | 'private'
  view_count: number
  ai_quality_score: number | null
  published_at: string | null
  created_at: string
}