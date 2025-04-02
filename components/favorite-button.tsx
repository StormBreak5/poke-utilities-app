"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { addToFavorites, removeFromFavorites, isFavorite } from "@/actions/favorites"
import { useToast } from "@/hooks/use-toast"

interface FavoriteButtonProps {
  pokemonId: number
}

export function FavoriteButton({ pokemonId }: FavoriteButtonProps) {
  const [favorite, setFavorite] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function checkFavorite() {
      try {
        const result = await isFavorite(pokemonId)
        setFavorite(result.isFavorite)
      } catch (error) {
        console.error("Error checking favorite status:", error)
      } finally {
        setLoading(false)
      }
    }

    checkFavorite()
  }, [pokemonId])

  const handleToggleFavorite = async () => {
    try {
      setLoading(true)

      if (favorite) {
        await removeFromFavorites(pokemonId)
        toast({
          title: "Removed from favorites",
          description: "This Pokémon has been removed from your favorites.",
        })
      } else {
        await addToFavorites(pokemonId)
        toast({
          title: "Added to favorites",
          description: "This Pokémon has been added to your favorites.",
        })
      }

      setFavorite(!favorite)
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Error",
        description: "There was an error updating your favorites.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={favorite ? "default" : "outline"}
      size="icon"
      onClick={handleToggleFavorite}
      disabled={loading}
      className={favorite ? "bg-primary text-primary-foreground" : ""}
    >
      <Heart className={favorite ? "fill-current" : ""} />
      <span className="sr-only">{favorite ? "Remove from favorites" : "Add to favorites"}</span>
    </Button>
  )
}

