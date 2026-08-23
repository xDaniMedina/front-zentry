// TIPADO GLOBAL ZENTRY

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

export interface Comment {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
}

export interface Like {
  id: string
  post_id: string
  user_id: string
  created_at: string
  disliked: boolean
  date: string
}

export interface Follower {
  id: string
  follower_id: string
  following_id: string
  created_at: string
  unfollowed: boolean
  date: string
}

export interface Notification {
  id: string | number
  user_id?: string
  type: 'like' | 'comment' | 'follow' | 'reward' | 'system'
  content?: string
  text?: string
  read: boolean
  time?: string
  created_at?: string
  link_url?: string
}

export interface Message {
  id: string
  sender_id?: string
  sender_username?: string
  receiver_id?: string
  receiver_username?: string
  text?: string
  content?: string
  isMe?: boolean
  read?: boolean
  status?: 'sending' | 'sent' | 'delivered' | 'read'
  time?: string
  created_at?: string
  isImage?: boolean
  fileUrl?: string
  isVoice?: boolean
  voiceDuration?: string
  reactions?: Record<string, string[]>
}

export interface Conversation {
  id: string | number
  name: string
  username: string
  avatar: string
  bio?: string
  isOnline?: boolean
  lastSeen?: string
  participant_ids?: string[]
  last_message?: Message | null
  messages?: Message[]
  unread_count?: number
  created_at?: string
}

export interface Transaction {
  id: string
  user_id: string 
  amount: number
  type: 'credit' | 'debit'
  description: string
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: 'basic' | 'premium' | 'enterprise'
  status: 'active' | 'inactive' | 'canceled'
  started_at: string
  ended_at: string | null
}

export interface Report {
  id: string
  reporter_id: string
  reported_id: string
  reason: string
  status: 'pending' | 'reviewed' | 'resolved'
  created_at: string
  resolved_at: string | null
  date: string
}

export interface Community {
  id: string
  name: string
  description: string
  banner_url: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  members: User[]
  posts: Post[]
}

export interface CommunityMember {
  id: string
  community_id: string
  user_id: string
  role: 'member' | 'moderator' | 'admin'
  joined_at: string
  left_at: string | null
}

export interface CommunityPost {
  id: string
  community_id: string
  author_id: string
  title: string
  content: string
  status: ContentStatus
  visibility: 'public' | 'members' | 'private'
  created_at: string
  updated_at: string
}

export interface CommunityComment {
  id: string
  community_post_id: string
  author_id: string
  content: string
  created_at: string
} 

export interface CommunityLike {
  id: string
  community_post_id: string
  user_id: string
  created_at: string
  disliked: boolean
  date: string
}

export interface CommunityFollower {
  id: string
  community_id: string
  user_id: string
  created_at: string
  unfollowed: boolean
  date: string
}

export interface StudioProject {
  id: string
  title: string
  type: 'canvas' | 'document' | 'image' | 'video' | 'audio'
  lastEdited: string
  reward?: number
  content?: string
  thumbnail_url?: string | null
  metadata?: Record<string, any>
  created_at?: string
}

export type ProjectPriority = 'baja' | 'media' | 'alta' | 'urgente';
export type ProjectCategory = 'UI/UX' | 'Arte Digital' | 'Desarrollo' | 'Animación 3D' | 'Branding' | 'Música' | 'General';
export type ProjectStatus = 'active' | 'completed' | 'paused';

export interface ProjectMember {
  id: string;
  name: string;
  username?: string;
  avatar: string;
  role: string;
  isOnline: boolean;
}

export interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
  priority?: ProjectPriority;
  assignedTo?: string;
  dueDate?: string;
}

export interface ProjectComment {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  name?: string;
  description: string;
  category: ProjectCategory;
  priority: ProjectPriority;
  progress: number;
  status: ProjectStatus;
  updatedAt: string;
  createdAt?: string;
  created_at?: string;
  updated_at?: string;
  deadline?: string;
  tasksCount: number;
  completedTasksCount: number;
  members: ProjectMember[];
  tags: string[];
  tasks?: ProjectTask[];
  comments?: ProjectComment[];
  likesCount?: number;
  isLiked?: boolean;
  authorUsername?: string;
  authorName?: string;
  authorAvatar?: string;
  thumbnail_url?: string | null;
  visibility?: 'public' | 'private';
  types?: string[];
  date?: string;
}

export interface User {
  id: string
  email: string
  username?: string
  name?: string
  profile?: Profile | null
  created_at?: string
  updated_at?: string
  zentry_coins?: number
  reputation_score?: number
  onboarding_status?: OnboardingStatus
  posts?: Post[]
  comments?: Comment[]
  likes?: Like[]
  followers?: Follower[]
  following?: Follower[]
  notifications?: Notification[]
  messages?: Message[]
  conversations?: Conversation[]
  transactions?: Transaction[]
  subscriptions?: Subscription[]
  reports?: Report[]
}

export interface FriendUser {
  id: number | string
  username: string
  name: string
  avatar_url?: string | null
  discipline?: string
  bio?: string | null
  is_online?: boolean
  status?: string
  last_seen?: string | null
  request_id?: number | null
  mutual_friends_count?: number
  project_title?: string
}
