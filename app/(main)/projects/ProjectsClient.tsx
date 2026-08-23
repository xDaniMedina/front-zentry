"use client"

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutGrid, Plus, Folder, Clock, CheckCircle2, MoreVertical, 
  Search, X, Calendar, Tag, AlertCircle, Users, Sparkles, Filter,
  ArrowUpRight, BarChart3, CheckSquare, Layers, Flame, Trash2,
  FolderKanban, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { Project, ProjectPriority, ProjectCategory } from "@/types";
import { createProjectAction, deleteProjectAction } from "@/lib/actions/projects";

const DEFAULT_STARTER_PROJECTS: Project[] = [
  { 
    id: '1', 
    title: 'Rediseño Zentry UI & Design System', 
    description: 'Migración a Next.js 16 y Tailwind CSS, implementando micro-animaciones en Framer Motion y soporte responsivo completo.', 
    category: 'UI/UX' as any,
    priority: 'alta' as any,
    progress: 75, 
    status: 'active' as any, 
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
    category: 'Desarrollo' as any,
    priority: 'urgente' as any,
    progress: 45, 
    status: 'active' as any, 
    updatedAt: 'Hace 2 horas',
    deadline: '05 Mar 2026',
    tasksCount: 6,
    completedTasksCount: 3,
    members: [
      { id: 'u1', name: 'Daniel Medina', avatar: 'DM', role: 'Backend Dev', isOnline: true },
      { id: 'u4', name: 'Carlos Dev', avatar: 'CD', role: 'DB Admin', isOnline: true }
    ],
    tags: ['Spring Boot', 'Gamification', 'Postgres']
  }
];

const PRIORITY_STYLES: Record<string, { label: string; color: string; border: string }> = {
  baja: { label: 'Baja', color: 'text-slate-400 bg-slate-500/10', border: 'border-slate-500/20' },
  media: { label: 'Media', color: 'text-blue-400 bg-blue-500/10', border: 'border-blue-500/20' },
  alta: { label: 'Alta', color: 'text-amber-400 bg-amber-500/10', border: 'border-amber-500/20' },
  urgente: { label: 'Urgente', color: 'text-red-400 bg-red-500/10', border: 'border-red-500/20' },
};

const CATEGORIES = ['UI/UX', 'Arte Digital', 'Desarrollo', 'Animación 3D', 'Branding', 'Música'];

