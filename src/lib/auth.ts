import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Facebook from "next-auth/providers/facebook"
import { prisma } from "./prisma"

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
      if (!account) return false
      
      try {
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
          console.log(`User ${existingUser.alias} authenticated successfully via ${account.provider}`)
          return true
        }
        
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
          console.log(`User ${pendingUser.alias} OAuth info updated, pending final authorization via callback-setup`)
          return true
        }
        
        console.log(`User with provider ${account.provider} and OAuth ID ${account.providerAccountId} not found or not authorized - access denied`)
        return false
      } catch (error) {
        console.error('Error during sign in:', error)
        return false
      }
    },
    async jwt({ token, user, account }) {
      if (user && account) {
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
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
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
        secure: process.env.NEXTAUTH_URL?.startsWith('https://') ?? process.env.NODE_ENV === 'production',
        maxAge: 900, // 15 minutes
      },
    },
    sessionToken: {
      name: 'next-auth.session_token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NEXTAUTH_URL?.startsWith('https://') ?? process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NEXTAUTH_URL?.startsWith('https://') ?? process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: 'next-auth.csrf_token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NEXTAUTH_URL?.startsWith('https://') ?? process.env.NODE_ENV === 'production',
      },
    },
  },
})

// Helper function to get current session
export async function getCurrentSession() {
  return await auth()
}