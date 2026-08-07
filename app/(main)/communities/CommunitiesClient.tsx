"use client"

import { useState } from "react";
import Link from "next/link";
import { Users, Globe, Plus, X } from "lucide-react";

export type Community = {
  id: string; slug: string; name: string; members: number; description: string; isJoined: boolean;
}

const FALLBACK_COMMUNITIES: Community[] = [
  { id: '1', slug: 'ui-ux-designers', name: 'UI/UX Designers', members: 12500, description: 'Feedback y recursos sobre diseño.', isJoined: true },
  { id: '2', slug: 'digital-art', name: 'Digital Art Masters', members: 8400, description: 'Comparte tus ilustraciones.', isJoined: true },
  { id: '3', slug: 'nextjs-devs', name: 'Next.js Devs', members: 5200, description: 'Desarrollo frontend, dudas y tutoriales.', isJoined: false },
];

export default function CommunitiesClient({ initialData }: { initialData: Community[] | null }) {
  const [communities, setCommunities] = useState<Community[]>(initialData || FALLBACK_COMMUNITIES);
  const [activeTab, setActiveTab] = useState<'joined' | 'discover'>('joined');
  
  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCommName, setNewCommName] = useState("");
  const [newCommDesc, setNewCommDesc] = useState("");

  const filteredCommunities = communities.filter(c => activeTab === 'joined' ? c.isJoined : !c.isJoined);

  const handleCreateCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim()) return;

    const newCommunity: Community = {
      id: Date.now().toString(),
      slug: newCommName.toLowerCase().replace(/\s+/g, '-'),
      name: newCommName,
      members: 1, // Tú eres el primer miembro
      description: newCommDesc,
      isJoined: true // Te unes automáticamente
    };

    setCommunities([newCommunity, ...communities]);
    setIsModalOpen(false);
    setNewCommName("");
    setNewCommDesc("");
    setActiveTab('joined'); // Cambiamos a la pestaña para que la veas inmediatamente
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-24 relative">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zentry-text-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zentry-bg border border-zentry-border flex items-center justify-center">
              <Users className="w-5 h-5 text-zentry-text-1" />
            </div>
            Comunidades
          </h1>
          <p className="text-sm text-zentry-text-2 mt-2">Encuentra tu tribu y comparte tu conocimiento.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-zentry-text-1 text-zentry-bg font-semibold px-5 py-3 rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Crear Comunidad
        </button>
      </div>

      {/* Pestañas */}
      <div className="flex gap-4 border-b border-zentry-border mb-6">
        <button 
          onClick={() => setActiveTab('joined')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'joined' ? 'text-zentry-text-1' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
        >
          Mis Comunidades
          {activeTab === 'joined' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zentry-text-1 rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('discover')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'discover' ? 'text-zentry-text-1' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
        >
          Descubrir
          {activeTab === 'discover' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zentry-text-1 rounded-t-full" />}
        </button>
      </div>

      {/* Grid de Comunidades */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredCommunities.map(community => (
          <div key={community.id} className="bg-zentry-card border border-zentry-border rounded-3xl p-5 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-zentry-bg border border-zentry-border flex items-center justify-center">
                <Globe className="w-6 h-6 text-zentry-text-1" />
              </div>
              {!community.isJoined && (
                <button 
                  onClick={() => setCommunities(communities.map(c => c.id === community.id ? { ...c, isJoined: true, members: c.members + 1 } : c))}
                  className="text-xs font-bold bg-zentry-bg border border-zentry-border text-zentry-text-1 px-3 py-1.5 rounded-full hover:bg-zentry-text-1 hover:text-zentry-bg transition-colors"
                >
                  Unirse
                </button>
              )}
            </div>
            <Link href={`/communities/${community.slug}`} className="hover:underline">
              <h3 className="font-bold text-zentry-text-1 text-lg">{community.name}</h3>
            </Link>
            <p className="text-sm text-zentry-text-2 mt-1 mb-4 line-clamp-2">{community.description}</p>
            <div className="mt-auto flex items-center gap-2 text-xs font-medium text-zentry-text-2">
              <Users className="w-4 h-4" />
              {community.members.toLocaleString()} miembros
            </div>
          </div>
        ))}
      </div>

      {/* MODAL PARA CREAR COMUNIDAD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zentry-border flex justify-between items-center">
              <h3 className="text-xl font-bold text-zentry-text-1">Nueva Comunidad</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zentry-text-2 hover:text-zentry-text-1 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateCommunity} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-zentry-text-2 mb-1">Nombre de la Comunidad</label>
                <input 
                  type="text" 
                  required
                  value={newCommName}
                  onChange={(e) => setNewCommName(e.target.value)}
                  placeholder="Ej. Artistas de Puebla"
                  className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zentry-text-2 mb-1">Descripción</label>
                <textarea 
                  required
                  value={newCommDesc}
                  onChange={(e) => setNewCommDesc(e.target.value)}
                  placeholder="¿De qué trata este espacio?"
                  className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors resize-none h-24"
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-semibold text-zentry-text-1 bg-zentry-bg border border-zentry-border rounded-xl hover:bg-zentry-border transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-3 font-semibold text-zentry-bg bg-zentry-text-1 rounded-xl hover:opacity-90 transition-opacity">
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
