"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "@/hooks/use-translations"
import { getItemsList, getItemDetails, searchItems, type Item } from "@/services/items-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search } from "lucide-react"
import Image from "next/image"
import { useDebounce } from "@/hooks/use-debounce"
import { useAppContext } from "@/contexts/app-context"

export default function ItemsPage() {
  const { t } = useTranslations()
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [offset, setOffset] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 20
  const { language } = useAppContext() // Access language here

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Load items on mount or when offset changes
  useEffect(() => {
    async function loadItems() {
      if (debouncedSearchTerm) return // Skip if we're searching

      try {
        setIsLoading(true)
        setError(null)

        const response = await getItemsList(itemsPerPage, offset)
        setTotalCount(response.count)

        // Fetch details for each item
        const itemDetailsPromises = response.results.map((item) =>
          getItemDetails(item.name).catch((err) => {
            console.error(`Error fetching item ${item.name}:`, err)
            return null
          }),
        )

        const itemDetails = await Promise.all(itemDetailsPromises)
        setItems(itemDetails.filter((item): item is Item => item !== null))
      } catch (err) {
        console.error("Error loading items:", err)
        setError(t("error"))
      } finally {
        setIsLoading(false)
      }
    }

    loadItems()
  }, [offset, debouncedSearchTerm, t])

  // Handle search
  useEffect(() => {
    async function performSearch() {
      if (!debouncedSearchTerm) return

      try {
        setIsSearching(true)
        setError(null)

        const results = await searchItems(debouncedSearchTerm)
        setItems(results)
      } catch (err) {
        console.error("Error searching items:", err)
        setError(t("error"))
      } finally {
        setIsSearching(false)
      }
    }

    performSearch()
  }, [debouncedSearchTerm, t])

  // Format item name with first letter capitalized and hyphens replaced with spaces
  const formatName = (name: string) => {
    return name
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  }

  // Get item description in the current language
  const getItemDescription = (item: Item) => {
    // Try to find effect entry in current language
    const effectEntry = item.effect_entries.find(
      (entry) => entry.language.name === language || entry.language.name === "en",
    )

    if (effectEntry) {
      return effectEntry.short_effect
    }

    // If no effect entry, try flavor text
    const flavorEntry = item.flavor_text_entries.find(
      (entry) => entry.language.name === language || entry.language.name === "en",
    )

    return flavorEntry ? flavorEntry.text : t("noDescription")
  }

  // Pagination handlers
  const handlePrevious = () => {
    setOffset(Math.max(0, offset - itemsPerPage))
  }

  const handleNext = () => {
    if (offset + itemsPerPage < totalCount) {
      setOffset(offset + itemsPerPage)
    }
  }

  const showLoading = isLoading || isSearching

  return (
    <main className="container py-8">
      <h1 className="text-3xl font-bold mb-6">{t("heldItems")}</h1>

      <div className="flex mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder={t("searchItems")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {showLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">{t("loading")}</span>
        </div>
      ) : error ? (
        <div className="flex h-64 items-center justify-center text-red-500">{error}</div>
      ) : items.length === 0 ? (
        <div className="flex h-64 items-center justify-center">{t("noItems")}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <div className="relative h-10 w-10 mr-3">
                      <Image
                        src={item.sprites.default || "/placeholder.svg?height=40&width=40"}
                        alt={item.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <CardTitle className="text-lg">{formatName(item.name)}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{getItemDescription(item)}</p>
                  <div className="mt-2 flex items-center text-xs text-muted-foreground">
                    <span className="font-medium mr-1">{t("category")}:</span>
                    <span>{formatName(item.category.name)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!searchTerm && (
            <div className="mt-6 flex justify-center gap-4">
              <Button onClick={handlePrevious} disabled={offset === 0 || showLoading}>
                {t("previous")}
              </Button>
              <Button onClick={handleNext} disabled={offset + itemsPerPage >= totalCount || showLoading}>
                {t("next")}
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  )
}

