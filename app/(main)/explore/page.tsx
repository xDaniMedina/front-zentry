'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'

type FilterType = 'todo' | 'artistas' | 'obras' | 'proyectos'
type DisciplineType = 'todas' | 'ilustracion' | 'musica' | 'fotografia' | 'escritura' | 'diseño' | 'video'

const MOCK_ARTISTS = [
  { id: 1, username: 'lunamuse',  initials: 'LM', color: '#1D9E75', discipline: 'Ilustracion', followers: '1.2k', tags: ['ilustracion','color'],    following: false },
  { id: 2, username: 'novabeats', initials: 'NB', color: '#534AB7', discipline: 'Musica',       followers: '2.1k', tags: ['musica','EP'],           following: false },
  { id: 3, username: 'pixelkid',  initials: 'PK', color: '#BA7517', discipline: 'Arte Digital', followers: '890',  tags: ['digital','proceso'],     following: true  },
  { id: 4, username: 'colorwav',  initials: 'CR', color: '#458AB7', discipline: 'Musica',       followers: '1.5k', tags: ['musica','experimental'], following: false },
  { id: 5, username: 'sketchr',   initials: 'SK', color: '#B74545', discipline: 'Fotografia',   followers: '670',  tags: ['fotografia','urbano'],   following: false },
  { id: 6, username: 'arquiviva', initials: 'AR', color: '#1D9E75', discipline: 'Arquitectura', followers: '430',  tags: ['arquitectura','diseño'], following: true  },
]

const MOCK_ARTWORKS = [
  { id: 1, title: 'Serie Raices',   author: '@lunamuse',  type: 'imagen',  likes: 142, score: 4.8, color: '#1D9E75' },
  { id: 2, title: 'EP Nocturno',    author: '@novabeats', type: 'audio',   likes: 203, score: 4.6, color: '#534AB7' },
  { id: 3, title: 'Urbano III',     author: '@pixelkid',  type: 'imagen',  likes: 89,  score: 4.2, color: '#BA7517' },
  { id: 4, title: 'Poema del Rio',  author: '@colorwav',  type: 'texto',   likes: 67,  score: 4.4, color: '#458AB7' },
  { id: 5, title: 'Ciudad Gris',    author: '@sketchr',   type: 'foto',    likes: 112, score: 4.5, color: '#B74545' },
  { id: 6, title: 'Estructura I',   author: '@arquiviva', type: 'imagen',  likes: 54,  score: 4.1, color: '#1D9E75' },
]

const MOCK_PROJECTS = [
  { id: 1, title: 'Album Conceptual', desc: 'Buscamos ilustrador para portada de album',    members: 3, maxMembers: 5, status: 'open',    statusLabel: 'Abierto'     },
  { id: 2, title: 'Comic Urbano',     desc: 'Escritor busca ilustrador para comic',          members: 1, maxMembers: 3, status: 'open',    statusLabel: 'Abierto'     },
  { id: 3, title: 'Documental Arte',  desc: 'Video artista busca musico para score',         members: 4, maxMembers: 5, status: 'almost',  statusLabel: 'Casi lleno'  },
  { id: 4, title: 'EP Colaborativo',  desc: 'Productores buscan cantante y letrista',        members: 2, maxMembers: 4, status: 'open',    statusLabel: 'Abierto'     },
  { id: 5, title: 'Exposicion 2025',  desc: 'Curadores buscan artistas visuales emergentes', members: 5, maxMembers: 8, status: 'open',    statusLabel: 'Abierto'     },
  { id: 6, title: 'Novela Grafica',   desc: 'Escritora busca ilustrador de personajes',      members: 1, maxMembers: 2, status: 'almost',  statusLabel: 'Casi lleno'  },
]

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'todo',      label: 'Todo'      },
  { key: 'artistas',  label: 'Artistas'  },
  { key: 'obras',     label: 'Obras'     },
  { key: 'proyectos', label: 'Proyectos' },
]

const DISCIPLINES: { key: DisciplineType; label: string }[] = [
  { key: 'todas',       label: 'Todas'       },
  { key: 'ilustracion', label: 'Ilustracion' },
  { key: 'musica',      label: 'Musica'      },
  { key: 'fotografia',  label: 'Fotografia'  },
  { key: 'escritura',   label: 'Escritura'   },
  { key: 'diseño',      label: 'Diseño'      },
  { key: 'video',       label: 'Video'       },
]

