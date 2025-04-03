"use client"

import { useTranslations } from "@/hooks/use-translations"
import { LanguageSwitcher } from "./language-switcher"
import { ThemeSwitcher } from "./theme-switcher"
import { PokeballIcon } from "./pokeball-icon"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, Users, Package } from "lucide-react"

export function Navbar() {
  const { t } = useTranslations()
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "home", icon: null },
    { href: "/favorites", label: "favorites", icon: <Heart className="h-4 w-4 mr-1" /> },
    { href: "/teams", label: "teams", icon: <Users className="h-4 w-4 mr-1" /> },
    { href: "/items", label: "heldItems", icon: <Package className="h-4 w-4 mr-1" /> },
  ]

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <PokeballIcon className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">{t("title")}</h1>
        </Link>

        <nav className="flex-1">
          <ul className="flex space-x-4">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:text-foreground hover:bg-accent"
                    }`}
                >
                  {item.icon}
                  {t(item.label)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}

