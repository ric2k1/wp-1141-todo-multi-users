import "@testing-library/jest-dom";

// Suppress act() warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      message.includes('not wrapped in act(...)')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock fetch globally
global.fetch = jest.fn();

// Helper to create a mock response
const createMockResponse = (data, ok = true) => ({
  ok,
  json: async () => data,
  status: ok ? 200 : 400,
  headers: new Headers(),
});

// Mock fetch implementation
global.fetch.mockImplementation((url) => {
  // Mock different responses based on URL
  if (url.includes("/api/tags")) {
    return Promise.resolve(
      createMockResponse(["work", "home", "urgent", "test"])
    );
  }

  if (url.includes("/api/todos")) {
    // For all requests to /api/todos, return an empty array by default
    // Individual tests will override this as needed
    return Promise.resolve(createMockResponse([]));
  }

  // Default response
  return Promise.resolve(createMockResponse({}));
});
