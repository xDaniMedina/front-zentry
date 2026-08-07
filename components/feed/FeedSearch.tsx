import { Search } from "lucide-react"

export function FeedSearch({ onSearch }: { onSearch: (q: string) => void }) {
  return (
    <div className="relative mb-6 px-4 sm:px-0">
      <Search className="absolute left-7 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zentry-text-2" />
      <input 
        type="text" 
        placeholder="Buscar en Zentry..." 
        onChange={(e) => onSearch(e.target.value)}
        className="w-full bg-zentry-card border border-zentry-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-text-2 transition-colors"
      />
    </div>
  )
}




