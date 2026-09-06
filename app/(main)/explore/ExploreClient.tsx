"use client"

import { useState, useEffect } from "react";
import {
  Search, Flame, Users, Image as ImageIcon,
  History, Sparkles, X, Heart, MessageSquare, ArrowUpRight,
  UserPlus, UserCheck, Clock, ChevronRight, Loader2
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchExplorePosts, searchExplore, fetchTrendingHistory, likePostAction, type TrendingDTO, type ArtDTO, type UserDTO } from "@/lib/actions/explore";
import { followUserAction } from "@/lib/actions/profile";

const POPULAR_SEARCHES = [
  "Cyberpunk Art 3D",
  "UI/UX Design Systems",
  "Midjourney Prompts",
  "Ilustración Anime",
  "Sintetizador Lo-Fi",
  "Next.js 16 Turbo"
];

const HISTORY_YEARS = [2026, 2025, 2024];

export default function ExploreClient({ initialTrending }: { initialTrending: TrendingDTO[] }) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'todo' | 'obras' | 'usuarios' | 'tendencias' | 'pasado'>('todo');
  const [pastYear, setPastYear] = useState<number>(HISTORY_YEARS[0]);

  const [trendingList] = useState<TrendingDTO[]>(initialTrending);
  const [pastTrending, setPastTrending] = useState<TrendingDTO[]>([]);
  const [loadingPast, setLoadingPast] = useState(false);

  const [usersList, setUsersList] = useState<UserDTO[]>([]);
  const [artsList, setArtsList] = useState<ArtDTO[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [likedArts, setLikedArts] = useState<string[]>([]);

  // Cargar publicaciones reales para la pestaña "Obras"
  useEffect(() => {
    fetchExplorePosts().then(res => {
      if (res.success) setArtsList(res.data);
    });
  }, []);

  // Cargar archivo histórico real al cambiar de año
  useEffect(() => {
    if (activeTab !== 'pasado') return;
    setLoadingPast(true);
    fetchTrendingHistory(pastYear).then(res => {
      setPastTrending(res.success ? res.data : []);
      setLoadingPast(false);
    });
  }, [activeTab, pastYear]);

  // Búsqueda real en el backend
  useEffect(() => {
    if (!searchQuery.trim()) {
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      const data = await searchExplore(searchQuery);
      setHasSearched(true);
      if (data.success) {
        setUsersList(data.users);
        setArtsList(data.arts);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleFollowUser = async (username: string) => {
    const target = usersList.find(u => u.username === username);
    const wasFollowing = target?.isFollowing ?? false;

    setUsersList(prev => prev.map(u => u.username === username ? { ...u, isFollowing: !wasFollowing, followers: wasFollowing ? u.followers - 1 : u.followers + 1 } : u));

    const res = await followUserAction(username);
    if (res.success) {
      toast.success(!wasFollowing ? `Ahora sigues a @${username}` : `Has dejado de seguir a @${username}`);
    } else {
      // revertir
      setUsersList(prev => prev.map(u => u.username === username ? { ...u, isFollowing: wasFollowing, followers: wasFollowing ? u.followers + 1 : u.followers - 1 } : u));
      toast.error("No se pudo actualizar el seguimiento");
    }
  };

  const toggleLikeArt = async (artId: string) => {
    const isLiked = likedArts.includes(artId);
    setLikedArts(prev => isLiked ? prev.filter(id => id !== artId) : [...prev, artId]);

    const res = await likePostAction(artId);
    if (res.success && res.likes != null) {
      setArtsList(prev => prev.map(a => a.id === artId ? { ...a, likes: res.likes as number } : a));
    }
  };

  const handleSelectSearchTerm = (term: string) => {
    setSearchQuery(term);
    setActiveTab('todo');
  };

  const queryLower = (searchQuery || "").toLowerCase();

  const filteredArts = artsList.filter(a =>
    (a.title || "").toLowerCase().includes(queryLower) ||
    (a.author || "").toLowerCase().includes(queryLower)
  );

  const filteredTrending = trendingList.filter(t =>
    (t.hashtag || "").toLowerCase().includes(queryLower) ||
    (t.category || "").toLowerCase().includes(queryLower)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 px-4 sm:px-6 lg:px-8">

      {/* BANNER PRINCIPAL DE EXPLORAR ESTILO TENDENCIAS X */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-orange-950/60 via-zentry-card to-purple-950/60 border border-zentry-border overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <span className="text-xs font-mono font-bold tracking-wider text-orange-400 uppercase bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 inline-flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" /> Tendencias Globales en Zentry
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-zentry-text-1 tracking-tight">
            Descubre Artistas, Obras y Temas del Momento
          </h1>

          <p className="text-sm text-zentry-text-2 leading-relaxed">
            Explora las conversaciones en tendencia estilo X (Twitter), busca creadores por su perfil o sumérgete en el archivo histórico de obras pasadas.
          </p>
        </div>
      </div>

      {/* BUSCADOR GIGANTE E INTERACTIVO */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zentry-text-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por usuario (@lunamuse), arte, hashtag (#Cyberpunk) o palabra clave..."
            className="w-full bg-zentry-card border-2 border-zentry-border rounded-2xl py-4 pl-12 pr-12 text-sm sm:text-base text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors shadow-lg placeholder:text-zentry-text-2/60"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zentry-text-2 hover:text-zentry-text-1 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar text-xs">
          <span className="text-zentry-text-2 font-bold shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Lo más buscado:
          </span>
          {POPULAR_SEARCHES.map((term, i) => (
            <button
              key={i}
              onClick={() => handleSelectSearchTerm(term)}
              className="whitespace-nowrap bg-zentry-card border border-zentry-border text-zentry-text-2 hover:text-zentry-text-1 hover:border-zentry-accent px-3 py-1 rounded-xl font-medium transition-all"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN Y RESULTADOS */}
      <div className="flex items-center gap-2 border-b border-zentry-border overflow-x-auto custom-scrollbar pb-1">
        {[
          { id: 'todo', label: 'Todo', icon: Sparkles },
          { id: 'obras', label: 'Obras y Arte', icon: ImageIcon },
          { id: 'usuarios', label: 'Artistas & Usuarios', icon: Users },
          { id: 'tendencias', label: 'Tendencias (X)', icon: Flame },
          { id: 'pasado', label: 'Tendencias del Pasado', icon: History },
        ].map(tab => {
          const IconComp = tab.icon;
          const tabId = tab.id as 'todo' | 'obras' | 'usuarios' | 'tendencias' | 'pasado';
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tabId)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-zentry-accent text-white shadow-md shadow-zentry-accent/20'
                  : 'text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-card'
              }`}
            >
              <IconComp className="w-4 h-4" /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* VISTA 1: PESTAÑA "TODO" O REGLA DE RESULTADOS UNIFICADOS */}
      {(activeTab === 'todo' || activeTab === 'tendencias') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-zentry-text-1 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" /> Tendencias en Zentry (X)
              </h2>
            </div>

            {filteredTrending.length === 0 ? (
              <div className="bg-zentry-card border border-zentry-border rounded-3xl p-8 text-center text-sm text-zentry-text-2">
                Todavía no hay tendencias registradas.
              </div>
            ) : (
              <div className="bg-zentry-card border border-zentry-border rounded-3xl divide-y divide-zentry-border overflow-hidden shadow-sm">
                {filteredTrending.map((item) => (
                  <div
                    key={item.rank}
                    onClick={() => handleSelectSearchTerm(item.hashtag)}
                    className="p-4 hover:bg-zentry-bg/70 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-zentry-text-2">
                        <span className="font-extrabold text-zentry-accent">#{item.rank}</span>
                        <span>•</span>
                        <span>{item.category}</span>
                        {item.isHot && (
                          <span className="bg-orange-500/20 text-orange-400 font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                            🔥 En auge
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-zentry-text-1 text-base group-hover:text-zentry-accent transition-colors flex items-center gap-1">
                        {item.hashtag}
                      </h3>

                      <p className="text-xs text-zentry-text-2">{item.postsCount}</p>
                    </div>

                    <ArrowUpRight className="w-5 h-5 text-zentry-text-2 group-hover:text-zentry-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: resultados de usuarios de la búsqueda activa */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-extrabold text-zentry-text-1 flex items-center gap-2">
              <Users className="w-5 h-5 text-zentry-accent" /> Artistas
            </h2>

            <div className="bg-zentry-card border border-zentry-border rounded-3xl p-4 space-y-4 shadow-sm">
              {usersList.length === 0 ? (
                <p className="text-xs text-zentry-text-2 text-center py-4">
                  Busca un nombre o @usuario para descubrir creadores.
                </p>
              ) : usersList.slice(0, 3).map((u) => (
                <div key={u.id} className="flex items-start justify-between gap-3 p-2 rounded-2xl hover:bg-zentry-bg transition-colors">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-zentry-accent/20 border border-zentry-accent/30 flex items-center justify-center font-extrabold text-xs text-zentry-accent shrink-0">
                      {u.avatar}
                    </div>
                    <div>
                      <Link href={`/profile/${u.username}`} className="font-bold text-xs text-zentry-text-1 hover:underline block">
                        {u.name}
                      </Link>
                      <span className="text-[11px] text-zentry-text-2">@{u.username}</span>
                      <p className="text-[10px] text-zentry-text-2 line-clamp-1 mt-0.5">{u.bio}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFollowUser(u.username)}
                    className={`p-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      u.isFollowing
                        ? 'bg-zentry-bg border border-zentry-border text-zentry-text-1 hover:text-red-400'
                        : 'bg-zentry-text-1 text-zentry-bg hover:opacity-90'
                    }`}
                  >
                    {u.isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* VISTA 2: PESTAÑA "OBRAS Y ARTE" */}
      {(activeTab === 'todo' || activeTab === 'obras') && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-zentry-text-1 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-400" /> Obras en Tendencia
            </h2>
            <span className="text-xs text-zentry-text-2">{filteredArts.length} obras encontradas</span>
          </div>

          {filteredArts.length === 0 ? (
            <div className="bg-zentry-card border border-zentry-border rounded-3xl p-8 text-center text-sm text-zentry-text-2">
              Todavía no hay publicaciones que mostrar.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredArts.map((art) => {
                const isLiked = likedArts.includes(art.id);
                return (
                  <div key={art.id} className="group bg-zentry-card border border-zentry-border rounded-3xl overflow-hidden shadow-sm hover:border-zentry-accent/60 transition-all flex flex-col justify-between">
                    <div className={`h-44 bg-gradient-to-tr ${art.color} relative p-4 flex flex-col justify-between overflow-hidden`}>
                      <div className="flex justify-between items-start z-10">
                        <span className="text-[10px] font-mono font-bold bg-black/50 backdrop-blur-md text-white px-2.5 py-1 rounded-full border border-white/10">
                          Arte Digital
                        </span>
                        <button
                          onClick={() => toggleLikeArt(art.id)}
                          className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                            isLiked ? 'bg-red-500 text-white' : 'bg-black/40 text-white hover:bg-black/60'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                        </button>
                      </div>

                      <div className="z-10">
                        <h3 className="font-extrabold text-white text-sm line-clamp-2 drop-shadow-md">{art.title}</h3>
                        <p className="text-[11px] text-white/80 font-medium">Por {art.author} ({art.handle})</p>
                      </div>
                    </div>

                    <div className="p-4 flex items-center justify-between text-xs text-zentry-text-2 bg-zentry-card border-t border-zentry-border">
                      <span className="flex items-center gap-1 font-bold text-zentry-text-1">
                        <Heart className="w-3.5 h-3.5 text-red-400" /> {art.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> {art.comments}
                      </span>
                      <span className="text-[10px] font-mono bg-zentry-bg px-2 py-0.5 rounded-lg border border-zentry-border">
                        {art.year}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* VISTA 3: PESTAÑA "ARTISTAS & USUARIOS" */}
      {activeTab === 'usuarios' && (
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-zentry-text-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-zentry-accent" /> Búsqueda de Creadores y Artistas
          </h2>

          {!hasSearched ? (
            <div className="bg-zentry-card border border-zentry-border rounded-3xl p-10 text-center text-sm text-zentry-text-2">
              Escribe un nombre o @usuario en el buscador para encontrar creadores.
            </div>
          ) : usersList.length === 0 ? (
            <div className="bg-zentry-card border border-zentry-border rounded-3xl p-10 text-center text-sm text-zentry-text-2">
              No encontramos usuarios para &quot;{searchQuery}&quot;.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {usersList.map((u) => (
                <div
                  key={u.id}
                  onClick={() => router.push(`/profile/${u.username}`)}
                  className="bg-zentry-card border border-zentry-border rounded-3xl p-5 shadow-sm hover:border-zentry-accent/50 transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-zentry-accent/20 border border-zentry-accent/30 flex items-center justify-center font-black text-sm text-zentry-accent shrink-0">
                        {u.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-sm text-zentry-text-1 group-hover:text-zentry-accent transition-colors truncate">
                          {u.name}
                        </h4>
                        <span className="text-xs text-zentry-text-2 block truncate">@{u.username}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFollowUser(u.username);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        u.isFollowing
                          ? 'bg-zentry-bg border border-zentry-border text-zentry-text-1 hover:text-red-400'
                          : 'bg-zentry-text-1 text-zentry-bg hover:opacity-90'
                      }`}
                    >
                      {u.isFollowing ? 'Siguiendo' : '+ Seguir'}
                    </button>
                  </div>

                  <p className="text-xs text-zentry-text-2 leading-relaxed line-clamp-2">
                    {u.bio || "Creador en la plataforma Zentry."}
                  </p>

                  <div className="pt-3 border-t border-zentry-border flex justify-between items-center text-xs text-zentry-text-2 font-medium">
                    <span>{u.followers.toLocaleString()} seguidores</span>
                    <span className="text-zentry-accent font-bold group-hover:underline flex items-center gap-1">
                      Ver perfil <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VISTA 4: PESTAÑA "TENDENCIAS DEL PASADO / ARCHIVO HISTÓRICO" */}
      {activeTab === 'pasado' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-zentry-text-1 flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" /> Archivo Histórico de Tendencias
              </h2>
              <p className="text-xs text-zentry-text-2 mt-0.5">Explora los hashtags que dominaron las conversaciones en años anteriores.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zentry-text-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Año:
              </span>
              {HISTORY_YEARS.map(y => (
                <button
                  key={y}
                  onClick={() => setPastYear(y)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    pastYear === y
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'bg-zentry-card border border-zentry-border text-zentry-text-2 hover:text-zentry-text-1'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {loadingPast ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-zentry-accent" /></div>
          ) : pastTrending.length === 0 ? (
            <div className="bg-zentry-card border border-zentry-border rounded-3xl p-10 text-center text-sm text-zentry-text-2">
              No hay tendencias registradas para {pastYear}.
            </div>
          ) : (
            <div className="bg-zentry-card border border-zentry-border rounded-3xl divide-y divide-zentry-border overflow-hidden shadow-sm">
              {pastTrending.map((item) => (
                <div key={item.rank} className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-zentry-text-2">
                      <span className="font-extrabold text-amber-400">#{item.rank}</span>
                      <span>•</span>
                      <span>{item.category}</span>
                    </div>
                    <h3 className="font-extrabold text-zentry-text-1 text-base">{item.hashtag}</h3>
                    <p className="text-xs text-zentry-text-2">{item.postsCount}</p>
                  </div>
                  <span className="text-xs font-mono bg-zentry-bg px-2.5 py-1 rounded-lg border border-zentry-border text-zentry-text-2">{item.year}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
