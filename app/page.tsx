"use client"

import { useEffect, useState, useCallback } from "react"
import { useTranslations } from "@/hooks/use-translations"
import { getPokemonDetails, getPokemonList, searchPokemon, getPokemonByRegion } from "@/services/pokemon-service"
import { isPokemonInRegion } from "@/services/regions-service"
import type { PokemonDetails } from "@/types/pokemon"
import { PokemonCard } from "@/components/pokemon-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { RegionFilter } from "@/components/region-filter"
import { ItemsPerPage } from "@/components/items-per-page"
import { useDebounce } from "@/hooks/use-debounce"

export default function Home() {
  const { t } = useTranslations()
  const [pokemonList, setPokemonList] = useState<PokemonDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Função para carregar a lista de Pokémon
  const loadPokemonList = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Se temos uma região selecionada, buscamos Pokémon dessa região
      if (selectedRegion !== null) {
        const { pokemon, total } = await getPokemonByRegion(selectedRegion, itemsPerPage, offset)
        setPokemonList(pokemon)
        setTotalCount(total)
      } else {
        // Caso contrário, buscamos a lista normal
        const listResponse = await getPokemonList(offset, itemsPerPage)
        setTotalCount(listResponse.count)

        const detailsPromises = listResponse.results.map((pokemon) => getPokemonDetails(pokemon.name))
        const pokemonDetails = await Promise.all(detailsPromises)

        setPokemonList(pokemonDetails)
      }
    } catch (err) {
      console.error("Error loading Pokémon:", err)
      setError(t("error"))
      setPokemonList([])
    } finally {
      setIsLoading(false)
    }
  }, [offset, itemsPerPage, selectedRegion, t])

  // Carregar a lista inicial de Pokémon
  useEffect(() => {
    // Resetamos a busca ao mudar a região ou a paginação
    if (debouncedSearchTerm.trim() === "") {
      loadPokemonList()
    }
  }, [loadPokemonList, debouncedSearchTerm])

  // Efeito para busca global
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm.trim()) {
        return
      }

      try {
        setIsSearching(true)
        setError(null)

        const searchResults = await searchPokemon(debouncedSearchTerm)

        // Filtramos por região se necessário
        const regionFiltered =
          selectedRegion === null
            ? searchResults
            : searchResults.filter((pokemon) => isPokemonInRegion(pokemon.id, selectedRegion))

        setPokemonList(regionFiltered)
        setTotalCount(regionFiltered.length) // Atualizamos o total para a paginação
      } catch (error) {
        console.error("Search error:", error)
        setError(t("error"))
        setPokemonList([])
      } finally {
        setIsSearching(false)
      }
    }

    if (debouncedSearchTerm.trim()) {
      performSearch()
    }
  }, [debouncedSearchTerm, selectedRegion, t])

  // Manipuladores de eventos
  const handlePrevious = () => {
    setOffset(Math.max(0, offset - itemsPerPage))
  }

  const handleNext = () => {
    if (offset + itemsPerPage < totalCount) {
      setOffset(offset + itemsPerPage)
    }
  }

  const handleRegionChange = (regionId: number | null) => {
    setSelectedRegion(regionId)
    // Resetamos a paginação ao mudar a região
    setOffset(0)
  }

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    // Resetamos a paginação ao mudar o número de itens por página
    setOffset(0)
  }

  // Determinar se estamos carregando
  const showLoading = isLoading || isSearching

  return (
    <main className="container py-6">
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-1">
          <Input
            type="text"
            placeholder={t("search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="md:col-span-1">
          <RegionFilter selectedRegion={selectedRegion} onRegionChange={handleRegionChange} />
        </div>
        <div className="md:col-span-1">
          <ItemsPerPage value={itemsPerPage} onChange={handleItemsPerPageChange} />
        </div>
      </div>

      {showLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">{t("loading")}</span>
        </div>
      ) : error ? (
        <div className="flex h-64 items-center justify-center text-red-500">{error}</div>
      ) : pokemonList.length === 0 ? (
        <div className="flex h-64 items-center justify-center">{t("noResults")}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {pokemonList.map((pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            ))}
          </div>

          {!searchTerm.trim() && (
            <div className="mt-6 flex justify-center gap-4">
              <Button onClick={handlePrevious} disabled={offset === 0 || showLoading}>
                {t("previous")}
              </Button>
              <Button onClick={handleNext} disabled={offset + itemsPerPage >= totalCount || showLoading}>
                {t("next")}
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  )
}

