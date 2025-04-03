"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "@/hooks/use-translations"
import { usePokemonStorage } from "@/hooks/use-pokemon-storage"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, User, Heart, Users } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function ProfilePage() {
  const { t } = useTranslations()
  const { isLoading, getCurrentUser, updateUserProfile, getUserStats } = usePokemonStorage()
  const { data: session, status } = useSession()

  const [user, setUser] = useState<{ id: number; email: string; name: string | null } | null>(null)
  const [stats, setStats] = useState({ favoriteCount: 0, teamCount: 0 })
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState("")

  // Redirect to sign in if not authenticated
  if (status === "unauthenticated") {
    redirect("/auth/signin")
  }

  useEffect(() => {
    async function loadUserData() {
      const { user } = await getCurrentUser()
      if (user) {
        setUser(user)
        setName(user.name || "")
      }

      const userStats = await getUserStats()
      setStats(userStats)
    }

    if (status === "authenticated") {
      loadUserData()
    }
  }, [getCurrentUser, getUserStats, status])

  const handleUpdateProfile = async () => {
    const result = await updateUserProfile(name)

    if (result.success) {
      const { user } = await getCurrentUser()
      if (user) {
        setUser(user)
      }
      setIsEditing(false)
    }
  }

  if (status === "loading" || !session) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t("loading")}</span>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">{t("profile")}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              {t("userInformation")}
            </CardTitle>
            <CardDescription>{t("yourAccountDetails")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    {t("name")}
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("enterYourName")}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    {t("email")}
                  </label>
                  <Input id="email" value={session.user?.email || ""} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">{t("emailCannotBeChanged")}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("name")}</p>
                  <p>{session.user?.name || t("noNameProvided")}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("email")}</p>
                  <p>{session.user?.email}</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            {isEditing ? (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  {t("cancel")}
                </Button>
                <Button onClick={handleUpdateProfile} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {t("saveChanges")}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>{t("editProfile")}</Button>
            )}
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="mr-2 h-5 w-5" />
                {t("favorites")}
              </CardTitle>
              <CardDescription>{t("yourFavoritePokemon")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.favoriteCount}</div>
              <p className="text-muted-foreground">
                {stats.favoriteCount === 1 ? t("favoritePokemonSingular") : t("favoritePokemonPlural")}
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/favorites" className="w-full">
                <Button className="w-full">{t("viewFavorites")}</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                {t("teams")}
              </CardTitle>
              <CardDescription>{t("yourPokemonTeams")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.teamCount}</div>
              <p className="text-muted-foreground">{stats.teamCount === 1 ? t("teamSingular") : t("teamPlural")}</p>
            </CardContent>
            <CardFooter>
              <Link href="/teams" className="w-full">
                <Button className="w-full">{t("viewTeams")}</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

