import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Note: No initial users - users must be added via todo-add-user.sh script
  console.log('Database seed started - no initial users will be created')

  // Create some sample todos (these will be visible once users are added and authenticated)
  const sampleTodos = [
    {
      title: 'Welcome to Todo Multi-Users',
      description: 'This is a shared todo app where all users can see and manage todos together. Use ./todo-add-user.sh to add users.',
      tags: ['welcome', 'admin'],
      completed: false,
    },
    {
      title: 'Add users via command line',
      description: 'Run "./todo-add-user.sh add <name> <provider>" to add new users who can login via OAuth.',
      tags: ['getting-started', 'admin'],
      completed: false,
    },
    {
      title: 'OAuth Authentication Ready',
      description: 'Users can login with Google, GitHub, or Facebook once they are pre-registered by admin.',
      tags: ['auth', 'oauth'],
      completed: false,
    },
  ]

  for (const todo of sampleTodos) {
    await prisma.todo.create({
      data: todo,
    })
  }

  console.log('Sample todos created - ready for OAuth authentication')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
