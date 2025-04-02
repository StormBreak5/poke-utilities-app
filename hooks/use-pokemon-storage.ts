"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import * as userActions from "@/actions/users"
import * as favoriteActions from "@/actions/favorites"
import * as teamActions from "@/actions/teams"
import * as teamMemberActions from "@/actions/team-members"

export function usePokemonStorage() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // User actions
  const getCurrentUser = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await userActions.getCurrentUser()
      return result
    } catch (error) {
      console.error("Error getting current user:", error)
      toast({
        title: "Error",
        description: "Failed to get user information",
        variant: "destructive",
      })
      return { user: null, error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const updateUserProfile = useCallback(
    async (name: string) => {
      setIsLoading(true)
      try {
        const result = await userActions.updateUserProfile(name)

        if (result.success) {
          toast({
            title: "Profile Updated",
            description: "Your profile has been updated successfully",
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update profile",
            variant: "destructive",
          })
        }

        return result
      } catch (error) {
        console.error("Error updating profile:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
        return { success: false, error: "An unexpected error occurred" }
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const getUserStats = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await userActions.getUserStats()
      return result
    } catch (error) {
      console.error("Error getting user stats:", error)
      return { favoriteCount: 0, teamCount: 0, error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Favorites actions
  const getFavorites = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await favoriteActions.getFavorites()
      return result
    } catch (error) {
      console.error("Error getting favorites:", error)
      return { favorites: [], error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getFavoritesPaginated = useCallback(async (page = 1, limit = 20) => {
    setIsLoading(true)
    try {
      const result = await favoriteActions.getFavoritesPaginated(page, limit)
      return result
    } catch (error) {
      console.error("Error getting paginated favorites:", error)
      return { favorites: [], total: 0, error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addToFavorites = useCallback(
    async (pokemonId: number) => {
      setIsLoading(true)
      try {
        const result = await favoriteActions.addToFavorites(pokemonId)

        if (result.success) {
          toast({
            title: "Added to Favorites",
            description: "This Pokémon has been added to your favorites",
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to add to favorites",
            variant: "destructive",
          })
        }

        return result
      } catch (error) {
        console.error("Error adding to favorites:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
        return { success: false, error: "An unexpected error occurred" }
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const removeFromFavorites = useCallback(
    async (pokemonId: number) => {
      setIsLoading(true)
      try {
        const result = await favoriteActions.removeFromFavorites(pokemonId)

        if (result.success) {
          toast({
            title: "Removed from Favorites",
            description: "This Pokémon has been removed from your favorites",
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to remove from favorites",
            variant: "destructive",
          })
        }

        return result
      } catch (error) {
        console.error("Error removing from favorites:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
        return { success: false, error: "An unexpected error occurred" }
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const isFavorite = useCallback(async (pokemonId: number) => {
    try {
      const result = await favoriteActions.isFavorite(pokemonId)
      return result
    } catch (error) {
      console.error("Error checking favorite status:", error)
      return { isFavorite: false, error: "An unexpected error occurred" }
    }
  }, [])

  const clearAllFavorites = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await favoriteActions.clearAllFavorites()

      if (result.success) {
        toast({
          title: "Favorites Cleared",
          description: "All Pokémon have been removed from your favorites",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to clear favorites",
          variant: "destructive",
        })
      }

      return result
    } catch (error) {
      console.error("Error clearing favorites:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Teams actions
  const getTeams = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await teamActions.getTeams()
      return result
    } catch (error) {
      console.error("Error getting teams:", error)
      return { teams: [], error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getTeam = useCallback(async (teamId: number) => {
    setIsLoading(true)
    try {
      const result = await teamActions.getTeam(teamId)
      return result
    } catch (error) {
      console.error("Error getting team:", error)
      return { error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createTeam = useCallback(
    async (name: string, description = "") => {
      setIsLoading(true)
      try {
        const result = await teamActions.createTeam(name, description)

        if (result.teamId) {
          toast({
            title: "Team Created",
            description: "Your new team has been created successfully",
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to create team",
            variant: "destructive",
          })
        }

        return result
      } catch (error) {
        console.error("Error creating team:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
        return { error: "An unexpected error occurred" }
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const updateTeam = useCallback(
    async (teamId: number, name: string, description = "") => {
      setIsLoading(true)
      try {
        const result = await teamActions.updateTeam(teamId, name, description)

        if (result.success) {
          toast({
            title: "Team Updated",
            description: "Your team has been updated successfully",
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update team",
            variant: "destructive",
          })
        }

        return result
      } catch (error) {
        console.error("Error updating team:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
        return { success: false, error: "An unexpected error occurred" }
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const deleteTeam = useCallback(
    async (teamId: number) => {
      setIsLoading(true)
      try {
        const result = await teamActions.deleteTeam(teamId)

        if (result.success) {
          toast({
            title: "Team Deleted",
            description: "Your team has been deleted successfully",
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to delete team",
            variant: "destructive",
          })
        }

        return result
      } catch (error) {
        console.error("Error deleting team:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
        return { success: false, error: "An unexpected error occurred" }
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const getAllTeamsWithMembers = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await teamActions.getAllTeamsWithMembers()
      return result
    } catch (error) {
      console.error("Error getting all teams with members:", error)
      return { teams: [], error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Team members actions
  const addPokemonToTeam = useCallback(
    async (teamId: number, pokemonId: number, position: number, nickname = "") => {
      setIsLoading(true)
      try {
        const result = await teamMemberActions.addPokemonToTeam(teamId, pokemonId, position, nickname)

        if (result.success) {
          toast({
            title: "Pokémon Added",
            description: "The Pokémon has been added to your team",
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to add Pokémon to team",
            variant: "destructive",
          })
        }

        return result
      } catch (error) {
        console.error("Error adding Pokémon to team:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
        return { success: false, error: "An unexpected error occurred" }
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const removePokemonFromTeam = useCallback(
    async (teamId: number, position: number) => {
      setIsLoading(true)
      try {
        const result = await teamMemberActions.removePokemonFromTeam(teamId, position)

        if (result.success) {
          toast({
            title: "Pokémon Removed",
            description: "The Pokémon has been removed from your team",
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to remove Pokémon from team",
            variant: "destructive",
          })
        }

        return result
      } catch (error) {
        console.error("Error removing Pokémon from team:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
        return { success: false, error: "An unexpected error occurred" }
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const updateTeamMember = useCallback(
    async (
      teamId: number,
      position: number,
      updates: {
        pokemon_id?: number
        nickname?: string
        new_position?: number
      },
    ) => {
      setIsLoading(true)
      try {
        const result = await teamMemberActions.updateTeamMember(teamId, position, updates)

        if (result.success) {
          toast({
            title: "Team Member Updated",
            description: "The team member has been updated successfully",
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update team member",
            variant: "destructive",
          })
        }

        return result
      } catch (error) {
        console.error("Error updating team member:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
        return { success: false, error: "An unexpected error occurred" }
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const getTeamMembers = useCallback(async (teamId: number) => {
    setIsLoading(true)
    try {
      const result = await teamMemberActions.getTeamMembers(teamId)
      return result
    } catch (error) {
      console.error("Error getting team members:", error)
      return { members: [], error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearTeamMembers = useCallback(
    async (teamId: number) => {
      setIsLoading(true)
      try {
        const result = await teamMemberActions.clearTeamMembers(teamId)

        if (result.success) {
          toast({
            title: "Team Cleared",
            description: "All Pokémon have been removed from your team",
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to clear team",
            variant: "destructive",
          })
        }

        return result
      } catch (error) {
        console.error("Error clearing team members:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
        return { success: false, error: "An unexpected error occurred" }
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  return {
    isLoading,
    // User actions
    getCurrentUser,
    updateUserProfile,
    getUserStats,
    // Favorites actions
    getFavorites,
    getFavoritesPaginated,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    clearAllFavorites,
    // Teams actions
    getTeams,
    getTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    getAllTeamsWithMembers,
    // Team members actions
    addPokemonToTeam,
    removePokemonFromTeam,
    updateTeamMember,
    getTeamMembers,
    clearTeamMembers,
  }
}

