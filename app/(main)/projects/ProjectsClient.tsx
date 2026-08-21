"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutGrid, Plus, Folder, Clock, CheckCircle2, MoreVertical, 
  Search, X, Calendar, Tag, AlertCircle, Users, Sparkles, Filter,
  ArrowUpRight, BarChart3, CheckSquare, Layers, Flame
} from "lucide-react";
import { toast } from "sonner";

export type ProjectPriority = 'baja' | 'media' | 'alta' | 'urgente';
export type ProjectCategory = 'UI/UX' | 'Arte Digital' | 'Desarrollo' | 'Animación 3D' | 'Branding' | 'Música';

export type ProjectMember = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  isOnline: boolean;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  priority: ProjectPriority;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  updatedAt: string;
  deadline: string;
  tasksCount: number;
  completedTasksCount: number;
  members: ProjectMember[];
  tags: string[];
};

const INITIAL_PROJECTS: Project[] = [
  { 
    id: '1', 
    title: 'Rediseño Zentry UI & Design System', 
    description: 'Migración a Next.js 16 y Tailwind CSS, implementando micro-animaciones en Framer Motion y soporte responsivo completo.', 
    category: 'UI/UX',
    priority: 'alta',
    progress: 75, 
    status: 'active', 
    updatedAt: 'Hace 15 min',
    deadline: '28 Feb 2026',
    tasksCount: 8,
    completedTasksCount: 6,
    members: [
      { id: 'u1', name: 'Daniel Medina', avatar: 'DM', role: 'Lead Dev', isOnline: true },
      { id: 'u2', name: 'Luna Muse', avatar: 'LM', role: 'UI Designer', isOnline: true },
      { id: 'u3', name: 'Pixel Kid', avatar: 'PK', role: 'Motion', isOnline: false }
    ],
    tags: ['Next.js', 'Tailwind', 'UI/UX']
  },
  { 
    id: '2', 
    title: 'Motor de Misiones y Recompensas Zentry Coins', 
    description: 'Integración del microservicio de economía y logros gamificados con base de datos PostgreSQL.', 
    category: 'Desarrollo',
    priority: 'urgente',
    progress: 45, 
    status: 'active', 
    updatedAt: 'Hace 2 horas',
    deadline: '05 Mar 2026',
    tasksCount: 6,
    completedTasksCount: 3,
    members: [
      { id: 'u1', name: 'Daniel Medina', avatar: 'DM', role: 'Backend Dev', isOnline: true },
      { id: 'u4', name: 'Carlos Dev', avatar: 'CD', role: 'DB Admin', isOnline: true }
    ],
    tags: ['Spring Boot', 'Gamification', 'Postgres']
  },
  { 
    id: '3', 
    title: 'Serie de Ilustraciones 3D CyberPunk', 
    description: 'Colección artística de personajes y fondos renderizados para el lanzamiento del Estudio Creativo.', 
    category: 'Arte Digital',
    priority: 'media',
    progress: 100, 
    status: 'completed', 
    updatedAt: 'Ayer',
    deadline: '20 Feb 2026',
    tasksCount: 10,
    completedTasksCount: 10,
    members: [
      { id: 'u2', name: 'Luna Muse', avatar: 'LM', role: '3D Artist', isOnline: false },
      { id: 'u3', name: 'Pixel Kid', avatar: 'PK', role: 'Concept Artist', isOnline: false }
    ],
    tags: ['Blender', '3D', 'Cyberpunk']
  },
  { 
    id: '4', 
    title: 'Campaña Multimedia de Comunidades', 
    description: 'Kit de prensa, banners promocionales y guías de bienvenida para nuevos creadores.', 
    category: 'Branding',
    priority: 'baja',
    progress: 20, 
    status: 'paused', 
    updatedAt: 'Hace 3 días',
    deadline: '15 Mar 2026',
    tasksCount: 5,
    completedTasksCount: 1,
    members: [
      { id: 'u1', name: 'Daniel Medina', avatar: 'DM', role: 'Marketing', isOnline: true }
    ],
    tags: ['Branding', 'Media', 'Guides']
  }
];

const PRIORITY_STYLES: Record<ProjectPriority, { label: string; color: string; border: string }> = {
  baja: { label: 'Baja', color: 'text-slate-400 bg-slate-500/10', border: 'border-slate-500/20' },
  media: { label: 'Media', color: 'text-blue-400 bg-blue-500/10', border: 'border-blue-500/20' },
  alta: { label: 'Alta', color: 'text-amber-400 bg-amber-500/10', border: 'border-amber-500/20' },
  urgente: { label: 'Urgente', color: 'text-red-400 bg-red-500/10', border: 'border-red-500/20' },
};

const CATEGORIES: ProjectCategory[] = ['UI/UX', 'Arte Digital', 'Desarrollo', 'Animación 3D', 'Branding', 'Música'];

