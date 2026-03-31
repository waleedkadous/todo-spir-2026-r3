import { Todo } from "@/types/todo";

const STORAGE_KEY = "todo-manager-todos";

export function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, "test");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function loadTodos(): Todo[] {
  if (!isStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveTodos(todos: Todo[]): boolean {
  if (!isStorageAvailable()) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    return true;
  } catch {
    return false;
  }
}
