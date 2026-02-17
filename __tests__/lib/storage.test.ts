import { isStorageAvailable, loadTodos, saveTodos } from "@/lib/storage";
import { Todo } from "@/types/todo";

const mockTodo: Todo = {
  id: "test-id-1",
  title: "Test Todo",
  description: "A test todo",
  priority: "medium",
  status: "pending",
  dueDate: "2026-03-01",
  createdAt: "2026-02-17T10:00:00.000Z",
  updatedAt: "2026-02-17T10:00:00.000Z",
};

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("isStorageAvailable", () => {
    it("should return true when localStorage is available", () => {
      expect(isStorageAvailable()).toBe(true);
    });

    it("should return false when localStorage throws", () => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        throw new Error("QuotaExceededError");
      };
      expect(isStorageAvailable()).toBe(false);
      Storage.prototype.setItem = original;
    });
  });

  describe("loadTodos", () => {
    it("should return empty array when no data stored", () => {
      expect(loadTodos()).toEqual([]);
    });

    it("should return stored todos", () => {
      localStorage.setItem(
        "todo-manager-todos",
        JSON.stringify([mockTodo])
      );
      const result = loadTodos();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Test Todo");
    });

    it("should return empty array for invalid JSON", () => {
      localStorage.setItem("todo-manager-todos", "not-json");
      expect(loadTodos()).toEqual([]);
    });

    it("should return empty array for non-array JSON", () => {
      localStorage.setItem(
        "todo-manager-todos",
        JSON.stringify({ foo: "bar" })
      );
      expect(loadTodos()).toEqual([]);
    });
  });

  describe("saveTodos", () => {
    it("should save todos to localStorage", () => {
      const result = saveTodos([mockTodo]);
      expect(result).toBe(true);
      const stored = JSON.parse(
        localStorage.getItem("todo-manager-todos")!
      );
      expect(stored).toHaveLength(1);
      expect(stored[0].title).toBe("Test Todo");
    });

    it("should return false when storage is full", () => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        throw new Error("QuotaExceededError");
      };
      expect(saveTodos([mockTodo])).toBe(false);
      Storage.prototype.setItem = original;
    });

    it("should overwrite existing data", () => {
      saveTodos([mockTodo]);
      const updatedTodo = { ...mockTodo, title: "Updated" };
      saveTodos([updatedTodo]);
      const stored = JSON.parse(
        localStorage.getItem("todo-manager-todos")!
      );
      expect(stored[0].title).toBe("Updated");
    });
  });
});
