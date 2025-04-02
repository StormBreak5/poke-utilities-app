"use client"

import { useTranslations } from "@/hooks/use-translations"
import { LanguageSwitcher } from "./language-switcher"
import { ThemeSwitcher } from "./theme-switcher"
import { PokeballIcon } from "./pokeball-icon"
import { NavLinks } from "./nav-links"
import Link from "next/link"

export function Header() {
  const { t } = useTranslations()

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <PokeballIcon className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">{t("title")}</h1>
        </Link>
        <div className="hidden md:flex">
          <NavLinks />
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}

