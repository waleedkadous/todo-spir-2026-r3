"use client";

import { Priority, Status } from "@/types/todo";

export type StatusFilter = "all" | Status;
export type PriorityFilter = "all" | Priority;

interface TodoFiltersProps {
  statusFilter: StatusFilter;
  priorityFilter: PriorityFilter;
  onStatusChange: (status: StatusFilter) => void;
  onPriorityChange: (priority: PriorityFilter) => void;
  completedCount: number;
  onClearCompleted: () => void;
}

export function TodoFilters({
  statusFilter,
  priorityFilter,
  onStatusChange,
  onPriorityChange,
  completedCount,
  onClearCompleted,
}: TodoFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Status:</span>
        <div className="flex rounded-md overflow-hidden border border-gray-300">
          {(["all", "pending", "completed"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={`px-3 py-1 text-sm capitalize ${
                statusFilter === s
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Priority:</span>
        <div className="flex rounded-md overflow-hidden border border-gray-300">
          {(["all", "low", "medium", "high"] as PriorityFilter[]).map((p) => (
            <button
              key={p}
              onClick={() => onPriorityChange(p)}
              className={`px-3 py-1 text-sm capitalize ${
                priorityFilter === p
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      {completedCount > 0 && (
        <button
          onClick={onClearCompleted}
          className="ml-auto text-sm text-red-600 hover:text-red-800"
        >
          Clear completed ({completedCount})
        </button>
      )}
    </div>
  );
}
