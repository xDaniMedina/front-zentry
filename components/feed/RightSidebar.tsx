'use client'

import { useFeed } from '@/lib/context/FeedContext'

const TRENDS = [
  { tag: 'ilustracion',   count: '2.4k' },
  { tag: 'musica',        count: '1.8k' },
  { tag: 'fotografia',    count: '1.2k' },
]

const NOTIFICATIONS = [
  { initials: 'LM', color: '#1D9E75', text: '@lunamuse reacciono tu obra' },
  { initials: 'NB', color: '#534AB7', text: '@novabeats te invito a colaborar' },
]

const SUGGESTED = [
  { initials: 'CR', color: '#458AB7', username: 'colorwav',  discipline: 'Musica',       followers: '1.2k' },
  { initials: 'AR', color: '#1D9E75', username: 'arquiviva', discipline: 'Arquitectura', followers: '890'  },
]

export default function RightSidebar() {
  const { activeTrend, setActiveTrend } = useFeed()

  return (
    // En Móvil es flex-col. En Tablet es un grid de 2 columnas. En Escritorio vuelve a ser flex-col.
    <div className="flex flex-col md:grid md:grid-cols-2 lg:flex lg:flex-col gap-4 lg:gap-3 transition-colors duration-300 w-full">

      {/* Notificaciones */}
      <div className="bg-zentry-card border border-zentry-border rounded-2xl p-4 transition-colors duration-300 w-full">
        <p className="text-xs font-medium text-zentry-text-2 uppercase tracking-wider mb-3">
          Notificaciones
        </p>
        <div className="flex flex-col gap-3">
          {NOTIFICATIONS.map((n, i) => (
            <div key={i} className="flex gap-2.5 items-start">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                style={{ background: n.color + '30', color: n.color }}
              >
                {n.initials}
              </div>
              <p className="text-xs text-zentry-text-1/80 leading-relaxed">{n.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tendencias clickeables */}
      <div className="bg-zentry-card border border-zentry-border rounded-2xl p-4 transition-colors duration-300 w-full">
        <p className="text-xs font-medium text-zentry-text-2 uppercase tracking-wider mb-3">
          Tendencias hoy
        </p>
        <div className="flex flex-col gap-1">
          {TRENDS.map(t => (
            <button
              key={t.tag}
              onClick={() => setActiveTrend(activeTrend === t.tag ? null : t.tag)}
              className={`flex justify-between items-center px-3 py-2 rounded-xl transition-all text-left ${
                activeTrend === t.tag
                  ? 'bg-zentry-accent/10 text-zentry-accent'
                  : 'hover:bg-zentry-bg text-zentry-text-2'
              }`}
            >
              <span className={`text-sm font-medium ${activeTrend === t.tag ? 'text-zentry-accent' : 'text-zentry-accent/80'}`}>
                #{t.tag}
              </span>
              <span className="text-xs text-zentry-text-2 opacity-80">{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Artistas sugeridos (Ocupa 2 columnas enteras en tablet para balancear) */}
      <div className="bg-zentry-card border border-zentry-border rounded-2xl p-4 transition-colors duration-300 w-full md:col-span-2 lg:col-span-1">
        <p className="text-xs font-medium text-zentry-text-2 uppercase tracking-wider mb-3">
          Artistas sugeridos
        </p>
        <div className="flex flex-col gap-3">
          {SUGGESTED.map(a => (
            <div key={a.username} className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                style={{ background: a.color + '30', color: a.color }}
              >
                {a.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zentry-text-1 truncate">@{a.username}</p>
                <p className="text-xs text-zentry-text-2 truncate">{a.discipline}</p>
              </div>
              <button className="text-xs text-zentry-accent hover:opacity-80 font-medium transition-colors border border-transparent hover:border-zentry-accent/30 px-2 py-1 rounded-full shrink-0">
                Seguir
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}