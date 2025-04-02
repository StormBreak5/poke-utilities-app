"use server"

import { executeQuery, ensureUserExists } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export type Team = {
  id: number
  user_id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export type TeamMember = {
  id: number
  team_id: number
  pokemon_id: number
  nickname: string | null
  position: number
  created_at: string
}

export type TeamWithMembers = Team & {
  members: TeamMember[]
}

// Get user's teams
export async function getTeams(): Promise<{
  teams: Team[]
  error?: string
}> {
  const session = await auth()

  if (!session?.user?.email) {
    return { teams: [], error: "Not authenticated" }
  }

  try {
    const userId = await ensureUserExists(session.user.email, session.user.name || "")

    if (!userId) {
      return { teams: [] }
    }

    // Get teams
    const teams = await executeQuery<Team[]>(
      "SELECT id, user_id, name, description, created_at, updated_at FROM teams WHERE user_id = $1 ORDER BY updated_at DESC",
      [userId],
    )

    return { teams }
  } catch (error) {
    console.error("Error getting teams:", error)
    return { teams: [], error: "Failed to get teams" }
  }
}

// Get a specific team with its members
export async function getTeam(teamId: number): Promise<{
  team?: TeamWithMembers
  error?: string
}> {
  const session = await auth()

  if (!session?.user?.email) {
    return { error: "Not authenticated" }
  }

  try {
    const userId = await ensureUserExists(session.user.email, session.user.name || "")

    if (!userId) {
      return { error: "User not found" }
    }

    // Get team
    const teamResult = await executeQuery<Team[]>(
      "SELECT id, user_id, name, description, created_at, updated_at FROM teams WHERE id = $1 AND user_id = $2",
      [teamId, userId],
    )

    if (!teamResult.length) {
      return { error: "Team not found" }
    }

    const team = teamResult[0]

    // Get team members
    const members = await executeQuery<TeamMember[]>(
      "SELECT id, team_id, pokemon_id, nickname, position, created_at FROM team_members WHERE team_id = $1 ORDER BY position",
      [teamId],
    )

    return { team: { ...team, members } }
  } catch (error) {
    console.error("Error getting team:", error)
    return { error: "Failed to get team" }
  }
}

// Create a new team
export async function createTeam(
  name: string,
  description = "",
): Promise<{
  teamId?: number
  error?: string
}> {
  const session = await auth()

  if (!session?.user?.email) {
    return { error: "Not authenticated" }
  }

  try {
    const userId = await ensureUserExists(session.user.email, session.user.name || "")

    if (!userId) {
      return { error: "Failed to create user" }
    }

    // Create team
    const team = await executeQuery<any[]>(
      "INSERT INTO teams (user_id, name, description) VALUES ($1, $2, $3) RETURNING id",
      [userId, name, description],
    )

    revalidatePath("/teams")

    return { teamId: team[0].id }
  } catch (error) {
    console.error("Error creating team:", error)
    return { error: "Failed to create team" }
  }
}

// Update a team
export async function updateTeam(
  teamId: number,
  name: string,
  description = "",
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

    // Update team
    const result = await executeQuery<any[]>(
      "UPDATE teams SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4 RETURNING id",
      [name, description, teamId, userId],
    )

    if (!result.length) {
      return { success: false, error: "Team not found or not owned by user" }
    }

    revalidatePath("/teams")
    revalidatePath(`/teams/${teamId}`)

    return { success: true }
  } catch (error) {
    console.error("Error updating team:", error)
    return { success: false, error: "Failed to update team" }
  }
}

// Delete a team
export async function deleteTeam(teamId: number): Promise<{
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

    // Delete team
    const result = await executeQuery<any[]>("DELETE FROM teams WHERE id = $1 AND user_id = $2 RETURNING id", [
      teamId,
      userId,
    ])

    if (!result.length) {
      return { success: false, error: "Team not found or not owned by user" }
    }

    revalidatePath("/teams")

    return { success: true }
  } catch (error) {
    console.error("Error deleting team:", error)
    return { success: false, error: "Failed to delete team" }
  }
}

// Get all teams with members
export async function getAllTeamsWithMembers(): Promise<{
  teams: TeamWithMembers[]
  error?: string
}> {
  const session = await auth()

  if (!session?.user?.email) {
    return { teams: [], error: "Not authenticated" }
  }

  try {
    const userId = await ensureUserExists(session.user.email, session.user.name || "")

    if (!userId) {
      return { teams: [] }
    }

    // Get teams
    const teams = await executeQuery<Team[]>(
      "SELECT id, user_id, name, description, created_at, updated_at FROM teams WHERE user_id = $1 ORDER BY updated_at DESC",
      [userId],
    )

    // Get all team members for this user's teams
    const teamIds = teams.map((team) => team.id)

    if (teamIds.length === 0) {
      return { teams: [] }
    }

    const members = await executeQuery<TeamMember[]>(
      `SELECT id, team_id, pokemon_id, nickname, position, created_at 
       FROM team_members 
       WHERE team_id IN (${teamIds.map((_, i) => `$${i + 1}`).join(",")}) 
       ORDER BY team_id, position`,
      teamIds,
    )

    // Combine teams with their members
    const teamsWithMembers = teams.map((team) => ({
      ...team,
      members: members.filter((member) => member.team_id === team.id),
    }))

    return { teams: teamsWithMembers }
  } catch (error) {
    console.error("Error getting all teams with members:", error)
    return { teams: [], error: "Failed to get teams" }
  }
}

