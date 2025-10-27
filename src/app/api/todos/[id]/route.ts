import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateTodoSchema, todoIdSchema } from '@/lib/validators'
import { auth } from '@/lib/auth'

// Function to clean up unused tags
async function cleanupUnusedTags() {
  try {
    // Get all unique tags from all todos
    const todos = await prisma.todo.findMany({
      select: { tags: true }
    })
    
    const allUsedTags = new Set<string>()
    todos.forEach((todo: { tags: string[] }) => {
      todo.tags.forEach((tag: string) => allUsedTags.add(tag))
    })
    
    // Note: This is a placeholder - in a real implementation, you might have
    // a separate tags table that needs to be cleaned up
    return allUsedTags
  } catch (error) {
    console.error('Error cleaning up unused tags:', error)
    return new Set<string>()
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication using request context
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Await params and validate the ID parameter
    const resolvedParams = await params
    const { id } = todoIdSchema.parse({ id: resolvedParams.id })

    const body = await request.json()
    const validatedData = updateTodoSchema.parse(body)

    // Check if todo exists
    const existingTodo = await prisma.todo.findUnique({
      where: { id }
    })

    if (!existingTodo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      )
    }

    const todo = await prisma.todo.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date() // Explicitly update the timestamp
      }
    })

    // Clean up unused tags after update (in case tags were removed)
    await cleanupUnusedTags()

    return NextResponse.json(todo)
  } catch (error) {
    console.error('Error updating todo:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication using request context
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Await params and validate the ID parameter
    const resolvedParams = await params
    const { id } = todoIdSchema.parse({ id: resolvedParams.id })

    // Check if todo exists
    const existingTodo = await prisma.todo.findUnique({
      where: { id }
    })

    if (!existingTodo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      )
    }

    await prisma.todo.delete({
      where: { id }
    })

    // Clean up unused tags after deletion
    await cleanupUnusedTags()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting todo:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid ID', details: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    )
  }
}
