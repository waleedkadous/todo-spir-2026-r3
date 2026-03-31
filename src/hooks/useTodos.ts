"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Todo, CreateTodoInput, UpdateTodoInput } from "@/types/todo";
import { loadTodos, saveTodos, isStorageAvailable } from "@/lib/storage";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const available = isStorageAvailable();
    setStorageAvailable(available);
    if (available) {
      setTodos(loadTodos());
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded && storageAvailable) {
      saveTodos(todos);
    }
  }, [todos, loaded, storageAvailable]);

  const addTodo = useCallback((input: CreateTodoInput): Todo => {
    const now = new Date().toISOString();
    const newTodo: Todo = {
      id: uuidv4(),
      title: input.title,
      description: input.description,
      priority: input.priority ?? "medium",
      status: "pending",
      dueDate: input.dueDate,
      createdAt: now,
      updatedAt: now,
    };
    setTodos((prev) => [newTodo, ...prev]);
    return newTodo;
  }, []);

  const updateTodo = useCallback(
    (id: string, changes: UpdateTodoInput): Todo | null => {
      let updated: Todo | null = null;
      setTodos((prev) =>
        prev.map((todo) => {
          if (todo.id === id) {
            updated = {
              ...todo,
              ...changes,
              dueDate:
                changes.dueDate === null ? undefined : (changes.dueDate ?? todo.dueDate),
              updatedAt: new Date().toISOString(),
            };
            return updated;
          }
          return todo;
        })
      );
      return updated;
    },
    []
  );

  const deleteTodo = useCallback((id: string): boolean => {
    let found = false;
    setTodos((prev) => {
      const filtered = prev.filter((todo) => {
        if (todo.id === id) {
          found = true;
          return false;
        }
        return true;
      });
      return filtered;
    });
    return found;
  }, []);

  const toggleTodo = useCallback((id: string): Todo | null => {
    let toggled: Todo | null = null;
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id === id) {
          toggled = {
            ...todo,
            status: todo.status === "pending" ? "completed" : "pending",
            updatedAt: new Date().toISOString(),
          };
          return toggled;
        }
        return todo;
      })
    );
    return toggled;
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((todo) => todo.status !== "completed"));
  }, []);

  return {
    todos,
    loaded,
    storageAvailable,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
  };
}
