"use client"

import { useState, useEffect } from "react"
import { usePokemonStorage } from "@/hooks/use-pokemon-storage"
import { useTranslations } from "@/hooks/use-translations"
import { getPokemonDetails } from "@/services/pokemon-service"
import type { PokemonDetails } from "@/types/pokemon"
import type { Team, TeamWithMembers } from "@/actions/teams"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Trash, Edit, X } from "lucide-react"
import Image from "next/image"

export function TeamBuilder() {
  const { t } = useTranslations()
  const {
    isLoading,
    getTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    getTeam,
    addPokemonToTeam,
    removePokemonFromTeam,
    updateTeamMember,
  } = usePokemonStorage()

  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<TeamWithMembers | null>(null)
  const [teamMembers, setTeamMembers] = useState<(PokemonDetails | null)[]>([null, null, null, null, null, null])
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)
  const [isEditingTeam, setIsEditingTeam] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamDescription, setNewTeamDescription] = useState("")
  const [isAddingPokemon, setIsAddingPokemon] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<PokemonDetails[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Load teams on mount
  useEffect(() => {
    async function loadTeams() {
      const { teams } = await getTeams()
      setTeams(teams)
    }

    loadTeams()
  }, [getTeams])

  // Load team details when a team is selected
  useEffect(() => {
    async function loadTeamDetails() {
      if (!selectedTeam) {
        setTeamMembers([null, null, null, null, null, null])
        return
      }

      const { team } = await getTeam(selectedTeam.id)

      if (team) {
        setSelectedTeam(team)

        // Load Pokémon details for each team member
        const membersPromises = Array(6)
          .fill(null)
          .map(async (_, index) => {
            const member = team.members.find((m) => m.position === index + 1)

            if (!member) {
              return null
            }

            try {
              return await getPokemonDetails(member.pokemon_id)
            } catch (error) {
              console.error(`Error loading Pokémon ${member.pokemon_id}:`, error)
              return null
            }
          })

        const loadedMembers = await Promise.all(membersPromises)
        setTeamMembers(loadedMembers)
      }
    }

    loadTeamDetails()
  }, [getTeam, selectedTeam?.id])

  // Handle team selection
  const handleSelectTeam = async (teamId: number) => {
    const team = teams.find((t) => t.id === teamId)
    if (team) {
      setSelectedTeam(team as TeamWithMembers)
    }
  }

  // Handle team creation
  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      return
    }

    const result = await createTeam(newTeamName, newTeamDescription)

    if (result.teamId) {
      const { teams: updatedTeams } = await getTeams()
      setTeams(updatedTeams)

      // Select the newly created team
      const newTeam = updatedTeams.find((t) => t.id === result.teamId)
      if (newTeam) {
        setSelectedTeam(newTeam as TeamWithMembers)
      }

      // Reset form
      setNewTeamName("")
      setNewTeamDescription("")
      setIsCreatingTeam(false)
    }
  }

  // Handle team update
  const handleUpdateTeam = async () => {
    if (!selectedTeam || !newTeamName.trim()) {
      return
    }

    const result = await updateTeam(selectedTeam.id, newTeamName, newTeamDescription)

    if (result.success) {
      const { teams: updatedTeams } = await getTeams()
      setTeams(updatedTeams)

      // Update the selected team
      const updatedTeam = updatedTeams.find((t) => t.id === selectedTeam.id)
      if (updatedTeam) {
        setSelectedTeam({
          ...updatedTeam,
          members: selectedTeam.members,
        })
      }

      // Reset form
      setIsEditingTeam(false)
    }
  }

  // Handle team deletion
  const handleDeleteTeam = async () => {
    if (!selectedTeam) {
      return
    }

    const result = await deleteTeam(selectedTeam.id)

    if (result.success) {
      const { teams: updatedTeams } = await getTeams()
      setTeams(updatedTeams)
      setSelectedTeam(null)
    }
  }

  // Handle Pokémon search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    try {
      // This is a simplified search - in a real app, you'd want to implement a more robust search
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`)

      if (response.ok) {
        const data = await response.json()
        const pokemon = await getPokemonDetails(data.id)
        setSearchResults([pokemon])
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error("Error searching for Pokémon:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Handle adding a Pokémon to the team
  const handleAddPokemon = async (pokemon: PokemonDetails) => {
    if (!selectedTeam || selectedPosition < 1 || selectedPosition > 6) {
      return
    }

    const result = await addPokemonToTeam(selectedTeam.id, pokemon.id, selectedPosition)

    if (result.success) {
      // Update the team members
      const newTeamMembers = [...teamMembers]
      newTeamMembers[selectedPosition - 1] = pokemon
      setTeamMembers(newTeamMembers)

      // Close the dialog
      setIsAddingPokemon(false)
      setSearchTerm("")
      setSearchResults([])
    }
  }

  // Handle removing a Pokémon from the team
  const handleRemovePokemon = async (position: number) => {
    if (!selectedTeam) {
      return
    }

    const result = await removePokemonFromTeam(selectedTeam.id, position)

    if (result.success) {
      // Update the team members
      const newTeamMembers = [...teamMembers]
      newTeamMembers[position - 1] = null
      setTeamMembers(newTeamMembers)
    }
  }

  // Start editing team
  const startEditingTeam = () => {
    if (selectedTeam) {
      setNewTeamName(selectedTeam.name)
      setNewTeamDescription(selectedTeam.description || "")
      setIsEditingTeam(true)
    }
  }

  // Render team selection
  const renderTeamSelection = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{t("myTeams")}</h2>
        <Button onClick={() => setIsCreatingTeam(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("createTeam")}
        </Button>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-8">
          <p className="mb-4">{t("noTeams")}</p>
          <Button onClick={() => setIsCreatingTeam(true)}>{t("createYourFirstTeam")}</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <Card
              key={team.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                selectedTeam?.id === team.id ? "border-primary" : ""
              }`}
              onClick={() => handleSelectTeam(team.id)}
            >
              <CardHeader>
                <CardTitle>{team.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{team.description || t("noDescription")}</p>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">{new Date(team.updated_at).toLocaleDateString()}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  // Render team creation form
  const renderTeamCreationForm = () => (
    <Dialog open={isCreatingTeam} onOpenChange={setIsCreatingTeam}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createTeam")}</DialogTitle>
          <DialogDescription>{t("createTeamDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="team-name" className="text-sm font-medium">
              {t("teamName")}
            </label>
            <Input
              id="team-name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder={t("enterTeamName")}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="team-description" className="text-sm font-medium">
              {t("teamDescription")}
            </label>
            <Textarea
              id="team-description"
              value={newTeamDescription}
              onChange={(e) => setNewTeamDescription(e.target.value)}
              placeholder={t("enterTeamDescription")}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsCreatingTeam(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleCreateTeam} disabled={!newTeamName.trim() || isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {t("createTeam")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // Render team editing form
  const renderTeamEditingForm = () => (
    <Dialog open={isEditingTeam} onOpenChange={setIsEditingTeam}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("editTeam")}</DialogTitle>
          <DialogDescription>{t("editTeamDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="edit-team-name" className="text-sm font-medium">
              {t("teamName")}
            </label>
            <Input
              id="edit-team-name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder={t("enterTeamName")}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-team-description" className="text-sm font-medium">
              {t("teamDescription")}
            </label>
            <Textarea
              id="edit-team-description"
              value={newTeamDescription}
              onChange={(e) => setNewTeamDescription(e.target.value)}
              placeholder={t("enterTeamDescription")}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsEditingTeam(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleUpdateTeam} disabled={!newTeamName.trim() || isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {t("saveChanges")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // Render add Pokémon dialog
  const renderAddPokemonDialog = () => (
    <Dialog open={isAddingPokemon} onOpenChange={setIsAddingPokemon}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("addPokemon")}</DialogTitle>
          <DialogDescription>{t("searchPokemonToAdd")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="position" className="text-sm font-medium">
              {t("position")}
            </label>
            <Select
              value={selectedPosition.toString()}
              onValueChange={(value) => setSelectedPosition(Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectPosition")} />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((pos) => (
                  <SelectItem key={pos} value={pos.toString()}>
                    {t("position")} {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("searchByNameOrId")}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : t("search")}
            </Button>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((pokemon) => (
                  <div
                    key={pokemon.id}
                    className="flex items-center p-2 border rounded hover:bg-accent cursor-pointer"
                    onClick={() => handleAddPokemon(pokemon)}
                  >
                    <div className="relative h-10 w-10 mr-3">
                      <Image
                        src={pokemon.sprites.front_default || "/placeholder.svg?height=40&width=40"}
                        alt={pokemon.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-medium">
                        #{pokemon.id} {pokemon.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {pokemon.types.map((t) => t.type.name).join(", ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm && !isSearching ? (
              <p className="text-center py-4 text-muted-foreground">{t("noPokemonFound")}</p>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsAddingPokemon(false)}>
            {t("cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // Render team details
  const renderTeamDetails = () => {
    if (!selectedTeam) {
      return null
    }

    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{selectedTeam.name}</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={startEditingTeam}>
              <Edit className="h-4 w-4 mr-2" />
              {t("edit")}
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteTeam}>
              <Trash className="h-4 w-4 mr-2" />
              {t("delete")}
            </Button>
          </div>
        </div>

        {selectedTeam.description && <p className="text-muted-foreground mb-6">{selectedTeam.description}</p>}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
          {teamMembers.map((pokemon, index) => (
            <Card key={index} className="overflow-hidden">
              {pokemon ? (
                <>
                  <div className="relative h-24 bg-muted flex items-center justify-center">
                    <Image
                      src={pokemon.sprites.front_default || "/placeholder.svg?height=96&width=96"}
                      alt={pokemon.name}
                      width={96}
                      height={96}
                      className="object-contain"
                    />
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium truncate">{pokemon.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pokemon.types.map(({ type }) => (
                        <span
                          key={type.name}
                          className={`text-xs px-1.5 py-0.5 rounded pokemon-type pokemon-type-${type.name}`}
                        >
                          {type.name}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="p-2 pt-0 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => handleRemovePokemon(index + 1)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </>
              ) : (
                <div
                  className="h-full flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-accent"
                  onClick={() => {
                    setSelectedPosition(index + 1)
                    setIsAddingPokemon(true)
                  }}
                >
                  <div className="h-24 flex items-center justify-center">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{t("addPokemon")}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">{t("teamBuilder")}</h1>

      {renderTeamSelection()}
      {renderTeamDetails()}
      {renderTeamCreationForm()}
      {renderTeamEditingForm()}
      {renderAddPokemonDialog()}
    </div>
  )
}

