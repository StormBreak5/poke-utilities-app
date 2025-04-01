"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "@/hooks/use-translations"
import { getPokemonDetails, getPokemonSpecies, getEvolutionChain, getMoveDetails } from "@/services/pokemon-service"
import type { PokemonDetails, PokemonSpecies, EvolutionChain, MoveWithType } from "@/types/pokemon"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PokemonDetailsPage() {
  const { t } = useTranslations()
  const { language } = useAppContext()
  const params = useParams()
  const router = useRouter()
  const [pokemon, setPokemon] = useState<PokemonDetails | null>(null)
  const [species, setSpecies] = useState<PokemonSpecies | null>(null)
  const [evolutionChain, setEvolutionChain] = useState<EvolutionChain | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<string>("all")
  const [availableGames, setAvailableGames] = useState<string[]>([])
  const [movesWithTypes, setMovesWithTypes] = useState<Record<string, MoveWithType[]>>({})
  const [isLoadingMoves, setIsLoadingMoves] = useState(false)

  useEffect(() => {
    async function loadPokemonDetails() {
      try {
        setIsLoading(true)
        setError(null)

        // Carregar detalhes do Pokémon
        const pokemonData = await getPokemonDetails(params.id as string)
        setPokemon(pokemonData)

        // Extrair jogos disponíveis para os movimentos
        const games = new Set<string>()
        pokemonData.moves.forEach((moveData) => {
          moveData.version_group_details.forEach((detail) => {
            games.add(detail.version_group.name)
          })
        })
        setAvailableGames(Array.from(games).sort())

        // Carregar espécie do Pokémon
        const speciesData = await getPokemonSpecies(pokemonData.species.name)
        setSpecies(speciesData)

        // Carregar cadeia evolutiva
        if (speciesData.evolution_chain) {
          const evolutionData = await getEvolutionChain(speciesData.evolution_chain.url)
          setEvolutionChain(evolutionData)
        }
      } catch (err) {
        console.error("Error loading Pokémon details:", err)
        setError(t("error"))
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadPokemonDetails()
    }
  }, [params.id, t])

  // Carregar tipos de movimentos quando o jogo é selecionado
  useEffect(() => {
    async function loadMoveTypes() {
      if (!pokemon) return

      setIsLoadingMoves(true)

      try {
        const movesByMethod: Record<string, MoveWithType[]> = {}

        // Preparar a lista de movimentos para o jogo selecionado
        pokemon.moves.forEach((moveData) => {
          const { move, version_group_details } = moveData

          version_group_details.forEach((detail) => {
            // Filtrar por jogo selecionado
            if (selectedGame !== "all" && detail.version_group.name !== selectedGame) {
              return
            }

            const method = detail.move_learn_method.name

            if (!movesByMethod[method]) {
              movesByMethod[method] = []
            }

            // Verificar se o movimento já existe neste método
            const existingMove = movesByMethod[method].find((m) => m.move === formatName(move.name))

            if (!existingMove) {
              movesByMethod[method].push({
                move: formatName(move.name),
                level: detail.level_learned_at,
                game: formatName(detail.version_group.name),
                versionGroup: detail.version_group.name,
                type: "", // Será preenchido depois
                url: move.url,
              })
            }
          })
        })

        // Para cada método, buscar os tipos dos movimentos
        for (const method in movesByMethod) {
          const moves = movesByMethod[method]

          // Buscar os tipos dos movimentos em paralelo
          const movesWithTypesPromises = moves.map(async (moveInfo) => {
            try {
              const moveDetails = await getMoveDetails(moveInfo.url)
              return {
                ...moveInfo,
                type: moveDetails.type.name,
              }
            } catch (error) {
              console.error(`Error fetching move details for ${moveInfo.move}:`, error)
              return moveInfo
            }
          })

          movesByMethod[method] = await Promise.all(movesWithTypesPromises)

          // Ordenar movimentos
          if (method === "level-up") {
            movesByMethod[method].sort((a, b) => (a.level || 0) - (b.level || 0))
          } else {
            movesByMethod[method].sort((a, b) => a.move.localeCompare(b.move))
          }
        }

        setMovesWithTypes(movesByMethod)
      } catch (error) {
        console.error("Error loading move types:", error)
      } finally {
        setIsLoadingMoves(false)
      }
    }

    loadMoveTypes()
  }, [pokemon, selectedGame])

  // Função para formatar o nome com a primeira letra maiúscula
  const formatName = (name: string) => {
    return name
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  }

  // Função para obter a descrição do Pokémon no idioma atual
  const getPokemonDescription = () => {
    if (!species) return ""

    // Mapeamento de códigos de idioma
    const languageCodes = {
      en: ["en"],
      pt: ["pt-BR", "pt"],
    }

    const preferredCodes = languageCodes[language]

    // Tentar encontrar uma entrada na língua preferida
    let entry = null
    for (const code of preferredCodes) {
      entry = species.flavor_text_entries.find((entry) => entry.language.name === code)
      if (entry) break
    }

    // Se não encontrar na língua preferida, tentar inglês como fallback
    if (!entry && language !== "en") {
      entry = species.flavor_text_entries.find((entry) => entry.language.name === "en")
    }

    // Se ainda não encontrar, usar a primeira entrada disponível
    if (!entry && species.flavor_text_entries.length > 0) {
      entry = species.flavor_text_entries[0]
    }

    return entry ? entry.flavor_text.replace(/\f/g, " ") : ""
  }

  // Função para renderizar a cadeia evolutiva
  const renderEvolutionChain = (chain: EvolutionChainLink | null, level = 0) => {
    if (!chain) return null

    const pokemonId = getIdFromUrl(chain.species.url)

    return (
      <div className="flex flex-col items-center">
        <Link href={`/pokemon/${pokemonId}`} className="block">
          <div className="evolution-item p-2 rounded-lg bg-card hover:bg-accent transition-colors">
            <div className="relative h-20 w-20 mx-auto">
              <Image
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`}
                alt={chain.species.name}
                fill
                className="object-contain"
              />
            </div>
            <div className="text-center mt-2">
              <p className="font-semibold">{formatName(chain.species.name)}</p>
              {chain.evolution_details && chain.evolution_details.length > 0 && (
                <p className="text-xs text-muted-foreground">{renderEvolutionDetails(chain.evolution_details[0])}</p>
              )}
            </div>
          </div>
        </Link>

        {chain.evolves_to && chain.evolves_to.length > 0 && (
          <div className="mt-2 mb-2">
            <div className="h-6 w-0.5 bg-border mx-auto"></div>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-4">
          {chain.evolves_to.map((evolution, index) => (
            <div key={index}>{renderEvolutionChain(evolution, level + 1)}</div>
          ))}
        </div>
      </div>
    )
  }

  // Função para renderizar os detalhes da evolução
  const renderEvolutionDetails = (details: EvolutionDetail) => {
    if (details.min_level) {
      return `Level ${details.min_level}`
    } else if (details.min_happiness) {
      return `Happiness ${details.min_happiness}`
    } else if (details.item) {
      return `Use ${formatName(details.item.name)}`
    } else if (details.trigger.name === "trade") {
      return "Trade"
    }
    return ""
  }

  // Função para extrair o ID da URL
  const getIdFromUrl = (url: string) => {
    const matches = url.match(/\/(\d+)\/$/)
    return matches ? matches[1] : "1"
  }

  // Função para renderizar as formas alternativas
  const renderAlternativeForms = () => {
    if (!species || !species.varieties) return null

    const varieties = species.varieties.filter((v) => !v.is_default)

    if (varieties.length === 0) {
      return (
        <div className="text-center p-4">
          <p>{t("noAlternativeForms")}</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {varieties.map((variety, index) => {
          const pokemonId = getIdFromUrl(variety.pokemon.url)
          return (
            <Link href={`/pokemon/${pokemonId}`} key={index}>
              <Card className="overflow-hidden hover:bg-accent transition-colors">
                <CardContent className="p-4">
                  <div className="relative h-24 w-24 mx-auto">
                    <Image
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`}
                      alt={variety.pokemon.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="text-center mt-2 text-sm">{formatName(variety.pokemon.name)}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    )
  }

  // Função para renderizar os movimentos
  const renderMoves = () => {
    if (!pokemon || !pokemon.moves || pokemon.moves.length === 0) {
      return (
        <div className="text-center p-4">
          <p>{t("noMoves")}</p>
        </div>
      )
    }

    if (isLoadingMoves) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>{t("loading")}</span>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="mb-4">
          <Select value={selectedGame} onValueChange={setSelectedGame}>
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder={t("selectGame")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allGames")}</SelectItem>
              {availableGames.map((game) => (
                <SelectItem key={game} value={game}>
                  {formatName(game)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {Object.keys(movesWithTypes).length === 0 ? (
          <div className="text-center p-4">
            <p>{t("noMovesInGame")}</p>
          </div>
        ) : (
          Object.entries(movesWithTypes).map(([method, moves]) => (
            <div key={method} className="space-y-2">
              <h4 className="font-semibold">{formatName(method)}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {moves.map((move, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-sm ${move.type ? `pokemon-move-${move.type}` : "bg-muted"}`}
                  >
                    <div className="font-medium">{move.move}</div>
                    {method === "level-up" && move.level ? (
                      <div className="text-xs opacity-90">Level: {move.level}</div>
                    ) : null}
                    {selectedGame === "all" && <div className="text-xs opacity-90">{move.game}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    )
  }

  // Função para renderizar os grupos de ovos
  const renderEggGroups = () => {
    if (!species || !species.egg_groups || species.egg_groups.length === 0) {
      return <span>{t("unknown")}</span>
    }

    return (
      <div className="flex flex-wrap gap-1">
        {species.egg_groups.map((group, index) => (
          <Link key={group.name} href={`/egg-group/${group.name}`} className="text-primary hover:underline">
            {formatName(group.name)}
            {index < species.egg_groups.length - 1 ? ", " : ""}
          </Link>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t("loading")}</span>
      </div>
    )
  }

  if (error || !pokemon) {
    return (
      <div className="container py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-red-500 mb-4">{error || t("error")}</p>
        <Button onClick={() => router.push("/")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          {t("backToList")}
        </Button>
      </div>
    )
  }

  // Garantir que temos uma URL de imagem válida
  const imageUrl =
    pokemon.sprites.other["official-artwork"].front_default ||
    pokemon.sprites.front_default ||
    `/placeholder.svg?height=200&width=200&text=${pokemon.name}`

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/" passHref>
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("backToList")}
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Coluna da esquerda - Imagem e informações básicas */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>
                #{pokemon.id} {formatName(pokemon.name)}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative h-48 w-48 mb-4">
                <Image
                  src={imageUrl || "/placeholder.svg"}
                  alt={pokemon.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {pokemon.types.map(({ type }) => (
                  <span key={type.name} className={`pokemon-type pokemon-type-${type.name}`}>
                    {formatName(type.name)}
                  </span>
                ))}
              </div>

              <div className="w-full space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted p-2 rounded">
                    <span className="font-semibold">{t("height")}:</span> {pokemon.height / 10}m
                  </div>
                  <div className="bg-muted p-2 rounded">
                    <span className="font-semibold">{t("weight")}:</span> {pokemon.weight / 10}kg
                  </div>
                </div>

                <div className="bg-muted p-2 rounded">
                  <span className="font-semibold">{t("abilities")}:</span>{" "}
                  {pokemon.abilities.map(({ ability, is_hidden }) => (
                    <span key={ability.name}>
                      {formatName(ability.name)}
                      {is_hidden ? " (Hidden)" : ""}
                      {ability !== pokemon.abilities[pokemon.abilities.length - 1] ? ", " : ""}
                    </span>
                  ))}
                </div>

                {species && (
                  <>
                    {species.habitat && (
                      <div className="bg-muted p-2 rounded">
                        <span className="font-semibold">{t("habitat")}:</span> {formatName(species.habitat.name)}
                      </div>
                    )}
                    <div className="bg-muted p-2 rounded">
                      <span className="font-semibold">{t("generation")}:</span> {formatName(species.generation.name)}
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <span className="font-semibold">{t("growthRate")}:</span> {formatName(species.growth_rate.name)}
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <span className="font-semibold">{t("eggGroups")}:</span> {renderEggGroups()}
                    </div>
                  </>
                )}
              </div>

              {species && species.flavor_text_entries.length > 0 && (
                <div className="mt-4 p-3 bg-muted rounded w-full">
                  <p className="italic text-sm">{getPokemonDescription()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna da direita - Tabs com informações detalhadas */}
        <div className="md:col-span-2">
          <Tabs defaultValue="stats">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="stats">{t("baseStats")}</TabsTrigger>
              <TabsTrigger value="evolution">{t("evolutionChain")}</TabsTrigger>
              <TabsTrigger value="forms">{t("alternativeForms")}</TabsTrigger>
              <TabsTrigger value="moves">{t("moves")}</TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("baseStats")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pokemon.stats.map((stat) => (
                    <div key={stat.stat.name} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{t(statNameMap[stat.stat.name] || stat.stat.name)}</span>
                        <span>{stat.base_stat}</span>
                      </div>
                      <Progress value={stat.base_stat} max={255} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evolution">
              <Card>
                <CardHeader>
                  <CardTitle>{t("evolutionChain")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {evolutionChain ? (
                    renderEvolutionChain(evolutionChain.chain)
                  ) : (
                    <div className="text-center p-4">
                      <p>{t("noEvolution")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="forms">
              <Card>
                <CardHeader>
                  <CardTitle>{t("alternativeForms")}</CardTitle>
                </CardHeader>
                <CardContent>{renderAlternativeForms()}</CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="moves">
              <Card>
                <CardHeader>
                  <CardTitle>{t("moves")}</CardTitle>
                </CardHeader>
                <CardContent>{renderMoves()}</CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

// Mapeamento de nomes de estatísticas para chaves de tradução
const statNameMap: Record<string, TranslationKey> = {
  hp: "hp",
  attack: "attack",
  defense: "defense",
  "special-attack": "specialAttack",
  "special-defense": "specialDefense",
  speed: "speed",
}
import type { TranslationKey } from "@/translations"
import type { EvolutionChainLink, EvolutionDetail } from "@/types/pokemon"
import { useAppContext } from "@/contexts/app-context"

