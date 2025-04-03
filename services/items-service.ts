const API_URL = "https://pokeapi.co/api/v2"
const HELD_ITEMS_CATEGORY_URL = "https://pokeapi.co/api/v2/item-category/12/"

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

export interface ItemCategoryResponse {
  id: number
  name: string
  items: Array<{
    name: string
    url: string
  }>
  names: Array<{
    name: string
    language: {
      name: string
      url: string
    }
  }>
  pocket: {
    name: string
    url: string
  }
}

// Get a list of held items
export async function getHeldItemsList(
  limit = 20,
  offset = 0,
): Promise<{
  items: Array<{
    name: string
    url: string
  }>
  total: number
}> {
  try {
    // First, fetch the held items category
    const response = await fetch(HELD_ITEMS_CATEGORY_URL)

    if (!response.ok) {
      throw new Error(`Failed to fetch held items category: ${response.status}`)
    }

    const categoryData: ItemCategoryResponse = await response.json()
    const totalItems = categoryData.items.length

    // Apply pagination manually since the API doesn't support it for category items
    const paginatedItems = categoryData.items.slice(offset, offset + limit)

    return {
      items: paginatedItems,
      total: totalItems,
    }
  } catch (error) {
    console.error("Error fetching held items:", error)
    throw error
  }
}

// Get details for a specific item
export async function getItemDetails(nameOrId: string | number): Promise<Item> {
  const response = await fetch(`${API_URL}/item/${nameOrId}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch item details: ${response.status}`)
  }

  return response.json()
}

// Search for held items by name
export async function searchHeldItems(query: string): Promise<Item[]> {
  try {
    // First get the list of all held items
    const { items } = await getHeldItemsList(1000) // Get all held items

    // Filter items by name
    const filteredItems = items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())).slice(0, 20) // Limit to 20 results

    // Fetch details for each filtered item
    const itemDetailsPromises = filteredItems.map((item) => getItemDetails(item.name))
    const itemDetails = await Promise.all(itemDetailsPromises)

    return itemDetails
  } catch (error) {
    console.error("Error searching held items:", error)
    return []
  }
}

// Get a batch of item details by IDs or names
export async function getItemDetailsBatch(itemIds: (string | number)[]): Promise<Item[]> {
  const promises = itemIds.map((id) => getItemDetails(id))
  return Promise.all(promises)
}

