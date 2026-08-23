"use client"

import { useState, useEffect } from "react";
import { 
  Search, Flame, TrendingUp, Users, Image as ImageIcon, 
  History, Sparkles, X, Heart, MessageSquare, ArrowUpRight, 
  UserPlus, UserCheck, ShieldCheck, Filter, Clock, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type TrendingItem = {
  rank: number;
  hashtag: string;
  category: string;
  postsCount: string;
  isHot?: boolean;
};

type UserResult = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  followers: number;
  isFollowing?: boolean;
};

type ArtResult = {
  id: string;
  title: string;
  author: string;
  handle: string;
  category: string;
  likes: number;
  comments: number;
  imageUrl?: string;
  color: string;
  year: number;
};

type PastTrend = {
  year: number;
  title: string;
  description: string;
  topArtCount: string;
  icon: string;
};

const POPULAR_SEARCHES = [
  "Cyberpunk Art 3D",
  "UI/UX Design Systems",
  "Midjourney Prompts",
  "Ilustración Anime",
  "Sintetizador Lo-Fi",
  "Next.js 16 Turbo"
];

const DEFAULT_TRENDING: TrendingItem[] = [
  { rank: 1, hashtag: "#Cyberpunk2099", category: "Arte 3D & VFX", postsCount: "24.5k publicaciones", isHot: true },
  { rank: 2, hashtag: "#UIUXZentry", category: "Diseño de Interfaces", postsCount: "18.2k publicaciones", isHot: true },
  { rank: 3, hashtag: "#GenerativeAI", category: "Tecnología & Prompts", postsCount: "14.9k publicaciones" },
  { rank: 4, hashtag: "#BlenderCommunity", category: "Modelado 3D", postsCount: "11.3k publicaciones" },
  { rank: 5, hashtag: "#LoFiBeats", category: "Música & Audio", postsCount: "9.8k publicaciones" },
  { rank: 6, hashtag: "#Tailwindv4", category: "Desarrollo Web", postsCount: "7.1k publicaciones" },
];

const DEFAULT_USERS: UserResult[] = [
  { id: '1', name: 'Luna Muse', username: 'lunamuse', avatar: 'LM', bio: 'Concept Artist & Ilustradora Digital en Zentry. Apasionada por los entornos nocturnos.', followers: 12400, isFollowing: false },
  { id: '2', name: 'Carlos Dev', username: 'carlos_dev', avatar: 'CD', bio: 'Desarrollador Full Stack & Diseñador 3D. Creando sistemas interactivos.', followers: 8900, isFollowing: true },
  { id: '3', name: 'Elena UI', username: 'elena_ui', avatar: 'EU', bio: 'Lead Product Designer. Especialista en Design Systems y Accesibilidad Web.', followers: 15300, isFollowing: false },
];

const DEFAULT_ARTS: ArtResult[] = [
  { id: '101', title: 'Neón en la Ciudad Nocturna 2099', author: 'Luna Muse', handle: '@lunamuse', category: 'Arte Digital', likes: 1420, comments: 89, color: 'from-purple-600/30 to-pink-600/30', year: 2026 },
  { id: '102', title: 'Sistema de Componentes Zentry v2', author: 'Elena UI', handle: '@elena_ui', category: 'UI/UX', likes: 980, comments: 45, color: 'from-blue-600/30 to-cyan-600/30', year: 2026 },
  { id: '103', title: 'Texturas Procedurales en Substance Painter', author: 'Carlos Dev', handle: '@carlos_dev', category: 'Modelado 3D', likes: 670, comments: 23, color: 'from-emerald-600/30 to-teal-600/30', year: 2025 },
  { id: '104', title: 'Concept Art - Ruinas del Templo Olvidado', author: 'Zentry Studio', handle: '@zentry', category: 'Ilustración', likes: 2150, comments: 134, color: 'from-amber-600/30 to-orange-600/30', year: 2024 },
];

const PAST_TRENDS: PastTrend[] = [
  { year: 2025, title: 'La Era del Neumorfismo & Arte GenAI', description: 'Revolución en la generación multimodal y estética espacial oscura con contrastes vibrantes.', topArtCount: '150k obras', icon: '⚡' },
  { year: 2024, title: 'Nacimiento del Estudio Zentry', description: 'Primeros lienzos colaborativos en tiempo real y auge del Pixel Art vectorizado.', topArtCount: '98k obras', icon: '🎨' },
  { year: 2023, title: 'Orígenes y Primeros Creadores', description: 'Fase Beta de la comunidad con foco en ilustración digital y comunidades cerradas.', topArtCount: '45k obras', icon: '🏛️' },
];

export type InitialTrendingData = {
  list?: TrendingItem[];
};

