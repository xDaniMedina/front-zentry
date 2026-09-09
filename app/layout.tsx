import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from "@/context/AuthContext"; // Ajusta la ruta de importación si es necesario
import './globals.css'

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
    <html lang='es' suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider attribute='class' defaultTheme='zentry' enableSystem={false} enableColorScheme={false}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

