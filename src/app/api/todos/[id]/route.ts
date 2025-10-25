import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateTodoSchema, todoIdSchema } from '@/lib/validators'
import { mockSession } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // For now, we'll use mock auth - in production this would check real session
    const session = mockSession

    // Validate the ID parameter
    const { id } = todoIdSchema.parse({ id: params.id })

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
  { params }: { params: { id: string } }
) {
  try {
    // For now, we'll use mock auth - in production this would check real session
    const session = mockSession

    // Validate the ID parameter
    const { id } = todoIdSchema.parse({ id: params.id })

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
