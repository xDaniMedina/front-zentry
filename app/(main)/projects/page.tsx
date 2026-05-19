"use client"
import { useState } from "react";
import { LayoutGrid, Plus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CreateProjectModal } from "@/components/projects/create-project-modal";

export default function ProjectsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    const projects = [
    { id: 1, title: "Cyber Art Collection", status: "En progreso", color: "text-violet-400" },
    { id: 2, title: "Zentry UI Kit", status: "Completado", color: "text-emerald-400" },
    { id: 3, title: "Community Dashboard", status: "Revisión", color: "text-orange-400" },
  ];
  const handleNewProject = () => {
    toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
      loading: 'Preparando entorno de proyecto...',
      success: 'Entorno listo (Simulación de redirección)',
      error: 'Error al crear',
    });
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <LayoutGrid className="text-violet-400" /> Proyectos
        </h1>
        <Button 
    onClick={handleNewProject}
    className="bg-violet-600 hover:bg-violet-500"
  >
    <Plus className="w-4 h-4 mr-2" /> Nuevo Proyecto
  </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-violet-500/50 transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-500 font-bold">Z{p.id}</div>
              <Button variant="ghost" size="icon" className="text-zinc-500"><MoreVertical className="w-4 h-4" /></Button>
            </div>
            <h3 className="text-white font-bold text-lg mb-1 group-hover:text-violet-400">{p.title}</h3>
            <div className="flex items-center gap-2 mt-4">
              <div className={`w-2 h-2 rounded-full bg-current ${p.color}`} />
              <span className="text-zinc-400 text-xs">{p.status}</span>
            </div>
          </div>
        ))}
      </div>
      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onProjectCreated={() => console.log("Refrescar lista de la API...")}
      />
    </div>
  );
}