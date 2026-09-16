"use client"

import { useEffect, useRef } from "react"
import { Megaphone, ExternalLink, Sparkles } from "lucide-react"
import { AdDTO, recordAdImpressionAction } from "@/lib/actions/ads"

export default function AdCard({ ad, variant = "feed" }: { ad: AdDTO; variant?: "feed" | "sidebar" }) {
  const trackedRef = useRef(false)

  useEffect(() => {
    if (trackedRef.current) return
    trackedRef.current = true
    recordAdImpressionAction(ad.id)
  }, [ad.id])

  const isEmojiIcon = ad.icon && ad.icon.length <= 4
  const brandName = ad.brandName || "Marca Aliada"

  if (variant === "sidebar") {
    return (
      <div className="bg-gradient-to-br from-zentry-card via-zentry-card to-zentry-bg/80 border border-zentry-border/80 hover:border-violet-500/40 rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden group transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-violet-400 uppercase tracking-wider bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded-full">
            <Megaphone className="w-3 h-3 text-violet-400" /> Patrocinado por {brandName}
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-zentry-bg border border-zentry-border/80 flex items-center justify-center text-2xl shrink-0 shadow-inner group-hover:scale-105 group-hover:border-violet-500/30 transition-all">
            {isEmojiIcon ? ad.icon : <Sparkles className="w-5 h-5 text-zentry-accent" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-zentry-text-1 truncate group-hover:text-zentry-accent transition-colors">{ad.headline}</p>
            <p className="text-[11px] text-zentry-text-2 line-clamp-2 mt-0.5 leading-relaxed">{ad.body}</p>
          </div>
        </div>
        <a
          href={ad.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 rounded-xl text-xs font-black transition-all shadow-md hover:shadow-violet-500/20"
        >
          <span>{ad.ctaLabel}</span>
          <ExternalLink className="w-3 h-3 opacity-90" />
        </a>
      </div>
    )
  }

  return (
    <div className="break-inside-avoid bg-gradient-to-br from-zentry-card via-zentry-card to-zentry-bg/80 border border-zentry-border/80 hover:border-violet-500/30 rounded-3xl mb-6 overflow-hidden shadow-sm group transition-all duration-300">
      <div className="px-5 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-black text-violet-400 uppercase tracking-wider bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded-full">
          <Megaphone className="w-3 h-3 text-violet-400" /> Patrocinado por {brandName}
        </div>
        <Sparkles className="w-3.5 h-3.5 text-violet-400/80" />
      </div>

      <div className="p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-zentry-bg border border-zentry-border/80 flex items-center justify-center text-3xl shrink-0 shadow-inner group-hover:scale-105 group-hover:border-violet-500/30 transition-all">
          {isEmojiIcon ? ad.icon : <Megaphone className="w-6 h-6 text-zentry-accent" />}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-black text-sm text-zentry-text-1 group-hover:text-zentry-accent transition-colors">{ad.headline}</h4>
          <p className="text-xs text-zentry-text-2 line-clamp-2 mt-1 leading-relaxed">{ad.body}</p>
        </div>
      </div>

      <a
        href={ad.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3.5 border-t border-zentry-border bg-zentry-bg hover:bg-violet-600 hover:text-white text-violet-400 text-xs font-black transition-all"
      >
        <span>{ad.ctaLabel}</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  )
}
