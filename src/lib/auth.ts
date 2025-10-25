import NextAuth, { NextAuthConfig } from "next-auth"
// import Google from "next-auth/providers/google"
// import GitHub from "next-auth/providers/github"
// import Facebook from "next-auth/providers/facebook"
// import { prisma } from "./prisma"

export const authConfig: NextAuthConfig = {
  providers: [
    // OAuth providers (commented out for now - will be enabled when credentials are provided)
    // Google({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
    // GitHub({
    //   clientId: process.env.GITHUB_CLIENT_ID!,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    // }),
    // Facebook({
    //   clientId: process.env.FACEBOOK_CLIENT_ID!,
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    // }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.image = user.image
        token.provider = account?.provider
        token.providerId = account?.providerAccountId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.image as string
        // Add provider info for future use
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session as any).provider = token.provider as string
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session as any).providerId = token.providerId as string
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
  provider: "mock",
  providerId: "mock-ric-001",
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
}

// Helper function to get current session (mock or real)
export async function getCurrentSession() {
  // For development, always return mock session
  // In production, this would check for real session
  return mockSession
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
