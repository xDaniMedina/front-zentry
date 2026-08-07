"use client"

import { useState } from "react";
import { Users, Shield, Hash, Bell, Info, ArrowLeft, Globe } from "lucide-react";
import Link from "next/link";
// ¡AQUÍ ESTÁ LA MAGIA! Agregamos las llaves { } para importar correctamente
import { FeedCard, PostType } from "@/components/feed/FeedCard"; 

const MOCK_COMMUNITY_POSTS: PostType[] = [
  { id: 101, title: 'Tips para mejorar el contraste', author: 'Luna Muse', handle: '@lunamuse', likes: 145, comments: 23, height: 'h-64', color: 'from-purple-500/20 to-pink-500/20', avatar: 'LM' },
  { id: 102, title: 'Mi primer proyecto en Zentry', author: 'Carlos Dev', handle: '@carlos_dev', likes: 89, comments: 5, height: 'h-80', color: 'from-blue-500/20 to-cyan-500/20', avatar: 'CD' },
];

export default function CommunityDetailClient({ slug }: { slug: string }) {
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  
  // Limpiamos el nombre de la URL para que se vea bonito (ej: ui-ux-designers -> UI UX DESIGNERS)
  const communityName = decodeURIComponent(slug).replace(/-/g, ' ').toUpperCase();

  const toggleLike = (postId: number) => {
    setLikedPosts(prev => prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]);
  };

  return (
    <div className="max-w-5xl mx-auto pb-24">
      {/* Banner de la Comunidad */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-r from-zentry-bg to-zentry-border border-b border-zentry-border">
        <Link href="/communities" className="absolute top-6 left-4 sm:left-8 bg-black/40 p-2 rounded-full text-white hover:bg-black/60 backdrop-blur-md transition-colors z-10">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="px-4 sm:px-8 -mt-12 relative z-10 flex flex-col sm:flex-row gap-6 items-start sm:items-end mb-8">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-zentry-card border-4 border-zentry-bg flex items-center justify-center shadow-xl">
          <Hash className="w-10 h-10 sm:w-12 sm:h-12 text-zentry-accent" />
        </div>
        
        <div className="flex-1 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-zentry-text-1">{communityName}</h1>
              <p className="text-sm text-zentry-text-2 mt-1 flex items-center gap-2">
                <Globe className="w-4 h-4" /> 
              </p>
            </div>
            
            <div className="flex gap-2">
              <button className="bg-zentry-card border border-zentry-border text-zentry-text-1 p-3 rounded-xl hover:bg-zentry-bg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="bg-zentry-text-1 text-zentry-bg font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
                Unido
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Información */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-zentry-card border border-zentry-border rounded-3xl p-5">
            <h3 className="font-bold text-zentry-text-1 flex items-center gap-2 mb-3">
              <Info className="w-5 h-5" /> Acerca de
            </h3>
            <p className="text-sm text-zentry-text-2 leading-relaxed mb-4">
              El espacio oficial para discutir sobre {communityName.toLowerCase()}. Comparte tus dudas, proyectos y conecta con otros profesionales.
            </p>
            <div className="pt-4 border-t border-zentry-border flex items-center gap-2 text-sm text-zentry-text-2">
              <Shield className="w-4 h-4" /> Reglas de la comunidad
            </div>
          </div>
        </div>

        {/* Columna Derecha: El Muro de la Comunidad */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Caja para crear un nuevo post en la comunidad */}
          <div className="bg-zentry-card border border-zentry-border rounded-3xl p-4 flex gap-4 items-center">
            <div className="w-10 h-10 rounded-full bg-zentry-bg border border-zentry-border flex items-center justify-center font-bold text-zentry-text-1">
              DA
            </div>
            <input 
              type="text" 
              placeholder={`Crear publicación en ${communityName}...`}
              className="flex-1 bg-transparent text-sm text-zentry-text-1 focus:outline-none"
            />
          </div>

          {/* Renderizamos las publicaciones usando FeedCard */}
          {MOCK_COMMUNITY_POSTS.map(post => (
            <FeedCard 
              key={post.id}
              post={post}
              isLiked={likedPosts.includes(post.id)}
              onLike={toggleLike}
              isListMode={true} // Forzamos modo lista para las comunidades
            />
          ))}
        </div>

      </div>
    </div>
  )
}

