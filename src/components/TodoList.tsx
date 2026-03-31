"use client";

import { Todo } from "@/types/todo";
import { TodoItem } from "./TodoItem";
import { StatusFilter, PriorityFilter } from "./TodoFilters";

interface TodoListProps {
  todos: Todo[];
  statusFilter: StatusFilter;
  priorityFilter: PriorityFilter;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export function sortTodos(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    // Pending before completed
    if (a.status !== b.status) {
      return a.status === "pending" ? -1 : 1;
    }
    // Due date ascending (nulls last)
    if (a.dueDate !== b.dueDate) {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    // Created at descending (newest first)
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function filterTodos(
  todos: Todo[],
  statusFilter: StatusFilter,
  priorityFilter: PriorityFilter
): Todo[] {
  return todos.filter((todo) => {
    if (statusFilter !== "all" && todo.status !== statusFilter) return false;
    if (priorityFilter !== "all" && todo.priority !== priorityFilter)
      return false;
    return true;
  });
}

export function TodoList({
  todos,
  statusFilter,
  priorityFilter,
  onToggle,
  onEdit,
  onDelete,
}: TodoListProps) {
  const filtered = filterTodos(todos, statusFilter, priorityFilter);
  const sorted = sortTodos(filtered);

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        {todos.length === 0
          ? "No todos yet. Add one above!"
          : "No todos match the current filters."}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
