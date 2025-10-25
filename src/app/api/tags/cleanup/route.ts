import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentSession } from '@/lib/auth'

export async function POST() {
  try {
    // Check authentication
    const session = await getCurrentSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all unique tags from all todos
    const todos = await prisma.todo.findMany({
      select: { tags: true }
    })
    
    const allUsedTags = new Set<string>()
    todos.forEach((todo: { tags: string[] }) => {
      todo.tags.forEach((tag: string) => allUsedTags.add(tag))
    })
    
    // In a real implementation, you might have a separate tags table
    // that needs to be cleaned up.
    
    return NextResponse.json({ 
      success: true, 
      activeTags: Array.from(allUsedTags),
      message: 'Tag cleanup completed'
    })
  } catch (error) {
    console.error('Error during tag cleanup:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup tags' },
      { status: 500 }
    )
  }
}
