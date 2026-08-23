"use client"

import * as React from "react"

type ThemeContextType = {
  theme: string
  setTheme: (theme: string) => void
  themes: string[]
  systemTheme?: string
}

const ThemeContext = React.createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
  themes: ["dark", "light", "theme-special", "zentry"],
})

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: string
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  enableColorScheme?: boolean
  disableTransitionOnChange?: boolean
  forcedTheme?: string
  themes?: string[]
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "zentry-theme",
  attribute = "class",
  themes = ["dark", "light", "theme-special", "zentry"],
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) return saved
      } catch {}
    }
    return defaultTheme
  })

  const applyTheme = React.useCallback((t: string) => {
    if (typeof window === "undefined") return
    const root = document.documentElement

    // Remover clases de tema anteriores
    root.classList.remove("light", "dark", "theme-special", "zentry")

    if (t === "theme-special") {
      root.classList.add("theme-special")
    } else if (t === "light") {
      root.classList.add("light")
    } else {
      // dark o zentry por defecto
      root.classList.add("dark")
    }
  }, [])

  React.useEffect(() => {
    applyTheme(theme)
  }, [theme, applyTheme])

  const setTheme = React.useCallback(
    (newTheme: string) => {
      setThemeState(newTheme)
      try {
        localStorage.setItem(storageKey, newTheme)
      } catch {}
      applyTheme(newTheme)
    },
    [storageKey, applyTheme]
  )

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      themes,
      systemTheme: "dark",
    }),
    [theme, setTheme, themes]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => React.useContext(ThemeContext)