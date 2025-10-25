import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentSession } from '@/lib/auth'

export async function GET() {
  try {
    // Check authentication (mock session for now)
    const session = await getCurrentSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all todos and extract unique tags
    const todos = await prisma.todo.findMany({
      select: {
        tags: true
      }
    })

    // Flatten all tags and get unique ones
    const allTags = todos.flatMap((todo: { tags: string[] }) => todo.tags)
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
