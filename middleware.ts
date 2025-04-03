import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// List of paths that require authentication
const protectedPaths = ["/profile", "/settings", "/favorites", "/teams"]

// List of paths that are accessible only to non-authenticated users
const authPaths = ["/auth/signin"]

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isAuthenticated = !!token
  const path = request.nextUrl.pathname

  // Check if the path is protected and user is not authenticated
  const isProtectedPath = protectedPaths.some(
    (protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`),
  )

  if (isProtectedPath && !isAuthenticated) {
    const url = new URL("/auth/signin", request.url)
    url.searchParams.set("callbackUrl", path)
    return NextResponse.redirect(url)
  }

  // Check if the path is for auth and user is already authenticated
  const isAuthPath = authPaths.some((authPath) => path === authPath || path.startsWith(`${authPath}/`))

  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/profile/:path*", "/settings/:path*", "/favorites/:path*", "/teams/:path*", "/auth/signin"],
}

