"use client"

import { useState } from "react";
import { Award, Grid, Shield, Trophy, MapPin, Link as LinkIcon, Calendar } from "lucide-react";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export type ProfileData = {
  name: string;
  username: string;
  bio: string;
  location: string;
  joinedDate: string;
  followers: number;
  following: number;
  achievements: Achievement[];
}

const FALLBACK_PROFILE: ProfileData = {
  name: "Daniel Artesano",
  username: "danielarte",
  bio: "Ingeniero en Sistemas e Ilustrador. Construyendo el futuro de la web y el lienzo digital.",
  location: "Puebla, México",
  joinedDate: "Se unió en Ene 2024",
  followers: 342,
  following: 89,
  achievements: [
    { id: '1', title: 'Pionero', description: 'De los primeros 1,000 usuarios en Zentry', icon: '🌟', unlockedAt: '12 Ene 2024' },
    { id: '2', title: 'Ventas 10k', description: 'Alcanzó 10,000 ZC en ventas', icon: '💰', unlockedAt: '05 Abr 2024' },
    { id: '3', title: 'Comunidad', description: 'Creó una comunidad con más de 100 miembros', icon: '🏰', unlockedAt: '20 May 2024' },
  ]
};

export default function ProfileClient({ initialData, username }: { initialData: ProfileData | null, username: string }) {
  const [profile] = useState<ProfileData>(initialData || { ...FALLBACK_PROFILE, username });
  const [activeTab, setActiveTab] = useState<'posts' | 'achievements'>('posts');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24">
      {/* Banner y Avatar */}
      <div className="relative mb-16">
        <div className="w-full h-32 sm:h-48 bg-zentry-card border border-zentry-border rounded-3xl overflow-hidden">
          {/* Aquí iría un <img> del banner */}
          <div className="w-full h-full bg-gradient-to-r from-zentry-border to-zentry-bg" />
        </div>
        <div className="absolute -bottom-10 left-6 sm:left-10">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-zentry-bg bg-zentry-card flex items-center justify-center text-3xl font-bold text-zentry-text-1">
            {profile.name.charAt(0)}
          </div>
        </div>
      </div>

      {/* Info del Perfil */}
      <div className="px-2 sm:px-4 mb-8">
        <h1 className="text-2xl font-bold text-zentry-text-1">{profile.name}</h1>
        <p className="text-zentry-text-2 mb-4">@{profile.username}</p>
        
        <p className="text-sm text-zentry-text-1 mb-4 max-w-2xl leading-relaxed">
          {profile.bio}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs text-zentry-text-2 mb-6">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {profile.location}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {profile.joinedDate}</span>
        </div>

        <div className="flex gap-4">
          <p className="text-sm"><span className="font-bold text-zentry-text-1">{profile.following}</span> <span className="text-zentry-text-2">Siguiendo</span></p>
          <p className="text-sm"><span className="font-bold text-zentry-text-1">{profile.followers}</span> <span className="text-zentry-text-2">Seguidores</span></p>
        </div>
      </div>

      {/* Pestañas (Posts vs Logros) */}
      <div className="flex gap-6 border-b border-zentry-border mb-6 px-2 sm:px-4">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`pb-3 flex items-center gap-2 text-sm font-medium transition-colors relative ${activeTab === 'posts' ? 'text-zentry-text-1' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
        >
          <Grid className="w-4 h-4" /> Obras
          {activeTab === 'posts' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zentry-text-1 rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('achievements')}
          className={`pb-3 flex items-center gap-2 text-sm font-medium transition-colors relative ${activeTab === 'achievements' ? 'text-zentry-text-1' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
        >
          <Trophy className="w-4 h-4" /> Logros
          {activeTab === 'achievements' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zentry-text-1 rounded-t-full" />}
        </button>
      </div>

      {/* Contenido Dinámico */}
      <div className="px-2 sm:px-4">
        {activeTab === 'posts' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Grid de publicaciones vacías de ejemplo */}
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-square bg-zentry-card border border-zentry-border rounded-2xl hover:opacity-80 transition-opacity cursor-pointer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.achievements.map(ach => (
              <div key={ach.id} className="bg-zentry-card border border-zentry-border rounded-2xl p-4 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-zentry-bg border border-zentry-border flex items-center justify-center text-2xl shrink-0">
                  {ach.icon}
                </div>
                <div>
                  <h4 className="font-bold text-zentry-text-1 text-sm">{ach.title}</h4>
                  <p className="text-xs text-zentry-text-2 mt-1 leading-tight">{ach.description}</p>
                  <p className="text-[10px] text-zentry-text-2/60 mt-2">Desbloqueado: {ach.unlockedAt}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


