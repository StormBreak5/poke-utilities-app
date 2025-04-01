"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Language = "pt" | "en"
type Theme = "light" | "dark"

interface AppContextType {
  language: Language
  setLanguage: (language: Language) => void
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")
  const [theme, setTheme] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)

  // Inicializa o tema com base na preferência do sistema
  useEffect(() => {
    setMounted(true)

    const savedTheme = localStorage.getItem("theme") as Theme
    const savedLanguage = localStorage.getItem("language") as Language

    if (savedTheme) {
      setTheme(savedTheme)
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark")
    }

    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Atualiza a classe do documento e salva a preferência
  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement

    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }

    localStorage.setItem("theme", theme)
  }, [theme, mounted])

  // Salva a preferência de idioma
  useEffect(() => {
    if (!mounted) return

    localStorage.setItem("language", language)
  }, [language, mounted])

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <AppContext.Provider value={{ language, setLanguage, theme, setTheme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

