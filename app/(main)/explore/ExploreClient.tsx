"use client"

import { getCommunities } from "@/lib/actions/communities"
import { getPublicProjectsAction } from "@/lib/actions/projects"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Search, Flame, Users, Image as ImageIcon, History, Sparkles, X, ArrowUpRight, UserPlus, UserCheck,
  Loader2, FolderKanban, Globe, Lock, Compass, Heart,
} from "lucide-react"
import { toast } from "sonner"
import {
  fetchPopularPosts, fetchSuggestedCreators, fetchTrendingHistory, searchExplore,
  type TrendingDTO, type UserDTO, type ExploreProjectDTO, type ExploreCommunityDTO,
} from "@/lib/actions/explore"
import { followUserAction } from "@/lib/actions/profile"
import { FeedCard } from "@/components/feed/FeedCard"
import PostDetailModal from "@/components/feed/PostDetailModal"
import UserAvatar from "@/components/shared/UserAvatar"
import { usePostInteractions } from "@/lib/hooks/usePostInteractions"
import { projectTypeInfo } from "@/lib/projects"
import type { ProjectType } from "@/types"
import { cn, getImageUrl } from "@/lib/utils"

type Tab = "para_ti" | "obras" | "creadores" | "proyectos" | "comunidades" | "tendencias" | "archivo"

const CURRENT_YEAR = new Date().getFullYear()
const HISTORY_YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2]

