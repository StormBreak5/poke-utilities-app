export interface ShowdownPokemon {
  name: string
  species: string
  item?: string
  ability?: string
  moves: string[]
  nature?: string
  evs?: Record<string, number>
  ivs?: Record<string, number>
  level?: number
  gender?: string
  shiny?: boolean
  happiness?: number
  nickname?: string
}

export interface ShowdownTeam {
  name?: string
  pokemon: ShowdownPokemon[]
}

/**
 * Parse a Pokémon Showdown team export format
 */
export function parseShowdownTeam(input: string): ShowdownTeam {
  const lines = input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
  const team: ShowdownTeam = { pokemon: [] }
  let currentPokemon: Partial<ShowdownPokemon> | null = null

  for (const line of lines) {
    // Check if this is a team name line (=== Team Name ===)
    if (line.startsWith("===") && line.endsWith("===")) {
      team.name = line.replace(/===/g, "").trim()
      continue
    }

    // Check if this is the start of a new Pokémon
    if (!line.startsWith("|") && !line.startsWith("-") && !line.startsWith("IVs:") && !line.startsWith("EVs:")) {
      // Save the previous Pokémon if it exists
      if (currentPokemon?.species) {
        team.pokemon.push(currentPokemon as ShowdownPokemon)
      }

      // Start a new Pokémon
      currentPokemon = { moves: [] }

      // Parse the Pokémon line
      const pokemonLine = line.split("@").map((part) => part.trim())
      const nameOrSpecies = pokemonLine[0]

      // Check for nickname
      if (nameOrSpecies.includes("(") && nameOrSpecies.includes(")")) {
        const match = nameOrSpecies.match(/^(.*) $$(.*)$$$/)
        if (match) {
          currentPokemon.nickname = match[1]
          currentPokemon.species = match[2]
        } else {
          currentPokemon.species = nameOrSpecies
        }
      } else {
        currentPokemon.species = nameOrSpecies
      }

      // Remove gender symbol from species
      currentPokemon.species = currentPokemon.species.replace(/\s*$$[MF]$$$/, "")

      // Set name to be the same as species if no nickname
      currentPokemon.name = currentPokemon.nickname || currentPokemon.species

      // Parse item if present
      if (pokemonLine.length > 1) {
        currentPokemon.item = pokemonLine[1]
      }

      continue
    }

    // Skip if no current Pokémon
    if (!currentPokemon) continue

    // Parse ability
    if (line.startsWith("Ability:")) {
      currentPokemon.ability = line.substring("Ability:".length).trim()
      continue
    }

    // Parse level
    if (line.startsWith("Level:")) {
      currentPokemon.level = Number.parseInt(line.substring("Level:".length).trim(), 10)
      continue
    }

    // Parse EVs
    if (line.startsWith("EVs:")) {
      currentPokemon.evs = {}
      const evParts = line.substring("EVs:".length).trim().split("/")
      for (const part of evParts) {
        const [value, stat] = part.trim().split(" ")
        const statKey = mapStatToKey(stat)
        if (statKey) {
          currentPokemon.evs[statKey] = Number.parseInt(value, 10)
        }
      }
      continue
    }

    // Parse IVs
    if (line.startsWith("IVs:")) {
      currentPokemon.ivs = {}
      const ivParts = line.substring("IVs:".length).trim().split("/")
      for (const part of ivParts) {
        const [value, stat] = part.trim().split(" ")
        const statKey = mapStatToKey(stat)
        if (statKey) {
          currentPokemon.ivs[statKey] = Number.parseInt(value, 10)
        }
      }
      continue
    }

    // Parse nature
    if (line.endsWith("Nature")) {
      currentPokemon.nature = line.split(" ")[0]
      continue
    }

    // Parse shiny
    if (line === "Shiny: Yes") {
      currentPokemon.shiny = true
      continue
    }

    // Parse happiness
    if (line.startsWith("Happiness:")) {
      currentPokemon.happiness = Number.parseInt(line.substring("Happiness:".length).trim(), 10)
      continue
    }

    // Parse gender
    if (line === "Gender: M") {
      currentPokemon.gender = "M"
      continue
    }
    if (line === "Gender: F") {
      currentPokemon.gender = "F"
      continue
    }

    // Parse moves
    if (line.startsWith("- ")) {
      const move = line.substring(2).trim()
      if (currentPokemon.moves) {
        currentPokemon.moves.push(move)
      }
      continue
    }
  }

  // Add the last Pokémon if it exists
  if (currentPokemon?.species) {
    team.pokemon.push(currentPokemon as ShowdownPokemon)
  }

  return team
}

/**
 * Map Pokémon Showdown stat names to our stat keys
 */
function mapStatToKey(stat: string): string | null {
  const statMap: Record<string, string> = {
    HP: "hp",
    Atk: "attack",
    Def: "defense",
    SpA: "special-attack",
    SpD: "special-defense",
    Spe: "speed",
  }
  return statMap[stat] || null
}

/**
 * Find a Pokémon in the PokéAPI by its Showdown name
 */
export async function findPokemonByShowdownName(name: string): Promise<number | null> {
  try {
    // Clean up the name to match PokéAPI format
    const cleanName = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-") // Replace non-alphanumeric with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with a single one
      .replace(/^-|-$/g, "") // Remove leading/trailing hyphens

    // Handle special cases
    const specialCases: Record<string, string> = {
      "nidoran-m": "nidoran-male",
      "nidoran-f": "nidoran-female",
      "mr-mime": "mr-mime",
      "mime-jr": "mime-jr",
      "type-null": "type-null",
      "tapu-koko": "tapu-koko",
      "tapu-lele": "tapu-lele",
      "tapu-bulu": "tapu-bulu",
      "tapu-fini": "tapu-fini",
      "ho-oh": "ho-oh",
      "porygon-z": "porygon-z",
      "jangmo-o": "jangmo-o",
      "hakamo-o": "hakamo-o",
      "kommo-o": "kommo-o",
    }

    const apiName = specialCases[cleanName] || cleanName

    // Try to fetch the Pokémon from the API
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${apiName}`)

    if (!response.ok) {
      console.error(`Failed to find Pokémon: ${name} (${apiName})`)
      return null
    }

    const data = await response.json()
    return data.id
  } catch (error) {
    console.error(`Error finding Pokémon ${name}:`, error)
    return null
  }
}

