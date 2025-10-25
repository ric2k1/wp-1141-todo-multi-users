import "@testing-library/jest-dom";

// Mock fetch globally
global.fetch = jest.fn();

// Mock fetch implementation
global.fetch.mockImplementation((url) => {
  console.log("Mock fetch called with URL:", url);

  // Mock different responses based on URL
  if (url.includes("/api/tags")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(["work", "home", "urgent", "test"]),
    });
  }

  if (url.includes("/api/todos")) {
    // For GET requests (no query params), return an array
    if (!url.includes("?")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    }

    // For GET requests with query params, return an array
    if (url.includes("?")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    }

    // For POST/PUT/DELETE requests, return an object
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "test-id",
          title: "Test Todo",
          description: "Test Description",
          completed: false,
          tags: ["test"],
          success: true,
        }),
    });
  }

  // Default response
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  });
});
