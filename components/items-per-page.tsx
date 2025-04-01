"use client"

import { useTranslations } from "@/hooks/use-translations"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface ItemsPerPageProps {
  value: number
  onChange: (value: number) => void
}

export function ItemsPerPage({ value, onChange }: ItemsPerPageProps) {
  const { t } = useTranslations()

  const handleChange = (newValue: string) => {
    onChange(Number.parseInt(newValue, 10))
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor="items-per-page">{t("itemsPerPage")}</Label>
      <Select value={value.toString()} onValueChange={handleChange}>
        <SelectTrigger id="items-per-page" className="w-full">
          <SelectValue placeholder="20" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="20">20</SelectItem>
          <SelectItem value="50">50</SelectItem>
          <SelectItem value="100">100</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

