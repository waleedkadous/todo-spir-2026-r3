import { validateNLRequest, validateNLResponse } from "@/lib/nl-validation";

describe("validateNLRequest", () => {
  const validRequest = {
    query: "show all todos",
    todos: [],
    timezone: "America/New_York",
    currentTime: "2026-02-17T12:00:00.000Z",
  };

  it("should accept a valid request", () => {
    const result = validateNLRequest(validRequest);
    expect(result.valid).toBe(true);
  });

  it("should reject null body", () => {
    const result = validateNLRequest(null);
    expect(result.valid).toBe(false);
  });

  it("should reject missing query", () => {
    const result = validateNLRequest({ ...validRequest, query: "" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0].field).toBe("query");
    }
  });

  it("should reject query exceeding 500 chars", () => {
    const result = validateNLRequest({ ...validRequest, query: "a".repeat(501) });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0].field).toBe("query");
    }
  });

  it("should reject non-array todos", () => {
    const result = validateNLRequest({ ...validRequest, todos: "not-array" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0].field).toBe("todos");
    }
  });

  it("should reject todos exceeding 1000 items", () => {
    const result = validateNLRequest({ ...validRequest, todos: new Array(1001).fill({}) });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0].field).toBe("todos");
    }
  });

  it("should reject missing timezone", () => {
    const result = validateNLRequest({ ...validRequest, timezone: "" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0].field).toBe("timezone");
    }
  });

  it("should reject missing currentTime", () => {
    const result = validateNLRequest({ ...validRequest, currentTime: "" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0].field).toBe("currentTime");
    }
  });

  it("should trim query whitespace", () => {
    const result = validateNLRequest({ ...validRequest, query: "  hello  " });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.query).toBe("hello");
    }
  });
});

describe("validateNLResponse", () => {
  it("should accept a valid query response", () => {
    const result = validateNLResponse({
      type: "query",
      message: "Found 2 todos",
      todoIds: ["id-1", "id-2"],
    });
    expect(result.valid).toBe(true);
  });

  it("should accept a valid create response", () => {
    const result = validateNLResponse({
      type: "create",
      message: "Created todo",
      todo: { title: "Buy milk", priority: "high" },
    });
    expect(result.valid).toBe(true);
  });

  it("should accept a valid update response", () => {
    const result = validateNLResponse({
      type: "update",
      message: "Updated",
      todoId: "id-1",
      changes: { priority: "high" },
    });
    expect(result.valid).toBe(true);
  });

  it("should accept a valid delete response", () => {
    const result = validateNLResponse({
      type: "delete",
      message: "Deleted",
      todoId: "id-1",
    });
    expect(result.valid).toBe(true);
  });

  it("should accept a valid toggle response", () => {
    const result = validateNLResponse({
      type: "toggle",
      message: "Toggled",
      todoId: "id-1",
    });
    expect(result.valid).toBe(true);
  });

  it("should accept a valid clarification response", () => {
    const result = validateNLResponse({
      type: "clarification",
      message: "Which one?",
      options: ["A", "B"],
    });
    expect(result.valid).toBe(true);
  });

  it("should accept clarification without options", () => {
    const result = validateNLResponse({
      type: "clarification",
      message: "Can you be more specific?",
    });
    expect(result.valid).toBe(true);
  });

  it("should accept a valid error response", () => {
    const result = validateNLResponse({
      type: "error",
      message: "Something went wrong",
    });
    expect(result.valid).toBe(true);
  });

  it("should reject null", () => {
    const result = validateNLResponse(null);
    expect(result.valid).toBe(false);
  });

  it("should reject unrecognized action type", () => {
    const result = validateNLResponse({
      type: "hack",
      message: "Gotcha",
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("Unrecognized action type");
    }
  });

  it("should reject missing message", () => {
    const result = validateNLResponse({
      type: "query",
      todoIds: [],
    });
    expect(result.valid).toBe(false);
  });

  it("should reject query without todoIds", () => {
    const result = validateNLResponse({
      type: "query",
      message: "Found",
    });
    expect(result.valid).toBe(false);
  });

  it("should reject create without todo object", () => {
    const result = validateNLResponse({
      type: "create",
      message: "Created",
    });
    expect(result.valid).toBe(false);
  });

  it("should reject create with todo missing title", () => {
    const result = validateNLResponse({
      type: "create",
      message: "Created",
      todo: { priority: "high" },
    });
    expect(result.valid).toBe(false);
  });

  it("should reject update without todoId", () => {
    const result = validateNLResponse({
      type: "update",
      message: "Updated",
      changes: {},
    });
    expect(result.valid).toBe(false);
  });

  it("should reject update without changes", () => {
    const result = validateNLResponse({
      type: "update",
      message: "Updated",
      todoId: "id-1",
    });
    expect(result.valid).toBe(false);
  });

  it("should reject delete without todoId", () => {
    const result = validateNLResponse({
      type: "delete",
      message: "Deleted",
    });
    expect(result.valid).toBe(false);
  });

  it("should reject toggle without todoId", () => {
    const result = validateNLResponse({
      type: "toggle",
      message: "Toggled",
    });
    expect(result.valid).toBe(false);
  });

  it("should reject clarification with non-array options", () => {
    const result = validateNLResponse({
      type: "clarification",
      message: "Which?",
      options: "not-array",
    });
    expect(result.valid).toBe(false);
  });
});
