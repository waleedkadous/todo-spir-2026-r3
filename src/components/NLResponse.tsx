"use client";

import { NLResponse, Todo } from "@/types/todo";

interface NLResponseProps {
  response: NLResponse;
  todos: Todo[];
  onClarificationSelect: (option: string) => void;
}

export function NLResponseDisplay({ response, todos, onClarificationSelect }: NLResponseProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-sm">
      <p className="text-gray-700">{response.message}</p>

      {response.type === "query" && response.todoIds.length > 0 && (
        <ul className="mt-2 space-y-1">
          {response.todoIds.map((id) => {
            const todo = todos.find((t) => t.id === id);
            if (!todo) return null;
            return (
              <li key={id} className="text-gray-600 pl-2 border-l-2 border-blue-300">
                <span className={todo.status === "completed" ? "line-through opacity-60" : ""}>
                  {todo.title}
                </span>
                <span className="ml-2 text-xs text-gray-400">{todo.priority}</span>
              </li>
            );
          })}
        </ul>
      )}

      {response.type === "clarification" && response.options && response.options.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {response.options.map((option) => (
            <button
              key={option}
              onClick={() => onClarificationSelect(option)}
              className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-full hover:bg-blue-50 hover:border-blue-300"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
