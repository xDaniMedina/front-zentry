import { Users, Search, Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CommunitiesPage() {
  const MOCK_COMMUNITIES = [
    { 
      id: 1, 
      name: "ChettoLandia Builders", 
      members: 12, 
      role: "Admin", 
      color: "from-emerald-500 to-emerald-700",
      tags: ["Minecraft", "VoxelArt", "Servidores"] 
    },
    { 
      id: 2, 
      name: "Blue Lock FC Tacticians", 
      members: 45, 
      role: "Admin", 
      color: "from-blue-500 to-blue-700",
      tags: ["Sports", "Data", "Excel"] 
    },
    { 
      id: 3, 
      name: "Next.js Masters", 
      members: 892, 
      role: "Miembro", 
      color: "from-zinc-600 to-zinc-800",
      tags: ["React", "Frontend", "UI/UX"] 
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      {/* Cabecera y Buscador */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-violet-500" /> Comunidades
          </h1>
          <p className="text-zinc-400 mt-1">Encuentra tu tribu y colabora en nuevos proyectos.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              placeholder="Buscar comunidades..." 
              className="pl-9 bg-zinc-900 border-zinc-800 text-white focus:border-violet-500"
            />
          </div>
          <Button className="bg-violet-600 hover:bg-violet-500 text-white shrink-0">
            <Plus className="w-4 h-4 mr-2" /> Crear
          </Button>
        </div>
      </div>

      {/* Grid de Comunidades */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_COMMUNITIES.map((community) => (
          <div key={community.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors group cursor-pointer">
            {/* Banner de la comunidad */}
            <div className={`h-24 bg-gradient-to-r ${community.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
            
            <div className="p-5 relative">
              {/* Avatar Flotante */}
              <div className="absolute -top-10 left-5 w-16 h-16 bg-zinc-950 border-4 border-zinc-900 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-zinc-400" />
              </div>

              {/* Badge de Rol */}
              <div className="flex justify-end mb-2">
                {community.role === "Admin" ? (
                  <span className="inline-flex items-center gap-1 bg-violet-500/10 text-violet-400 text-xs font-medium px-2.5 py-1 rounded-full border border-violet-500/20">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-zinc-800 text-zinc-300 text-xs font-medium px-2.5 py-1 rounded-full border border-zinc-700">
                    Miembro
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-white mt-2 group-hover:text-violet-400 transition-colors">
                {community.name}
              </h3>
              <p className="text-zinc-500 text-sm mt-1 mb-4">
                {community.members} miembros activos
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {community.tags.map(tag => (
                  <span key={tag} className="text-xs font-medium text-zinc-400 bg-zinc-950 px-2 py-1 rounded-md border border-zinc-800">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}