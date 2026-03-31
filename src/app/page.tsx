"use client";

import { useState } from "react";
import { useTodos } from "@/hooks/useTodos";
import { TodoForm } from "@/components/TodoForm";
import { TodoFilters, StatusFilter, PriorityFilter } from "@/components/TodoFilters";
import { TodoList } from "@/components/TodoList";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { NLInput } from "@/components/NLInput";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { StorageWarning } from "@/components/StorageWarning";
import { EmptyState } from "@/components/EmptyState";
import { Todo } from "@/types/todo";

export default function Home() {
  const {
    todos,
    loaded,
    storageAvailable,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
  } = useTodos();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);

  const completedCount = todos.filter((t) => t.status === "completed").length;
  const deleteTarget = deleteId
    ? todos.find((t) => t.id === deleteId)
    : null;

  if (!loaded) {
    return (
      <div className="text-center py-12 text-gray-400">Loading...</div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {!storageAvailable && <StorageWarning />}

      <NLInput
        todos={todos}
        onAddTodo={addTodo}
        onUpdateTodo={updateTodo}
        onDeleteTodo={deleteTodo}
        onToggleTodo={toggleTodo}
      />

      <TodoForm
        key={editingTodo?.id ?? "new"}
        onSubmit={addTodo}
        editingTodo={editingTodo}
        onUpdate={updateTodo}
        onCancelEdit={() => setEditingTodo(undefined)}
      />

      <TodoFilters
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        completedCount={completedCount}
        onClearCompleted={() => setClearConfirm(true)}
      />

      <div className="text-xs text-gray-400">
        {todos.length} total &middot; {todos.length - completedCount} pending
      </div>

      {todos.length === 0 ? (
        <EmptyState />
      ) : (
        <TodoList
          todos={todos}
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          onToggle={toggleTodo}
          onEdit={setEditingTodo}
          onDelete={setDeleteId}
        />
      )}

      <PrivacyNotice />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Todo"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        onConfirm={() => {
          if (deleteId) deleteTodo(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        open={clearConfirm}
        title="Clear Completed"
        message={`Remove all ${completedCount} completed todos?`}
        onConfirm={() => {
          clearCompleted();
          setClearConfirm(false);
        }}
        onCancel={() => setClearConfirm(false)}
      />
    </div>
  );
}