export default function ProjectsClient({ initialProjects }: { initialProjects: Project[] | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const formattedInitial: Project[] = (initialProjects && initialProjects.length > 0)
    ? initialProjects
    : DEFAULT_STARTER_PROJECTS;

  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('zentry_user_projects');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return formattedInitial;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && projects.length > 0) {
      try {
        localStorage.setItem('zentry_user_projects', JSON.stringify(projects));
      } catch {}
    }
  }, [projects]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal de Creación
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: 'UI/UX',
    priority: 'media' as ProjectPriority,
    deadline: "",
    tags: ""
  });

  // Estadísticas Rápidas
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalTasks = projects.reduce((acc, p) => acc + (p.tasksCount || 0), 0);
  const totalCompletedTasks = projects.reduce((acc, p) => acc + (p.completedTasksCount || 0), 0);
  const overallProgress = totalTasks > 0 ? Math.round((totalCompletedTasks / totalTasks) * 100) : 0;

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.tags || []).some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
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

    const tagsArray: string[] = formData.tags
      ? formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [formData.category];

    const tempId = Date.now().toString();
    const newProj: Project = {
      id: tempId,
      title: formData.title,
      description: formData.description || "Sin descripción.",
      category: formData.category as any,
      priority: formData.priority as any,
      progress: 0,
      status: 'active' as any,
      updatedAt: 'Justo ahora',
      deadline: formData.deadline || 'Sin fecha límite',
      tasksCount: 0,
      completedTasksCount: 0,
      members: [
        { id: 'me', name: 'Tú (Creador)', avatar: 'YO', role: 'Líder', isOnline: true }
      ],
      tags: tagsArray
    };

    setProjects([newProj, ...projects]);
    setIsCreateModalOpen(false);
    toast.success("¡Proyecto creado con éxito!");

    startTransition(async () => {
      const res = await createProjectAction({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        status: 'active',
        deadline: formData.deadline,
        tags: tagsArray
      });

      if (res.success && res.data) {
        setProjects(prev => prev.map(p => p.id === tempId ? res.data! : p));
      }
    });

    setFormData({
      title: "",
      description: "",
      category: 'UI/UX',
      priority: 'media' as ProjectPriority,
      deadline: "",
      tags: ""
    });
  };

  const handleDeleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setProjects(prev => prev.filter(p => p.id !== id));
    toast.success("Proyecto eliminado");

    startTransition(async () => {
      await deleteProjectAction(id);
    });
  };

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8 max-w-7xl mx-auto w-full pb-20">
      
      {/* HEADER DE PROYECTOS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-950/40 via-zentry-card to-indigo-950/40 border border-zentry-border p-6 rounded-3xl relative overflow-hidden shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <FolderKanban className="w-6 h-6 text-zentry-accent" />
            <h1 className="text-2xl font-black text-zentry-text-1">Gestión de Proyectos</h1>
          </div>
          <p className="text-xs text-zentry-text-2">
            Organiza tus obras, coordina tareas creativas y colabora en tiempo real.
          </p>
        </div>

        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-zentry-accent text-white font-extrabold text-xs hover:opacity-90 transition-opacity shadow-lg shadow-zentry-accent/20 shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Nuevo Proyecto
        </button>
      </div>

      {/* DASHBOARD DE MÉTRICAS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-zentry-card border border-zentry-border rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-zentry-text-2 uppercase flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-zentry-accent" /> Total Proyectos
          </span>
          <p className="text-2xl font-black text-zentry-text-1 mt-2">{totalProjects}</p>
        </div>

        <div className="bg-zentry-card border border-zentry-border rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-emerald-400 uppercase flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-emerald-400" /> En Progreso
          </span>
          <p className="text-2xl font-black text-emerald-400 mt-2">{activeProjects}</p>
        </div>

        <div className="bg-zentry-card border border-zentry-border rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-blue-400 uppercase flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-blue-400" /> Tareas Totales
          </span>
          <p className="text-2xl font-black text-zentry-text-1 mt-2">
            {totalCompletedTasks} <span className="text-xs text-zentry-text-2 font-normal">/ {totalTasks}</span>
          </p>
        </div>

        <div className="bg-zentry-card border border-zentry-border rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-purple-400 uppercase flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" /> Avance Global
          </span>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-2xl font-black text-zentry-text-1">{overallProgress}%</span>
            <div className="flex-1 bg-zentry-bg rounded-full h-2 border border-zentry-border overflow-hidden">
              <div className="bg-zentry-accent h-full rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zentry-text-2 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Buscar por título, descripción o etiqueta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zentry-card border border-zentry-border rounded-2xl pl-10 pr-4 py-2.5 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zentry-text-2 hover:text-zentry-text-1">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-zentry-card border border-zentry-border rounded-2xl px-3 py-2 text-xs font-bold text-zentry-text-1 focus:outline-none focus:border-zentry-accent cursor-pointer"
          >
            <option value="all">Todos los Estados</option>
            <option value="active">En Progreso</option>
            <option value="completed">Completados</option>
            <option value="paused">Pausados</option>
          </select>

          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-zentry-card border border-zentry-border rounded-2xl px-3 py-2 text-xs font-bold text-zentry-text-1 focus:outline-none focus:border-zentry-accent cursor-pointer"
          >
            <option value="all">Todas las Categorías</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* GRILLA DE PROYECTOS */}
      {filteredProjects.length === 0 ? (
        <div className="bg-zentry-card border border-zentry-border rounded-3xl p-12 text-center space-y-4">
          <FolderKanban className="w-12 h-12 text-zentry-text-2/40 mx-auto" />
          <h3 className="text-lg font-bold text-zentry-text-1">No se encontraron proyectos</h3>
          <p className="text-xs text-zentry-text-2 max-w-sm mx-auto">
            {searchQuery ? "Intenta con otro término de búsqueda o limpia los filtros." : "Comienza creando tu primer proyecto creativo para organizar tus tareas."}
          </p>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-zentry-accent text-white rounded-xl text-xs font-extrabold hover:opacity-90 transition-opacity"
          >
            Crear Primer Proyecto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((proj) => {
            const priorityConfig = PRIORITY_STYLES[proj.priority] || PRIORITY_STYLES.media;
            return (
              <motion.div
                key={proj.id}
                whileHover={{ y: -3 }}
                onClick={() => router.push(`/projects/${proj.id}`)}
                className="bg-zentry-card border border-zentry-border rounded-3xl p-5 shadow-sm hover:border-zentry-accent/50 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Categoría & Prioridad */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zentry-accent bg-zentry-accent/10 px-2.5 py-1 rounded-xl border border-zentry-accent/20">
                      {proj.category}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityConfig.color} ${priorityConfig.border}`}>
                        {priorityConfig.label}
                      </span>
                      
                      <button 
                        onClick={(e) => handleDeleteProject(e, proj.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-zentry-text-2 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                        title="Eliminar proyecto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Título & Descripción */}
                  <h3 className="font-extrabold text-base text-zentry-text-1 group-hover:text-zentry-accent transition-colors line-clamp-1 mb-2">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-zentry-text-2 line-clamp-2 leading-relaxed mb-4">
                    {proj.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {(proj.tags || []).slice(0, 3).map((t, idx) => (
                      <span key={idx} className="text-[10px] text-zentry-text-2 bg-zentry-bg border border-zentry-border px-2 py-0.5 rounded-lg">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer del Card: Barra de Progreso y Miembros */}
                <div className="space-y-3 pt-3 border-t border-zentry-border/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] text-zentry-text-2 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {proj.completedTasksCount} / {proj.tasksCount} tareas
                    </span>
                    <span className="font-black text-zentry-text-1">{proj.progress}%</span>
                  </div>

                  <div className="w-full bg-zentry-bg rounded-full h-1.5 overflow-hidden border border-zentry-border">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        proj.progress === 100 ? 'bg-emerald-500' : 'bg-zentry-accent'
                      }`} 
                      style={{ width: `${proj.progress}%` }} 
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {/* Miembros */}
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {(proj.members || []).map((m, idx) => (
                        <div 
                          key={idx} 
                          title={m.name}
                          className="relative w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 border border-zentry-card flex items-center justify-center text-[9px] font-black"
                        >
                          {m.avatar}
                          {m.isOnline && (
                            <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-emerald-500 rounded-full border border-zentry-card" />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-zentry-text-2 font-medium">
                      <Calendar className="w-3 h-3 text-zentry-text-2/70" />
                      {proj.deadline}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* MODAL CREAR NUEVO PROYECTO */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-zentry-border flex justify-between items-center bg-zentry-bg">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-zentry-accent" />
                  <h3 className="font-extrabold text-base text-zentry-text-1">Nuevo Proyecto Creativo</h3>
                </div>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 text-zentry-text-2 hover:text-zentry-text-1 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-zentry-text-2 uppercase mb-1">Título del Proyecto *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Colección Cyberpunk 3D / Brand Identity"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-2.5 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zentry-text-2 uppercase mb-1">Descripción</label>
                  <textarea 
                    rows={3}
                    placeholder="Detalles, objetivos o alcance del proyecto..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-zentry-bg border border-zentry-border rounded-xl p-3 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-zentry-text-2 uppercase mb-1">Categoría</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-3 py-2 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-zentry-text-2 uppercase mb-1">Prioridad</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-3 py-2 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-zentry-text-2 uppercase mb-1">Fecha Límite</label>
                    <input 
                      type="text" 
                      placeholder="Ej. 15 Mar 2026"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-3 py-2 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zentry-text-2 uppercase mb-1">Tags (separados por coma)</label>
                    <input 
                      type="text" 
                      placeholder="UI, Next.js, 3D"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-3 py-2 text-xs text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-zentry-border flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 bg-zentry-bg border border-zentry-border text-zentry-text-2 hover:text-zentry-text-1 rounded-xl font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-zentry-accent text-white rounded-xl font-black hover:opacity-90 transition-opacity shadow-md shadow-zentry-accent/20"
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
