"use client";

import { Todo } from "@/types/todo";

const priorityColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200",
};

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  const isCompleted = todo.status === "completed";

  return (
    <div
      className={`flex items-start gap-3 p-3 bg-white rounded-lg border ${
        isCompleted ? "opacity-60" : ""
      }`}
    >
      <input
        type="checkbox"
        checked={isCompleted}
        onChange={() => onToggle(todo.id)}
        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        aria-label={`Mark "${todo.title}" as ${isCompleted ? "pending" : "completed"}`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-sm font-medium ${
              isCompleted ? "line-through text-gray-400" : "text-gray-900"
            }`}
          >
            {todo.title}
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
              priorityColors[todo.priority]
            }`}
          >
            {todo.priority}
          </span>
          {todo.dueDate && (
            <span className="text-xs text-gray-500">
              Due: {new Date(todo.dueDate + "T00:00:00").toLocaleDateString()}
            </span>
          )}
        </div>
        {todo.description && (
          <p
            className={`mt-1 text-xs ${
              isCompleted ? "text-gray-300" : "text-gray-500"
            }`}
          >
            {todo.description}
          </p>
        )}
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => onEdit(todo)}
          className="p-1 text-gray-400 hover:text-blue-600 text-sm"
          aria-label={`Edit "${todo.title}"`}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="p-1 text-gray-400 hover:text-red-600 text-sm"
          aria-label={`Delete "${todo.title}"`}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
