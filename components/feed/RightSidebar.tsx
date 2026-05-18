'use client'

import { useFeed } from '@/lib/context/FeedContext'

const TRENDS = [
  { tag: 'ilustracion',   count: '2.4k' },
  { tag: 'musica',        count: '1.8k' },
  { tag: 'fotografia',    count: '1.2k' },
  { tag: 'poesia',        count: '980'  },
  { tag: 'diseno3d',      count: '750'  },
]

const NOTIFICATIONS = [
  { initials: 'LM', color: '#1D9E75', text: '@lunamuse reacciono tu obra' },
  { initials: 'NB', color: '#534AB7', text: '@novabeats te invito a colaborar' },
  { initials: 'SK', color: '#BA7517', text: '@sketchr empezo a seguirte' },
  { initials: 'ZC', color: '#1D9E75', text: 'Ganaste +5 Zentry Coins hoy' },
]

const SUGGESTED = [
  { initials: 'CR', color: '#458AB7', username: 'colorwav',  discipline: 'Musica',       followers: '1.2k' },
  { initials: 'AR', color: '#1D9E75', username: 'arquiviva', discipline: 'Arquitectura', followers: '890'  },
  { initials: 'NB', color: '#B74545', username: 'novabeats', discipline: 'Musica',       followers: '2.1k' },
]

export default function RightSidebar() {
  const { activeTrend, setActiveTrend } = useFeed()

  return (
    <div className="flex flex-col gap-3">

      {/* Notificaciones */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
          Notificaciones
        </p>
        <div className="flex flex-col gap-3">
          {NOTIFICATIONS.map((n, i) => (
            <div key={i} className="flex gap-2.5 items-start">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                style={{ background: n.color + '30', color: n.color }}
              >
                {n.initials}
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{n.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tendencias clickeables */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
          Tendencias hoy
        </p>
        <div className="flex flex-col gap-1">
          {TRENDS.map(t => (
            <button
              key={t.tag}
              onClick={() => setActiveTrend(
                activeTrend === t.tag ? null : t.tag
              )}
              className={`flex justify-between items-center px-3 py-2 rounded-xl transition-all text-left ${
                activeTrend === t.tag
                  ? 'bg-violet-500/10 text-violet-400'
                  : 'hover:bg-zinc-800 text-zinc-400'
              }`}
            >
              <span className={`text-sm font-medium ${
                activeTrend === t.tag ? 'text-violet-400' : 'text-violet-500'
              }`}>
                #{t.tag}
              </span>
              <span className="text-xs text-zinc-600">{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Artistas sugeridos */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
          Artistas sugeridos
        </p>
        <div className="flex flex-col gap-3">
          {SUGGESTED.map(a => (
            <div key={a.username} className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                style={{ background: a.color + '30', color: a.color }}
              >
                {a.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">@{a.username}</p>
                <p className="text-xs text-zinc-600">{a.discipline} - {a.followers} seg</p>
              </div>
              <button className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors">
                Seguir
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}