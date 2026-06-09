'use client'

import { useState } from 'react'
import { motion, Variants } from 'framer-motion'
import { Users, MessageSquare, ArrowRight, PlusCircle, ShieldCheck } from 'lucide-react'

const MOCK_COMMUNITIES = [
  { id: 1, name: 'Frontend Alquimistas', desc: 'Discutimos UI/UX, animaciones y React. El código también es arte.', members: '12.4k', active: '340 online', color: '#10B981', joined: true },
  { id: 2, name: 'Voxel Builders', desc: 'Creadores de mundos 3D bloque a bloque. Retos semanales.', members: '8.2k', active: '120 online', color: '#F59E0B', joined: false },
  { id: 3, name: 'Productores Lofi', desc: 'Comparte tus beats, busca colaboraciones y feedback honesto.', members: '15.1k', active: '890 online', color: '#8B5CF6', joined: false },
  { id: 4, name: 'Ilustración Oscura', desc: 'Cyberpunk, Gótico y fantasía oscura. Pura tinta y neón.', members: '5.6k', active: '45 online', color: '#EF4444', joined: true },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
}

export default function CommunitiesPage() {
  const [tab, setTab] = useState('discover')

  return (
    <motion.div 
      variants={containerVariants} initial="hidden" animate="show"
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 transition-colors duration-300"
    >
      {/* Header y Creación */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zentry-text-1">Comunidades</h1>
          <p className="text-zentry-text-2 mt-1">Únete a tribus de creadores y expande tu red.</p>
        </div>
        <button className="bg-zentry-accent hover:opacity-90 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-zentry-accent/20 flex items-center gap-2 w-full sm:w-auto justify-center">
          <PlusCircle className="w-5 h-5" /> Crear Comunidad
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex border-b border-zentry-border mb-8">
        <button 
          onClick={() => setTab('discover')}
          className={`pb-4 px-4 text-sm font-medium transition-colors relative ${tab === 'discover' ? 'text-zentry-accent' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
        >
          Descubrir
          {tab === 'discover' && <motion.div layoutId="commTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-zentry-accent" />}
        </button>
        <button 
          onClick={() => setTab('joined')}
          className={`pb-4 px-4 text-sm font-medium transition-colors relative ${tab === 'joined' ? 'text-zentry-accent' : 'text-zentry-text-2 hover:text-zentry-text-1'}`}
        >
          Mis Comunidades
          {tab === 'joined' && <motion.div layoutId="commTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-zentry-accent" />}
        </button>
      </motion.div>

      {/* Lista de Comunidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {MOCK_COMMUNITIES.filter(c => tab === 'discover' || c.joined).map(comm => (
          <motion.div 
            key={comm.id} variants={itemVariants}
            className="bg-zentry-card border border-zentry-border hover:border-zentry-accent/50 rounded-3xl p-5 sm:p-6 transition-all group flex flex-col h-full"
          >
            <div className="flex gap-4 items-start mb-4">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                style={{ background: comm.color + '20', border: `1px solid ${comm.color}40` }}
              >
                <ShieldCheck className="w-7 h-7" style={{ color: comm.color }} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zentry-text-1 group-hover:text-zentry-accent transition-colors leading-tight">{comm.name}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs font-medium text-zentry-text-2 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {comm.members}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-zentry-border" />
                  <span className="text-xs font-medium text-green-500">{comm.active}</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-zentry-text-1/80 leading-relaxed mb-6 flex-1">
              {comm.desc}
            </p>
            
            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-zentry-border">
              {comm.joined ? (
                <button className="flex-1 bg-zentry-bg border border-zentry-border text-zentry-text-1 text-sm font-medium py-2.5 rounded-xl transition-colors hover:bg-zentry-border/50">
                  Entrar al foro
                </button>
              ) : (
                <button className="flex-1 bg-zentry-accent/10 text-zentry-accent hover:bg-zentry-accent hover:text-white text-sm font-medium py-2.5 rounded-xl transition-all">
                  Unirse a la tribu
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}