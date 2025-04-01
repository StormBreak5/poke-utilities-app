"use client"

import { useAppContext } from "@/contexts/app-context"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useAppContext()
  const { t } = useTranslations()

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      {theme === "light" ? (
        <>
          <Moon className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("darkMode")}</span>
        </>
      ) : (
        <>
          <Sun className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("lightMode")}</span>
        </>
      )}
    </Button>
  )
}

