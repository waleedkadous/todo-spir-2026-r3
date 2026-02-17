/**
 * Tests for the /api/nl route handler with mocked Gemini.
 * @jest-environment node
 */

import { POST } from "@/app/api/nl/route";
import { NextRequest } from "next/server";
import { resetRateLimitStore } from "@/lib/rate-limit";

// Mock the gemini module
jest.mock("@/lib/gemini", () => ({
  isGeminiConfigured: jest.fn(() => true),
  callGemini: jest.fn(),
}));

import { callGemini, isGeminiConfigured } from "@/lib/gemini";

const mockedCallGemini = callGemini as jest.MockedFunction<typeof callGemini>;
const mockedIsGeminiConfigured = isGeminiConfigured as jest.MockedFunction<typeof isGeminiConfigured>;

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/nl", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  query: "show all todos",
  todos: [
    {
      id: "id-1",
      title: "Test Todo",
      priority: "medium",
      status: "pending",
      createdAt: "2026-02-17T10:00:00.000Z",
      updatedAt: "2026-02-17T10:00:00.000Z",
    },
  ],
  timezone: "America/New_York",
  currentTime: "2026-02-17T12:00:00.000Z",
};

describe("POST /api/nl", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetRateLimitStore();
    mockedIsGeminiConfigured.mockReturnValue(true);
  });

  it("should return 503 when Gemini is not configured", async () => {
    mockedIsGeminiConfigured.mockReturnValue(false);
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.type).toBe("error");
    expect(data.message).toContain("not available");
  });

  it("should return 400 for invalid request body", async () => {
    const res = await POST(makeRequest({ query: "" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.type).toBe("error");
  });

  it("should return valid query response from Gemini", async () => {
    mockedCallGemini.mockResolvedValue(
      JSON.stringify({ type: "query", message: "Found 1 todo", todoIds: ["id-1"] })
    );
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.type).toBe("query");
    expect(data.todoIds).toEqual(["id-1"]);
  });

  it("should return valid create response from Gemini", async () => {
    mockedCallGemini.mockResolvedValue(
      JSON.stringify({
        type: "create",
        message: "Created 'Buy milk'",
        todo: { title: "Buy milk", priority: "high" },
      })
    );
    const res = await POST(makeRequest({ ...validBody, query: "add a todo to buy milk" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.type).toBe("create");
    expect(data.todo.title).toBe("Buy milk");
  });

  it("should return valid update response from Gemini", async () => {
    mockedCallGemini.mockResolvedValue(
      JSON.stringify({
        type: "update",
        message: "Updated priority",
        todoId: "id-1",
        changes: { priority: "high" },
      })
    );
    const res = await POST(makeRequest({ ...validBody, query: "set priority to high" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.type).toBe("update");
    expect(data.changes.priority).toBe("high");
  });

  it("should return valid delete response from Gemini", async () => {
    mockedCallGemini.mockResolvedValue(
      JSON.stringify({ type: "delete", message: "Delete Test Todo?", todoId: "id-1" })
    );
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.type).toBe("delete");
    expect(data.todoId).toBe("id-1");
  });

  it("should return valid toggle response from Gemini", async () => {
    mockedCallGemini.mockResolvedValue(
      JSON.stringify({ type: "toggle", message: "Toggled", todoId: "id-1" })
    );
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.type).toBe("toggle");
  });

  it("should return valid clarification response from Gemini", async () => {
    mockedCallGemini.mockResolvedValue(
      JSON.stringify({
        type: "clarification",
        message: "Which todo?",
        options: ["Todo A", "Todo B"],
      })
    );
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.type).toBe("clarification");
    expect(data.options).toEqual(["Todo A", "Todo B"]);
  });

  it("should return 502 when Gemini returns invalid JSON", async () => {
    mockedCallGemini.mockResolvedValue("this is not json");
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.type).toBe("error");
  });

  it("should return 502 when Gemini returns unrecognized action type", async () => {
    mockedCallGemini.mockResolvedValue(
      JSON.stringify({ type: "hack", message: "Gotcha" })
    );
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.type).toBe("error");
    expect(data.message).toContain("invalid response");
  });

  it("should return 502 when Gemini throws an error", async () => {
    mockedCallGemini.mockRejectedValue(new Error("API timeout"));
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.type).toBe("error");
    expect(data.message).toContain("API timeout");
  });

  it("should strip markdown code fences from Gemini response", async () => {
    mockedCallGemini.mockResolvedValue(
      '```json\n{ "type": "query", "message": "All todos", "todoIds": ["id-1"] }\n```'
    );
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.type).toBe("query");
  });

  it("should return 429 when rate limit exceeded", async () => {
    mockedCallGemini.mockResolvedValue(
      JSON.stringify({ type: "query", message: "ok", todoIds: [] })
    );
    // Exhaust rate limit (20 req/min)
    for (let i = 0; i < 20; i++) {
      await POST(makeRequest(validBody));
    }
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.type).toBe("error");
    expect(data.message).toContain("Too many requests");
  });
});
