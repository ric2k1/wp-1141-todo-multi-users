import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Facebook from "next-auth/providers/facebook"
import { prisma } from "./prisma"

// Determine the base URL for NextAuth
// Priority: NEXTAUTH_URL > VERCEL_URL (for preview deployments) > localhost
const getBaseUrl = () => {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}

const baseUrl = getBaseUrl()
// For secure cookies: use https in production/preview, http only in local development
// Vercel preview deployments always use HTTPS, so we check for https:// prefix
const isSecure = baseUrl.startsWith('https://')

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'public_profile', // Remove email scope as it requires special permissions
        }
      }
    }),
  ],
  pages: {
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account) {
        console.error('[OAuth] signIn callback: No account provided')
        return false
      }
      
      console.log(`[OAuth] signIn callback triggered for provider: ${account.provider}, OAuth ID: ${account.providerAccountId}, email: ${user.email}`)
      console.log(`[OAuth] Environment: NODE_ENV=${process.env.NODE_ENV}, VERCEL_URL=${process.env.VERCEL_URL}, NEXTAUTH_URL=${process.env.NEXTAUTH_URL}`)
      
      try {
        // Test database connection first
        await prisma.$connect().catch((err) => {
          console.error('[OAuth] Database connection failed:', err)
          throw new Error(`Database connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        })
        // First, check if user exists with matching provider and OAuth ID (already authorized)
        let existingUser = await prisma.user.findFirst({
          where: {
            provider: account.provider,
            oauthId: account.providerAccountId,
            isAuthorized: true,
          },
        })
        
        if (existingUser) {
          // Update user info
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              email: user.email,
              image: user.image,
              oauthName: user.name,
            },
          })
          console.log(`[OAuth] User ${existingUser.alias} (ID: ${existingUser.id}) authenticated successfully via ${account.provider}`)
          return true
        }
        
        console.log(`[OAuth] No authorized user found with provider ${account.provider} and OAuth ID ${account.providerAccountId}`)
        
        // If not found, check for pending authorization (user created by todo-add-user script)
        const pendingUser = await prisma.user.findFirst({
          where: {
            provider: account.provider,
            isAuthorized: false,
            oauthId: {
              startsWith: 'temp-' // Temporary OAuth ID
            }
          },
          orderBy: {
            createdAt: 'desc' // Get the most recently created pending user
          }
        })
        
        if (pendingUser) {
          // Update the pending user with real OAuth ID but DON'T authorize yet
          // Let the callback-setup API handle the final authorization
          await prisma.user.update({
            where: { id: pendingUser.id },
            data: {
              oauthId: account.providerAccountId,
              oauthName: user.name,
              email: user.email,
              image: user.image,
              // isAuthorized remains false - will be set by callback-setup
            },
          })
          console.log(`[OAuth] User ${pendingUser.alias} (ID: ${pendingUser.id}) OAuth info updated, pending final authorization via callback-setup`)
          return true
        }
        
        console.warn(`[OAuth] Access denied: User with provider ${account.provider} and OAuth ID ${account.providerAccountId} not found or not authorized`)
        console.warn(`[OAuth] User email: ${user.email}, name: ${user.name}`)
        console.warn(`[OAuth] To fix this, ensure the user is registered in the database with isAuthorized=true`)
        return false
      } catch (error) {
        console.error('[OAuth] Error during sign in callback:', error)
        if (error instanceof Error) {
          console.error('[OAuth] Error message:', error.message)
          console.error('[OAuth] Error stack:', error.stack)
        }
        // Check if it's a database connection error
        if (error && typeof error === 'object' && 'code' in error) {
          console.error('[OAuth] Database error code:', (error as any).code)
        }
        // Check for Prisma-specific errors
        if (error && typeof error === 'object') {
          const prismaError = error as any
          if (prismaError.code) {
            console.error('[OAuth] Prisma error code:', prismaError.code)
            console.error('[OAuth] Prisma error meta:', JSON.stringify(prismaError.meta, null, 2))
          }
          if (prismaError.clientVersion) {
            console.error('[OAuth] Prisma client version:', prismaError.clientVersion)
          }
        }
        // Log environment info for debugging
        console.error('[OAuth] DATABASE_URL present:', !!process.env.DATABASE_URL)
        console.error('[OAuth] DATABASE_URL length:', process.env.DATABASE_URL?.length || 0)
        return false
      }
    },
    async jwt({ token, user, account }) {
      if (user && account) {
        try {
          // Find the user in our database to get our internal ID and alias
          const dbUser = await prisma.user.findFirst({
            where: {
              provider: account.provider,
              oauthId: account.providerAccountId,
              isAuthorized: true,
            },
          })
        
          if (dbUser) {
            token.id = dbUser.id
            token.alias = dbUser.alias  // Use alias instead of OAuth name
            token.email = user.email
            token.image = user.image
            token.provider = account.provider
            token.oauthId = account.providerAccountId
          }
        } catch (error) {
          console.error('[OAuth] Error in jwt callback:', error)
          if (error instanceof Error) {
            console.error('[OAuth] JWT callback error message:', error.message)
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        try {
          // Verify user still exists and is authorized in database
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              id: true,
              alias: true,
              isAuthorized: true,
            }
          })
          
          // If user doesn't exist or is not authorized, invalidate session
          if (!dbUser || !dbUser.isAuthorized) {
            console.log(`Session invalidated: user ${token.alias} not found or not authorized`)
            return { ...session, user: undefined } as any
          }
          
          session.user.id = token.id as string
          session.user.name = token.alias as string  // Use alias as display name
          session.user.email = token.email as string
          session.user.image = token.image as string
          // Add provider info for future use
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (session as any).provider = token.provider as string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (session as any).providerId = token.oauthId as string
        } catch (error) {
          console.error('[OAuth] Error in session callback:', error)
          if (error instanceof Error) {
            console.error('[OAuth] Session callback error message:', error.message)
          }
          // Return session without user data on error
          return { ...session, user: undefined } as any
        }
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isSecure,
        maxAge: 900, // 15 minutes
      },
    },
    sessionToken: {
      name: 'next-auth.session_token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isSecure,
      },
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isSecure,
      },
    },
    csrfToken: {
      name: 'next-auth.csrf_token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isSecure,
      },
    },
  },
})

// Helper function to get current session
export async function getCurrentSession() {
  return await auth()
}