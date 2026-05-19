"use client"
import { useState } from "react";
import { toast } from "sonner";
import { Users, Shield, Hash, Bell, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeedCard from "@/components/feed/FeedCard"; // Reutilizamos tu componente estrella

export default function CommunityDetailPage({ params }: { params: { slug: string } }) {
  const communityName = decodeURIComponent(params.slug).replace(/-/g, ' ').toUpperCase();
  const [isJoined, setIsJoined] = useState(false);

  const handleJoin = () => {
    if (isJoined) {
      setIsJoined(false);
      toast.info("Has abandonado la comunidad");
    } else {
      setIsJoined(true);
      toast.success("¡Te has unido a la comunidad con éxito!");
    }
  };

  // Mock exclusivo de posts para esta comunidad
  const COMMUNITY_POSTS = [
    {
      id: 101,
      author: { 
        username: '@admin_luis', 
        initials: 'AL', 
        color: '#8B5CF6', 
        discipline: 'Community Manager', 
        time: 'hace 1h' 
      },
      content: { 
        text: '¡Bienvenidos a todos los nuevos miembros! Recuerden que este fin de semana tenemos hackathon interno. 🚀', 
        tags: ['#Anuncio', '#Hackathon', '#Zentry'], 
        qualityScore: 100, 
        likes: 56, 
        comments: 12 
      },
      isFollowing: true
    },
    {
      id: 102,
      author: { 
        username: '@dev_rookie', 
        initials: 'DR', 
        color: '#3B82F6', 
        discipline: 'Frontend', 
        time: 'hace 3h' 
      },
      content: { 
        text: '¿Alguien tiene recomendaciones para manejar estados globales? Estoy dudando entre Context o Zustand para un proyecto de la universidad.', 
        tags: ['#Pregunta', '#React', '#Frontend'], 
        qualityScore: 78, 
        likes: 14, 
        comments: 8 
      },
      isFollowing: false
    }
  ];

  return (
    <div className="max-w-5xl mx-auto pb-10">
      
      {/* Banner de la Comunidad */}
      <div className="h-48 md:h-64 w-full bg-gradient-to-r from-violet-600 to-indigo-800 relative rounded-b-3xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
      </div>

      <div className="px-8 relative -mt-16 sm:-mt-24">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end justify-between">
          
          {/* Avatar e Info Principal */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-zinc-950 border-4 border-zinc-900 rounded-3xl flex items-center justify-center shadow-xl">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 text-violet-400" />
            </div>
            <div className="mb-2">
              <h1 className="text-3xl font-black text-white">{communityName}</h1>
              <p className="text-zinc-400 font-medium flex items-center gap-2 mt-1">
                <Hash className="w-4 h-4" /> zentry-devs • 892 miembros
              </p>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" size="icon" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              <Bell className="w-4 h-4" />
            </Button>
              <Button 
    onClick={handleJoin}
    variant={isJoined ? "outline" : "default"}
    className={isJoined 
      ? "flex-1 sm:flex-none border-zinc-700 text-white hover:bg-zinc-800 px-8"
      : "flex-1 sm:flex-none bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8"
    }
  >
    {isJoined ? "Abandondar" : "Unirse"}
  </Button>

          </div>
        </div>

        {/* Layout Principal de la Comunidad (Dos columnas) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 mt-10">
          
          {/* Columna Izquierda: Feed de la Comunidad */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h2 className="text-xl font-bold text-white">Últimas Publicaciones</h2>
            </div>
            
            <div className="flex flex-col gap-4">
              {COMMUNITY_POSTS.map(post => (
                <FeedCard 
                  key={post.id} 
                  author={post.author} 
                  content={post.content} 
                  isFollowing={post.isFollowing} 
                />
              ))}
            </div>
          </div>

          {/* Columna Derecha: Info Lateral (About) */}
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-violet-400" /> Acerca de
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                El espacio oficial para desarrolladores, creadores y artistas dentro de Zentry. Comparte tus avances, pide feedback y encuentra colaboradores para tus próximos proyectos.
              </p>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Administrada por</p>
                    <p className="text-zinc-500 text-xs">@ZentryCore</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}