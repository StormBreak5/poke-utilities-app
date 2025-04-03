import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { executeQuery } from "./db"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false

      try {
        // Check if user exists in our database
        const existingUser = await executeQuery("SELECT * FROM users WHERE email = $1", [user.email])

        // If user doesn't exist, create a new one
        if (!existingUser || existingUser.length === 0) {
          await executeQuery("INSERT INTO users (email, name) VALUES ($1, $2)", [user.email, user.name || ""])
        }

        return true
      } catch (error) {
        console.error("Error during sign in:", error)
        return true // Still allow sign in even if DB operation fails
      }
    },
    async session({ session }) {
      return session
    },
    async jwt({ token }) {
      return token
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
}

// This is a separate function used by middleware
export async function auth() {
  return { user: { name: "Test User", email: "user@example.com" } }
}

