import { buildSystemPrompt, buildUserPrompt } from "@/lib/nl-prompt";
import { Todo } from "@/types/todo";

describe("buildSystemPrompt", () => {
  it("should include timezone and current time", () => {
    const prompt = buildSystemPrompt("America/New_York", "2026-02-17T12:00:00.000Z");
    expect(prompt).toContain("America/New_York");
    expect(prompt).toContain("2026-02-17T12:00:00.000Z");
  });

  it("should include all 7 action types", () => {
    const prompt = buildSystemPrompt("UTC", "2026-02-17T12:00:00.000Z");
    expect(prompt).toContain('"query"');
    expect(prompt).toContain('"create"');
    expect(prompt).toContain('"update"');
    expect(prompt).toContain('"delete"');
    expect(prompt).toContain('"toggle"');
    expect(prompt).toContain('"clarification"');
    expect(prompt).toContain('"error"');
  });

  it("should include week definition", () => {
    const prompt = buildSystemPrompt("UTC", "2026-02-17T12:00:00.000Z");
    expect(prompt).toContain("Monday through Sunday");
  });
});

describe("buildUserPrompt", () => {
  it("should include user query", () => {
    const prompt = buildUserPrompt("show all todos", []);
    expect(prompt).toContain("show all todos");
  });

  it("should include empty list message when no todos", () => {
    const prompt = buildUserPrompt("show all", []);
    expect(prompt).toContain("currently empty");
  });

  it("should include todo data when todos exist", () => {
    const todos: Todo[] = [
      {
        id: "id-1",
        title: "Buy milk",
        priority: "high",
        status: "pending",
        createdAt: "2026-02-17T10:00:00.000Z",
        updatedAt: "2026-02-17T10:00:00.000Z",
      },
    ];
    const prompt = buildUserPrompt("show all", todos);
    expect(prompt).toContain("Buy milk");
    expect(prompt).toContain("id-1");
  });
});
