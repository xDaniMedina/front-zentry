"use client"

import { useState, useEffect } from "react"
import { Search, Loader2, X, TrendingUp, Hash } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { searchProfilesAction } from "@/lib/actions/profile"

type SearchResult = {
  username: string;
  name: string;
  avatarUrl?: string;
  discipline?: string;
}

const DYNAMIC_TRENDS = [
  { tag: "#Arte3D", label: "Arte 3D & VFX", count: "1.2k obras" },
  { tag: "#LoFiMusic", label: "Producción Lo-Fi", count: "940 temas" },
  { tag: "#Cyberpunk", label: "Estética Neón", count: "2.4k posts" },
  { tag: "#MotionGraphics", label: "Animación 60fps", count: "780 reels" },
  { tag: "#Ilustracion", label: "Concept Art", count: "3.1k obras" },
  { tag: "#CreatorEconomy", label: "Web3 & Arte Ético", count: "510 posts" },
];

export function FeedSearch({ 
  onSearch, 
  activeTag, 
  onSelectTag 
}: { 
  onSearch: (q: string) => void;
  activeTag?: string;
  onSelectTag?: (tag: string) => void;
}) {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) {
      const clearTimer = setTimeout(() => setResults([]), 0);
      return () => clearTimeout(clearTimer);
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true)
      try {
        const result = await searchProfilesAction(query);
        setResults(result.success ? result.data : []);
      } catch (error) {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const handleClear = () => {
    setQuery("")
    setResults([])
    onSearch("")
  }

  const handleTagClick = (tag: string) => {
    if (activeTag === tag) {
      onSelectTag?.("")
      onSearch("")
    } else {
      onSelectTag?.(tag)
      onSearch(tag)
    }
  }

  return (
    <div className="relative mb-4 sm:mb-6 z-40 space-y-3">
      {/* Barra de Búsqueda */}
      <div className={`relative flex items-center bg-zentry-card border rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 transition-all ${isFocused ? 'border-zentry-accent ring-1 ring-zentry-accent/50 shadow-lg' : 'border-zentry-border'}`}>
        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-zentry-text-2 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            onSearch(e.target.value)
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Buscar creadores, obras, música, videos o #tags..."
          className="bg-transparent border-none text-xs sm:text-sm text-zentry-text-1 w-full focus:outline-none ml-2 sm:ml-3 placeholder:text-zentry-text-2/70"
          suppressHydrationWarning
        />
        {query && (
          <button onClick={handleClear} className="p-1 hover:bg-zentry-bg rounded-full transition-colors text-zentry-text-2 cursor-pointer">
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
      </div>

      {/* Chips de Tendencias Dinámicas en Tiempo Real */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 text-xs">
        <span className="text-[10px] uppercase font-black text-amber-400 flex items-center gap-1 shrink-0 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-xl">
          <TrendingUp className="w-3 h-3" /> Tendencias
        </span>
        
        {DYNAMIC_TRENDS.map(t => {
          const isSelected = activeTag === t.tag || query.includes(t.tag);
          return (
            <button
              key={t.tag}
              onClick={() => handleTagClick(t.tag)}
              className={`px-3 py-1 rounded-xl font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-zentry-accent text-white shadow-md shadow-zentry-accent/30 scale-105'
                  : 'bg-zentry-card hover:bg-zentry-bg border border-zentry-border text-zentry-text-2 hover:text-zentry-text-1'
              }`}
            >
              <Hash className="w-3 h-3 text-zentry-accent" />
              <span>{t.tag.replace('#', '')}</span>
              <span className="text-[9px] opacity-60 font-mono hidden sm:inline">({t.count})</span>
            </button>
          );
        })}
      </div>

      {/* Menú Desplegable de Resultados */}
      <AnimatePresence>
        {isFocused && query.length >= 2 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-zentry-card border border-zentry-border rounded-2xl shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto z-50 divide-y divide-zentry-border/50"
          >
            {isSearching ? (
              <div className="flex items-center justify-center p-6 text-zentry-text-2 gap-2 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-zentry-accent" /> Buscando en la red creativa...
              </div>
            ) : results.length === 0 ? (
              <div className="p-5 text-center text-xs text-zentry-text-2">
                No se encontraron creadores para &ldquo;<span className="text-zentry-text-1 font-bold">{query}</span>&rdquo;
              </div>
            ) : (
              results.map((res) => (
                <Link
                  key={res.username}
                  href={`/profile/${encodeURIComponent(res.username)}`}
                  className="flex items-center justify-between p-3.5 hover:bg-zentry-bg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-950/50 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-300 group-hover:border-zentry-accent transition-colors overflow-hidden">
                      {res.name?.slice(0, 2).toUpperCase() || res.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-zentry-text-1 group-hover:text-zentry-accent transition-colors">
                        {res.name}
                      </h4>
                      <p className="text-[11px] text-zentry-text-2">@{res.username}</p>
                    </div>
                  </div>
                  {res.discipline && (
                    <span className="text-[10px] font-bold text-zentry-accent bg-zentry-accent/10 px-2 py-0.5 rounded-full border border-zentry-accent/20">
                      {res.discipline}
                    </span>
                  )}
                </Link>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}