export default function ExploreClient({ initialTrending }: { initialTrending?: InitialTrendingData | null }) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'todo' | 'obras' | 'usuarios' | 'tendencias' | 'pasado'>('todo');
  const [pastYearFilter, setPastYearFilter] = useState<number | 'all'>('all');

  const [trendingList, setTrendingList] = useState<TrendingItem[]>(initialTrending?.list || DEFAULT_TRENDING);
  const [usersList, setUsersList] = useState<UserResult[]>(DEFAULT_USERS);
  const [artsList, setArtsList] = useState<ArtResult[]>(DEFAULT_ARTS);
  const [likedArts, setLikedArts] = useState<string[]>([]);

  // Cargar publicaciones y usuarios dinámicos en tiempo real
  useEffect(() => {
    async function loadDynamicExplore() {
      try {
        const postsRes = await fetch('/api/posts');
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          if (postsData.success && Array.isArray(postsData.data)) {
            const mappedArts: ArtResult[] = postsData.data.map((p: any) => ({
              id: String(p.id),
              title: p.title,
              author: p.author,
              handle: p.handle,
              category: p.tags && p.tags.length > 0 ? p.tags[0].replace('#', '') : 'Arte Digital',
              likes: p.likes || 0,
              comments: p.comments || 0,
              imageUrl: p.media_url,
              color: 'from-purple-600/30 to-indigo-600/30',
              year: 2026
            }));
            setArtsList(mappedArts);
          }
        }
      } catch {}
    }

    loadDynamicExplore();
  }, []);

  // Búsqueda en el backend si existe el endpoint /api/core/search
  useEffect(() => {
    if (!searchQuery.trim()) return;

    const timer = setTimeout(async () => {
      try {
        const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, "");
        const response = await fetch(`${apiBase}/api/core/search?query=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.users) setUsersList(data.users);
          if (data.arts) setArtsList(data.arts);
        }
      } catch (err) {
        // Fallback local silencioso
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleFollowUser = (userId: string, username: string) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextState = !u.isFollowing;
        toast.success(nextState ? `Ahora sigues a @${username}` : `Has dejado de seguir a @${username}`);
        return {
          ...u,
          isFollowing: nextState,
          followers: nextState ? u.followers + 1 : u.followers - 1
        };
      }
      return u;
    }));
  };

  const toggleLikeArt = (artId: string) => {
    setLikedArts(prev => {
      const isLiked = prev.includes(artId);
      toast.success(isLiked ? "Obra removida de tus me gusta" : "¡Te ha gustado esta obra!");
      return isLiked ? prev.filter(id => id !== artId) : [...prev, artId];
    });
  };

  const handleSelectSearchTerm = (term: string) => {
    setSearchQuery(term);
    setActiveTab('todo');
  };

  // Filtrado de Resultados Locales con Manejo Seguro de Nulos
  const queryLower = (searchQuery || "").toLowerCase();

  const filteredUsers = usersList.filter(u => 
    (u.name || "").toLowerCase().includes(queryLower) || 
    (u.username || "").toLowerCase().includes(queryLower) ||
    (u.bio || "").toLowerCase().includes(queryLower)
  );

  const filteredArts = artsList.filter(a => {
    const matchesSearch = (a.title || "").toLowerCase().includes(queryLower) ||
                          (a.author || "").toLowerCase().includes(queryLower) ||
                          (a.category || "").toLowerCase().includes(queryLower);
    const matchesYear = pastYearFilter === 'all' || a.year === pastYearFilter;
    return matchesSearch && matchesYear;
  });

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

        {/* Chips de "Lo Más Buscado" */}
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
          
          {/* Columna Tendencias Estilo X/Twitter (2 Tercios o Completo) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-zentry-text-1 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" /> Tendencias en Zentry (X)
              </h2>
              <span className="text-xs text-zentry-text-2 font-mono">Actualizado en tiempo real</span>
            </div>

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
          </div>

          {/* Sidebar Lateral de Artistas Sugeridos */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-extrabold text-zentry-text-1 flex items-center gap-2">
              <Users className="w-5 h-5 text-zentry-accent" /> Artistas Destacados
            </h2>

            <div className="bg-zentry-card border border-zentry-border rounded-3xl p-4 space-y-4 shadow-sm">
              {usersList.slice(0, 3).map((u, idx) => (
                <div key={u.id || u.username || `user-top-${idx}`} className="flex items-start justify-between gap-3 p-2 rounded-2xl hover:bg-zentry-bg transition-colors">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-zentry-accent/20 border border-zentry-accent/30 flex items-center justify-center font-extrabold text-xs text-zentry-accent shrink-0">
                      {u.avatar || "U"}
                    </div>
                    <div>
                      <Link href={`/profile/${u.username || 'user'}`} className="font-bold text-xs text-zentry-text-1 hover:underline block">
                        {u.name || "Usuario"}
                      </Link>
                      <span className="text-[11px] text-zentry-text-2">@{u.username || "usuario"}</span>
                      <p className="text-[10px] text-zentry-text-2 line-clamp-1 mt-0.5">{u.bio || ""}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => toggleFollowUser(u.id, u.username)}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredArts.map((art, idx) => {
              const isLiked = likedArts.includes(art.id);
              return (
                <div key={art.id || `art-${idx}`} className="group bg-zentry-card border border-zentry-border rounded-3xl overflow-hidden shadow-sm hover:border-zentry-accent/60 transition-all flex flex-col justify-between">
                  {/* Aspect Thumbnail Gradient/Image */}
                  <div className={`h-44 bg-gradient-to-tr ${art.color || 'from-purple-600/30 to-pink-600/30'} relative p-4 flex flex-col justify-between overflow-hidden`}>
                    <div className="flex justify-between items-start z-10">
                      <span className="text-[10px] font-mono font-bold bg-black/50 backdrop-blur-md text-white px-2.5 py-1 rounded-full border border-white/10">
                        {art.category || "Arte"}
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
                      <h3 className="font-extrabold text-white text-sm line-clamp-2 drop-shadow-md">{art.title || "Obra sin título"}</h3>
                      <p className="text-[11px] text-white/80 font-medium">Por {art.author || "Anónimo"} ({art.handle || "@anon"})</p>
                    </div>
                  </div>

                  {/* Footer Stats */}
                  <div className="p-4 flex items-center justify-between text-xs text-zentry-text-2 bg-zentry-card border-t border-zentry-border">
                    <span className="flex items-center gap-1 font-bold text-zentry-text-1">
                      <Heart className="w-3.5 h-3.5 text-red-400" /> {(art.likes || 0) + (isLiked ? 1 : 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" /> {art.comments || 0}
                    </span>
                    <span className="text-[10px] font-mono bg-zentry-bg px-2 py-0.5 rounded-lg border border-zentry-border">
                      {art.year || 2026}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* VISTA 3: PESTAÑA "ARTISTAS & USUARIOS" */}
      {activeTab === 'usuarios' && (
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-zentry-text-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-zentry-accent" /> Búsqueda de Creadores y Artistas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredUsers.map((u, idx) => (
              <div 
                key={u.id || u.username || `user-card-${idx}`} 
                onClick={() => router.push(`/profile/${u.username || 'user'}`)}
                className="bg-zentry-card border border-zentry-border rounded-3xl p-5 shadow-sm hover:border-zentry-accent/50 transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-zentry-accent/20 border border-zentry-accent/30 flex items-center justify-center font-black text-sm text-zentry-accent shrink-0">
                      {u.avatar || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-sm text-zentry-text-1 group-hover:text-zentry-accent transition-colors truncate">
                        {u.name || "Usuario"}
                      </h4>
                      <span className="text-xs text-zentry-text-2 block truncate">@{u.username || "usuario"}</span>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFollowUser(u.id, u.username);
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
                  <span>{(u.followers || 0).toLocaleString()} seguidores</span>
                  <span className="text-zentry-accent font-bold group-hover:underline flex items-center gap-1">
                    Ver perfil <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
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
              <p className="text-xs text-zentry-text-2 mt-0.5">Explora lo que dominó las conversaciones y el arte en años anteriores.</p>
            </div>

            {/* Filtros por Año */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zentry-text-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Año:
              </span>
              {(['all', 2026, 2025, 2024] as const).map(y => (
                <button
                  key={y}
                  onClick={() => setPastYearFilter(y)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    pastYearFilter === y 
                      ? 'bg-amber-500 text-black shadow-sm' 
                      : 'bg-zentry-card border border-zentry-border text-zentry-text-2 hover:text-zentry-text-1'
                  }`}
                >
                  {y === 'all' ? 'Todos' : y}
                </button>
              ))}
            </div>
          </div>

          {/* Tarjetas del Archivo Histórico */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PAST_TRENDS.map((past, i) => (
              <div key={i} className="bg-zentry-card border border-zentry-border rounded-3xl p-6 space-y-3 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="text-2xl">{past.icon}</span>
                  <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full">
                    {past.year}
                  </span>
                </div>

                <h3 className="font-extrabold text-zentry-text-1 text-base">{past.title}</h3>
                <p className="text-xs text-zentry-text-2 leading-relaxed">{past.description}</p>

                <div className="pt-3 border-t border-zentry-border flex justify-between items-center text-xs text-zentry-text-2">
                  <span>Volumen registrado:</span>
                  <span className="font-bold text-zentry-text-1">{past.topArtCount}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Malla de Obras Filtradas por Año Past */}
          <div className="pt-4 space-y-4">
            <h3 className="text-sm font-extrabold text-zentry-text-1">Obras Registradas en el Archivo</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredArts.map(art => (
                <div key={art.id} className="bg-zentry-card border border-zentry-border rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-xs text-zentry-text-1">{art.title}</h4>
                    <p className="text-[10px] text-zentry-text-2">Por {art.author} • {art.year}</p>
                  </div>
                  <span className="text-xs font-mono text-amber-400 font-bold">{art.likes} ❤</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
