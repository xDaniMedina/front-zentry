'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'

const MOCK_RESULTS = [
  { type: 'artist', username: 'lunamuse',  discipline: 'Ilustracion', initials: 'LM', color: '#1D9E75' },
  { type: 'artist', username: 'novabeats', discipline: 'Musica',      initials: 'NB', color: '#534AB7' },
  { type: 'tag',    username: 'ilustracion',  discipline: '2.4k obras', initials: '#', color: '#534AB7' },
  { type: 'tag',    username: 'fotografia',   discipline: '1.2k obras', initials: '#', color: '#534AB7' },
]

export default function FeedSearch() {
  const [query, setQuery]   = useState('')
  const [focused, setFocused] = useState(false)

  const filtered = MOCK_RESULTS.filter(r =>
    r.username.toLowerCase().includes(query.toLowerCase())
  )

  const showResults = focused && query.length > 0

  return (
    <div className="relative">
      <div className={`bg-zinc-900 border rounded-2xl px-4 py-3 flex items-center gap-3 transition-colors ${
        focused ? 'border-violet-500' : 'border-zinc-800'
      }`}>
        <Search className="w-4 h-4 text-zinc-500 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Buscar artistas, obras, hashtags..."
          className="bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none w-full"
        />
        {query && (
          <button onClick={() => setQuery('')}>
            <X className="w-4 h-4 text-zinc-500 hover:text-white transition-colors" />
          </button>
        )}
      </div>

      {/* Resultados */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl z-40">
          {filtered.length > 0 ? (
            <div className="py-2">
              {filtered.map((result, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800 transition-colors text-left"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{ background: result.color + '30', color: result.color }}
                  >
                    {result.initials}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">
                      {result.type === 'tag' ? '#' : '@'}{result.username}
                    </p>
                    <p className="text-xs text-zinc-500">{result.discipline}</p>
                  </div>
                  <span className="ml-auto text-xs text-zinc-600">
                    {result.type === 'tag' ? 'Hashtag' : 'Artista'}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-sm text-zinc-500">Sin resultados para {query}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}