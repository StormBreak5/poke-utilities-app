"use client"

import { useAppContext } from "@/contexts/app-context"
import { type TranslationKey, translations } from "@/translations"
import { useCallback } from "react"

export function useTranslations() {
  const { language } = useAppContext()

  // Use useCallback para memoizar a função t
  const t = useCallback(
    (key: TranslationKey) => {
      return translations[language][key]
    },
    [language],
  )

  return { t }
}

