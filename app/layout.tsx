import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Zentry — Creator Economy para Artistas',
  description:
    'La plataforma que premia la calidad artística mediante un Algoritmo Ético. Co-crea, colabora y monetiza tu arte.',
  keywords: ['arte', 'creatividad', 'colaboración', 'creator economy', 'artistas'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-white`}
      >
        {children}

        {/* Sistema de notificaciones toast global */}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: 'hsl(0 0% 6%)',
              border: '1px solid hsl(0 0% 14%)',
              color: 'white',
            },
          }}
        />
      </body>
    </html>
  )
}