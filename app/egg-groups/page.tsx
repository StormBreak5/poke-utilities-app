"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "@/hooks/use-translations"
import { getAllEggGroups } from "@/services/egg-groups-service"
import type { EggGroup } from "@/types/pokemon"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function EggGroupsPage() {
  const { t } = useTranslations()
  const [eggGroups, setEggGroups] = useState<EggGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadEggGroups() {
      try {
        setIsLoading(true)
        setError(null)

        const groups = await getAllEggGroups()
        setEggGroups(groups)
      } catch (err) {
        console.error("Error loading egg groups:", err)
        setError(t("error"))
      } finally {
        setIsLoading(false)
      }
    }

    loadEggGroups()
  }, [t])

  // Função para formatar o nome com a primeira letra maiúscula
  const formatName = (name: string) => {
    return name
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t("loading")}</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[50vh]">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">{t("eggGroups")}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {eggGroups.map((group) => (
          <Link key={group.id} href={`/egg-group/${group.name}`}>
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-center">{formatName(group.name)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  {t("pokemonCount")}: {group.pokemon_species.length}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

