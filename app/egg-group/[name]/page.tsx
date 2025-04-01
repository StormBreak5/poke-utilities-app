"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useTranslations } from "@/hooks/use-translations"
import { getPokemonSpeciesByEggGroup, getEggGroupDetails } from "@/services/egg-groups-service"
import { getPokemonDetails } from "@/services/pokemon-service"
import type { PokemonDetails, EggGroup } from "@/types/pokemon"
import { PokemonCard } from "@/components/pokemon-card"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function EggGroupPage() {
  const { t } = useTranslations()
  const params = useParams()
  const [eggGroup, setEggGroup] = useState<EggGroup | null>(null)
  const [pokemonList, setPokemonList] = useState<PokemonDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    async function loadEggGroupPokemon() {
      if (!params.name) return

      try {
        setIsLoading(true)
        setError(null)

        // Carregar detalhes do grupo de ovos
        const groupDetails = await getEggGroupDetails(params.name as string)
        setEggGroup(groupDetails)

        // Carregar espécies de Pokémon deste grupo
        const species = await getPokemonSpeciesByEggGroup(params.name as string)

        // Limitar a quantidade de Pokémon para não sobrecarregar a API
        const startIndex = (page - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        const paginatedSpecies = species.slice(startIndex, endIndex)

        // Carregar detalhes de cada Pokémon
        const pokemonDetailsPromises = paginatedSpecies.map(async (species) => {
          try {
            return await getPokemonDetails(species.id)
          } catch (error) {
            console.error(`Error fetching details for Pokémon ${species.name}:`, error)
            return null
          }
        })

        const pokemonDetails = await Promise.all(pokemonDetailsPromises)
        setPokemonList(pokemonDetails.filter((pokemon): pokemon is PokemonDetails => pokemon !== null))
      } catch (err) {
        console.error("Error loading egg group Pokémon:", err)
        setError(t("error"))
      } finally {
        setIsLoading(false)
      }
    }

    loadEggGroupPokemon()
  }, [params.name, page, t])

  // Função para formatar o nome com a primeira letra maiúscula
  const formatName = (name: string) => {
    return name
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  }

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const handleNextPage = () => {
    if (eggGroup && page * itemsPerPage < eggGroup.pokemon_species.length) {
      setPage(page + 1)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t("loading")}</span>
      </div>
    )
  }

  if (error || !eggGroup) {
    return (
      <div className="container py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-red-500 mb-4">{error || t("error")}</p>
        <Button onClick={() => window.history.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {formatName(eggGroup.name)} {t("eggGroup")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("totalPokemon")}: {eggGroup.pokemon_species.length}
          </p>
        </div>
        <Link href="/egg-groups" className="mt-2 sm:mt-0">
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("allEggGroups")}
          </Button>
        </Link>
      </div>

      {pokemonList.length === 0 ? (
        <div className="text-center py-8">
          <p>{t("noResults")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {pokemonList.map((pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            ))}
          </div>

          <div className="mt-6 flex justify-center gap-4">
            <Button onClick={handlePrevPage} disabled={page === 1}>
              {t("previous")}
            </Button>
            <span className="flex items-center px-4">
              {t("page")} {page} / {Math.ceil(eggGroup.pokemon_species.length / itemsPerPage)}
            </span>
            <Button onClick={handleNextPage} disabled={page * itemsPerPage >= eggGroup.pokemon_species.length}>
              {t("next")}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

