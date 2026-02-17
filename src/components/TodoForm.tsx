"use client";

import { useState } from "react";
import { CreateTodoInput, Priority, Todo, UpdateTodoInput } from "@/types/todo";

interface TodoFormProps {
  onSubmit: (input: CreateTodoInput) => void;
  editingTodo?: Todo;
  onUpdate?: (id: string, changes: UpdateTodoInput) => void;
  onCancelEdit?: () => void;
}

export function TodoForm({
  onSubmit,
  editingTodo,
  onUpdate,
  onCancelEdit,
}: TodoFormProps) {
  const [title, setTitle] = useState(editingTodo?.title ?? "");
  const [description, setDescription] = useState(
    editingTodo?.description ?? ""
  );
  const [priority, setPriority] = useState<Priority>(
    editingTodo?.priority ?? "medium"
  );
  const [dueDate, setDueDate] = useState(editingTodo?.dueDate ?? "");

  const isEditing = !!editingTodo;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    if (isEditing && onUpdate) {
      onUpdate(editingTodo.id, {
        title: trimmedTitle,
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || null,
      });
      onCancelEdit?.();
    } else {
      onSubmit({
        title: trimmedTitle,
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || undefined,
      });
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          autoFocus
        />
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {isEditing ? "Update" : "Add Todo"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
