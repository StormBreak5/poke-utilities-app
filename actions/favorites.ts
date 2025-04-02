"use server"

import { executeQuery, ensureUserExists } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export type FavoritePokemon = {
  id: number
  user_id: number
  pokemon_id: number
  added_at: string
}

// Get user's favorite Pokémon
export async function getFavorites(): Promise<{
  favorites: number[]
  error?: string
}> {
  const session = await auth()

  if (!session?.user?.email) {
    return { favorites: [], error: "Not authenticated" }
  }

  try {
    const userId = await ensureUserExists(session.user.email, session.user.name || "")

    if (!userId) {
      return { favorites: [] }
    }

    // Get favorites
    const favorites = await executeQuery<FavoritePokemon[]>(
      "SELECT id, user_id, pokemon_id, added_at FROM favorite_pokemon WHERE user_id = $1 ORDER BY added_at DESC",
      [userId],
    )

    return { favorites: favorites.map((f) => f.pokemon_id) }
  } catch (error) {
    console.error("Error getting favorites:", error)
    return { favorites: [], error: "Failed to get favorites" }
  }
}

// Get user's favorite Pokémon with pagination
export async function getFavoritesPaginated(
  page = 1,
  limit = 20,
): Promise<{
  favorites: FavoritePokemon[]
  total: number
  error?: string
}> {
  const session = await auth()

  if (!session?.user?.email) {
    return { favorites: [], total: 0, error: "Not authenticated" }
  }

  try {
    const userId = await ensureUserExists(session.user.email, session.user.name || "")

    if (!userId) {
      return { favorites: [], total: 0 }
    }

    const offset = (page - 1) * limit

    // Get favorites with pagination
    const favorites = await executeQuery<FavoritePokemon[]>(
      "SELECT id, user_id, pokemon_id, added_at FROM favorite_pokemon WHERE user_id = $1 ORDER BY added_at DESC LIMIT $2 OFFSET $3",
      [userId, limit, offset],
    )

    // Get total count
    const totalResult = await executeQuery<any[]>("SELECT COUNT(*) as count FROM favorite_pokemon WHERE user_id = $1", [
      userId,
    ])

    const total = Number.parseInt(totalResult[0].count) || 0

    return { favorites, total }
  } catch (error) {
    console.error("Error getting paginated favorites:", error)
    return { favorites: [], total: 0, error: "Failed to get favorites" }
  }
}

// Add a Pokémon to favorites
export async function addToFavorites(pokemonId: number): Promise<{
  success: boolean
  error?: string
}> {
  const session = await auth()

  if (!session?.user?.email) {
    return { success: false, error: "Not authenticated" }
  }

  try {
    const userId = await ensureUserExists(session.user.email, session.user.name || "")

    if (!userId) {
      return { success: false, error: "Failed to create user" }
    }

    // Add to favorites
    await executeQuery(
      "INSERT INTO favorite_pokemon (user_id, pokemon_id) VALUES ($1, $2) ON CONFLICT (user_id, pokemon_id) DO NOTHING",
      [userId, pokemonId],
    )

    revalidatePath("/favorites")
    revalidatePath(`/pokemon/${pokemonId}`)

    return { success: true }
  } catch (error) {
    console.error("Error adding to favorites:", error)
    return { success: false, error: "Failed to add to favorites" }
  }
}

// Remove a Pokémon from favorites
export async function removeFromFavorites(pokemonId: number): Promise<{
  success: boolean
  error?: string
}> {
  const session = await auth()

  if (!session?.user?.email) {
    return { success: false, error: "Not authenticated" }
  }

  try {
    const userId = await ensureUserExists(session.user.email, session.user.name || "")

    if (!userId) {
      return { success: false, error: "User not found" }
    }

    // Remove from favorites
    await executeQuery("DELETE FROM favorite_pokemon WHERE user_id = $1 AND pokemon_id = $2", [userId, pokemonId])

    revalidatePath("/favorites")
    revalidatePath(`/pokemon/${pokemonId}`)

    return { success: true }
  } catch (error) {
    console.error("Error removing from favorites:", error)
    return { success: false, error: "Failed to remove from favorites" }
  }
}

// Check if a Pokémon is in favorites
export async function isFavorite(pokemonId: number): Promise<{
  isFavorite: boolean
  error?: string
}> {
  const session = await auth()

  if (!session?.user?.email) {
    return { isFavorite: false }
  }

  try {
    const userId = await ensureUserExists(session.user.email, session.user.name || "")

    if (!userId) {
      return { isFavorite: false }
    }

    // Check if in favorites
    const favorite = await executeQuery<any[]>(
      "SELECT 1 FROM favorite_pokemon WHERE user_id = $1 AND pokemon_id = $2",
      [userId, pokemonId],
    )

    return { isFavorite: favorite.length > 0 }
  } catch (error) {
    console.error("Error checking favorite:", error)
    return { isFavorite: false, error: "Failed to check favorite status" }
  }
}

// Clear all favorites
export async function clearAllFavorites(): Promise<{
  success: boolean
  error?: string
}> {
  const session = await auth()

  if (!session?.user?.email) {
    return { success: false, error: "Not authenticated" }
  }

  try {
    const userId = await ensureUserExists(session.user.email, session.user.name || "")

    if (!userId) {
      return { success: false, error: "User not found" }
    }

    // Clear all favorites
    await executeQuery("DELETE FROM favorite_pokemon WHERE user_id = $1", [userId])

    revalidatePath("/favorites")

    return { success: true }
  } catch (error) {
    console.error("Error clearing favorites:", error)
    return { success: false, error: "Failed to clear favorites" }
  }
}

