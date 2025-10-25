import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mockSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // For now, we'll use mock auth - in production this would check real session
    const session = mockSession

    // Get all todos and extract unique tags
    const todos = await prisma.todo.findMany({
      select: {
        tags: true
      }
    })

    // Flatten all tags and get unique ones
    const allTags = todos.flatMap(todo => todo.tags)
    const uniqueTags = Array.from(new Set(allTags)).sort()

    return NextResponse.json(uniqueTags)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}
