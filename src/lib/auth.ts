import NextAuth, { NextAuthConfig } from "next-auth"
import { prisma } from "./prisma"

export const authConfig: NextAuthConfig = {
  providers: [
    // OAuth providers will be added later
    // For now, we'll use a mock session
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Mock session for development - bypass OAuth for now
export const mockSession = {
  user: {
    id: "mock-ric-001",
    name: "ric",
    email: "ric@example.com",
    image: null,
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