export default function ExplorePage() {
  const [query,      setQuery]      = useState('')
  const [filter,     setFilter]     = useState<FilterType>('todo')
  const [discipline, setDiscipline] = useState<DisciplineType>('todas')
  const [following,  setFollowing]  = useState<Record<number, boolean>>(
    Object.fromEntries(MOCK_ARTISTS.map(a => [a.id, a.following]))
  )
  const [showFilters, setShowFilters] = useState(false)

  const filteredArtists = MOCK_ARTISTS.filter(a => {
    const matchQuery = query === '' ||
      a.username.includes(query.toLowerCase()) ||
      a.discipline.toLowerCase().includes(query.toLowerCase())
    const matchDiscipline = discipline === 'todas' ||
      a.discipline.toLowerCase().includes(discipline)
    return matchQuery && matchDiscipline
  })

  const filteredArtworks = MOCK_ARTWORKS.filter(a =>
    query === '' ||
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.author.includes(query.toLowerCase())
  )

  const filteredProjects = MOCK_PROJECTS.filter(p =>
    query === '' ||
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.desc.toLowerCase().includes(query.toLowerCase())
  )

  const toggleFollow = (id: number) => {
    setFollowing(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const showArtists  = filter === 'todo' || filter === 'artistas'
  const showArtworks = filter === 'todo' || filter === 'obras'
  const showProjects = filter === 'todo' || filter === 'proyectos'

  const statusColor = (status: string) => {
    if (status === 'open')   return 'bg-green-500/10 text-green-400'
    if (status === 'almost') return 'bg-yellow-500/10 text-yellow-400'
    return 'bg-zinc-800 text-zinc-400'
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Buscador */}
      <div className="flex gap-3">
        <div className={`flex-1 bg-zinc-900 border rounded-2xl px-4 py-3 flex items-center gap-3 transition-colors ${
          query ? 'border-violet-500' : 'border-zinc-800'
        }`}>
          <Search className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar artistas, obras, proyectos..."
            className="bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none w-full"
          />
          {query && (
            <button onClick={() => setQuery('')}>
              <X className="w-4 h-4 text-zinc-500 hover:text-white transition-colors" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all text-sm ${
            showFilters
              ? 'bg-violet-500/10 border-violet-500 text-violet-400'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* Filtros expandibles */}
      {showFilters && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
          <div>
            <p className="text-xs text-zinc-500 mb-2">Disciplina</p>
            <div className="flex flex-wrap gap-2">
              {DISCIPLINES.map(d => (
                <button
                  key={d.key}
                  onClick={() => setDiscipline(d.key)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                    discipline === d.key
                      ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs de tipo */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-sm px-4 py-2 rounded-full transition-all ${
              filter === f.key
                ? 'bg-violet-600 text-white font-medium'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Artistas */}
      {showArtists && filteredArtists.length > 0 && (
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
            Artistas destacados
          </p>
          <div className="flex flex-col gap-3">
            {filteredArtists.map(artist => (
              <div
                key={artist.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 flex items-center gap-3 transition-all"
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                  style={{ background: artist.color + '25', color: artist.color }}
                >
                  {artist.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">@{artist.username}</p>
                  <p className="text-xs text-zinc-500 mb-1.5">{artist.discipline} · {artist.followers} seguidores</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {artist.tags.map(tag => (
                      <span key={tag} className="text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => toggleFollow(artist.id)}
                  className={`text-xs font-medium px-4 py-1.5 rounded-full transition-all flex-shrink-0 ${
                    following[artist.id]
                      ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      : 'bg-violet-600 hover:bg-violet-500 text-white'
                  }`}
                >
                  {following[artist.id] ? 'Siguiendo' : 'Seguir'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Obras */}
      {showArtworks && filteredArtworks.length > 0 && (
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
            Obras destacadas
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredArtworks.map(artwork => (
              <div
                key={artwork.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden transition-all cursor-pointer group"
              >
                <div
                  className="h-28 flex items-center justify-center text-xs text-zinc-600 group-hover:opacity-90 transition-opacity"
                  style={{ background: artwork.color + '15' }}
                >
                  {artwork.type}
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-white truncate mb-0.5">{artwork.title}</p>
                  <p className="text-xs text-zinc-500 mb-2">{artwork.author}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-600">{artwork.likes} likes</span>
                    <span className="text-xs bg-violet-500/15 text-violet-400 px-2 py-0.5 rounded-full font-medium">
                      {artwork.score}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proyectos */}
      {showProjects && filteredProjects.length > 0 && (
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
            Proyectos buscando colaboradores
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProjects.map(project => (
              <div
                key={project.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-white">{project.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${statusColor(project.status)}`}>
                    {project.statusLabel}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mb-3 leading-relaxed">{project.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {Array.from({ length: project.members }).map((_, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full bg-violet-500/30 border border-zinc-900 flex items-center justify-center text-xs text-violet-400"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-zinc-600">
                      {project.members}/{project.maxMembers}
                    </span>
                  </div>
                  <button className="text-xs bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-full transition-colors">
                    Unirse
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
1
      {/* Sin resultados */}
      {query && filteredArtists.length === 0 && filteredArtworks.length === 0 && filteredProjects.length === 0 && (
        <div className="text-center py-16">
          <p className="text-zinc-500 text-sm">Sin resultados para {query} </p>
          <button onClick={() => setQuery('')} className="text-violet-400 text-xs mt-2 hover:text-violet-300 transition-colors">
            Limpiar busqueda
          </button>
        </div>
      )}

    </div>
  )
}