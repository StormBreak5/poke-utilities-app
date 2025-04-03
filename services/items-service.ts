const API_URL = "https://pokeapi.co/api/v2"

export interface Item {
  id: number
  name: string
  sprites: {
    default: string
  }
  cost: number
  effect_entries: Array<{
    effect: string
    short_effect: string
    language: {
      name: string
      url: string
    }
  }>
  flavor_text_entries: Array<{
    text: string
    language: {
      name: string
      url: string
    }
  }>
  category: {
    name: string
    url: string
  }
  attributes: Array<{
    name: string
    url: string
  }>
}

export interface ItemListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Array<{
    name: string
    url: string
  }>
}

// Get a list of items with pagination
export async function getItemsList(limit = 20, offset = 0): Promise<ItemListResponse> {
  const response = await fetch(`${API_URL}/item?limit=${limit}&offset=${offset}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch items list: ${response.status}`)
  }

  return response.json()
}

// Get details for a specific item
export async function getItemDetails(nameOrId: string | number): Promise<Item> {
  const response = await fetch(`${API_URL}/item/${nameOrId}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch item details: ${response.status}`)
  }

  return response.json()
}

// Search for items by name
export async function searchItems(query: string): Promise<Item[]> {
  try {
    // First get a large list of items
    const response = await fetch(`${API_URL}/item?limit=100`)

    if (!response.ok) {
      throw new Error(`Failed to fetch items: ${response.status}`)
    }

    const data: ItemListResponse = await response.json()

    // Filter items by name
    const filteredItems = data.results
      .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 20) // Limit to 20 results

    // Fetch details for each filtered item
    const itemDetailsPromises = filteredItems.map((item) => getItemDetails(item.name))
    const itemDetails = await Promise.all(itemDetailsPromises)

    return itemDetails
  } catch (error) {
    console.error("Error searching items:", error)
    return []
  }
}

// Get a batch of item details by IDs or names
export async function getItemDetailsBatch(itemIds: (string | number)[]): Promise<Item[]> {
  const promises = itemIds.map((id) => getItemDetails(id))
  return Promise.all(promises)
}

