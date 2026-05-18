'use client'

import { useState } from 'react'

export default function FeedCard({ author, content, isFollowing }: {
  author: { username: string; initials: string; color: string; discipline: string; time: string }
  content: { text: string; imageUrl?: string; tags: string[]; qualityScore: number; likes: number; comments: number }
  isFollowing?: boolean
}) {
  const [liked, setLiked]       = useState(false)
  const [likes, setLikes]       = useState(content.likes)
  const [following, setFollowing] = useState(isFollowing)
  const [showComment, setShowComment] = useState(false)
  const [comment, setComment]   = useState('')

  const handleLike = () => {
    setLiked(!liked)
    setLikes(liked ? likes - 1 : likes + 1)
  }

  const qualityColor =
    content.qualityScore >= 4.5 ? '#1D9E75' :
    content.qualityScore >= 4.0 ? '#534AB7' : '#BA7517'

  return (
    <div className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden transition-all duration-300">

      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ring-2 ring-transparent group-hover:ring-violet-500/30 transition-all duration-300"
          style={{ background: author.color + '25', color: author.color }}
        >
          {author.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{author.username}</p>
          <p className="text-xs text-zinc-500">{author.time} · {author.discipline}</p>
        </div>
        {!following ? (
          <button
            onClick={() => setFollowing(true)}
            className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors border border-violet-500/30 hover:border-violet-500/60 px-3 py-1 rounded-full"
          >
            Seguir
          </button>
        ) : (
          <span className="text-xs text-zinc-600 px-3 py-1 rounded-full border border-zinc-800">
            Siguiendo
          </span>
        )}
      </div>

      {/* Imagen */}
      {content.imageUrl && (
        <div className="mx-4 mb-3 bg-zinc-800 rounded-xl overflow-hidden h-48 flex items-center justify-center relative">
          <span className="text-zinc-600 text-sm">{content.imageUrl}</span>
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
            style={{ background: qualityColor + '25', color: qualityColor }}>
            ✦ {content.qualityScore}
          </div>
        </div>
      )}

      {/* Texto */}
      <p className="px-4 pb-3 text-sm text-zinc-300 leading-relaxed">{content.text}</p>

      {/* Tags */}
      {content.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-3">
          {content.tags.map(tag => (
            <span
              key={tag}
              className="text-xs bg-zinc-800 hover:bg-violet-500/10 hover:text-violet-400 text-zinc-500 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Score de calidad — solo en posts sin imagen */}
      {!content.imageUrl && (
        <div className="mx-4 mb-3">
          <div
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
            style={{ background: qualityColor + '20', color: qualityColor }}
          >
            ✦ {content.qualityScore} calidad algorítmica
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-zinc-800">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all duration-200 ${
            liked
              ? 'bg-red-500/15 text-red-400 scale-105'
              : 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10'
          }`}
        >
          {liked ? '♥' : '♡'} {likes}
        </button>

        <button
          onClick={() => setShowComment(!showComment)}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white hover:bg-zinc-800 px-3 py-1.5 rounded-full transition-all duration-200"
        >
          ◎ {content.comments}
        </button>

        <button className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white hover:bg-zinc-800 px-3 py-1.5 rounded-full transition-all duration-200">
          ↗ Compartir
        </button>

        <button className="ml-auto flex items-center gap-1.5 text-xs font-medium bg-violet-600 hover:bg-violet-500 active:scale-95 text-white px-4 py-1.5 rounded-full transition-all duration-200">
          + Colaborar
        </button>
      </div>

      {/* Caja de comentario */}
      {showComment && (
        <div className="px-4 pb-4 flex gap-2">
          <input
            type="text"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Escribe un comentario..."
            className="flex-1 bg-zinc-800 border border-zinc-700 focus:border-violet-500 text-white placeholder:text-zinc-500 text-xs rounded-full px-4 py-2 outline-none transition-colors"
          />
          <button
            onClick={() => setComment('')}
            className="text-xs bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-full transition-colors"
          >
            Enviar
          </button>
        </div>
      )}
    </div>
  )
}