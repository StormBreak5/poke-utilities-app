"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PokeballIcon } from "@/components/pokeball-icon"
import { useTranslations } from "@/hooks/use-translations"
import { FcGoogle } from "react-icons/fc"

export default function SignIn() {
  const { t } = useTranslations()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const [isLoading, setIsLoading] = useState(false)
  const error = searchParams.get("error")

  const handleSignIn = async (provider: string) => {
    setIsLoading(true)
    await signIn(provider, { callbackUrl })
    setIsLoading(false)
  }

  return (
    <div className="container flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <PokeballIcon className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Poke Utilities</CardTitle>
          <CardDescription>{t("signInToContinue")}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/15 text-destructive text-center p-3 rounded-md mb-4">
              {error === "OAuthCallback" ? t("authError") : t("unknownError")}
            </div>
          )}
          <Button
            variant="outline"
            className="w-full h-12 flex items-center justify-center gap-2"
            onClick={() => handleSignIn("google")}
            disabled={isLoading}
          >
            <FcGoogle className="h-5 w-5" />
            {t("signInWithGoogle")}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">{t("privacyNotice")}</CardFooter>
      </Card>
    </div>
  )
}

