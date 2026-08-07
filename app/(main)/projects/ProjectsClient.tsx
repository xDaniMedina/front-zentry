"use client"

import { useState } from "react";
import { useRouter  } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { LayoutGrid, Plus, Folder, Clock, CheckCircle2, MoreVertical, Search, X } from "lucide-react";

export type Project = {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: 'active' | 'completed';
  updatedAt: string;
}

const FALLBACK_PROJECTS: Project[] = [
  { id: '1', title: 'Rediseño Zentry UI', description: 'Migración a Next.js 14 y Tailwind, implementando el nuevo sistema de diseño.', progress: 85, status: 'active', updatedAt: 'Hace 2 horas' },
  { id: '2', title: 'API de Usuarios', description: 'Conexión con el backend en Python/FastAPI de los compañeros.', progress: 40, status: 'active', updatedAt: 'Ayer' },
  { id: '3', title: 'Bocetos de Mascotas', description: 'Serie de ilustraciones digitales para la campaña de lanzamiento.', progress: 100, status: 'completed', updatedAt: 'La semana pasada' },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export default function ProjectsClient({ initialProjects }: { initialProjects: Project[] | null }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects || FALLBACK_PROJECTS);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  
  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' ? true : p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProject: Project = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDesc,
      progress: 0,
      status: 'active',
      updatedAt: 'Justo ahora'
    };

    setProjects([newProject, ...projects]);
    setIsModalOpen(false);
    setNewTitle("");
    setNewDesc("");
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-24 relative"
    >
      {/* Cabecera */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zentry-text-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zentry-bg border border-zentry-border flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-zentry-text-1" />
            </div>
            Proyectos
          </h1>
          <p className="text-sm text-zentry-text-2 mt-2">Organiza tu trabajo, colabora y haz seguimiento a tu progreso.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-zentry-text-1 text-zentry-bg font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nuevo Proyecto
        </button>
      </motion.div>

      {/* Controles de Búsqueda y Filtros */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zentry-text-2" />
          <input 
            type="text" 
            placeholder="Buscar proyecto..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zentry-card border border-zentry-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-text-2 transition-colors"
          />
        </div>
        <div className="flex bg-zentry-card border border-zentry-border rounded-xl p-1 shrink-0 overflow-x-auto hide-scrollbar">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f ? 'bg-zentry-bg text-zentry-text-1 shadow-sm' : 'text-zentry-text-2 hover:text-zentry-text-1'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : 'Completados'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid de Proyectos */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredProjects.map((project) => (
          <div 
            key={project.id} 
            onClick={() => router.push(`/projects/${project.id}`)}
            className="bg-zentry-card border border-zentry-border rounded-3xl p-5 hover:border-zentry-text-2 transition-all group flex flex-col h-full cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
                project.status === 'completed' 
                  ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                  : 'bg-zentry-bg border-zentry-border text-zentry-accent'
              }`}>
                {project.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
              </div>
              <button 
                className="text-zentry-text-2 hover:text-zentry-text-1 p-1 rounded-full transition-colors relative z-10"
                onClick={(e) => e.stopPropagation()} 
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            
            <h3 className="font-bold text-zentry-text-1 text-lg mb-2 group-hover:underline">
              {project.title}
            </h3>
            <p className="text-sm text-zentry-text-2 mb-6 line-clamp-2 flex-1">
              {project.description}
            </p>
            
            <div className="mt-auto">
              <div className="flex justify-between text-xs font-medium mb-2">
                <span className="text-zentry-text-2">Progreso</span>
                <span className="text-zentry-text-1">{project.progress}%</span>
              </div>
              <div className="w-full bg-zentry-bg rounded-full h-1.5 mb-4 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${project.progress === 100 ? 'bg-green-500' : 'bg-zentry-accent'}`} 
                  style={{ width: `${project.progress}%` }} 
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zentry-text-2">
                <Clock className="w-3.5 h-3.5" /> Actualizado {project.updatedAt}
              </div>
            </div>
          </div>
        ))}
      </motion.div>



      {/* MODAL PARA NUEVO PROYECTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zentry-border flex justify-between items-center">
              <h3 className="text-xl font-bold text-zentry-text-1">Nuevo Proyecto</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zentry-text-2 hover:text-zentry-text-1 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-zentry-text-2 mb-1">Título del Proyecto</label>
                <input 
                  type="text" 
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Rediseño de Dashboard"
                  className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zentry-text-2 mb-1">Descripción</label>
                <textarea 
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="¿De qué trata este proyecto?"
                  className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors resize-none h-24"
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-semibold text-zentry-text-1 bg-zentry-bg border border-zentry-border rounded-xl hover:bg-zentry-border transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-3 font-semibold text-zentry-bg bg-zentry-text-1 rounded-xl hover:opacity-90 transition-opacity">
                  Crear Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}

