"use server"

import { executeQuery, ensureUserExists } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export type TeamMember = {
  id: number
  team_id: number
  pokemon_id: number
  nickname: string | null
  position: number
  created_at: string
}

// Add a Pokémon to a team
export async function addPokemonToTeam(
  teamId: number,
  pokemonId: number,
  position: number,
  nickname = "",
): Promise<{
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

    // Check if team belongs to user
    const teamResult = await executeQuery<any[]>("SELECT 1 FROM teams WHERE id = $1 AND user_id = $2", [teamId, userId])

    if (!teamResult.length) {
      return { success: false, error: "Team not found or not owned by user" }
    }

    // Add Pokémon to team
    await executeQuery(
      `INSERT INTO team_members (team_id, pokemon_id, position, nickname) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (team_id, position) 
       DO UPDATE SET pokemon_id = $2, nickname = $4`,
      [teamId, pokemonId, position, nickname],
    )

    // Update team's updated_at timestamp
    await executeQuery("UPDATE teams SET updated_at = CURRENT_TIMESTAMP WHERE id = $1", [teamId])

    revalidatePath(`/teams/${teamId}`)

    return { success: true }
  } catch (error) {
    console.error("Error adding Pokémon to team:", error)
    return { success: false, error: "Failed to add Pokémon to team" }
  }
}

// Remove a Pokémon from a team
export async function removePokemonFromTeam(
  teamId: number,
  position: number,
): Promise<{
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

    // Check if team belongs to user
    const teamResult = await executeQuery<any[]>("SELECT 1 FROM teams WHERE id = $1 AND user_id = $2", [teamId, userId])

    if (!teamResult.length) {
      return { success: false, error: "Team not found or not owned by user" }
    }

    // Remove Pokémon from team
    const result = await executeQuery<any[]>(
      "DELETE FROM team_members WHERE team_id = $1 AND position = $2 RETURNING id",
      [teamId, position],
    )

    if (!result.length) {
      return { success: false, error: "Team member not found" }
    }

    // Update team's updated_at timestamp
    await executeQuery("UPDATE teams SET updated_at = CURRENT_TIMESTAMP WHERE id = $1", [teamId])

    revalidatePath(`/teams/${teamId}`)

    return { success: true }
  } catch (error) {
    console.error("Error removing Pokémon from team:", error)
    return { success: false, error: "Failed to remove Pokémon from team" }
  }
}

// Update a team member
export async function updateTeamMember(
  teamId: number,
  position: number,
  updates: {
    pokemon_id?: number
    nickname?: string
    new_position?: number
  },
): Promise<{
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

    // Check if team belongs to user
    const teamResult = await executeQuery<any[]>("SELECT 1 FROM teams WHERE id = $1 AND user_id = $2", [teamId, userId])

    if (!teamResult.length) {
      return { success: false, error: "Team not found or not owned by user" }
    }

    // Get the current member
    const memberResult = await executeQuery<TeamMember[]>(
      "SELECT id, pokemon_id, nickname, position FROM team_members WHERE team_id = $1 AND position = $2",
      [teamId, position],
    )

    if (!memberResult.length) {
      return { success: false, error: "Team member not found" }
    }

    const member = memberResult[0]

    // Handle position change
    if (updates.new_position !== undefined && updates.new_position !== position) {
      // Check if the new position is already taken
      const existingAtNewPosition = await executeQuery<any[]>(
        "SELECT id FROM team_members WHERE team_id = $1 AND position = $2",
        [teamId, updates.new_position],
      )

      if (existingAtNewPosition.length) {
        // Swap positions
        await executeQuery("UPDATE team_members SET position = -1 WHERE team_id = $1 AND position = $2", [
          teamId,
          updates.new_position,
        ])

        await executeQuery("UPDATE team_members SET position = $1 WHERE team_id = $2 AND position = $3", [
          updates.new_position,
          teamId,
          position,
        ])

        await executeQuery("UPDATE team_members SET position = $1 WHERE team_id = $2 AND position = -1", [
          position,
          teamId,
        ])
      } else {
        // Just update the position
        await executeQuery("UPDATE team_members SET position = $1 WHERE team_id = $2 AND position = $3", [
          updates.new_position,
          teamId,
          position,
        ])
      }
    }

    // Update other fields if provided
    if (updates.pokemon_id !== undefined || updates.nickname !== undefined) {
      const updatePosition = updates.new_position !== undefined ? updates.new_position : position

      await executeQuery(
        "UPDATE team_members SET pokemon_id = $1, nickname = $2 WHERE team_id = $3 AND position = $4",
        [
          updates.pokemon_id !== undefined ? updates.pokemon_id : member.pokemon_id,
          updates.nickname !== undefined ? updates.nickname : member.nickname,
          teamId,
          updatePosition,
        ],
      )
    }

    // Update team's updated_at timestamp
    await executeQuery("UPDATE teams SET updated_at = CURRENT_TIMESTAMP WHERE id = $1", [teamId])

    revalidatePath(`/teams/${teamId}`)

    return { success: true }
  } catch (error) {
    console.error("Error updating team member:", error)
    return { success: false, error: "Failed to update team member" }
  }
}

// Get team members for a specific team
export async function getTeamMembers(teamId: number): Promise<{
  members: TeamMember[]
  error?: string
}> {
  const session = await auth()

  if (!session?.user?.email) {
    return { members: [], error: "Not authenticated" }
  }

  try {
    const userId = await ensureUserExists(session.user.email, session.user.name || "")

    if (!userId) {
      return { members: [], error: "User not found" }
    }

    // Check if team belongs to user
    const teamResult = await executeQuery<any[]>("SELECT 1 FROM teams WHERE id = $1 AND user_id = $2", [teamId, userId])

    if (!teamResult.length) {
      return { members: [], error: "Team not found or not owned by user" }
    }

    // Get team members
    const members = await executeQuery<TeamMember[]>(
      "SELECT id, team_id, pokemon_id, nickname, position, created_at FROM team_members WHERE team_id = $1 ORDER BY position",
      [teamId],
    )

    return { members }
  } catch (error) {
    console.error("Error getting team members:", error)
    return { members: [], error: "Failed to get team members" }
  }
}

// Clear all members from a team
export async function clearTeamMembers(teamId: number): Promise<{
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

    // Check if team belongs to user
    const teamResult = await executeQuery<any[]>("SELECT 1 FROM teams WHERE id = $1 AND user_id = $2", [teamId, userId])

    if (!teamResult.length) {
      return { success: false, error: "Team not found or not owned by user" }
    }

    // Delete all team members
    await executeQuery("DELETE FROM team_members WHERE team_id = $1", [teamId])

    // Update team's updated_at timestamp
    await executeQuery("UPDATE teams SET updated_at = CURRENT_TIMESTAMP WHERE id = $1", [teamId])

    revalidatePath(`/teams/${teamId}`)

    return { success: true }
  } catch (error) {
    console.error("Error clearing team members:", error)
    return { success: false, error: "Failed to clear team members" }
  }
}

