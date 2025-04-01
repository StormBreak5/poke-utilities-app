"use client"

import { useAppContext } from "@/contexts/app-context"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const { language, setLanguage } = useAppContext()
  const { t } = useTranslations()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage("en")} className={language === "en" ? "bg-accent" : ""}>
          {t("english")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("pt")} className={language === "pt" ? "bg-accent" : ""}>
          {t("portuguese")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

