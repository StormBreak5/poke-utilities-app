"use client"

import { useState } from "react"
import { useTranslations } from "@/hooks/use-translations"
import { usePokemonStorage } from "@/hooks/use-pokemon-storage"
import { parseShowdownTeam, findPokemonByShowdownName } from "@/utils/showdown-parser"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImportShowdownTeamProps {
  onImportComplete?: () => void
}

export function ImportShowdownTeam({ onImportComplete }: ImportShowdownTeamProps) {
  const { t } = useTranslations()
  const { toast } = useToast()
  const { createTeam, addPokemonToTeam } = usePokemonStorage()

  const [isOpen, setIsOpen] = useState(false)
  const [teamInput, setTeamInput] = useState("")
  const [teamName, setTeamName] = useState("")
  const [teamDescription, setTeamDescription] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 })

  const handleImport = async () => {
    if (!teamInput.trim()) {
      toast({
        title: t("error"),
        description: t("pleaseEnterTeamData"),
        variant: "destructive",
      })
      return
    }

    try {
      setIsImporting(true)

      // Parse the team
      const parsedTeam = parseShowdownTeam(teamInput)

      // Use the parsed team name if available and no custom name provided
      const finalTeamName = teamName.trim() || parsedTeam.name || t("importedTeam")

      // Create a new team
      const result = await createTeam(finalTeamName, teamDescription)

      if (!result.teamId) {
        throw new Error("Failed to create team")
      }

      // Add each Pokémon to the team
      const teamId = result.teamId
      setImportProgress({ current: 0, total: parsedTeam.pokemon.length })

      for (let i = 0; i < parsedTeam.pokemon.length; i++) {
        const pokemon = parsedTeam.pokemon[i]
        setImportProgress({ current: i + 1, total: parsedTeam.pokemon.length })

        // Find the Pokémon ID from the API
        const pokemonId = await findPokemonByShowdownName(pokemon.species)

        if (pokemonId) {
          // Add to team (position is 1-based)
          await addPokemonToTeam(teamId, pokemonId, i + 1, pokemon.nickname)
        } else {
          console.error(`Could not find Pokémon: ${pokemon.species}`)
          toast({
            title: t("warning"),
            description: t("couldNotFindPokemon", { name: pokemon.species }),
            variant: "destructive",
          })
        }
      }

      toast({
        title: t("success"),
        description: t("teamImportedSuccessfully"),
      })

      // Reset form and close dialog
      setTeamInput("")
      setTeamName("")
      setTeamDescription("")
      setIsOpen(false)

      // Notify parent component
      if (onImportComplete) {
        onImportComplete()
      }
    } catch (error) {
      console.error("Error importing team:", error)
      toast({
        title: t("error"),
        description: t("errorImportingTeam"),
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
      setImportProgress({ current: 0, total: 0 })
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
        <Upload className="h-4 w-4" />
        {t("importShowdownTeam")}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("importShowdownTeam")}</DialogTitle>
            <DialogDescription>{t("pasteShowdownTeamFormat")}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="team-name">{t("teamName")}</Label>
              <Input
                id="team-name"
                placeholder={t("enterTeamName")}
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="team-description">{t("teamDescription")}</Label>
              <Input
                id="team-description"
                placeholder={t("enterTeamDescription")}
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="team-data">{t("showdownTeamData")}</Label>
              <Textarea
                id="team-data"
                placeholder={t("pasteShowdownTeamHere")}
                value={teamInput}
                onChange={(e) => setTeamInput(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isImporting}>
              {t("cancel")}
            </Button>
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {importProgress.current > 0
                    ? `${t("importing")} (${importProgress.current}/${importProgress.total})`
                    : t("importing")}
                </span>
              ) : (
                t("importTeam")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

