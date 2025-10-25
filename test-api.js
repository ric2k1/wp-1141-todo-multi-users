#!/usr/bin/env node

// Simple API test script
const BASE_URL = 'http://localhost:3000/api'

async function testAPI() {
  console.log('Testing Todo Multi-Users API...\n')

  try {
    // Test 1: Get all todos
    console.log('1. Testing GET /api/todos')
    const todosResponse = await fetch(`${BASE_URL}/todos`)
    const todos = await todosResponse.json()
    console.log('✅ GET /api/todos:', todos.length, 'todos found')
    console.log('Sample todo:', todos[0] || 'No todos yet')
    console.log()

    // Test 2: Get all tags
    console.log('2. Testing GET /api/tags')
    const tagsResponse = await fetch(`${BASE_URL}/tags`)
    const tags = await tagsResponse.json()
    console.log('✅ GET /api/tags:', tags.length, 'unique tags found')
    console.log('Tags:', tags)
    console.log()

    // Test 3: Create a new todo
    console.log('3. Testing POST /api/todos')
    const newTodo = {
      title: 'Test Todo from API',
      description: 'This is a test todo created via API',
      tags: ['test', 'api', 'ric']
    }
    
    const createResponse = await fetch(`${BASE_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTodo)
    })
    
    if (createResponse.ok) {
      const createdTodo = await createResponse.json()
      console.log('✅ POST /api/todos: Todo created successfully')
      console.log('Created todo:', createdTodo.title)
      console.log()

      // Test 4: Update the todo
      console.log('4. Testing PUT /api/todos/[id]')
      const updateData = {
        title: 'Updated Test Todo',
        completed: true
      }
      
      const updateResponse = await fetch(`${BASE_URL}/todos/${createdTodo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })
      
      if (updateResponse.ok) {
        const updatedTodo = await updateResponse.json()
        console.log('✅ PUT /api/todos/[id]: Todo updated successfully')
        console.log('Updated todo:', updatedTodo.title, '- Completed:', updatedTodo.completed)
        console.log()

        // Test 5: Delete the todo
        console.log('5. Testing DELETE /api/todos/[id]')
        const deleteResponse = await fetch(`${BASE_URL}/todos/${createdTodo.id}`, {
          method: 'DELETE'
        })
        
        if (deleteResponse.ok) {
          console.log('✅ DELETE /api/todos/[id]: Todo deleted successfully')
        } else {
          console.log('❌ DELETE failed:', await deleteResponse.text())
        }
      } else {
        console.log('❌ PUT failed:', await updateResponse.text())
      }
    } else {
      console.log('❌ POST failed:', await createResponse.text())
    }

    // Test 6: Test filtering
    console.log('\n6. Testing filtering')
    const filterResponse = await fetch(`${BASE_URL}/todos?tags=ric&done=false`)
    const filteredTodos = await filterResponse.json()
    console.log('✅ Filter test: Found', filteredTodos.length, 'todos with tag "ric" and not done')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\nMake sure the Next.js server is running on http://localhost:3000')
  }
}

// Run the test
testAPI()
