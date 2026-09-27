"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import type { PostType } from "@/components/feed/FeedCard"
import { reactToPostAction, toggleLikePostAction } from "@/lib/actions/feed"
import { applyReactionLocally } from "@/lib/reactions"

/**
 * Estado + interacciones de una lista de obras (reacciones optimistas, edición, borrado y modal
 * de detalle). Lo usan Explorar y otras vistas que muestran FeedCard fuera del feed principal.
 */
export function usePostInteractions(initial: PostType[] = []) {
  const [posts, setPosts] = useState<PostType[]>(initial)
  const [activePost, setActivePost] = useState<PostType | null>(null)
  const postsRef = useRef(posts)
  useEffect(() => { postsRef.current = posts }, [posts])

  const applyPostUpdate = useCallback((updated: PostType) => {
    setPosts(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated, comments_list: p.comments_list } : p))
    setActivePost(prev => prev && prev.id === updated.id ? { ...prev, ...updated, comments_list: prev.comments_list } : prev)
  }, [])

  const removePost = useCallback((postId: string | number) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
    setActivePost(prev => prev && prev.id === postId ? null : prev)
  }, [])

  /** type = null → botón "Me gusta" (quitar o poner ❤️) */
  const react = useCallback(async (postId: string | number, type: string | null) => {
    const original = postsRef.current.find(p => p.id === postId)
    if (!original) return
    applyPostUpdate(applyReactionLocally(original, type))
    const res = type === null ? await toggleLikePostAction(postId) : await reactToPostAction(postId, type)
    if (!res.success || !res.data) {
      applyPostUpdate(original)
      toast.error(res.error || "No se pudo registrar tu reacción")
      return
    }
    applyPostUpdate(res.data)
  }, [applyPostUpdate])

  return {
    posts,
    setPosts,
    activePost,
    openPost: setActivePost,
    closePost: () => setActivePost(null),
    toggleLike: (postId: string | number) => react(postId, null),
    reactTo: (postId: string | number, type: string) => react(postId, type),
    applyPostUpdate,
    removePost,
    isLiked: (post: PostType) => Boolean(post.myReaction ?? post.liked),
  }
}
