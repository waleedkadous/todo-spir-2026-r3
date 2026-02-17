import { sortTodos, filterTodos } from "@/components/TodoList";
import { Todo } from "@/types/todo";

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: "id-1",
  title: "Test",
  priority: "medium",
  status: "pending",
  createdAt: "2026-02-17T10:00:00.000Z",
  updatedAt: "2026-02-17T10:00:00.000Z",
  ...overrides,
});

describe("sortTodos", () => {
  it("should sort pending before completed", () => {
    const todos = [
      makeTodo({ id: "1", status: "completed", title: "Done" }),
      makeTodo({ id: "2", status: "pending", title: "Not Done" }),
    ];
    const sorted = sortTodos(todos);
    expect(sorted[0].title).toBe("Not Done");
    expect(sorted[1].title).toBe("Done");
  });

  it("should sort by due date ascending within same status", () => {
    const todos = [
      makeTodo({ id: "1", dueDate: "2026-03-15", title: "Later" }),
      makeTodo({ id: "2", dueDate: "2026-03-01", title: "Sooner" }),
    ];
    const sorted = sortTodos(todos);
    expect(sorted[0].title).toBe("Sooner");
    expect(sorted[1].title).toBe("Later");
  });

  it("should sort todos without due dates last", () => {
    const todos = [
      makeTodo({ id: "1", title: "No Date" }),
      makeTodo({ id: "2", dueDate: "2026-03-01", title: "Has Date" }),
    ];
    const sorted = sortTodos(todos);
    expect(sorted[0].title).toBe("Has Date");
    expect(sorted[1].title).toBe("No Date");
  });

  it("should sort by createdAt descending when dates are equal", () => {
    const todos = [
      makeTodo({
        id: "1",
        dueDate: "2026-03-01",
        createdAt: "2026-02-15T10:00:00.000Z",
        title: "Older",
      }),
      makeTodo({
        id: "2",
        dueDate: "2026-03-01",
        createdAt: "2026-02-17T10:00:00.000Z",
        title: "Newer",
      }),
    ];
    const sorted = sortTodos(todos);
    expect(sorted[0].title).toBe("Newer");
    expect(sorted[1].title).toBe("Older");
  });
});

describe("filterTodos", () => {
  const todos = [
    makeTodo({ id: "1", status: "pending", priority: "high", title: "High Pending" }),
    makeTodo({ id: "2", status: "completed", priority: "high", title: "High Done" }),
    makeTodo({ id: "3", status: "pending", priority: "low", title: "Low Pending" }),
    makeTodo({ id: "4", status: "completed", priority: "medium", title: "Med Done" }),
  ];

  it("should return all todos with 'all' filters", () => {
    expect(filterTodos(todos, "all", "all")).toHaveLength(4);
  });

  it("should filter by status 'pending'", () => {
    const result = filterTodos(todos, "pending", "all");
    expect(result).toHaveLength(2);
    expect(result.every((t) => t.status === "pending")).toBe(true);
  });

  it("should filter by status 'completed'", () => {
    const result = filterTodos(todos, "completed", "all");
    expect(result).toHaveLength(2);
    expect(result.every((t) => t.status === "completed")).toBe(true);
  });

  it("should filter by priority 'high'", () => {
    const result = filterTodos(todos, "all", "high");
    expect(result).toHaveLength(2);
    expect(result.every((t) => t.priority === "high")).toBe(true);
  });

  it("should combine status and priority filters", () => {
    const result = filterTodos(todos, "pending", "high");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("High Pending");
  });

  it("should return empty when no matches", () => {
    const result = filterTodos(todos, "completed", "low");
    expect(result).toHaveLength(0);
  });
});
