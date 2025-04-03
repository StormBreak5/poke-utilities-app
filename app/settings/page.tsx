"use client"

import { useSession } from "next-auth/react"
import { useTranslations } from "@/hooks/use-translations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { redirect } from "next/navigation"

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const { t } = useTranslations()

  // Redirect to sign in if not authenticated
  if (status === "unauthenticated") {
    redirect("/auth/signin")
  }

  if (status === "loading") {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t("loading")}</span>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">{t("settings")}</h1>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">{t("account")}</TabsTrigger>
          <TabsTrigger value="appearance">{t("appearance")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("notifications")}</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("accountSettings")}</CardTitle>
              <CardDescription>{t("manageAccountSettings")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <p className="text-sm font-medium">{t("email")}</p>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">{t("name")}</p>
                <p className="text-sm text-muted-foreground">{session?.user?.name || t("noName")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("appearanceSettings")}</CardTitle>
              <CardDescription>{t("manageAppearanceSettings")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Theme settings will be added here */}
              <p className="text-sm text-muted-foreground">{t("comingSoon")}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("notificationSettings")}</CardTitle>
              <CardDescription>{t("manageNotificationSettings")}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Notification settings will be added here */}
              <p className="text-sm text-muted-foreground">{t("comingSoon")}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

