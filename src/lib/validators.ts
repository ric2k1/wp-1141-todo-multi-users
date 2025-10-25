import { z } from 'zod'

export const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  tags: z.array(z.string().min(1).max(50)).optional().default([]),
})

export const updateTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  tags: z.array(z.string().min(1).max(50)).optional(),
  completed: z.boolean().optional(),
})

export const todoIdSchema = z.object({
  id: z.string().cuid(),
})

export type CreateTodoInput = z.infer<typeof createTodoSchema>
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>
export type TodoIdInput = z.infer<typeof todoIdSchema>
