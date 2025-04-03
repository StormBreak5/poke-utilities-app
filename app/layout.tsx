import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AppProvider } from "@/contexts/app-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AuthProvider } from "@/components/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Poke Utilities",
  description: "A comprehensive Pokémon utility application with various tools and features",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} flex min-h-screen flex-col`}>
        <AuthProvider>
          <AppProvider>
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

