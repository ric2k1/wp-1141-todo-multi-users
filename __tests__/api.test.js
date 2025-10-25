/**
 * API Integration Tests
 * 
 * These tests verify that the API endpoints work correctly.
 * Run with: node __tests__/api.test.js
 * 
 * Make sure the Next.js server is running: npm run dev
 */

const BASE_URL = 'http://localhost:3000/api'

async function testAPI() {
  console.log('🧪 Running API Integration Tests...\n')

  let passedTests = 0
  let totalTests = 0

  function test(name, testFn) {
    totalTests++
    try {
      testFn()
      console.log(`✅ ${name}`)
      passedTests++
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`)
    }
  }

  // Test 1: Get all todos
  test('GET /api/todos returns todos', async () => {
    const response = await fetch(`${BASE_URL}/todos`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    
    const todos = await response.json()
    if (!Array.isArray(todos)) throw new Error('Expected array of todos')
  })

  // Test 2: Get tags
  test('GET /api/tags returns tags', async () => {
    const response = await fetch(`${BASE_URL}/tags`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    
    const tags = await response.json()
    if (!Array.isArray(tags)) throw new Error('Expected array of tags')
  })

  // Test 3: Create todo
  test('POST /api/todos creates todo', async () => {
    const newTodo = {
      title: 'API Test Todo',
      description: 'Created by API test',
      tags: ['test', 'api']
    }
    
    const response = await fetch(`${BASE_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTodo)
    })
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    
    const createdTodo = await response.json()
    if (!createdTodo.id) throw new Error('Expected todo with ID')
    if (createdTodo.title !== newTodo.title) throw new Error('Title mismatch')
    
    return createdTodo.id // Return for cleanup
  })

  // Test 4: Update todo
  test('PUT /api/todos/[id] updates todo', async () => {
    // First create a todo
    const newTodo = {
      title: 'Update Test Todo',
      description: 'To be updated',
      tags: ['test']
    }
    
    const createResponse = await fetch(`${BASE_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTodo)
    })
    
    const createdTodo = await createResponse.json()
    
    // Then update it
    const updateData = {
      title: 'Updated Todo Title',
      completed: true
    }
    
    const updateResponse = await fetch(`${BASE_URL}/todos/${createdTodo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })
    
    if (!updateResponse.ok) throw new Error(`HTTP ${updateResponse.status}`)
    
    const updatedTodo = await updateResponse.json()
    if (updatedTodo.title !== updateData.title) throw new Error('Title not updated')
    if (updatedTodo.completed !== updateData.completed) throw new Error('Completed not updated')
    
    return createdTodo.id // Return for cleanup
  })

  // Test 5: Delete todo
  test('DELETE /api/todos/[id] deletes todo', async () => {
    // First create a todo
    const newTodo = {
      title: 'Delete Test Todo',
      description: 'To be deleted',
      tags: ['test']
    }
    
    const createResponse = await fetch(`${BASE_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTodo)
    })
    
    const createdTodo = await createResponse.json()
    
    // Then delete it
    const deleteResponse = await fetch(`${BASE_URL}/todos/${createdTodo.id}`, {
      method: 'DELETE'
    })
    
    if (!deleteResponse.ok) throw new Error(`HTTP ${deleteResponse.status}`)
    
    const result = await deleteResponse.json()
    if (!result.success) throw new Error('Delete not successful')
  })

  // Test 6: Filter by tags
  test('GET /api/todos?tags=test filters by tags', async () => {
    const response = await fetch(`${BASE_URL}/todos?tags=test`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    
    const todos = await response.json()
    // Should return todos that have 'test' tag
    if (!Array.isArray(todos)) throw new Error('Expected array')
  })

  // Test 7: Filter by completion status
  test('GET /api/todos?done=true filters by completion', async () => {
    const response = await fetch(`${BASE_URL}/todos?done=true`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    
    const todos = await response.json()
    if (!Array.isArray(todos)) throw new Error('Expected array')
    
    // All returned todos should be completed
    todos.forEach(todo => {
      if (!todo.completed) throw new Error('Found uncompleted todo in completed filter')
    })
  })

  // Test 8: Invalid todo creation
  test('POST /api/todos validates input', async () => {
    const invalidTodo = {
      title: '', // Empty title should fail
      description: 'Invalid todo'
    }
    
    const response = await fetch(`${BASE_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidTodo)
    })
    
    if (response.ok) throw new Error('Expected validation error')
    if (response.status !== 400) throw new Error(`Expected 400, got ${response.status}`)
  })

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`)
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed!')
  } else {
    console.log('⚠️  Some tests failed. Check the output above.')
  }
}

// Run the tests
testAPI().catch(error => {
  console.error('❌ Test suite failed:', error.message)
  console.log('\n💡 Make sure the Next.js server is running: npm run dev')
  process.exit(1)
})
