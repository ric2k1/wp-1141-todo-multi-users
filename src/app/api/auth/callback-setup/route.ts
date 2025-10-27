import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const alias = searchParams.get('alias')

    if (!alias) {
      return NextResponse.redirect(new URL('/auth/error?error=MissingAlias', request.url))
    }

    // Get current OAuth session
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.redirect(new URL('/auth/error?error=NoSession', request.url))
    }

    // Find the pending user record
    const pendingUser = await prisma.user.findUnique({
      where: { alias }
    })

    if (!pendingUser) {
      return NextResponse.redirect(new URL('/auth/error?error=UserNotFound', request.url))
    }

    if (pendingUser.isAuthorized) {
      // User is already authorized - this is fine, just redirect to success
      console.log(`User ${alias} is already authorized, redirecting to success page`)
      return NextResponse.redirect(new URL(`/auth/setup-complete?alias=${encodeURIComponent(alias)}`, request.url))
    }

    // Get OAuth provider info from session
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionProvider = (session as any).provider
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionProviderId = (session as any).providerId

    // Skip provider check if session doesn't have provider info yet
    // This happens during initial OAuth setup - we'll verify by checking the updated oauthId instead
    if (sessionProvider && pendingUser.provider !== sessionProvider) {
      return NextResponse.redirect(new URL('/auth/error?error=ProviderMismatch', request.url))
    }

    // Check if OAuth ID has been updated (should not be temp- anymore)
    if (pendingUser.oauthId.startsWith('temp-')) {
      return NextResponse.redirect(new URL('/auth/error?error=OAuthNotCompleted', request.url))
    }

    // Finalize authorization
    await prisma.user.update({
      where: { alias },
      data: {
        isAuthorized: true
      }
    })
    
    console.log(`User ${alias} authorization finalized successfully`)

    // Redirect to success page
    return NextResponse.redirect(new URL(`/auth/setup-complete?alias=${encodeURIComponent(alias)}`, request.url))
  } catch (error) {
    console.error('Error in callback setup:', error)
    return NextResponse.redirect(new URL('/auth/error?error=InternalError', request.url))
  }
}
