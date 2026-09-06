"use client"

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Plus, CheckCircle2, Files, History, 
  Users, UploadCloud, MessageSquare, Trash2, Check, Share2,
  Download, Send, Heart, UserPlus,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import {
  addProjectTaskAction,
  toggleProjectTaskAction,
  deleteTaskAction,
  addResourceAction,
  addProjectCommentAction,
  toggleProjectLikeAction,
  inviteProjectMemberAction,
  removeProjectMemberAction,
} from "@/lib/actions/projects";
import { Project, ProjectTask, ProjectPriority } from "@/types";

export type ProjectResource = {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  date: string;
  url?: string;
};

export type ProjectActivity = {
  id: string;
  user: string;
  avatar: string;
  action: string;
  target: string;
  time: string;
  iconType: 'task' | 'file' | 'member' | 'status';
};

export type ProjectCollaborator = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  isOnline: boolean;
  tasksCompleted: number;
};

interface ProjectDetailClientProps {
  projectId: string;
  initialProject?: Project | null;
}

export default function ProjectDetailClient({ projectId, initialProject }: ProjectDetailClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  // Tab Activa
  const [activeTab, setActiveTab] = useState<'tasks' | 'resources' | 'history' | 'team' | 'notes'>('tasks');

  // Datos del Proyecto
  const [projectTitle, setProjectTitle] = useState(initialProject?.title || initialProject?.name || `Proyecto #${projectId}`);
  const [projectDesc, setProjectDesc] = useState(initialProject?.description || "Iniciativa colaborativa en la red creativa Zentry.");
  const [projectStatus, setProjectStatus] = useState<'active' | 'completed' | 'paused'>(initialProject?.status || 'active');
  const [likesCount, setLikesCount] = useState(initialProject?.likesCount || 0);
  const [isLiked, setIsLiked] = useState(initialProject?.isLiked || false);

  // Estado de Tareas
  const [tasks, setTasks] = useState<ProjectTask[]>(initialProject?.tasks || []);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<ProjectPriority>('media');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Estado de Recursos / Archivos (metadatos reales del backend; sin almacenamiento de archivo aún)
  const [resources, setResources] = useState<ProjectResource[]>(
    (initialProject as unknown as { resources?: ProjectResource[] })?.resources || []
  );

  // Estado de Colaboradores
  const [collaborators, setCollaborators] = useState<ProjectCollaborator[]>(
    (initialProject?.members || []).map(m => ({
      id: m.id,
      name: m.name,
      avatar: m.avatar,
      role: m.role,
      isOnline: m.isOnline,
      tasksCompleted: 0,
    }))
  );

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");

  // Estado de Historial de Actividad (real, generado por el backend en cada acción)
  const [activities, setActivities] = useState<ProjectActivity[]>(
    (initialProject as unknown as { activities?: ProjectActivity[] })?.activities || []
  );

  // Estado de Notas Rápidas & Discusión
  const [notes, setNotes] = useState<Array<{ id: string; user: string; text: string; time: string }>>(
    (initialProject?.comments || []).map(c => ({
      id: c.id,
      user: c.authorName || `@${c.authorUsername}`,
      text: c.content,
      time: c.createdAt
    }))
  );
  const [newNoteText, setNewNoteText] = useState("");

  // Cálculos de Progreso
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Reacción Social (Like)
  const handleToggleLike = () => {
    const previousLiked = isLiked;
    const previousCount = likesCount;
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount(prev => nextLiked ? prev + 1 : Math.max(0, prev - 1));

    startTransition(async () => {
      const res = await toggleProjectLikeAction(projectId);
      if (res.success) {
        if (res.isLiked !== undefined) setIsLiked(res.isLiked);
        if (res.likesCount !== undefined) setLikesCount(res.likesCount);
      } else {
        setIsLiked(previousLiked);
        setLikesCount(previousCount);
      }
    });
  };

  const handleRemoveMember = (username: string) => {
    const previous = collaborators;
    setCollaborators(prev => prev.filter(c => c.id !== username));

    startTransition(async () => {
      const res = await removeProjectMemberAction(projectId, username);
      if (!res.success) {
        setCollaborators(previous);
        toast.error(res.error || "No se pudo quitar al colaborador");
      }
    });
  };

  // Acciones de Tareas
  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextState = !t.completed;
        if (nextState) {
          setActivities(act => [
            {
              id: Date.now().toString(),
              user: 'Tú',
              avatar: 'YO',
              action: 'completó la tarea',
              target: t.title,
              time: 'Justo ahora',
              iconType: 'task'
            },
            ...act
          ]);
          toast.success("¡Tarea completada! 🎉");
        }

        startTransition(async () => {
          await toggleProjectTaskAction(projectId, taskId, nextState);
        });

        return { ...t, completed: nextState };
      }
      return t;
    }));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: ProjectTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      completed: false,
      priority: newTaskPriority,
      assignedTo: 'Tú',
      dueDate: 'Pronto'
    };

    setTasks([newTask, ...tasks]);
    setActivities(act => [
      {
        id: Date.now().toString(),
        user: 'Tú',
        avatar: 'YO',
        action: 'creó la tarea',
        target: newTaskTitle.trim(),
        time: 'Justo ahora',
        iconType: 'task'
      },
      ...act
    ]);

    setNewTaskTitle("");
    setIsAddingTask(false);
    toast.success("Nueva tarea añadida al proyecto ✨");

    startTransition(async () => {
      await addProjectTaskAction(projectId, {
        title: newTask.title,
        priority: newTask.priority,
        assignedTo: newTask.assignedTo,
        dueDate: newTask.dueDate
      });
    });
  };

  const handleDeleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const previous = tasks;
    setTasks(prev => prev.filter(t => t.id !== taskId));

    startTransition(async () => {
      const res = await deleteTaskAction(projectId, taskId);
      if (res.success) {
        toast.info("Tarea eliminada.");
      } else {
        setTasks(previous);
        toast.error("No se pudo eliminar la tarea");
      }
    });
  };

  // Subida de Archivos (solo metadatos: el backend aún no almacena el archivo en sí)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

    startTransition(async () => {
      const res = await addResourceAction(projectId, { name: file.name, type: ext, size: sizeMB });
      if (res.success && res.data) {
        setResources(prev => [{
          id: String(res.data.id),
          name: res.data.name,
          type: res.data.type,
          size: res.data.size,
          uploadedBy: res.data.uploadedBy,
          date: res.data.uploadedAt,
          url: res.data.url,
        }, ...prev]);
        toast.success(`Archivo "${file.name}" registrado en el proyecto 📁`);
      } else {
        toast.error("No se pudo registrar el archivo");
      }
    });
  };

  // Invitar Colaborador
  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUsername.trim()) return;

    const clean = inviteUsername.replace('@', '');

    startTransition(async () => {
      const res = await inviteProjectMemberAction(projectId, clean);
      if (res.success && res.data) {
        setCollaborators(prev => [...prev, {
          id: res.data!.id,
          name: res.data!.name,
          avatar: res.data!.avatar,
          role: res.data!.role,
          isOnline: false,
          tasksCompleted: 0,
        }]);
        toast.success(`¡Invitación enviada a @${clean}! 🚀`);
      } else {
        toast.error(res.error || "No se pudo invitar a este usuario");
      }
    });

    setInviteUsername("");
    setIsInviteModalOpen(false);
  };

  // Enviar Nota / Comentario
  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const noteContent = newNoteText.trim();
    setNotes([
      ...notes,
      {
        id: Date.now().toString(),
        user: 'Tú',
        text: noteContent,
        time: 'Justo ahora'
      }
    ]);
    setNewNoteText("");

    startTransition(async () => {
      await addProjectCommentAction(projectId, noteContent);
    });
  };

  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'pending') return !t.completed;
    if (taskFilter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="w-full mx-auto py-4 sm:py-6 space-y-6">
      
      {/* 1. BOTÓN VOLVER & ACCIONES SUPERIORES */}
      <div className="flex items-center justify-between gap-4">
        <button 
          onClick={() => router.push('/projects')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-zentry-card border border-zentry-border text-xs font-bold text-zentry-text-2 hover:text-zentry-text-1 hover:border-zentry-accent/40 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a Proyectos
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleLike}
            className={`px-3 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              isLiked 
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' 
                : 'bg-zentry-card text-zentry-text-2 border-zentry-border hover:text-zentry-text-1'
            }`}
            title="Apoyar iniciativa"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
            <span className="font-mono">{likesCount}</span>
          </button>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-zentry-accent text-white text-xs font-black hover:opacity-90 shadow-md flex items-center gap-1.5 transition-all"
          >
            <UserPlus className="w-4 h-4" /> Invitar Colaborador
          </button>

          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Enlace del proyecto copiado al portapapeles 📋");
              }
            }}
            className="p-2 rounded-2xl bg-zentry-card border border-zentry-border text-zentry-text-2 hover:text-zentry-text-1 transition-colors shadow-sm"
            title="Compartir proyecto"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. CABECERA DEL PROYECTO & TARJETA DE PROGRESO */}
      <div className="bg-gradient-to-br from-zentry-card via-zentry-card to-zentry-bg border border-zentry-border rounded-3xl p-5 sm:p-8 shadow-sm relative overflow-hidden space-y-6">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Info Principal */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-zentry-accent/15 border border-zentry-accent/30 text-zentry-accent text-[11px] font-mono font-bold uppercase">
                ID: #{projectId}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                ⚡ {projectStatus === 'active' ? 'En Desarrollo' : projectStatus === 'completed' ? 'Completado' : 'Pausado'}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold">
                {initialProject?.category || 'Creativo & Técnico'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-zentry-text-1 tracking-tight">
              {projectTitle}
            </h1>
            <p className="text-xs sm:text-sm text-zentry-text-2 max-w-2xl leading-relaxed">
              {projectDesc}
            </p>
          </div>

          {/* Widget de Progreso Circular / Barra */}
          <div className="p-4 bg-zentry-bg/80 border border-zentry-border rounded-2xl sm:rounded-3xl w-full lg:w-72 space-y-3 shrink-0 shadow-inner">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-zentry-text-2 uppercase tracking-wider text-[10px]">Progreso del Sprint</span>
              <span className="font-black text-amber-400 font-mono text-sm">{progressPercent}%</span>
            </div>

            <div className="w-full bg-zentry-card rounded-full h-2.5 overflow-hidden border border-zentry-border">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-zentry-accent rounded-full shadow-sm"
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-zentry-text-2 font-mono">
              <span>{completedCount} de {totalCount} tareas listas</span>
              <span className="text-emerald-400 font-bold">{totalCount - completedCount} restantes</span>
            </div>
          </div>

        </div>

      </div>

      {/* 3. SISTEMA DE PESTAÑAS (TABS) */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar border-b border-zentry-border pb-1">
        {[
          { id: 'tasks', label: `Tareas (${tasks.length})`, icon: CheckCircle2 },
          { id: 'resources', label: `Recursos (${resources.length})`, icon: Files },
          { id: 'team', label: `Equipo (${collaborators.length})`, icon: Users },
          { id: 'history', label: `Historial (${activities.length})`, icon: History },
          { id: 'notes', label: `Notas (${notes.length})`, icon: MessageSquare },
        ].map(tab => {
          const IconC = tab.icon;
          const isAct = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
                isAct
                  ? 'bg-zentry-accent text-white shadow-md shadow-zentry-accent/20'
                  : 'text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-card'
              }`}
            >
              <IconC className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* 4. CONTENIDO SEGÚN LA PESTAÑA ACTIVA */}
      
      {/* PESTAÑA 1: TAREAS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zentry-card p-4 rounded-2xl border border-zentry-border">
            <div className="flex items-center gap-2">
              {(['all', 'pending', 'completed'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setTaskFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    taskFilter === st 
                      ? 'bg-zentry-bg text-zentry-text-1 border border-zentry-border' 
                      : 'text-zentry-text-2 hover:text-zentry-text-1'
                  }`}
                >
                  {st === 'all' ? 'Todas' : st === 'pending' ? 'Pendientes' : 'Completadas'}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsAddingTask(!isAddingTask)}
              className="px-4 py-2 bg-zentry-accent hover:opacity-90 active:scale-95 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Nueva Tarea
            </button>
          </div>

          {/* Formulario para añadir tarea */}
          {isAddingTask && (
            <form onSubmit={handleAddTask} className="p-4 bg-zentry-card border border-zentry-accent/50 rounded-2xl space-y-3 shadow-lg">
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  type="text"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="Título de la tarea (ej. Crear endpoint POST en backend)..."
                  className="flex-1 bg-zentry-bg border border-zentry-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
                />
                <select
                  value={newTaskPriority}
                  onChange={e => setNewTaskPriority(e.target.value as ProjectPriority)}
                  className="bg-zentry-bg border border-zentry-border rounded-xl px-3 py-2.5 text-xs text-zentry-text-1 focus:outline-none"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddingTask(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-zentry-text-2 hover:bg-zentry-bg"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 rounded-lg text-xs font-black bg-zentry-accent text-white hover:opacity-90"
                >
                  Guardar Tarea
                </button>
              </div>
            </form>
          )}

          {/* Lista de Tareas */}
          <div className="space-y-2.5">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center bg-zentry-card border border-zentry-border rounded-2xl text-xs text-zentry-text-2">
                No hay tareas en este filtro.
              </div>
            ) : (
              filteredTasks.map((t) => (
                <motion.div
                  layout
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    t.completed 
                      ? 'bg-zentry-bg/70 border-zentry-border/50 opacity-70' 
                      : 'bg-zentry-card border-zentry-border hover:border-zentry-accent/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button 
                      type="button"
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                        t.completed ? 'bg-emerald-500 text-white' : 'border-2 border-zentry-border hover:border-zentry-accent'
                      }`}
                    >
                      {t.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs sm:text-sm font-medium ${t.completed ? 'line-through text-zentry-text-2' : 'text-zentry-text-1'}`}>
                        {t.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-zentry-text-2">
                        {t.assignedTo && <span>Asignado: <strong className="text-zentry-text-1">{t.assignedTo}</strong></span>}
                        {t.dueDate && <span>• Vence: {t.dueDate}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                      t.priority === 'alta' || t.priority === 'urgente'
                        ? 'text-red-400 bg-red-500/10 border-red-500/20' 
                        : t.priority === 'media'
                          ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                          : 'text-slate-400 bg-slate-500/10 border-slate-500/20'
                    }`}>
                      {t.priority}
                    </span>

                    <button 
                      onClick={(e) => handleDeleteTask(t.id, e)}
                      className="p-1.5 rounded-lg text-zentry-text-2 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

        </div>
      )}

      {/* PESTAÑA 2: RECURSOS Y ARCHIVOS */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          
          <div className="flex items-center justify-between bg-zentry-card p-4 rounded-2xl border border-zentry-border">
            <div>
              <h3 className="font-extrabold text-sm text-zentry-text-1">Archivos y Entregables del Proyecto</h3>
              <p className="text-xs text-zentry-text-2">Formatos compatibles: Figma, PDF, ZIP, PNG, JSON, etc.</p>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-zentry-accent hover:opacity-90 active:scale-95 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md transition-all"
            >
              <UploadCloud className="w-4 h-4" /> Subir Archivo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {resources.map((res) => (
              <div 
                key={res.id}
                className="p-4 bg-zentry-card border border-zentry-border rounded-2xl space-y-3 hover:border-zentry-accent/50 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-zentry-accent/15 border border-zentry-accent/30 text-zentry-accent flex items-center justify-center font-mono font-black text-xs shrink-0">
                    {res.type}
                  </div>
                  <button 
                    onClick={() => toast.success(`Descargando "${res.name}"...`)}
                    className="p-1.5 rounded-lg text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg"
                    title="Descargar archivo"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-zentry-text-1 truncate" title={res.name}>
                    {res.name}
                  </h4>
                  <p className="text-[10px] text-zentry-text-2 mt-1">
                    {res.size} • Por {res.uploadedBy} • {res.date}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* PESTAÑA 3: EQUIPO Y USUARIOS EN LÍNEA */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          
          <div className="flex items-center justify-between bg-zentry-card p-4 rounded-2xl border border-zentry-border">
            <div>
              <h3 className="font-extrabold text-sm text-zentry-text-1">Creadores y Colaboradores</h3>
              <p className="text-xs text-zentry-text-2">
                {collaborators.filter(c => c.isOnline).length} miembros conectados ahora
              </p>
            </div>

            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-4 py-2 bg-zentry-accent hover:opacity-90 active:scale-95 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" /> Invitar Creador
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
            {collaborators.map((collab) => (
              <div 
                key={collab.id}
                className="p-4 bg-zentry-card border border-zentry-border rounded-2xl flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-2xl bg-zentry-bg border border-zentry-border flex items-center justify-center font-extrabold text-zentry-text-1 text-sm">
                      {collab.avatar}
                    </div>
                    {collab.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-zentry-card rounded-full animate-pulse" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-zentry-text-1 flex items-center gap-2">
                      {collab.name}
                      {collab.isOnline && <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.2 rounded-full">En Línea</span>}
                    </h4>
                    <p className="text-xs text-zentry-text-2">{collab.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-[11px] text-zentry-text-2 font-mono">
                    <span className="font-bold text-zentry-text-1">{tasks.filter(t => t.assignedTo === collab.name && t.completed).length}</span> tareas
                  </div>
                  {collab.role !== 'Líder de Proyecto' && (
                    <button
                      onClick={() => handleRemoveMember(collab.id)}
                      className="p-1.5 text-zentry-text-2 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                      title="Quitar colaborador"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* PESTAÑA 4: HISTORIAL Y ACTIVIDAD */}
      {activeTab === 'history' && (
        <div className="bg-zentry-card border border-zentry-border rounded-3xl p-5 sm:p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-zentry-text-1 flex items-center gap-2">
            <History className="w-4 h-4 text-zentry-accent" /> Registro Cronológico del Proyecto
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zentry-border">
            {activities.map((act) => (
              <div key={act.id} className="relative group">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-zentry-card border-2 border-zentry-accent" />
                <div className="bg-zentry-bg border border-zentry-border rounded-2xl p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zentry-text-1">@{act.user}</span>
                    <span className="text-[10px] text-zentry-text-2 font-mono">{act.time}</span>
                  </div>
                  <p className="text-zentry-text-2">
                    {act.action} <span className="font-bold text-zentry-text-1">&quot;{act.target}&quot;</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA 5: NOTAS Y DISCUSIÓN */}
      {activeTab === 'notes' && (
        <div className="bg-zentry-card border border-zentry-border rounded-3xl p-5 sm:p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-zentry-text-1 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-zentry-accent" /> Notas Rápidas y Discusión del Equipo
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            {notes.map((note) => (
              <div key={note.id} className="p-3.5 rounded-2xl bg-zentry-bg border border-zentry-border space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-zentry-text-1">{note.user}</span>
                  <span className="text-[10px] text-zentry-text-2 font-mono">{note.time}</span>
                </div>
                <p className="text-xs text-zentry-text-2 leading-relaxed">{note.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendNote} className="flex gap-2 pt-2 border-t border-zentry-border">
            <input 
              type="text" 
              value={newNoteText}
              onChange={e => setNewNoteText(e.target.value)}
              placeholder="Escribe una nota o actualización para el equipo..."
              className="flex-1 bg-zentry-bg border border-zentry-border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
            />
            <button 
              type="submit" 
              disabled={!newNoteText.trim() || isPending}
              className="px-4 py-2.5 bg-zentry-accent text-white rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>
      )}

      {/* MODAL PARA INVITAR COLABORADOR */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div 
            onClick={() => setIsInviteModalOpen(false)}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-zentry-card border border-zentry-border rounded-3xl w-full max-w-sm overflow-hidden p-6 shadow-2xl space-y-4"
            >
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-zentry-accent/15 border border-zentry-accent/30 text-zentry-accent flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-zentry-text-1">Invitar Creador</h3>
                <p className="text-xs text-zentry-text-2">Ingresa el @username del usuario para sumarlo al equipo.</p>
              </div>

              <form onSubmit={handleInvite} className="space-y-4">
                <input 
                  autoFocus
                  type="text" 
                  value={inviteUsername}
                  onChange={e => setInviteUsername(e.target.value)}
                  placeholder="@usuario_zentry"
                  className="w-full bg-zentry-bg border border-zentry-border rounded-xl px-4 py-3 text-xs sm:text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent"
                />

                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsInviteModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-zentry-border text-xs font-bold text-zentry-text-2 hover:bg-zentry-bg"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-2.5 rounded-xl bg-zentry-accent text-white text-xs font-black hover:opacity-90 shadow-md shadow-zentry-accent/20"
                  >
                    Enviar Invitación
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
