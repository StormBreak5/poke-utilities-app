import type { EggGroup, PokemonSpecies } from "@/types/pokemon"

const API_URL = "https://pokeapi.co/api/v2"

export async function getAllEggGroups(): Promise<EggGroup[]> {
  const response = await fetch(`${API_URL}/egg-group?limit=20`)

  if (!response.ok) {
    throw new Error(`Failed to fetch egg groups: ${response.status}`)
  }

  const data = await response.json()

  // Buscar detalhes de cada grupo de ovos
  const eggGroupPromises = data.results.map(async (group: { name: string; url: string }) => {
    return getEggGroupDetails(group.name)
  })

  return Promise.all(eggGroupPromises)
}

export async function getEggGroupDetails(name: string): Promise<EggGroup> {
  const response = await fetch(`${API_URL}/egg-group/${name}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch egg group details: ${response.status}`)
  }

  return response.json()
}

export async function getPokemonSpeciesByEggGroup(eggGroupName: string): Promise<PokemonSpecies[]> {
  const eggGroup = await getEggGroupDetails(eggGroupName)

  // Buscar detalhes de cada espécie de Pokémon
  const speciesPromises = eggGroup.pokemon_species.map(async (species) => {
    const response = await fetch(species.url)

    if (!response.ok) {
      throw new Error(`Failed to fetch species details: ${response.status}`)
    }

    return response.json()
  })

  return Promise.all(speciesPromises)
}

