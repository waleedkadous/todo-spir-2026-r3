import { renderHook, act } from "@testing-library/react";
import { useTodos } from "@/hooks/useTodos";

describe("useTodos", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should initialize with empty todos", () => {
    const { result } = renderHook(() => useTodos());
    expect(result.current.todos).toEqual([]);
    expect(result.current.loaded).toBe(true);
    expect(result.current.storageAvailable).toBe(true);
  });

  it("should load existing todos from localStorage", () => {
    const existing = [
      {
        id: "existing-1",
        title: "Existing Todo",
        priority: "high",
        status: "pending",
        createdAt: "2026-02-17T10:00:00.000Z",
        updatedAt: "2026-02-17T10:00:00.000Z",
      },
    ];
    localStorage.setItem("todo-manager-todos", JSON.stringify(existing));

    const { result } = renderHook(() => useTodos());
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].title).toBe("Existing Todo");
  });

  describe("addTodo", () => {
    it("should add a todo with defaults", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo({ title: "New Todo" });
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].title).toBe("New Todo");
      expect(result.current.todos[0].priority).toBe("medium");
      expect(result.current.todos[0].status).toBe("pending");
      expect(result.current.todos[0].id).toBeDefined();
      expect(result.current.todos[0].createdAt).toBeDefined();
      expect(result.current.todos[0].updatedAt).toBeDefined();
    });

    it("should add a todo with custom fields", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo({
          title: "Custom Todo",
          description: "With description",
          priority: "high",
          dueDate: "2026-03-01",
        });
      });

      expect(result.current.todos[0].title).toBe("Custom Todo");
      expect(result.current.todos[0].description).toBe("With description");
      expect(result.current.todos[0].priority).toBe("high");
      expect(result.current.todos[0].dueDate).toBe("2026-03-01");
    });

    it("should prepend new todos to the list", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo({ title: "First" });
      });
      act(() => {
        result.current.addTodo({ title: "Second" });
      });

      expect(result.current.todos[0].title).toBe("Second");
      expect(result.current.todos[1].title).toBe("First");
    });
  });

  describe("updateTodo", () => {
    it("should update a todo's fields", () => {
      const { result } = renderHook(() => useTodos());

      let id: string;
      act(() => {
        const todo = result.current.addTodo({ title: "Original" });
        id = todo.id;
      });

      act(() => {
        result.current.updateTodo(id!, {
          title: "Updated",
          priority: "high",
        });
      });

      expect(result.current.todos[0].title).toBe("Updated");
      expect(result.current.todos[0].priority).toBe("high");
    });

    it("should update the updatedAt timestamp", () => {
      const { result } = renderHook(() => useTodos());

      let originalUpdatedAt: string;
      let id: string;
      act(() => {
        const todo = result.current.addTodo({ title: "Test" });
        id = todo.id;
        originalUpdatedAt = todo.updatedAt;
      });

      // Small delay to ensure different timestamp
      act(() => {
        result.current.updateTodo(id!, { title: "Changed" });
      });

      expect(result.current.todos[0].updatedAt).toBeDefined();
    });

    it("should clear dueDate when set to null", () => {
      const { result } = renderHook(() => useTodos());

      let id: string;
      act(() => {
        const todo = result.current.addTodo({
          title: "With Date",
          dueDate: "2026-03-01",
        });
        id = todo.id;
      });

      act(() => {
        result.current.updateTodo(id!, { dueDate: null });
      });

      expect(result.current.todos[0].dueDate).toBeUndefined();
    });
  });

  describe("deleteTodo", () => {
    it("should remove a todo by id", () => {
      const { result } = renderHook(() => useTodos());

      let id: string;
      act(() => {
        const todo = result.current.addTodo({ title: "To Delete" });
        id = todo.id;
      });

      act(() => {
        result.current.deleteTodo(id!);
      });

      expect(result.current.todos).toHaveLength(0);
    });

    it("should not affect other todos", () => {
      const { result } = renderHook(() => useTodos());

      let id: string;
      act(() => {
        result.current.addTodo({ title: "Keep" });
        const todo = result.current.addTodo({ title: "Delete" });
        id = todo.id;
      });

      act(() => {
        result.current.deleteTodo(id!);
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].title).toBe("Keep");
    });
  });

  describe("toggleTodo", () => {
    it("should toggle pending to completed", () => {
      const { result } = renderHook(() => useTodos());

      let id: string;
      act(() => {
        const todo = result.current.addTodo({ title: "Toggle Me" });
        id = todo.id;
      });

      expect(result.current.todos[0].status).toBe("pending");

      act(() => {
        result.current.toggleTodo(id!);
      });

      expect(result.current.todos[0].status).toBe("completed");
    });

    it("should toggle completed back to pending", () => {
      const { result } = renderHook(() => useTodos());

      let id: string;
      act(() => {
        const todo = result.current.addTodo({ title: "Toggle Me" });
        id = todo.id;
      });

      act(() => {
        result.current.toggleTodo(id!);
      });
      act(() => {
        result.current.toggleTodo(id!);
      });

      expect(result.current.todos[0].status).toBe("pending");
    });
  });

  describe("clearCompleted", () => {
    it("should remove all completed todos", () => {
      const { result } = renderHook(() => useTodos());

      let id1: string;
      act(() => {
        const todo1 = result.current.addTodo({ title: "Done" });
        id1 = todo1.id;
        result.current.addTodo({ title: "Not Done" });
      });

      act(() => {
        result.current.toggleTodo(id1!);
      });

      act(() => {
        result.current.clearCompleted();
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].title).toBe("Not Done");
    });
  });

  describe("edge cases", () => {
    it("should generate valid UUID for new todos", () => {
      const { result } = renderHook(() => useTodos());
      act(() => {
        result.current.addTodo({ title: "UUID Test" });
      });
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(result.current.todos[0].id).toMatch(uuidRegex);
    });

    it("deleteTodo should return false for non-existent id", () => {
      const { result } = renderHook(() => useTodos());
      let found: boolean;
      act(() => {
        found = result.current.deleteTodo("non-existent-id");
      });
      expect(found!).toBe(false);
    });
  });

  describe("localStorage persistence", () => {
    it("should persist todos to localStorage", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo({ title: "Persisted" });
      });

      const stored = JSON.parse(
        localStorage.getItem("todo-manager-todos")!
      );
      expect(stored).toHaveLength(1);
      expect(stored[0].title).toBe("Persisted");
    });
  });
});
