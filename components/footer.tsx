"use client"

import { useTranslations } from "@/hooks/use-translations"

export function Footer() {
  const { t } = useTranslations()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4">
      <div className="container flex flex-col items-center justify-center text-sm text-muted-foreground">
        <p>
          &copy; {currentYear} Poke Utilities. {t("allRightsReserved")}
        </p>
        <p className="mt-1">{t("footerDisclaimer")}</p>
      </div>
    </footer>
  )
}