export default function ExploreClient({ initialTrending }: { initialTrending: TrendingDTO[] }) {
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<Tab>("para_ti")
  const [trending] = useState<TrendingDTO[]>(initialTrending)

  const popular = usePostInteractions()
  const [loadingPopular, setLoadingPopular] = useState(true)
  const [creators, setCreators] = useState<UserDTO[]>([])

  const [archiveYear, setArchiveYear] = useState(HISTORY_YEARS[0])
  const [archive, setArchive] = useState<TrendingDTO[]>([])
  const [loadingArchive, setLoadingArchive] = useState(false)

  // Resultados de búsqueda
  const searchPosts = usePostInteractions()
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<{ users: UserDTO[]; projects: ExploreProjectDTO[]; communities: ExploreCommunityDTO[]; trending: TrendingDTO[] } | null>(null)

  const [publicProjects, setPublicProjects] = useState<ExploreProjectDTO[] | null>(null)
  const [allCommunities, setAllCommunities] = useState<ExploreCommunityDTO[] | null>(null)

  const { setPosts: setPopularPosts } = popular
  const { setPosts: setSearchPosts } = searchPosts

  useEffect(() => {
    fetchPopularPosts().then(res => { setPopularPosts(res.data); setLoadingPopular(false) })
    fetchSuggestedCreators().then(res => setCreators(res.data))
  }, [setPopularPosts])

  // Proyectos públicos y comunidades se cargan al abrir su pestaña por primera vez
  useEffect(() => {
    if (tab === "proyectos" && publicProjects === null) {
      getPublicProjectsAction().then(res => setPublicProjects(res.data.map(p => ({
        id: p.id, title: p.title, description: p.description, projectType: p.projectType || "general",
        coverUrl: p.coverUrl ? getImageUrl(p.coverUrl) : undefined, ownerUsername: p.authorUsername,
        membersCount: p.membersCount || 0, likesCount: p.likesCount || 0,
      }))))
    }
    if (tab === "comunidades" && allCommunities === null) {
      getCommunities().then(res => setAllCommunities(res.data
        .map(c => ({ id: c.id, slug: c.slug, name: c.name, description: c.description, members: c.members,
          avatarUrl: c.avatarUrl ? getImageUrl(c.avatarUrl) : undefined, privacy: c.privacy }))
        .sort((a, b) => b.members - a.members)))
    }
  }, [tab, publicProjects, allCommunities])

  useEffect(() => {
    if (tab !== "archivo") return
    setLoadingArchive(true)
    fetchTrendingHistory(archiveYear).then(res => { setArchive(res.data); setLoadingArchive(false) })
  }, [tab, archiveYear])

  // Búsqueda unificada con espera de 350 ms
  useEffect(() => {
    const q = query.trim()
    if (!q) { setResults(null); return }
    setSearching(true)
    const timer = setTimeout(async () => {
      const res = await searchExplore(q)
      setSearchPosts(res.arts)
      setResults({ users: res.users, projects: res.projects, communities: res.communities, trending: res.trending })
      setSearching(false)
    }, 350)
    return () => clearTimeout(timer)
  }, [query, setSearchPosts])

  const toggleFollow = async (username: string, list: "creators" | "results") => {
    const update = (fn: (u: UserDTO) => UserDTO) => {
      if (list === "creators") setCreators(prev => prev.map(u => u.username === username ? fn(u) : u))
      else setResults(prev => prev ? { ...prev, users: prev.users.map(u => u.username === username ? fn(u) : u) } : prev)
    }
    const flip = (u: UserDTO) => ({ ...u, isFollowing: !u.isFollowing, followers: u.followers + (u.isFollowing ? -1 : 1) })
    update(flip)
    const res = await followUserAction(username)
    if (!res.success) { update(flip); toast.error("No se pudo actualizar el seguimiento"); return }
    toast.success(`${res.data?.following ? "Ahora sigues a" : "Dejaste de seguir a"} @${username}`)
  }

  const isSearching = Boolean(query.trim())
  const active = isSearching ? searchPosts : popular

  const count = (n?: number) => (isSearching && results ? n : undefined)
  const tabs: { id: Tab; label: string; icon: typeof Sparkles; count?: number }[] = [
    { id: "para_ti", label: isSearching ? "Todo" : "Para ti", icon: Sparkles },
    { id: "obras", label: "Obras", icon: ImageIcon, count: count(searchPosts.posts.length) },
    { id: "creadores", label: "Creadores", icon: Users, count: count(results?.users.length) },
    { id: "proyectos", label: "Proyectos", icon: FolderKanban, count: count(results?.projects.length) },
    { id: "comunidades", label: "Comunidades", icon: Globe, count: count(results?.communities.length) },
    { id: "tendencias", label: "Tendencias", icon: Flame, count: count(results?.trending.length) },
    { id: "archivo", label: "Archivo", icon: History },
  ]

  const users = isSearching ? results?.users ?? [] : creators
  const trends = isSearching ? results?.trending ?? [] : trending

  return (
    <div className="w-full py-2 sm:py-6 pb-24 space-y-5">
      {/* Cabecera + buscador */}
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zentry-text-1 flex items-center gap-2"><Compass className="w-7 h-7 text-zentry-accent" /> Explorar</h1>
          <p className="text-sm text-zentry-text-2 mt-1">Descubre obras populares, creadores, proyectos abiertos y comunidades.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zentry-text-2" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Busca creadores (@usuario), obras, #etiquetas, proyectos o comunidades…"
            aria-label="Buscar en Zentry"
            className="w-full bg-zentry-card border-2 border-zentry-border rounded-2xl py-3.5 pl-12 pr-12 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
          />
          {searching ? (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-zentry-text-2" />
          ) : query && (
            <button onClick={() => setQuery("")} aria-label="Limpiar búsqueda" className="absolute right-4 top-1/2 -translate-y-1/2 text-zentry-text-2 hover:text-zentry-text-1 cursor-pointer"><X className="w-5 h-5" /></button>
          )}
        </div>
        {!isSearching && trending.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar text-xs">
            <span className="text-zentry-text-2 font-bold shrink-0 flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-500" /> En tendencia:</span>
            {trending.slice(0, 8).map(t => (
              <button key={t.id} onClick={() => setQuery(t.hashtag)}
                className="whitespace-nowrap bg-zentry-card border border-zentry-border text-zentry-text-2 hover:text-zentry-text-1 hover:border-zentry-accent px-3 py-1 rounded-xl font-bold cursor-pointer">
                {t.hashtag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pestañas */}
      <nav className="flex gap-1 overflow-x-auto bg-zentry-card border border-zentry-border rounded-2xl p-1 custom-scrollbar" aria-label="Secciones de Explorar">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer",
              tab === t.id ? "bg-zentry-accent text-white shadow" : "text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg")}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
            {t.count !== undefined && (
              <span className={cn("ml-0.5 px-1.5 rounded-full text-[10px]", tab === t.id ? "bg-white/20" : "bg-zentry-bg text-zentry-text-2")}>{t.count}</span>
            )}
          </button>
        ))}
      </nav>

      {tab === "para_ti" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <section className="xl:col-span-2 space-y-3">
            <SectionTitle icon={Heart} title={isSearching ? "Obras encontradas" : "Populares este mes"} />
            <PostsGrid state={active} loading={!isSearching && loadingPopular} empty={isSearching ? "No encontramos obras con esa búsqueda" : "Aún no hay obras populares"} />
          </section>
          <aside className="space-y-5">
            <div className="space-y-3">
              <SectionTitle icon={Users} title={isSearching ? "Creadores" : "Creadores sugeridos"} />
              <UserList users={users.slice(0, 6)} onFollow={u => toggleFollow(u, isSearching ? "results" : "creators")} />
            </div>
            <div className="space-y-3">
              <SectionTitle icon={Flame} title="Tendencias" />
              <TrendList trends={trends.slice(0, 8)} onPick={setQuery} />
            </div>
          </aside>
        </div>
      )}

      {tab === "obras" && (
        <PostsGrid state={active} loading={!isSearching && loadingPopular} empty={isSearching ? "No encontramos obras con esa búsqueda" : "Aún no hay obras populares"} wide />
      )}

      {tab === "creadores" && <UserList users={users} onFollow={u => toggleFollow(u, isSearching ? "results" : "creators")} grid />}

      {tab === "proyectos" && (
        isSearching
          ? <ProjectList projects={results?.projects ?? []} />
          : publicProjects === null ? <Spinner /> : <ProjectList projects={publicProjects} empty="Aún no hay proyectos públicos. ¡Haz público el tuyo desde Proyectos!" />
      )}

      {tab === "comunidades" && (
        isSearching
          ? <CommunityList communities={results?.communities ?? []} />
          : allCommunities === null ? <Spinner /> : <CommunityList communities={allCommunities} empty="Aún no hay comunidades. ¡Crea la primera!" />
      )}

      {tab === "tendencias" && <TrendList trends={trends} onPick={(t) => { setQuery(t); setTab("para_ti") }} big />}

      {tab === "archivo" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {HISTORY_YEARS.map(y => (
              <button key={y} onClick={() => setArchiveYear(y)}
                className={cn("px-4 py-2 rounded-xl text-xs font-black border cursor-pointer",
                  archiveYear === y ? "bg-zentry-accent text-white border-zentry-accent" : "bg-zentry-card border-zentry-border text-zentry-text-2")}>{y}</button>
            ))}
          </div>
          {loadingArchive ? <Spinner /> : <TrendList trends={archive} onPick={(t) => { setQuery(t); setTab("para_ti") }} big empty={`No hubo etiquetas en ${archiveYear}`} />}
        </div>
      )}

      <PostDetailModal
        post={active.activePost}
        isOpen={Boolean(active.activePost)}
        onClose={active.closePost}
        isLiked={active.activePost ? active.isLiked(active.activePost) : false}
        onLike={active.toggleLike}
        onReact={active.reactTo}
        onShare={(p) => { navigator.clipboard.writeText(`${window.location.origin}/feed?post=${p.id}`); toast.success("🔗 Enlace copiado") }}
        onPostUpdated={active.applyPostUpdate}
        onPostDeleted={active.removePost}
        onCommentCountChange={(id, n) => active.setPosts(prev => prev.map(p => p.id === id ? { ...p, comments: n } : p))}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------

