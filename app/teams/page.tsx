"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "@/hooks/use-translations"
import { usePokemonStorage } from "@/hooks/use-pokemon-storage"
import { TeamBuilder } from "@/components/team-builder"
import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function TeamsPage() {
  const { t } = useTranslations()
  const { isLoading: isStorageLoading } = usePokemonStorage()
  const [isLoading, setIsLoading] = useState(true)
  const { status } = useSession()

  // Redirect to sign in if not authenticated
  if (status === "unauthenticated") {
    redirect("/auth/signin?callbackUrl=/teams")
  }

  useEffect(() => {
    if (status === "authenticated") {
      setIsLoading(false)
    }
  }, [status])

  if (status === "loading" || isLoading || isStorageLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t("loading")}</span>
      </div>
    )
  }

  return <TeamBuilder />
}

