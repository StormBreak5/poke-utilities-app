import type { PokemonDetails, PokemonListResponse, PokemonSpecies, EvolutionChain, MoveDetails } from "@/types/pokemon"
import { getPokemonIdsInRegion } from "./regions-service"

const API_URL = "https://pokeapi.co/api/v2"

export async function getPokemonList(offset = 0, limit = 20): Promise<PokemonListResponse> {
  const response = await fetch(`${API_URL}/pokemon?offset=${offset}&limit=${limit}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch Pokémon list: ${response.status}`)
  }

  return response.json()
}

export async function getPokemonDetails(nameOrId: string | number): Promise<PokemonDetails> {
  const response = await fetch(`${API_URL}/pokemon/${nameOrId}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch Pokémon details: ${response.status}`)
  }

  const data = await response.json()

  // Garantir que os campos necessários existem
  return {
    ...data,
    sprites: {
      ...data.sprites,
      front_default: data.sprites.front_default || null,
      other: {
        ...data.sprites.other,
        "official-artwork": {
          front_default: data.sprites.other?.["official-artwork"]?.front_default || null,
        },
      },
    },
  }
}

export async function getPokemonSpecies(nameOrId: string | number): Promise<PokemonSpecies> {
  const response = await fetch(`${API_URL}/pokemon-species/${nameOrId}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch Pokémon species: ${response.status}`)
  }

  return response.json()
}

export async function getEvolutionChain(url: string): Promise<EvolutionChain> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch evolution chain: ${response.status}`)
  }

  return response.json()
}

export async function getMoveDetails(url: string): Promise<MoveDetails> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch move details: ${response.status}`)
  }

  return response.json()
}

export async function searchPokemon(query: string): Promise<PokemonDetails[]> {
  try {
    // Se a query for um número, tentamos buscar diretamente pelo ID
    if (/^\d+$/.test(query)) {
      const pokemon = await getPokemonDetails(query)
      return [pokemon]
    }

    // Caso contrário, buscamos pelo nome
    try {
      const pokemon = await getPokemonDetails(query.toLowerCase())
      return [pokemon]
    } catch (error) {
      // Se não encontrar um Pokémon específico, tentamos buscar uma lista
      const listResponse = await fetch(`${API_URL}/pokemon?limit=1025`)
      if (!listResponse.ok) {
        return []
      }

      const data: PokemonListResponse = await listResponse.json()

      // Filtramos os resultados que contêm a query no nome
      const filteredResults = data.results
        .filter((pokemon) => pokemon.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 20) // Limitamos a 20 resultados para não sobrecarregar

      // Buscamos os detalhes de cada Pokémon filtrado
      const detailsPromises = filteredResults.map((pokemon) => getPokemonDetails(pokemon.name).catch(() => null))

      const pokemonDetails = await Promise.all(detailsPromises)
      return pokemonDetails.filter((pokemon): pokemon is PokemonDetails => pokemon !== null)
    }
  } catch (error) {
    console.error("Error searching Pokémon:", error)
    return []
  }
}

// Função para buscar vários Pokémon por IDs
export async function getPokemonByIds(ids: number[]): Promise<PokemonDetails[]> {
  // Limitamos a quantidade de requisições simultâneas para evitar sobrecarga
  const batchSize = 10
  const results: PokemonDetails[] = []

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize)
    const promises = batch.map((id) => getPokemonDetails(id).catch(() => null))
    const batchResults = await Promise.all(promises)

    results.push(...batchResults.filter((result): result is PokemonDetails => result !== null))
  }

  return results
}

// Função para buscar Pokémon por região
export async function getPokemonByRegion(
  regionId: number,
  limit = 20,
  offset = 0,
): Promise<{
  pokemon: PokemonDetails[]
  total: number
}> {
  const allIds = getPokemonIdsInRegion(regionId)
  const total = allIds.length

  // Aplicamos a paginação nos IDs
  const paginatedIds = allIds.slice(offset, offset + limit)

  // Buscamos os detalhes dos Pokémon
  const pokemon = await getPokemonByIds(paginatedIds)

  return {
    pokemon,
    total,
  }
}