function SectionTitle({ icon: Icon, title }: { icon: typeof Sparkles; title: string }) {
  return <h2 className="text-base font-black text-zentry-text-1 flex items-center gap-2"><Icon className="w-4 h-4 text-zentry-accent" /> {title}</h2>
}

function Spinner() {
  return <div className="py-12 flex justify-center text-zentry-text-2"><Loader2 className="w-6 h-6 animate-spin" /></div>
}

function Empty({ text }: { text: string }) {
  return <div className="bg-zentry-card border border-dashed border-zentry-border rounded-3xl p-8 text-center text-sm text-zentry-text-2">{text}</div>
}

function PostsGrid({ state, loading, empty, wide }: { state: ReturnType<typeof usePostInteractions>; loading: boolean; empty: string; wide?: boolean }) {
  if (loading) return <Spinner />
  if (state.posts.length === 0) return <Empty text={empty} />
  return (
    <div className={wide ? "columns-1 sm:columns-2 xl:columns-3 gap-5" : "columns-1 sm:columns-2 gap-5"}>
      {state.posts.map(post => (
        <div key={post.id} className="break-inside-avoid">
          <FeedCard
            post={post}
            isLiked={state.isLiked(post)}
            onLike={state.toggleLike}
            onReact={state.reactTo}
            onComment={state.openPost}
            onPostUpdated={state.applyPostUpdate}
            onPostDeleted={state.removePost}
          />
        </div>
      ))}
    </div>
  )
}

