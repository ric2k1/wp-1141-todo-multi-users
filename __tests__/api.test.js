/**
 * API Integration Tests
 *
 * These tests verify that the API endpoints work correctly.
 * Run with: yarn test
 *
 * Make sure the Next.js server is running: yarn dev
 */

const BASE_URL = "http://localhost:3000/api";

describe("API Integration Tests", () => {
  // Test 1: Get all todos
  test("GET /api/todos returns todos", async () => {
    const response = await fetch(`${BASE_URL}/todos`);
    expect(response.ok).toBe(true);

    const todos = await response.json();
    expect(Array.isArray(todos)).toBe(true);
  });

  // Test 2: Get tags
  test("GET /api/tags returns tags", async () => {
    const response = await fetch(`${BASE_URL}/tags`);
    expect(response.ok).toBe(true);

    const tags = await response.json();
    expect(Array.isArray(tags)).toBe(true);
  });

  // Test 3: Create todo
  test.skip("POST /api/todos creates todo (requires auth)", async () => {
    const newTodo = {
      title: "API Test Todo",
      description: "Created by API test",
      tags: ["test", "api"],
    };

    const response = await fetch(`${BASE_URL}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodo),
    });

    expect(response.ok).toBe(true);

    const createdTodo = await response.json();
    expect(createdTodo.id).toBeDefined();
    expect(createdTodo.title).toBe(newTodo.title);
  });

  // Test 4: Update todo
  test.skip("PUT /api/todos/[id] updates todo (requires auth)", async () => {
    // First create a todo
    const newTodo = {
      title: "Update Test Todo",
      description: "To be updated",
      tags: ["test"],
    };

    const createResponse = await fetch(`${BASE_URL}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodo),
    });

    const createdTodo = await createResponse.json();

    // Then update it
    const updateData = {
      title: "Updated Todo Title",
      completed: true,
    };

    const updateResponse = await fetch(`${BASE_URL}/todos/${createdTodo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });

    expect(updateResponse.ok).toBe(true);

    const updatedTodo = await updateResponse.json();
    expect(updatedTodo.title).toBe(updateData.title);
    expect(updatedTodo.completed).toBe(updateData.completed);
  });

  // Test 5: Delete todo
  test.skip("DELETE /api/todos/[id] deletes todo (requires auth)", async () => {
    // First create a todo
    const newTodo = {
      title: "Delete Test Todo",
      description: "To be deleted",
      tags: ["test"],
    };

    const createResponse = await fetch(`${BASE_URL}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodo),
    });

    const createdTodo = await createResponse.json();

    // Then delete it
    const deleteResponse = await fetch(`${BASE_URL}/todos/${createdTodo.id}`, {
      method: "DELETE",
    });

    expect(deleteResponse.ok).toBe(true);

    const result = await deleteResponse.json();
    expect(result.success).toBe(true);
  });

  // Test 6: Filter by tags
  test("GET /api/todos?tags=test filters by tags", async () => {
    const response = await fetch(`${BASE_URL}/todos?tags=test`);
    expect(response.ok).toBe(true);

    const todos = await response.json();
    expect(Array.isArray(todos)).toBe(true);
  });

  // Test 7: Filter by completion status
  test("GET /api/todos?done=true filters by completion", async () => {
    const response = await fetch(`${BASE_URL}/todos?done=true`);
    expect(response.ok).toBe(true);

    const todos = await response.json();
    expect(Array.isArray(todos)).toBe(true);

    // All returned todos should be completed
    todos.forEach((todo) => {
      expect(todo.completed).toBe(true);
    });
  });

  // Test 8: Invalid todo creation
  test.skip("POST /api/todos validates input (requires auth)", async () => {
    const invalidTodo = {
      title: "", // Empty title should fail
      description: "Invalid todo",
    };

    const response = await fetch(`${BASE_URL}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidTodo),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
  });
});
