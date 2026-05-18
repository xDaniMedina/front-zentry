'use client'

import { FeedProvider } from '@/lib/context/FeedContext'

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return (
    <FeedProvider>
      <div>{children}</div>
    </FeedProvider>
  )
}