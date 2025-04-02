"use server"

import { executeQuery, ensureUserExists } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export type User = {
  id: number
  email: string
  name: string | null
  created_at: string
}

// Get current user
export async function getCurrentUser(): Promise<{ user: User | null; error?: string }> {
  const session = await auth()

  if (!session?.user?.email) {
    return { user: null, error: "Not authenticated" }
  }

  try {
    const userResult = await executeQuery<User[]>("SELECT id, email, name, created_at FROM users WHERE email = $1", [
      session.user.email,
    ])

    if (!userResult.length) {
      // Create user if not exists
      const userId = await ensureUserExists(session.user.email, session.user.name || "")

      if (!userId) {
        return { user: null, error: "Failed to create user" }
      }

      const newUser = await executeQuery<User[]>("SELECT id, email, name, created_at FROM users WHERE id = $1", [
        userId,
      ])

      return { user: newUser[0] || null }
    }

    return { user: userResult[0] }
  } catch (error) {
    console.error("Error getting current user:", error)
    return { user: null, error: "Failed to get user" }
  }
}

// Update user profile
export async function updateUserProfile(name: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth()

  if (!session?.user?.email) {
    return { success: false, error: "Not authenticated" }
  }

  try {
    await executeQuery("UPDATE users SET name = $1 WHERE email = $2", [name, session.user.email])

    revalidatePath("/profile")

    return { success: true }
  } catch (error) {
    console.error("Error updating user profile:", error)
    return { success: false, error: "Failed to update profile" }
  }
}

// Get user stats
export async function getUserStats(): Promise<{
  favoriteCount: number
  teamCount: number
  error?: string
}> {
  const session = await auth()

  if (!session?.user?.email) {
    return { favoriteCount: 0, teamCount: 0, error: "Not authenticated" }
  }

  try {
    const userId = await ensureUserExists(session.user.email, session.user.name || "")

    if (!userId) {
      return { favoriteCount: 0, teamCount: 0, error: "User not found" }
    }

    const favoriteCountResult = await executeQuery<any[]>(
      "SELECT COUNT(*) as count FROM favorite_pokemon WHERE user_id = $1",
      [userId],
    )

    const teamCountResult = await executeQuery<any[]>("SELECT COUNT(*) as count FROM teams WHERE user_id = $1", [
      userId,
    ])

    return {
      favoriteCount: Number.parseInt(favoriteCountResult[0].count) || 0,
      teamCount: Number.parseInt(teamCountResult[0].count) || 0,
    }
  } catch (error) {
    console.error("Error getting user stats:", error)
    return { favoriteCount: 0, teamCount: 0, error: "Failed to get stats" }
  }
}

