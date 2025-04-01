"use client"

import { useTranslations } from "@/hooks/use-translations"
import { regions } from "@/services/regions-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface RegionFilterProps {
  selectedRegion: number | null
  onRegionChange: (regionId: number | null) => void
}

export function RegionFilter({ selectedRegion, onRegionChange }: RegionFilterProps) {
  const { t } = useTranslations()

  const handleChange = (value: string) => {
    const regionId = value === "all" ? null : Number.parseInt(value, 10)
    onRegionChange(regionId)
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor="region-filter">{t("region")}</Label>
      <Select value={selectedRegion === null ? "all" : selectedRegion.toString()} onValueChange={handleChange}>
        <SelectTrigger id="region-filter" className="w-full">
          <SelectValue placeholder={t("allRegions")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allRegions")}</SelectItem>
          {regions.map((region) => (
            <SelectItem key={region.id} value={region.id.toString()}>
              {t(region.nameTranslationKey as any)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

