import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create mock user "ric" for development
  const mockUser = await prisma.user.upsert({
    where: { email: 'ric@example.com' },
    update: {},
    create: {
      email: 'ric@example.com',
      name: 'ric',
      image: null,
      provider: 'mock',
      providerId: 'mock-ric-001',
    },
  })

  console.log('Mock user created:', mockUser)

  // Create some sample todos
  const sampleTodos = [
    {
      title: 'Welcome to Todo Multi-Users',
      description: 'This is a shared todo app where all users can see and manage todos together.',
      tags: ['welcome', 'ric'],
      completed: false,
    },
    {
      title: 'Add your first todo',
      description: 'Click the add button or press Enter to create your first todo item.',
      tags: ['getting-started', 'ric'],
      completed: false,
    },
    {
      title: 'Use tags to organize',
      description: 'Add tags to categorize your todos. Click on tags to filter the list.',
      tags: ['tips', 'organization'],
      completed: false,
    },
  ]

  for (const todo of sampleTodos) {
    await prisma.todo.create({
      data: todo,
    })
  }

  console.log('Sample todos created')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