function UserList({ users, onFollow, grid }: { users: UserDTO[]; onFollow: (username: string) => void; grid?: boolean }) {
  if (users.length === 0) return <Empty text="No hay creadores para mostrar" />
  return (
    <ul className={grid ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3" : "space-y-2"}>
      {users.map(u => (
        <li key={u.username} className="bg-zentry-card border border-zentry-border rounded-2xl p-3 flex items-center gap-3">
          <Link href={`/profile/${u.username}`}><UserAvatar name={u.name} avatarUrl={u.avatarUrl} cosmetics={u.cosmetics} size={44} /></Link>
          <div className="min-w-0 flex-1">
            <Link href={`/profile/${u.username}`} className="text-sm font-bold text-zentry-text-1 truncate block hover:text-zentry-accent">{u.name}</Link>
            <p className="text-[11px] text-zentry-text-2 truncate">@{u.username} · {u.followers} {u.followers === 1 ? "seguidor" : "seguidores"}</p>
          </div>
          <button onClick={() => onFollow(u.username)}
            className={cn("px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1 shrink-0 cursor-pointer",
              u.isFollowing ? "bg-zentry-bg border border-zentry-border text-zentry-text-2" : "bg-zentry-accent text-white")}>
            {u.isFollowing ? <><UserCheck className="w-3.5 h-3.5" /> Siguiendo</> : <><UserPlus className="w-3.5 h-3.5" /> Seguir</>}
          </button>
        </li>
      ))}
    </ul>
  )
}

function TrendList({ trends, onPick, big, empty = "Aún no hay tendencias: publica obras con #etiquetas para crearlas" }: {
  trends: TrendingDTO[]; onPick: (tag: string) => void; big?: boolean; empty?: string
}) {
  if (trends.length === 0) return <Empty text={empty} />
  return (
    <ol className="bg-zentry-card border border-zentry-border rounded-3xl divide-y divide-zentry-border overflow-hidden">
      {trends.map((t, i) => (
        <li key={t.id}>
          <button onClick={() => onPick(t.hashtag)} className={cn("w-full text-left hover:bg-zentry-bg/70 flex items-center justify-between group cursor-pointer", big ? "p-4" : "p-3")}>
            <span className="space-y-0.5">
              <span className="flex items-center gap-2 text-[11px] text-zentry-text-2">
                <span className="font-extrabold text-zentry-accent">#{i + 1}</span> {t.category}
                {t.isHot && <span className="bg-orange-500/20 text-orange-400 font-bold px-1.5 py-0.5 rounded-full text-[10px]">🔥 En llamas</span>}
              </span>
              <span className={cn("block font-extrabold text-zentry-text-1 group-hover:text-zentry-accent", big ? "text-base" : "text-sm")}>{t.hashtag}</span>
              <span className="block text-[11px] text-zentry-text-2">{t.postsCount} {t.postsCount === 1 ? "publicación" : "publicaciones"}</span>
            </span>
            <ArrowUpRight className="w-4 h-4 text-zentry-text-2 group-hover:text-zentry-accent" />
          </button>
        </li>
      ))}
    </ol>
  )
}

function ProjectList({ projects, empty = "No hay proyectos públicos con esa búsqueda" }: { projects: ExploreProjectDTO[]; empty?: string }) {
  if (projects.length === 0) return <Empty text={empty} />
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {projects.map(p => {
        const type = projectTypeInfo(p.projectType as ProjectType)
        return (
          <Link key={p.id} href={`/projects/${p.id}`} className="bg-zentry-card border border-zentry-border rounded-3xl overflow-hidden hover:border-zentry-accent/60 transition">
            <div className="relative h-24 bg-gradient-to-br from-indigo-950 via-purple-950/60 to-zentry-bg">
              {p.coverUrl && <Image src={p.coverUrl} alt={p.title} fill sizes="400px" className="object-cover opacity-80" />}
              <span className={cn("absolute top-2 left-2 text-[10px] font-black px-2 py-1 rounded-lg border flex items-center gap-1", type.color)}><type.icon className="w-3 h-3" /> {type.label}</span>
            </div>
            <div className="p-4 space-y-1">
              <p className="text-sm font-extrabold text-zentry-text-1 line-clamp-1">{p.title}</p>
              <p className="text-xs text-zentry-text-2 line-clamp-2">{p.description || "Sin descripción"}</p>
              <p className="text-[11px] text-zentry-text-2 pt-1">@{p.ownerUsername} · {p.membersCount} miembros · ❤️ {p.likesCount}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

function CommunityList({ communities, empty = "No hay comunidades con esa búsqueda" }: { communities: ExploreCommunityDTO[]; empty?: string }) {
  if (communities.length === 0) return <Empty text={empty} />
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {communities.map(c => (
        <Link key={c.id} href={`/communities/${c.slug}`} className="bg-zentry-card border border-zentry-border rounded-2xl p-4 flex items-center gap-3 hover:border-zentry-accent/60 transition">
          <span className="relative w-12 h-12 rounded-2xl bg-zentry-bg border border-zentry-border overflow-hidden flex items-center justify-center font-black text-zentry-accent shrink-0">
            {c.avatarUrl ? <Image src={c.avatarUrl} alt={c.name} fill sizes="48px" className="object-cover" /> : c.name.substring(0, 2).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="text-sm font-bold text-zentry-text-1 truncate flex items-center gap-1">{c.name} {c.privacy === "private" && <Lock className="w-3 h-3 text-amber-400" />}</span>
            <span className="block text-[11px] text-zentry-text-2">c/{c.slug} · {c.members} miembros</span>
            <span className="block text-[11px] text-zentry-text-2 line-clamp-1">{c.description}</span>
          </span>
        </Link>
      ))}
    </div>
  )
}
