"use client"

import { useState } from "react";
import { LayoutGrid, Plus, MoreVertical, FolderGit2, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { CreateProjectModal } from "@/components/projects/create-project-modal";

// Variantes de animación
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export default function ProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  
  // Mock adaptado para incluir iconos dinámicos según el estado
  const projects = [
    { id: 1, title: "Cyber Art Collection", status: "En progreso", color: "bg-blue-500", icon: Clock },
    { id: 2, title: "Zentry UI Kit", status: "Completado", color: "bg-emerald-500", icon: CheckCircle2 },
    { id: 3, title: "Community Dashboard", status: "Revisión", color: "bg-orange-500", icon: AlertCircle },
  ];

  const handleNewProject = () => {
    // Aquí podrías abrir el modal primero si lo deseas: setIsModalOpen(true)
    // O mantener tu simulación actual:
    toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
      loading: 'Preparando entorno de proyecto...',
      success: 'Entorno listo (Simulación de redirección)',
      error: 'Error al crear',
    });
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 transition-colors duration-300"
    >
      {/* ========================================== */}
      {/* HEADER                                     */}
      {/* ========================================== */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zentry-text-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zentry-accent/20 flex items-center justify-center border border-zentry-accent/30">
              <FolderGit2 className="w-5 h-5 text-zentry-accent" />
            </div>
            Proyectos
          </h1>
          <p className="text-sm text-zentry-text-2 mt-2">Gestiona tus colecciones, comisiones y trabajo en equipo.</p>
        </div>
        
        <Button 
          onClick={handleNewProject}
          className="w-full sm:w-auto bg-zentry-accent hover:opacity-90 text-white font-medium px-5 py-6 rounded-xl transition-all shadow-lg shadow-zentry-accent/20"
        >
          <Plus className="w-5 h-5 mr-2" /> Nuevo Proyecto
        </Button>
      </motion.div>

      {/* ========================================== */}
      {/* GRID DE PROYECTOS                          */}
      {/* ========================================== */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => {
          const StatusIcon = p.icon;
          
          return (
            <motion.div 
              key={p.id} 
              variants={itemVariants}
              className="bg-zentry-card border border-zentry-border rounded-3xl p-6 hover:border-zentry-accent/50 hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-zentry-bg border border-zentry-border group-hover:border-zentry-accent/30 rounded-2xl flex items-center justify-center text-zentry-text-1 font-bold text-lg transition-colors">
                  Z{p.id}
                </div>
                <button className="text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg p-2 rounded-full transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1">
                <h3 className="text-zentry-text-1 font-bold text-lg mb-2 group-hover:text-zentry-accent transition-colors">
                  {p.title}
                </h3>
                <p className="text-sm text-zentry-text-2 mb-4 line-clamp-2">
                  Espacio de trabajo dedicado para los recursos y la planificación de este proyecto.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zentry-border mt-auto">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${p.color} shadow-sm`} />
                  <span className="text-zentry-text-2 text-sm font-medium">{p.status}</span>
                </div>
                <StatusIcon className="w-4 h-4 text-zentry-text-2/50" />
              </div>
            </motion.div>
          )
        })}

        {/* Tarjeta para Crear Nuevo (Alternativa visual) */}
        <motion.div 
          variants={itemVariants}
          onClick={() => setIsModalOpen(true)}
          className="bg-zentry-card/50 border-2 border-dashed border-zentry-border hover:border-zentry-accent hover:bg-zentry-accent/5 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[220px] group"
        >
          <div className="w-14 h-14 bg-zentry-bg rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-zentry-text-2 group-hover:text-zentry-accent" />
          </div>
          <h3 className="text-zentry-text-1 font-bold text-lg">Empezar de cero</h3>
          <p className="text-sm text-zentry-text-2 mt-1">Crea un nuevo lienzo de trabajo</p>
        </motion.div>
      </div>

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onProjectCreated={() => console.log("Refrescar lista de la API...")}
      />
    </motion.div>
  );
}