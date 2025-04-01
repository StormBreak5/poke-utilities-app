// Definição das regiões dos jogos Pokémon e seus intervalos de IDs
export interface Region {
  id: number
  name: string
  nameTranslationKey: string
  startId: number
  endId: number
}

export const regions: Region[] = [
  { id: 1, name: "kanto", nameTranslationKey: "kanto", startId: 1, endId: 151 },
  { id: 2, name: "johto", nameTranslationKey: "johto", startId: 152, endId: 251 },
  { id: 3, name: "hoenn", nameTranslationKey: "hoenn", startId: 252, endId: 386 },
  { id: 4, name: "sinnoh", nameTranslationKey: "sinnoh", startId: 387, endId: 493 },
  { id: 5, name: "unova", nameTranslationKey: "unova", startId: 494, endId: 649 },
  { id: 6, name: "kalos", nameTranslationKey: "kalos", startId: 650, endId: 721 },
  { id: 7, name: "alola", nameTranslationKey: "alola", startId: 722, endId: 809 },
  { id: 8, name: "galar", nameTranslationKey: "galar", startId: 810, endId: 898 },
  { id: 9, name: "paldea", nameTranslationKey: "paldea", startId: 899, endId: 1025 },
]

export function isPokemonInRegion(pokemonId: number, regionId: number | null): boolean {
  if (regionId === null) return true

  const region = regions.find((r) => r.id === regionId)
  if (!region) return true

  return pokemonId >= region.startId && pokemonId <= region.endId
}

// Função para obter todos os IDs de Pokémon de uma região
export function getPokemonIdsInRegion(regionId: number): number[] {
  const region = regions.find((r) => r.id === regionId)
  if (!region) return []

  const ids: number[] = []
  for (let i = region.startId; i <= region.endId; i++) {
    ids.push(i)
  }

  return ids
}

