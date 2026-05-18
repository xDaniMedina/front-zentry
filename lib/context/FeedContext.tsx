'use client'

import { createContext, useContext, useState } from 'react'

interface FeedContextType {
  activeTab:      'foryou' | 'following' | 'trending'
  activeTrend:    string | null
  setActiveTab:   (tab: 'foryou' | 'following' | 'trending') => void
  setActiveTrend: (trend: string | null) => void
}

const FeedContext = createContext<FeedContextType>({
  activeTab:      'foryou',
  activeTrend:    null,
  setActiveTab:   () => {},
  setActiveTrend: () => {},
})

export function FeedProvider({ children }: { children: React.ReactNode }) {
  const [activeTab,   setActiveTab]   = useState<'foryou' | 'following' | 'trending'>('foryou')
  const [activeTrend, setActiveTrend] = useState<string | null>(null)

  const handleSetActiveTrend = (trend: string | null) => {
    setActiveTrend(trend)
    if (trend !== null) {
      setActiveTab('trending')
    }
  }

  return (
    <FeedContext.Provider value={{
      activeTab,
      activeTrend,
      setActiveTab,
      setActiveTrend: handleSetActiveTrend,
    }}>
      {children}
    </FeedContext.Provider>
  )
}

export function useFeed() {
  return useContext(FeedContext)
}