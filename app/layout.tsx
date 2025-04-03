import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AppProvider } from "@/contexts/app-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pokémon App",
  description: "A simple Pokémon listing application with language and theme switching",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} flex min-h-screen flex-col`}>
        <AppProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </AppProvider>
      </body>
    </html>
  )
}

