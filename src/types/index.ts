export interface Todo {
  id: string
  title: string
  description: string | null
  tags: string[]
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string | null
  name: string
  image: string | null
  provider: string | null
  providerId: string | null
  createdAt: Date
}

export interface CreateTodoData {
  title: string
  description?: string
  tags?: string[]
}

export interface UpdateTodoData {
  title?: string
  description?: string
  tags?: string[]
  completed?: boolean
}

export interface TodoFilters {
  tags: string[]
  done: boolean | null // null = no filter, true = only done, false = only not done
}
