import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createTodoSchema } from '@/lib/validators'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check authentication using request context
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const done = searchParams.get('done')

    // Build where clause for filtering
    const where: {
      tags?: { hasSome: string[] }
      completed?: boolean
    } = {}
    
    // Filter by tags (OR logic - any todo that has any of the specified tags)
    if (tags.length > 0) {
      where.tags = {
        hasSome: tags
      }
    }

    // Filter by completion status
    if (done !== null && done !== undefined) {
      if (done === 'true') {
        where.completed = true
      } else if (done === 'false') {
        where.completed = false
      }
      // If done is null, don't add any completion filter (show all)
    }

    const todos = await prisma.todo.findMany({
      where,
      orderBy: {
        updatedAt: 'desc' // Newest to oldest by updatedAt
      }
    })

    return NextResponse.json(todos)
  } catch (error) {
    console.error('Error fetching todos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication using request context
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createTodoSchema.parse(body)

    const todo = await prisma.todo.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || null,
        tags: validatedData.tags || [],
      }
    })

    return NextResponse.json(todo, { status: 201 })
  } catch (error) {
    console.error('Error creating todo:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    )
  }
}
