"use client";

import { useState, useCallback } from "react";
import {
  Todo,
  NLResponse,
  NLCreateResponse,
  NLUpdateResponse,
  NLDeleteResponse,
  NLToggleResponse,
} from "@/types/todo";
import { NLResponseDisplay } from "./NLResponse";

interface NLInputProps {
  todos: Todo[];
  onAddTodo: (input: { title: string; description?: string; priority?: "low" | "medium" | "high"; dueDate?: string }) => void;
  onUpdateTodo: (id: string, changes: Record<string, unknown>) => void;
  onDeleteTodo: (id: string) => void;
  onToggleTodo: (id: string) => void;
}

export function NLInput({ todos, onAddTodo, onUpdateTodo, onDeleteTodo, onToggleTodo }: NLInputProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<NLResponse | null>(null);
  const [pendingDelete, setPendingDelete] = useState<NLDeleteResponse | null>(null);

  const sendQuery = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      setLoading(true);
      setResponse(null);
      setPendingDelete(null);

      try {
        const res = await fetch("/api/nl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: text.trim(),
            todos,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            currentTime: new Date().toISOString(),
          }),
        });

        const data: NLResponse = await res.json();
        setResponse(data);

        // Auto-apply non-destructive actions
        if (data.type === "create") {
          const createData = data as NLCreateResponse;
          onAddTodo(createData.todo);
        } else if (data.type === "update") {
          const updateData = data as NLUpdateResponse;
          onUpdateTodo(updateData.todoId, updateData.changes);
        } else if (data.type === "toggle") {
          const toggleData = data as NLToggleResponse;
          onToggleTodo(toggleData.todoId);
        } else if (data.type === "delete") {
          // Delete requires confirmation
          setPendingDelete(data as NLDeleteResponse);
        }
      } catch {
        setResponse({
          type: "error",
          message: "Failed to reach the server. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    },
    [todos, onAddTodo, onUpdateTodo, onDeleteTodo, onToggleTodo]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuery(query);
    setQuery("");
  };

  const handleClarificationSelect = (option: string) => {
    const lastQuery = query || (response?.type === "clarification" ? response.message : "");
    const refined = option;
    setQuery("");
    sendQuery(refined);
  };

  const confirmDelete = () => {
    if (pendingDelete) {
      onDeleteTodo(pendingDelete.todoId);
      setPendingDelete(null);
    }
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything... e.g. 'show high priority todos' or 'add a todo to buy milk'"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Ask"}
        </button>
      </form>

      {response && (
        <div className="mt-3">
          <NLResponseDisplay
            response={response}
            todos={todos}
            onClarificationSelect={handleClarificationSelect}
          />
        </div>
      )}

      {pendingDelete && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
          <p className="text-red-700">
            Confirm delete: &quot;{todos.find((t) => t.id === pendingDelete.todoId)?.title}&quot;?
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={confirmDelete}
              className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={cancelDelete}
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
