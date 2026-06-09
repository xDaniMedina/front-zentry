export interface Project {
  id: string | number
  title: string
  description: string
  authorName: string
  authorAvatar?: string
  likes: number
  commentsCount: number
  tags: string[]
}
