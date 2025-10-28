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
});
