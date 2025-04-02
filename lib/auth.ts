const mockSession = {
  user: {
    email: "user@example.com",
    name: "Test User",
  },
}

export async function auth() {
  // In a real app, this would check for an authenticated session
  // For now, we'll return a mock session for development
  return mockSession
}

