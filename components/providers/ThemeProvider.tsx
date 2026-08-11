"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Extraemos los tipos de next-themes para evitar errores de TypeScript
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}