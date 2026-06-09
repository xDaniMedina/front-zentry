'use client'

import { useState } from 'react'

export default function FeedCard({ 
  author, 
  content, 
  isFollowing, 
  layout = 'classic' 
}: {
  author: { username: string; initials: string; color: string; discipline: string; time: string }
  content: { text: string; imageUrl?: string; tags: string[]; qualityScore: number; likes: number; comments: number }
  isFollowing?: boolean
  layout?: 'classic' | 'bento' | 'compact'
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

  // Ajustes dinámicos según el Layout
  const isCompact = layout === 'compact'
  const isBento = layout === 'bento'

  return (
    <div className={`group bg-zentry-card border border-zentry-border hover:border-zentry-accent/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${isBento ? 'h-full' : ''}`}>

      {/* Header */}
      <div className={`flex items-center gap-3 px-4 ${isCompact ? 'py-2' : 'pt-4 pb-3'}`}>
        <div
          className={`${isCompact ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs'} rounded-full flex items-center justify-center font-semibold flex-shrink-0 ring-2 ring-transparent group-hover:ring-zentry-accent/30 transition-all duration-300`}
          style={{ background: author.color + '25', color: author.color }}
        >
          {author.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-zentry-text-1 truncate`}>{author.username}</p>
          {!isCompact && <p className="text-xs text-zentry-text-2">{author.time} · {author.discipline}</p>}
        </div>
        
        {/* Simplificamos el botón seguir en vista compacta */}
        {!following ? (
          <button
            onClick={() => setFollowing(true)}
            className={`text-xs text-zentry-accent hover:text-white font-medium transition-colors border border-zentry-accent/30 hover:bg-zentry-accent hover:border-zentry-accent px-3 py-1 rounded-full ${isCompact ? 'px-2 py-0.5 text-[10px]' : ''}`}
          >
            Seguir
          </button>
        ) : (
          <span className={`text-xs text-zentry-text-2 px-3 py-1 rounded-full border border-zentry-border ${isCompact ? 'hidden' : ''}`}>
            Siguiendo
          </span>
        )}
      </div>

      {/* Contenido (Crece en modo Bento para empujar el footer hacia abajo) */}
      <div className="flex-1">
        {/* Imagen */}
        {content.imageUrl && !isCompact && (
          <div className="mx-4 mb-3 bg-zentry-bg rounded-xl overflow-hidden h-48 flex items-center justify-center relative">
            <span className="text-zentry-text-2 text-sm">{content.imageUrl}</span>
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
              style={{ background: qualityColor + '25', color: qualityColor }}>
              ✦ {content.qualityScore}
            </div>
          </div>
        )}

        {/* Texto */}
        <p className={`px-4 pb-3 ${isCompact ? 'text-xs truncate' : 'text-sm'} text-zentry-text-1/80 leading-relaxed`}>
          {content.text}
        </p>

        {/* Tags */}
        {content.tags.length > 0 && !isCompact && (
          <div className="flex flex-wrap gap-1.5 px-4 pb-3">
            {content.tags.map(tag => (
              <span
                key={tag}
                className="text-xs bg-zentry-bg hover:bg-zentry-accent/10 hover:text-zentry-accent text-zentry-text-2 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className={`flex items-center gap-2 px-4 ${isCompact ? 'py-2' : 'py-3'} border-t border-zentry-border`}>
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all duration-200 ${
            liked
              ? 'bg-red-500/15 text-red-400 scale-105'
              : 'text-zentry-text-2 hover:text-red-400 hover:bg-red-500/10'
          }`}
        >
          {liked ? '♥' : '♡'} {likes}
        </button>

        <button
          onClick={() => setShowComment(!showComment)}
          className="flex items-center gap-1.5 text-xs text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg px-3 py-1.5 rounded-full transition-all duration-200"
        >
          ◎ {content.comments}
        </button>

        {!isCompact && (
          <button className="flex items-center gap-1.5 text-xs text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg px-3 py-1.5 rounded-full transition-all duration-200">
            ↗ Compartir
          </button>
        )}

        <button className={`ml-auto flex items-center gap-1.5 font-medium bg-zentry-accent hover:opacity-80 active:scale-95 text-white rounded-full transition-all duration-200 ${isCompact ? 'text-[10px] px-3 py-1' : 'text-xs px-4 py-1.5'}`}>
          + {isCompact ? 'Colab' : 'Colaborar'}
        </button>
      </div>

      {/* Caja de comentario */}
      {showComment && (
        <div className="px-4 pb-4 flex gap-2 pt-2 border-t border-zentry-border">
          <input
            type="text"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Escribe un comentario..."
            className="flex-1 bg-zentry-bg border border-zentry-border focus:border-zentry-accent text-zentry-text-1 placeholder:text-zentry-text-2 text-xs rounded-full px-4 py-2 outline-none transition-colors"
          />
          <button
            onClick={() => setComment('')}
            className="text-xs bg-zentry-accent hover:opacity-80 text-white px-4 py-2 rounded-full transition-colors"
          >
            Enviar
          </button>
        </div>
      )}
    </div>
  )
}