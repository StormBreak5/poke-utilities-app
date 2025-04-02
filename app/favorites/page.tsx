"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "@/hooks/use-translations"
import { getFavorites } from "@/actions/favorites"
import { getPokemonDetails } from "@/services/pokemon-service"
import type { PokemonDetails } from "@/types/pokemon"
import { PokemonCardWithFavorite } from "@/components/pokemon-card-with-favorite"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function FavoritesPage() {
  const { t } = useTranslations()
  const [pokemonList, setPokemonList] = useState<PokemonDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadFavorites() {
      try {
        setIsLoading(true)
        setError(null)

        const { favorites, error } = await getFavorites()

        if (error) {
          setError(error)
          return
        }

        if (!favorites || favorites.length === 0) {
          setPokemonList([])
          return
        }

        // Load details for each favorite Pokémon
        const detailsPromises = favorites.map((id) =>
          getPokemonDetails(id).catch((err) => {
            console.error(`Error fetching Pokémon ${id}:`, err)
            return null
          }),
        )

        const pokemonDetails = await Promise.all(detailsPromises)
        setPokemonList(pokemonDetails.filter((p): p is PokemonDetails => p !== null))
      } catch (err) {
        console.error("Error loading favorites:", err)
        setError(t("error"))
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [t])

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
      <div className="container py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.history.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("favorites")}</h1>
        <Link href="/">
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("backToList")}
          </Button>
        </Link>
      </div>

      {pokemonList.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg mb-4">{t("noFavorites")}</p>
          <Link href="/">
            <Button>{t("browsePokemon")}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {pokemonList.map((pokemon) => (
            <PokemonCardWithFavorite key={pokemon.id} pokemon={pokemon} />
          ))}
        </div>
      )}
    </div>
  )
}

