"use client"

import { useState, useEffect } from "react"
import { Search, Loader2, X } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

// Este tipo coincidirá con lo que nos devolverá Spring Boot más adelante
type SearchResult = {
  username: string;
  name: string;
  avatarUrl: string;
  discipline: string;
}

export function FeedSearch({ onSearch }: { onSearch: (q: string) => void }) {
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
        const tokenMatch = document.cookie.match(new RegExp('(^| )zentry_token=([^;]+)'));
        const clientToken = tokenMatch ? tokenMatch[2] : null;

        const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, "");
        const response = await fetch(`${apiBase}/api/core/profiles/search?q=${query}`, {
          headers: {
            ...(clientToken ? { 'Authorization': `Bearer ${clientToken}` } : {})
          }
        });

        if (response.ok) {
          const data = await response.json();
          setResults(data);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Error buscando usuarios", error)
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const handleClear = () => {
    setQuery("")
    setResults([])
    onSearch("")
  }

  return (
    <div className="relative mb-6 z-50">
      <div className={`relative flex items-center bg-zentry-card border rounded-2xl px-4 py-3 transition-colors ${isFocused ? 'border-zentry-accent ring-1 ring-zentry-accent/50' : 'border-zentry-border'}`}>
        <Search className="w-5 h-5 text-zentry-text-2 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            onSearch(e.target.value)
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Retardo para permitir el clic en los resultados
          placeholder="Buscar creadores, obras o etiquetas..."
          className="bg-transparent border-none text-sm text-zentry-text-1 w-full focus:outline-none ml-3 placeholder:text-zentry-text-2/70"
        />
        {query && (
          <button onClick={handleClear} className="p-1 hover:bg-zentry-bg rounded-full transition-colors text-zentry-text-2">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* MENÚ DESPLEGABLE DE RESULTADOS */}
      <AnimatePresence>
        {isFocused && query.length >= 2 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-zentry-card border border-zentry-border rounded-2xl shadow-xl overflow-hidden"
          >
            {isSearching ? (
              <div className="flex items-center justify-center p-6 text-zentry-text-2">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : results.length > 0 ? (
              <div className="flex flex-col">
                <div className="px-4 py-2 text-xs font-bold text-zentry-text-2 uppercase tracking-wider bg-zentry-bg/50">
                  Creadores
                </div>
                {results.map((result) => (
                  <Link 
                    key={result.username} 
                    href={`/profile/${result.username}`}
                    className="flex items-center gap-3 p-3 hover:bg-zentry-bg transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-zentry-accent/20 flex items-center justify-center text-sm font-bold text-zentry-accent shrink-0">
                      {result.avatarUrl ? (
                        <img src={result.avatarUrl} alt={result.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        result.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-zentry-text-1">{result.name}</span>
                      <span className="text-xs text-zentry-text-2">@{result.username} • {result.discipline}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-zentry-text-2">
                No se encontraron resultados para &quot;{query}&quot;
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}