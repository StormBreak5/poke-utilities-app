"use client"

import { useTranslations } from "@/hooks/use-translations"
import type { PokemonDetails } from "@/types/pokemon"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FavoriteButton } from "@/components/favorite-button"
import Image from "next/image"
import Link from "next/link"

interface PokemonCardProps {
  pokemon: PokemonDetails
}

export function PokemonCardWithFavorite({ pokemon }: PokemonCardProps) {
  const { t } = useTranslations()

  // Função para formatar o nome do Pokémon com a primeira letra maiúscula
  const formatName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  // Garantir que temos uma URL de imagem válida
  const imageUrl =
    pokemon.sprites.other["official-artwork"].front_default ||
    pokemon.sprites.front_default ||
    `/placeholder.svg?height=96&width=96&text=${pokemon.name}`

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/pokemon/${pokemon.id}`}>
        <CardHeader className="p-4 pb-0 text-center">
          <div className="text-lg font-bold">
            #{pokemon.id} {formatName(pokemon.name)}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="relative mx-auto h-32 w-32">
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={pokemon.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain"
              priority={pokemon.id <= 20}
            />
          </div>

          <div className="mt-4 grid gap-2">
            <div className="flex flex-wrap gap-1">
              {pokemon.types.map(({ type }) => (
                <span key={type.name} className={`pokemon-type pokemon-type-${type.name}`}>
                  {formatName(type.name)}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-semibold">{t("height")}:</span> {pokemon.height / 10}m
              </div>
              <div>
                <span className="font-semibold">{t("weight")}:</span> {pokemon.weight / 10}kg
              </div>
            </div>

            <div className="text-sm">
              <span className="font-semibold">{t("abilities")}:</span>{" "}
              {pokemon.abilities.map(({ ability }) => formatName(ability.name)).join(", ")}
            </div>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <Link href={`/pokemon/${pokemon.id}`} className="flex-1 mr-2">
          <Button variant="secondary" className="w-full">
            {t("viewDetails")}
          </Button>
        </Link>
        <FavoriteButton pokemonId={pokemon.id} />
      </CardFooter>
    </Card>
  )
}