export default function ProjectsClient({ initialProjects }: { initialProjects: Project[] | null }) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects && initialProjects.length > 0 ? initialProjects : INITIAL_PROJECTS);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal de Creación
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: ProjectCategory;
    priority: ProjectPriority;
    deadline: string;
    tags: string;
  }>({
    title: "",
    description: "",
    category: 'UI/UX',
    priority: 'media',
    deadline: "",
    tags: ""
  });

  // Estadísticas Rápidas
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalTasks = projects.reduce((acc, p) => acc + p.tasksCount, 0);
  const totalCompletedTasks = projects.reduce((acc, p) => acc + p.completedTasksCount, 0);
  const overallProgress = totalTasks > 0 ? Math.round((totalCompletedTasks / totalTasks) * 100) : 0;

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' ? true : p.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' ? true : p.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Por favor ingresa un título para el proyecto.");
      return;
    }

    const tagsArray = formData.tags
      ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [formData.category];

    const newProj: Project = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description || "Sin descripción proporcionada.",
      category: formData.category,
      priority: formData.priority,
      progress: 0,
      status: 'active',
      updatedAt: 'Justo ahora',
      deadline: formData.deadline || 'Sin fecha límite',
      tasksCount: 0,
      completedTasksCount: 0,
      members: [
        { id: 'me', name: 'Tú (Creador)', avatar: 'YO', role: 'Líder de Proyecto', isOnline: true }
      ],
      tags: tagsArray
    };

    setProjects([newProj, ...projects]);
    setIsCreateModalOpen(false);
    setFormData({
      title: "",
      description: "",
      category: 'UI/UX',
      priority: 'media',
      deadline: "",
      tags: ""
    });
    toast.success("¡Proyecto creado exitosamente! 🚀");
  };

  return (
    <div className="w-full mx-auto py-4 sm:py-6 space-y-6 sm:space-y-8">
      
      {/* 1. CABECERA & ACCIÓN PRINCIPAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-zentry-accent/15 border border-zentry-accent/30 flex items-center justify-center text-zentry-accent shadow-md shadow-zentry-accent/10">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-zentry-text-1 tracking-tight">Gestor de Proyectos</h1>
              <p className="text-xs text-zentry-text-2">Planifica, colabora y haz seguimiento a tus metas creativas.</p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-3 bg-zentry-accent hover:opacity-90 active:scale-95 text-white rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-zentry-accent/25 transition-all w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Nuevo Proyecto
        </button>
      </div>

      {/* 2. TARJETAS DE MÉTRICAS & PROGRESO GLOBAL */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="p-4 bg-zentry-card border border-zentry-border rounded-2xl sm:rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zentry-text-2 uppercase tracking-wider">Activos</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-zentry-text-1">{activeProjects}</p>
          <p className="text-[10px] text-zentry-text-2 font-mono">De {totalProjects} proyectos totales</p>
        </div>

        <div className="p-4 bg-zentry-card border border-zentry-border rounded-2xl sm:rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zentry-text-2 uppercase tracking-wider">Completados</span>
            <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-zentry-text-1">{completedProjects}</p>
          <p className="text-[10px] text-emerald-400 font-mono font-bold">100% listos</p>
        </div>

        <div className="p-4 bg-zentry-card border border-zentry-border rounded-2xl sm:rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zentry-text-2 uppercase tracking-wider">Tareas</span>
            <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-zentry-text-1">{totalCompletedTasks} / {totalTasks}</p>
          <p className="text-[10px] text-zentry-text-2 font-mono">{totalTasks - totalCompletedTasks} pendientes</p>
        </div>

        <div className="p-4 bg-zentry-card border border-zentry-border rounded-2xl sm:rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zentry-text-2 uppercase tracking-wider">Avance Global</span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-400">{overallProgress}%</p>
          <div className="w-full bg-zentry-bg rounded-full h-1.5 overflow-hidden border border-zentry-border">
            <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>

      </div>

      {/* 3. BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zentry-text-2" />
            <input 
              type="text" 
              placeholder="Buscar por título, etiquetas o descripción..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zentry-card border border-zentry-border rounded-2xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zentry-text-2 hover:text-zentry-text-1">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtro por Estado */}
          <div className="flex bg-zentry-card border border-zentry-border rounded-2xl p-1 shrink-0 overflow-x-auto hide-scrollbar">
            {(['all', 'active', 'completed', 'paused'] as const).map((st) => (
              <button 
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === st 
                    ? 'bg-zentry-bg text-zentry-text-1 shadow-sm border border-zentry-border' 
                    : 'text-zentry-text-2 hover:text-zentry-text-1'
                }`}
              >
                {st === 'all' ? 'Todos' : st === 'active' ? '⚡ Activos' : st === 'completed' ? '✨ Listos' : '⏸️ Pausa'}
              </button>
            ))}
          </div>

        </div>

        {/* Categorías en Carrusel Horizontal */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
              categoryFilter === 'all'
                ? 'bg-zentry-text-1 text-zentry-bg shadow-sm'
                : 'bg-zentry-card border border-zentry-border text-zentry-text-2 hover:text-zentry-text-1'
            }`}
          >
            Todas las áreas
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                categoryFilter === cat
                  ? 'bg-zentry-accent text-white shadow-md shadow-zentry-accent/20'
                  : 'bg-zentry-card border border-zentry-border text-zentry-text-2 hover:text-zentry-text-1'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. CUADRÍCULA DE PROYECTOS */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center bg-zentry-card border border-zentry-border rounded-3xl space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-zentry-bg border border-zentry-border flex items-center justify-center text-zentry-text-2 mx-auto">
            <Folder className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zentry-text-1">No se encontraron proyectos</h3>
          <p className="text-xs text-zentry-text-2 max-w-sm mx-auto">Prueba cambiando los filtros o crea un nuevo proyecto para comenzar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredProjects.map((project) => {
            const pPriority = PRIORITY_STYLES[project.priority];
            const isCompleted = project.status === 'completed';

            return (
              <div 
                key={project.id} 
                onClick={() => router.push(`/projects/${project.id}`)}
                className="bg-zentry-card border border-zentry-border rounded-3xl p-5 hover:border-zentry-accent/50 hover:shadow-xl hover:shadow-zentry-accent/5 transition-all group flex flex-col justify-between cursor-pointer relative overflow-hidden"
              >
                {/* Indicador de categoría y prioridad */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-zentry-bg border border-zentry-border text-zentry-text-2">
                      {project.category}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border ${pPriority.color} ${pPriority.border}`}>
                      {pPriority.label}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-zentry-text-1 text-base group-hover:text-zentry-accent transition-colors line-clamp-1 mb-1.5 flex items-center justify-between">
                    <span>{project.title}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-zentry-accent shrink-0 ml-2" />
                  </h3>

                  <p className="text-xs text-zentry-text-2 line-clamp-2 leading-relaxed mb-4">
                    {project.description}
                  </p>
                </div>

                {/* Sección Inferior: Progreso + Miembros + Deadline */}
                <div className="space-y-4 pt-3 border-t border-zentry-border/70">
                  
                  {/* Barra de Progreso */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-mono">
                      <span className="text-zentry-text-2 font-bold">{project.completedTasksCount}/{project.tasksCount} tareas</span>
                      <span className={`font-black ${isCompleted ? 'text-emerald-400' : 'text-zentry-accent'}`}>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-zentry-bg rounded-full h-1.5 overflow-hidden border border-zentry-border/50">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-400' : 'bg-gradient-to-r from-zentry-accent to-purple-500'}`} 
                        style={{ width: `${project.progress}%` }} 
                      />
                    </div>
                  </div>

                  {/* Miembros & Fecha Límite */}
                  <div className="flex items-center justify-between pt-1">
                    
                    {/* Avatares de Miembros */}
                    <div className="flex -space-x-2 overflow-hidden">
                      {project.members.map((mem) => (
                        <div 
                          key={mem.id}
                          className="w-7 h-7 rounded-full bg-zentry-bg border-2 border-zentry-card flex items-center justify-center text-[10px] font-bold text-zentry-text-1 relative"
                          title={`${mem.name} (${mem.role})`}
                        >
                          {mem.avatar}
                          {mem.isOnline && (
                            <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-zentry-card rounded-full" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Deadline */}
                    <div className="flex items-center gap-1.5 text-[11px] text-zentry-text-2 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{project.deadline}</span>
                    </div>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 5. MODAL DE CREACIÓN DE PROYECTO */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div 
            onClick={() => setIsCreateModalOpen(false)}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-zentry-border flex justify-between items-center bg-zentry-bg">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-zentry-accent" />
                  <h3 className="text-base sm:text-lg font-black text-zentry-text-1">Crear Nuevo Proyecto</h3>
                </div>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-card rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
                
                <div>
                  <label className="block font-bold text-zentry-text-2 mb-1.5 uppercase tracking-wider text-[11px]">Título del Proyecto *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej. Rediseño Zentry UI o Álbum Synthwave..."
                    className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zentry-text-2 mb-1.5 uppercase tracking-wider text-[11px]">Descripción / Objetivo</label>
                  <textarea 
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe los entregables, estilo visual o requerimientos del proyecto..."
                    className="w-full bg-zentry-bg border border-zentry-border rounded-xl p-3 text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-zentry-text-2 mb-1.5 uppercase tracking-wider text-[11px]">Categoría</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as ProjectCategory })}
                      className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-3.5 py-3 text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-zentry-text-2 mb-1.5 uppercase tracking-wider text-[11px]">Prioridad</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProjectPriority })}
                      className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-3.5 py-3 text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">🔥 Urgente</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-zentry-text-2 mb-1.5 uppercase tracking-wider text-[11px]">Fecha Límite</label>
                    <input 
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-3.5 py-3 text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zentry-text-2 mb-1.5 uppercase tracking-wider text-[11px]">Etiquetas (separadas por coma)</label>
                    <input 
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="React, 3D, Figma..."
                      className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-3.5 py-3 text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-zentry-border flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-zentry-text-2 hover:bg-zentry-bg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-black bg-zentry-accent text-white hover:opacity-90 transition-opacity shadow-lg shadow-zentry-accent/20"
                  >
                    Crear Proyecto
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
