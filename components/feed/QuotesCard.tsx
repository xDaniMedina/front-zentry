"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Quote as QuoteIcon, RefreshCw, Copy } from "lucide-react"
import { toast } from "sonner"
import { QUOTES, QUOTE_CATEGORIES, quoteOfTheDay, type Quote, type QuoteCategory } from "@/lib/quotes"
import { cn } from "@/lib/utils"

/** Frases célebres sobre arte, creatividad, motivación y paz (debajo de amigos en línea). */
export default function QuotesCard() {
  const [category, setCategory] = useState<QuoteCategory | "hoy">("hoy")
  const [quote, setQuote] = useState<Quote | null>(null)

  // Se calcula en el cliente para no desajustar la hidratación por la fecha
  useEffect(() => { setQuote(quoteOfTheDay()) }, [])

  const next = (cat: QuoteCategory | "hoy" = category) => {
    if (cat === "hoy") { setQuote(quoteOfTheDay()); return }
    const pool = QUOTES.filter(q => q.category === cat && q.text !== quote?.text)
    setQuote(pool[Math.floor(Math.random() * pool.length)] ?? null)
  }

  const pick = (cat: QuoteCategory | "hoy") => { setCategory(cat); next(cat) }

  return (
    <section className="bg-gradient-to-br from-purple-950/40 via-zentry-card to-indigo-950/30 border border-zentry-border rounded-3xl p-5 space-y-3 shadow-sm" aria-label="Frases célebres">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-zentry-text-1 flex items-center gap-2"><QuoteIcon className="w-4 h-4 text-amber-400" /> Inspiración</h3>
        <div className="flex gap-1">
          {quote && (
            <button onClick={() => { navigator.clipboard.writeText(`“${quote.text}” — ${quote.author}`); toast.success("Frase copiada") }}
              aria-label="Copiar frase" className="p-1.5 rounded-lg text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg cursor-pointer"><Copy className="w-3.5 h-3.5" /></button>
          )}
          <button onClick={() => next(category === "hoy" ? "motivacion" : category)} aria-label="Otra frase"
            className="p-1.5 rounded-lg text-zentry-text-2 hover:text-zentry-text-1 hover:bg-zentry-bg cursor-pointer"><RefreshCw className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        <Chip active={category === "hoy"} onClick={() => pick("hoy")}>✨ Hoy</Chip>
        {QUOTE_CATEGORIES.map(c => <Chip key={c.id} active={category === c.id} onClick={() => pick(c.id)}>{c.emoji} {c.label}</Chip>)}
      </div>

      <div className="min-h-[92px]">
        <AnimatePresence mode="wait">
          {quote && (
            <motion.figure key={quote.text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
              <blockquote className="text-sm text-zentry-text-1 leading-relaxed font-serif italic">“{quote.text}”</blockquote>
              <figcaption className="text-[11px] text-zentry-accent font-bold mt-2">— {quote.author}</figcaption>
            </motion.figure>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={cn("px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer",
        active ? "bg-zentry-accent/15 border-zentry-accent text-zentry-accent" : "bg-zentry-bg border-zentry-border text-zentry-text-2 hover:text-zentry-text-1")}>
      {children}
    </button>
  )
}
