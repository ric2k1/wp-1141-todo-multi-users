import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { alias, provider } = await request.json()

    if (!alias || !provider) {
      return NextResponse.json(
        { error: 'Alias and provider are required' },
        { status: 400 }
      )
    }

    // Validate provider
    if (!['google', 'github', 'facebook'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      )
    }

    // Check if alias already exists
    const existingUser = await prisma.user.findUnique({
      where: { alias }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Alias already exists' },
        { status: 409 }
      )
    }

    // Create pending user record with temporary oauthId
    const tempOAuthId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const user = await prisma.user.create({
      data: {
        alias,
        provider,
        oauthId: tempOAuthId, // Temporary unique ID, will be updated after OAuth
        isAuthorized: false
      }
    })

    // Generate OAuth authorization URL using custom auth start page
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const callbackUrl = `${baseUrl}/api/auth/callback-setup?alias=${encodeURIComponent(alias)}`
    const authUrl = `${baseUrl}/auth/start?provider=${provider}&callbackUrl=${encodeURIComponent(callbackUrl)}`

    return NextResponse.json({
      message: 'User created, authorization required',
      authUrl,
      userId: user.id
    })
  } catch (error) {
    console.error('Error creating user authorization:', error)
    
    // In development, return more detailed error information
    const isDevelopment = process.env.NODE_ENV === 'development'
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        ...(isDevelopment && {
          details: errorMessage,
          stack: errorStack
        })
      },
      { status: 500 }
    )
  }
}
