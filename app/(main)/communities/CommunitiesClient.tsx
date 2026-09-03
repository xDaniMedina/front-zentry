"use client"

import { useState } from "react";
import Link from "next/link";
import { Users, Globe, Plus, X, Edit3, Trash2, Loader2, UserCheck, ShieldCheck, Search, Flame, Sparkles, Lock, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createCommunityAction, updateCommunityAction, deleteCommunityAction, joinCommunityAction, leaveCommunityAction } from "@/lib/actions/communities";

export type CommunitySummary = {
  id: string;
  slug: string;
  name: string;
  members: number;
  description: string;
  isJoined: boolean;
  ownerUsername?: string;
  ownerId?: string;
  isAdmin?: boolean;
  category?: string;
  postsPerDay?: number;
  bannerGradient?: string;
}

const FALLBACK_COMMUNITIES: CommunitySummary[] = [
  { 
    id: '1', 
    slug: 'ui-ux-designers', 
    name: 'UI/UX Designers Hub', 
    members: 12500, 
    description: 'Comunidad dedicada a feedback de interfaces, diseño de experiencia de usuario y recursos de Figma.', 
    isJoined: true, 
    ownerUsername: 'admin',
    category: 'Diseño',
    postsPerDay: 24,
    bannerGradient: 'from-purple-600/30 via-indigo-600/20 to-blue-600/30'
  },
  { 
    id: '2', 
    slug: 'digital-art', 
    name: 'Digital Art Masters', 
    members: 8400, 
    description: 'Espacio para ilustradores digitales, arte 3D y concept art. Comparte tu portafolio y recibe críticas constructivas.', 
    isJoined: true, 
    ownerUsername: 'artist',
    category: 'Arte Digital',
    postsPerDay: 18,
    bannerGradient: 'from-pink-600/30 via-purple-600/20 to-rose-600/30'
  },
  { 
    id: '3', 
    slug: 'nextjs-devs', 
    name: 'Next.js & React Devs', 
    members: 5200, 
    description: 'Desarrollo web moderno con Next.js App Router, Tailwind CSS, TypeScript y arquitectura frontend.', 
    isJoined: false, 
    ownerUsername: 'dev',
    category: 'Programación',
    postsPerDay: 12,
    bannerGradient: 'from-cyan-600/30 via-blue-600/20 to-teal-600/30'
  },
];

