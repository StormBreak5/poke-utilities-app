import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Initialize the SQL client with the database URL from environment variables
const sql = neon(process.env.DATABASE_URL!)

// Initialize the Drizzle ORM with the SQL client
export const db = drizzle(sql)

// Helper function for raw SQL queries
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T> {
  return sql(query, params) as Promise<T>
}

// Helper function to get user ID from email
export async function getUserIdFromEmail(email: string): Promise<number | null> {
  try {
    const result = await executeQuery<any[]>("SELECT id FROM users WHERE email = $1", [email])

    if (!result.length) {
      return null
    }

    return result[0].id
  } catch (error) {
    console.error("Error getting user ID:", error)
    return null
  }
}

// Helper function to ensure user exists
export async function ensureUserExists(email: string, name = ""): Promise<number | null> {
  try {
    // Check if user exists
    const userId = await getUserIdFromEmail(email)

    if (userId) {
      return userId
    }

    // Create user if not exists
    const newUser = await executeQuery<any[]>("INSERT INTO users (email, name) VALUES ($1, $2) RETURNING id", [
      email,
      name,
    ])

    return newUser[0].id
  } catch (error) {
    console.error("Error ensuring user exists:", error)
    return null
  }
}

