"use client"

import { Search, Hash, Flame } from "lucide-react"

export default function ExploreClient() {
  const categories = ["Arte Digital", "UI/UX", "Ilustración", "Fotografía", "Modelado 3D"]

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Buscador Gigante */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-zentry-text-2" />
        <input 
          type="text" 
          placeholder="Busca artistas, obras o tags..." 
          className="w-full bg-zentry-card border-2 border-zentry-border rounded-2xl py-4 pl-14 pr-6 text-lg text-zentry-text-1 focus:outline-none focus:border-zentry-text-2 transition-colors shadow-lg"
        />
      </div>

      {/* Categorías */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar mb-8 pb-2">
        {categories.map((cat, i) => (
          <button key={i} className="whitespace-nowrap px-4 py-2 bg-zentry-card border border-zentry-border rounded-full text-sm font-medium text-zentry-text-1 hover:border-zentry-text-2 transition-all">
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de Tendencias */}
      <div>
        <h2 className="text-xl font-bold text-zentry-text-1 mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" /> Tendencias Globales
        </h2>
        {/* Un grid tipo Masonry simulado */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className={`bg-zentry-card border border-zentry-border rounded-2xl ${i % 3 === 0 ? 'h-64' : 'h-48'} hover:opacity-80 transition-opacity cursor-pointer`} />
          ))}
        </div>
      </div>
    </div>
  )
}