export default function CommunitiesClient({ initialData }: { initialData: CommunitySummary[] | null }) {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<CommunitySummary[]>(
    initialData && initialData.length > 0 ? initialData : FALLBACK_COMMUNITIES
  );
  const [activeTab, setActiveTab] = useState<'joined' | 'discover'>('joined');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");

  // Estados para Modal de Crear / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<CommunitySummary | null>(null);
  const [commName, setCommName] = useState("");
  const [commDesc, setCommDesc] = useState("");
  const [commCategory, setCommCategory] = useState("Arte Digital");
  const [isLoading, setIsLoading] = useState(false);

  const categories = ["Todas", "Arte Digital", "Diseño", "Programación", "Música", "Escritura"];

  const filteredCommunities = communities.filter(c => {
    if (!c) return false;
    const matchesTab = activeTab === 'joined' ? c.isJoined : !c.isJoined;
    const q = (searchQuery || "").toLowerCase();
    const name = (c.name || "").toLowerCase();
    const desc = (c.description || "").toLowerCase();
    const slug = (c.slug || "").toLowerCase();
    const matchesSearch = !q || name.includes(q) || desc.includes(q) || slug.includes(q);
    const matchesCategory = selectedCategory === "Todas" || c.category === selectedCategory;
    return matchesTab && matchesSearch && matchesCategory;
  });

  const handleOpenCreateModal = () => {
    setEditingCommunity(null);
    setCommName("");
    setCommDesc("");
    setCommCategory("Arte Digital");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (community: CommunitySummary) => {
    setEditingCommunity(community);
    setCommName(community.name);
    setCommDesc(community.description);
    setCommCategory(community.category || "Arte Digital");
    setIsModalOpen(true);
  };

  const handleSubmitCommunitySummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commName.trim()) return;

    setIsLoading(true);

    const slug = commName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const payload = {
      name: commName,
      description: commDesc,
      slug: slug,
      category: commCategory
    };

    try {
      if (editingCommunity) {
        const res = await updateCommunityAction(editingCommunity.id, payload);

        if (res.success && res.data) {
          const updated = res.data;
          setCommunities(prev => prev.map(c => c.id === editingCommunity.id ? { ...c, ...updated } : c));
        } else {
          setCommunities(prev => prev.map(c => c.id === editingCommunity.id ? { ...c, name: commName, description: commDesc, slug, category: commCategory } : c));
        }
      } else {
        const res = await createCommunityAction(payload);

        if (res.success && res.data) {
          const created = res.data;
          setCommunities(prev => [created, ...prev]);
        } else {
          const newComm: CommunitySummary = {
            id: Date.now().toString(),
            slug,
            name: commName,
            members: 1,
            description: commDesc,
            isJoined: true,
            ownerUsername: user?.username || 'admin',
            isAdmin: true,
            category: commCategory,
            postsPerDay: 1,
            bannerGradient: 'from-purple-600/30 to-blue-600/30'
          };
          setCommunities(prev => [newComm, ...prev]);
        }
        setActiveTab('joined');
      }

      setIsModalOpen(false);
      setCommName("");
      setCommDesc("");
    } catch (err) {
      console.error("Error al guardar comunidad en backend:", err);
      if (editingCommunity) {
        setCommunities(prev => prev.map(c => c.id === editingCommunity.id ? { ...c, name: commName, description: commDesc, slug, category: commCategory } : c));
      } else {
        const newComm: CommunitySummary = {
          id: Date.now().toString(),
          slug,
          name: commName,
          members: 1,
          description: commDesc,
          isJoined: true,
          ownerUsername: user?.username || 'admin',
          isAdmin: true,
          category: commCategory,
          postsPerDay: 1,
          bannerGradient: 'from-purple-600/30 to-blue-600/30'
        };
        setCommunities(prev => [newComm, ...prev]);
        setActiveTab('joined');
      }
      setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCommunitySummary = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta comunidad?")) return;

    try {
      await deleteCommunityAction(id);
    } catch (err) {
      console.error("Error al eliminar comunidad en backend:", err);
    }

    setCommunities(prev => prev.filter(c => c.id !== id));
  };

  const handleToggleJoin = async (community: CommunitySummary) => {
    const newJoined = !community.isJoined;

    setCommunities(prev => prev.map(c => c.id === community.id ? {
      ...c,
      isJoined: newJoined,
      members: newJoined ? c.members + 1 : Math.max(0, c.members - 1)
    } : c));

    try {
      await (newJoined ? joinCommunityAction(community.id) : leaveCommunityAction(community.id));
    } catch (err) {
      console.error("Error al cambiar estado de membresía en backend:", err);
    }
  };

  const isCommunitySummaryAdmin = (community: CommunitySummary) => {
    if (!user) return false;
    if (community.isAdmin) return true;
    if (community.ownerUsername && user.username) {
      return community.ownerUsername.toLowerCase() === user.username.toLowerCase();
    }
    if (community.ownerId && user.id) {
      return community.ownerId.toString() === user.id.toString();
    }
    return false;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-24 relative">
      
      {/* Banner Principal de Comunidades Estilo Facebook Group / Subreddit */}
      <div className="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-r from-purple-900/40 via-zentry-card to-blue-900/40 border border-zentry-border p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zentry-accent/20 text-zentry-accent text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Comunidades & Grupos
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-zentry-text-1 tracking-tight">
              Encuentra tu tribu en Zentry
            </h1>
            <p className="text-sm sm:text-base text-zentry-text-2 mt-2 max-w-xl leading-relaxed">
              Únete a comunidades de arte, diseño y desarrollo. Comparte proyectos, recibe retroalimentación y colabora con creadores de todo el mundo.
            </p>
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="bg-zentry-text-1 text-zentry-bg font-bold px-6 py-3.5 rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shrink-0"
          >
            <Plus className="w-5 h-5" /> Crear Comunidad
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros Estilo Reddit */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        
        {/* Pestañas de Navegación */}
        <div className="flex gap-2 bg-zentry-card p-1.5 rounded-2xl border border-zentry-border shrink-0">
          <button 
            onClick={() => setActiveTab('joined')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'joined' ? 'bg-zentry-bg text-zentry-text-1 shadow-sm' : 'text-zentry-text-2 hover:text-zentry-text-1'
            }`}
          >
            Mis Grupos ({communities.filter(c => c.isJoined).length})
          </button>
          <button 
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'discover' ? 'bg-zentry-bg text-zentry-text-1 shadow-sm' : 'text-zentry-text-2 hover:text-zentry-text-1'
            }`}
          >
            Descubrir ({communities.filter(c => !c.isJoined).length})
          </button>
        </div>

        {/* Input de Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zentry-text-2 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, tema o r/comunidad..."
            className="w-full bg-zentry-card border border-zentry-border rounded-2xl pl-11 pr-4 py-2.5 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors placeholder:text-zentry-text-2/70"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zentry-text-2 hover:text-zentry-text-1 p-1">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chips de Categorías */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 custom-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-zentry-accent text-white shadow-md'
                : 'bg-zentry-card border border-zentry-border text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de Tarjetas Estilo Reddit Subreddit / Facebook Group */}
      {filteredCommunities.length === 0 ? (
        <div className="text-center py-16 bg-zentry-card border border-zentry-border border-dashed rounded-3xl p-6">
          <Globe className="w-12 h-12 text-zentry-text-2 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-zentry-text-1">No se encontraron comunidades</h3>
          <p className="text-sm text-zentry-text-2 mt-1 mb-4">
            {searchQuery ? `No hay resultados para "${searchQuery}"` : (activeTab === 'joined' ? 'Aún no te has unido a ningún grupo.' : 'Explora o crea una nueva comunidad.')}
          </p>
          {activeTab === 'joined' ? (
            <button onClick={() => setActiveTab('discover')} className="px-5 py-2.5 bg-zentry-bg border border-zentry-border text-zentry-text-1 rounded-xl text-sm font-bold hover:bg-zentry-card">
              Explorar Comunidades
            </button>
          ) : (
            <button onClick={handleOpenCreateModal} className="px-5 py-2.5 bg-zentry-text-1 text-zentry-bg rounded-xl text-sm font-bold hover:opacity-90">
              Crear una Comunidad
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCommunities.map(community => {
            const isAdmin = isCommunitySummaryAdmin(community);
            const bannerGradient = community.bannerGradient || 'from-purple-600/30 to-blue-600/30';
            
            return (
              <div 
                key={community.id} 
                className="bg-zentry-card border border-zentry-border rounded-3xl overflow-hidden flex flex-col hover:border-zentry-text-2/40 transition-all duration-300 shadow-sm group"
              >
                {/* Cabecera Gradient / Cover */}
                <div className={`h-24 bg-gradient-to-r ${bannerGradient} relative p-4 flex items-start justify-between border-b border-zentry-border/50`}>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-black/40 text-white backdrop-blur-md">
                    c/{community.slug}
                  </span>

                  {/* Botones de Administración */}
                  {isAdmin && (
                    <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md rounded-xl p-1">
                      <button 
                        onClick={() => handleOpenEditModal(community)} 
                        className="p-1 text-white/80 hover:text-white transition-colors"
                        title="Editar comunidad"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCommunitySummary(community.id)} 
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title="Eliminar comunidad"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Avatar e Info Principal */}
                <div className="px-5 pt-0 relative flex-1 flex flex-col">
                  <div className="flex justify-between items-end -mt-8 mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-zentry-bg border-4 border-zentry-card flex items-center justify-center shadow-md font-extrabold text-zentry-accent text-xl">
                      {community.name.substring(0, 2).toUpperCase()}
                    </div>

                    <button 
                      onClick={() => handleToggleJoin(community)}
                      className={`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                        community.isJoined 
                          ? 'bg-zentry-bg border border-zentry-border text-zentry-text-2 hover:text-red-400 hover:border-red-400/50' 
                          : 'bg-zentry-text-1 text-zentry-bg hover:opacity-90 shadow-sm'
                      }`}
                    >
                      {community.isJoined ? <><UserCheck className="w-3.5 h-3.5" /> Unido</> : '+ Unirse'}
                    </button>
                  </div>

                  <Link href={`/communities/${community.slug}`} className="group-hover:underline">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-zentry-text-1 text-base leading-snug">{community.name}</h3>
                      {isAdmin && (
                        <span className="text-[10px] bg-zentry-accent/20 text-zentry-accent px-1.5 py-0.5 rounded font-bold shrink-0">
                          Admin
                        </span>
                      )}
                    </div>
                  </Link>

                  <p className="text-xs text-zentry-text-2 mt-2 mb-4 line-clamp-2 leading-relaxed">
                    {community.description}
                  </p>

                  {/* Footer Stats Estilo Reddit */}
                  <div className="mt-auto pt-3 border-t border-zentry-border/60 flex items-center justify-between text-xs text-zentry-text-2 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {community.members.toLocaleString()} miembros
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-orange-400">
                      <Flame className="w-3.5 h-3.5" /> {community.postsPerDay || 10} posts/día
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL PARA CREAR / EDITAR COMUNIDAD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zentry-border flex justify-between items-center bg-zentry-bg">
              <h3 className="text-xl font-bold text-zentry-text-1">
                {editingCommunity ? 'Editar Comunidad' : 'Nueva Comunidad'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zentry-text-2 hover:text-zentry-text-1 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitCommunitySummary} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-zentry-text-2 mb-1.5 uppercase tracking-wider">Nombre de la Comunidad</label>
                <input 
                  type="text" 
                  required
                  value={commName}
                  onChange={(e) => setCommName(e.target.value)}
                  placeholder="Ej. Ilustración Digital & Concept Art"
                  className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zentry-text-2 mb-1.5 uppercase tracking-wider">Categoría</label>
                <select
                  value={commCategory}
                  onChange={(e) => setCommCategory(e.target.value)}
                  className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors"
                >
                  <option value="Arte Digital">Arte Digital</option>
                  <option value="Diseño">Diseño UI/UX</option>
                  <option value="Programación">Programación & Tech</option>
                  <option value="Música">Música & Audio</option>
                  <option value="Escritura">Escritura & Literatura</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-zentry-text-2 mb-1.5 uppercase tracking-wider">Descripción</label>
                <textarea 
                  required
                  value={commDesc}
                  onChange={(e) => setCommDesc(e.target.value)}
                  placeholder="¿De qué trata este espacio y cuáles son las reglas principales?"
                  className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors resize-none h-24"
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  disabled={isLoading}
                  className="flex-1 py-3 font-semibold text-zentry-text-1 bg-zentry-bg border border-zentry-border rounded-xl hover:bg-zentry-border transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 py-3 font-semibold text-zentry-bg bg-zentry-text-1 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : (editingCommunity ? 'Guardar Cambios' : 'Crear Comunidad')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


