"use client"

import { useTranslations } from "@/hooks/use-translations"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, Users } from "lucide-react"

export function NavLinks() {
  const { t } = useTranslations()
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/favorites"
        className={`flex items-center gap-1 hover:text-primary ${
          pathname === "/favorites" ? "text-primary font-medium" : ""
        }`}
      >
        <Heart className="h-4 w-4" />
        <span>{t("favorites")}</span>
      </Link>
      <Link
        href="/teams"
        className={`flex items-center gap-1 hover:text-primary ${
          pathname === "/teams" ? "text-primary font-medium" : ""
        }`}
      >
        <Users className="h-4 w-4" />
        <span>{t("teams")}</span>
      </Link>
    </div>
  )
}

