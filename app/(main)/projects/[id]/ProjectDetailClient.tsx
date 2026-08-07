"use client"

import { ArrowLeft, Plus, CheckCircle2, Circle, MoreVertical, Files, History, Users, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation"; // <-- 1. Importamos el Router de Next.js
import { useState, useRef } from "react";

type Task = { id: string; title: string; completed: boolean }
type Activity = { id: string; user: string; action: string; time: string }
type FileItem = { id: string; name: string; type: string; color: string }

export default function ProjectDetailClient({ projectId }: { projectId: string }) {
  const router = useRouter(); // <-- 2. Inicializamos el Router

  // Estados de Tareas
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Diseñar la pantalla principal', completed: true },
    { id: '2', title: 'Conectar endpoint de usuarios en FastAPI', completed: false },
    { id: '3', title: 'Ajustar contraste en modo oscuro', completed: false },
  ]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Estados de Archivos
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileItem[]>([
    { id: 'f1', name: 'Especificaciones.pdf', type: 'PDF', color: 'bg-blue-500/20 text-blue-500' },
    { id: 'f2', name: 'Bocetos_v2.fig', type: 'FIG', color: 'bg-pink-500/20 text-pink-500' }
  ]);

  // Mocks de Colaboradores y Actividad
  const collaborators = ['DA', 'LM', 'CD']; 
  const activities: Activity[] = [
    { id: 'a1', user: 'Carlos Dev', action: 'completó una tarea', time: 'Hace 10 min' },
    { id: 'a2', user: 'Luna Muse', action: 'subió Bocetos_v2.fig', time: 'Hace 2 horas' },
    { id: 'a3', user: 'Tú', action: 'creaste el proyecto', time: 'Ayer' },
  ];

  const progress = Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) || 0;

  // Manejadores
  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), title: newTaskTitle, completed: false }]);
    setNewTaskTitle("");
    setIsAddingTask(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      const ext = uploadedFile.name.split('.').pop()?.toUpperCase() || 'FILE';
      setFiles([...files, { id: Date.now().toString(), name: uploadedFile.name, type: ext.substring(0,3), color: 'bg-zentry-accent/20 text-zentry-accent' }]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-24">
      
      {/* 3. CAMBIAMOS EL <Link> POR UN <button> CON ROUTER */}
      <button 
        onClick={() => router.push('/projects')} 
        className="inline-flex items-center gap-2 text-sm text-zentry-text-2 hover:text-zentry-text-1 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a proyectos
      </button>

      <div className="bg-zentry-card border border-zentry-border rounded-3xl p-6 sm:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zentry-text-1 mb-2 flex items-center gap-3">
            Rediseño Zentry UI
            <span className="text-xs bg-green-500/20 text-green-500 px-3 py-1 rounded-full font-medium">Activo</span>
          </h1>
          <p className="text-sm text-zentry-text-2 max-w-xl">ID del proyecto: {projectId} • Fase de Desarrollo</p>
        </div>
        <div className="w-full md:w-64">
          <div className="flex justify-between text-xs font-medium mb-2">
            <span className="text-zentry-text-2">Progreso General</span>
            <span className="text-zentry-text-1">{progress}%</span>
          </div>
          <div className="w-full bg-zentry-bg rounded-full h-2 overflow-hidden">
            <div className="bg-zentry-accent h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA PRINCIPAL: Tareas */}
        <div className="lg:col-span-2 bg-zentry-card border border-zentry-border rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-zentry-text-1 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-zentry-text-2" /> Tareas del Proyecto
            </h3>
            <button onClick={() => setIsAddingTask(!isAddingTask)} className="text-zentry-accent bg-zentry-accent/10 p-2 rounded-lg hover:bg-zentry-accent/20 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {tasks.map(task => (
              <div key={task.id} onClick={() => toggleTask(task.id)} className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${task.completed ? 'bg-zentry-bg border-transparent opacity-60' : 'bg-zentry-card border-zentry-border hover:border-zentry-text-2'}`}>
                {task.completed ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-zentry-text-2" />}
                <span className={`text-sm flex-1 ${task.completed ? 'line-through text-zentry-text-2' : 'text-zentry-text-1'}`}>{task.title}</span>
                <MoreVertical className="w-4 h-4 text-zentry-text-2" />
              </div>
            ))}

            {/* Input para nueva tarea */}
            {isAddingTask && (
              <form onSubmit={handleAddTask} className="flex items-center gap-3 p-2 pl-4 rounded-2xl border border-zentry-accent bg-zentry-bg">
                <Circle className="w-5 h-5 text-zentry-text-2/50" />
                <input autoFocus type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Escribe la tarea y presiona Enter..." className="flex-1 bg-transparent text-sm text-zentry-text-1 focus:outline-none" />
              </form>
            )}
          </div>
        </div>

        {/* COLUMNA SECUNDARIA: Colaboradores, Archivos y Actividad */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Colaboradores en línea */}
          <div className="bg-zentry-card border border-zentry-border rounded-3xl p-6">
            <h3 className="font-bold text-zentry-text-1 flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-zentry-text-2" /> En línea
            </h3>
            <div className="flex flex-wrap gap-2">
              {collaborators.map((collab, i) => (
                <div key={i} className="relative group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-zentry-bg border border-zentry-border flex items-center justify-center font-bold text-zentry-text-1 text-sm">{collab}</div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-zentry-card rounded-full animate-pulse" />
                </div>
              ))}
              <button className="w-10 h-10 rounded-full border border-dashed border-zentry-border flex items-center justify-center text-zentry-text-2 hover:text-zentry-text-1 hover:border-zentry-text-1 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Archivos */}
          <div className="bg-zentry-card border border-zentry-border rounded-3xl p-6">
            <h3 className="font-bold text-zentry-text-1 flex items-center gap-2 mb-4">
              <Files className="w-4 h-4 text-zentry-text-2" /> Recursos
            </h3>
            <div className="flex flex-col gap-3">
              {files.map(file => (
                <div key={file.id} className="p-3 rounded-xl bg-zentry-bg border border-zentry-border flex items-center gap-3 text-sm text-zentry-text-1 hover:border-zentry-text-2 cursor-pointer transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] ${file.color}`}>{file.type}</div>
                  <span className="truncate flex-1">{file.name}</span>
                </div>
              ))}
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 mt-2 border-2 border-dashed border-zentry-border rounded-xl text-sm font-medium text-zentry-text-2 hover:border-zentry-accent hover:text-zentry-accent transition-colors flex items-center justify-center gap-2">
                <UploadCloud className="w-4 h-4" /> Subir archivo
              </button>
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-zentry-card border border-zentry-border rounded-3xl p-6">
            <h3 className="font-bold text-zentry-text-1 flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-zentry-text-2" /> Historial
            </h3>
            <div className="flex flex-col gap-4 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-zentry-border">
              {activities.map((act) => (
                <div key={act.id} className="flex gap-3 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-zentry-bg border-2 border-zentry-card flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-zentry-text-2" />
                  </div>
                  <div>
                    <p className="text-sm text-zentry-text-1">
                      <span className="font-bold">{act.user}</span> {act.action}
                    </p>
                    <p className="text-xs text-zentry-text-2 mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
