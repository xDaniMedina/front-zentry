"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Megaphone } from "lucide-react"
import { AdDTO, recordAdImpressionAction } from "@/lib/actions/ads"

export default function AdCard({ ad, variant = "feed" }: { ad: AdDTO; variant?: "feed" | "sidebar" }) {
  const trackedRef = useRef(false)

  useEffect(() => {
    if (trackedRef.current) return
    trackedRef.current = true;
    recordAdImpressionAction(ad.id)
  }, [ad.id])

  const isEmojiIcon = ad.icon.length <= 4;

  if (variant === "sidebar") {
    return (
      <div className="bg-zentry-card border border-zentry-border rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zentry-text-2 uppercase tracking-wider">
          <Megaphone className="w-3 h-3" /> Patrocinado
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zentry-bg border border-zentry-border flex items-center justify-center text-xl shrink-0">
            {isEmojiIcon ? ad.icon : <Megaphone className="w-5 h-5 text-zentry-accent" />}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-zentry-text-1 truncate">{ad.headline}</p>
            <p className="text-[11px] text-zentry-text-2 truncate">{ad.body}</p>
          </div>
        </div>
        <Link
          href={ad.linkUrl}
          className="block text-center w-full py-2 bg-zentry-accent/10 text-zentry-accent hover:bg-zentry-accent hover:text-white rounded-xl text-xs font-bold transition-colors"
        >
          {ad.ctaLabel}
        </Link>
      </div>
    )
  }

  return (
    <div className="break-inside-avoid bg-zentry-card border border-zentry-border rounded-3xl mb-6 overflow-hidden shadow-sm">
      <div className="px-4 pt-3 flex items-center gap-1.5 text-[10px] font-bold text-zentry-text-2 uppercase tracking-wider">
        <Megaphone className="w-3 h-3" /> Patrocinado
      </div>
      <div className="p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-zentry-bg border border-zentry-border flex items-center justify-center text-3xl shrink-0">
          {isEmojiIcon ? ad.icon : <Megaphone className="w-6 h-6 text-zentry-accent" />}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-black text-sm text-zentry-text-1 truncate">{ad.headline}</h4>
          <p className="text-xs text-zentry-text-2 line-clamp-2">{ad.body}</p>
        </div>
      </div>
      <Link
        href={ad.linkUrl}
        className="block text-center w-full py-3 border-t border-zentry-border bg-zentry-bg hover:bg-zentry-accent hover:text-white text-zentry-accent text-xs font-black transition-colors"
      >
        {ad.ctaLabel}
      </Link>
    </div>
  )
}
