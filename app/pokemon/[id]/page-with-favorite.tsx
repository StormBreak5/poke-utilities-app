"use client"

// Import the FavoriteButton component
import { FavoriteButton } from "@/components/favorite-button"
import { ChevronLeft } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"

// Dummy data for pokemon and formatName, replace with actual implementation
const pokemon = {
  id: 1,
  name: "Bulbasaur",
}

const formatName = (name: string) => {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

// Inside the return statement, add the FavoriteButton next to the title
export default function Page() {
  const { t } = useTranslation()

  return (
    <div className="container py-8">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/" passHref>
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("backToList")}
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href="/favorites">
            <Button variant="outline">{t("favorites")}</Button>
          </Link>
          <Link href="/teams">
            <Button variant="outline">{t("teams")}</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Coluna da esquerda - Imagem e informações básicas */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center flex flex-row justify-between items-center">
              <CardTitle className="flex-1">
                #{pokemon.id} {formatName(pokemon.name)}
              </CardTitle>
              <FavoriteButton pokemonId={pokemon.id} />
            </CardHeader>

            {/* Rest of the existing code... */}
          </Card>
        </div>

        {/* Rest of the existing code... */}
      </div>
    </div>
  )
}

