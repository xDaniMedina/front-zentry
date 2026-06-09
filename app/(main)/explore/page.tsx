'use client'

import { useState } from 'react'
import { motion, Variants } from 'framer-motion'
import { Search, Filter, TrendingUp, Star, Flame } from 'lucide-react'

const CATEGORIES = ['Todo', 'Ilustración', 'Voxel Art', 'Música', 'UI/UX', 'Fotografía']

const MOCK_DISCOVER = [
  { id: 1, title: 'Ciudad Neón', author: '@pixelkid', likes: 342, score: 4.9, category: 'Voxel Art', height: 'h-64' },
  { id: 2, title: 'Beat Nocturno', author: '@novabeats', likes: 128, score: 4.5, category: 'Música', height: 'h-48' },
  { id: 3, title: 'Identidad Visual', author: '@carlos_dev', likes: 89, score: 4.2, category: 'UI/UX', height: 'h-80' },
  { id: 4, title: 'Retrato Cyber', author: '@lunamuse', likes: 512, score: 4.8, category: 'Ilustración', height: 'h-56' },
  { id: 5, title: 'Bosque Low Poly', author: '@marcos_3d', likes: 201, score: 4.6, category: 'Voxel Art', height: 'h-72' },
  { id: 6, title: 'Logo Zentry', author: '@ana.ui', likes: 430, score: 4.9, category: 'UI/UX', height: 'h-64' },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
}

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState('Todo')

  return (
    <motion.div 
      variants={containerVariants} initial="hidden" animate="show"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 transition-colors duration-300"
    >
      {/* Buscador y Filtros */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zentry-text-2" />
          <input 
            type="text" 
            placeholder="Buscar obras, artistas o etiquetas..." 
            className="w-full bg-zentry-card border border-zentry-border focus:border-zentry-accent text-zentry-text-1 placeholder:text-zentry-text-2/60 rounded-2xl pl-12 pr-4 py-3.5 outline-none transition-colors shadow-sm"
          />
        </div>
        <button className="bg-zentry-card border border-zentry-border hover:bg-zentry-bg text-zentry-text-1 px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors font-medium shrink-0">
          <Filter className="w-5 h-5" /> Filtros
        </button>
      </motion.div>

      {/* Categorías (Scroll horizontal en móvil) */}
      <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto hide-scrollbar pb-4 mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${
              activeCategory === cat 
                ? 'bg-zentry-accent text-white border-zentry-accent shadow-md shadow-zentry-accent/20' 
                : 'bg-zentry-card text-zentry-text-2 border-zentry-border hover:border-zentry-accent/50 hover:text-zentry-text-1'
            }`}
          >
            {cat === 'Todo' ? <Flame className="w-4 h-4 inline-block mr-1.5 mb-0.5" /> : null}
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Grid de Exploración (Masonry simulado) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {MOCK_DISCOVER.map((post) => (
          <motion.div 
            key={post.id} variants={itemVariants}
            className={`relative w-full ${post.height} bg-zentry-card border border-zentry-border rounded-3xl overflow-hidden group cursor-pointer`}
          >
            {/* Placeholder de imagen */}
            <div className="absolute inset-0 flex items-center justify-center text-zentry-text-2/30 font-bold text-xl uppercase tracking-widest bg-zentry-bg">
              {post.category}
            </div>

            {/* Overlay interactivo */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
              <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex justify-between items-end mb-2">
                  <h3 className="text-white font-bold text-lg leading-tight">{post.title}</h3>
                  <div className="flex items-center gap-1 bg-zentry-accent px-2 py-1 rounded-lg">
                    <Star className="w-3.5 h-3.5 text-white" fill="currentColor" />
                    <span className="text-white text-xs font-bold">{post.score}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-white/80 text-sm font-medium">{post.author}</p>
                  <p className="text-white/60 text-xs">♡ {post.likes}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}