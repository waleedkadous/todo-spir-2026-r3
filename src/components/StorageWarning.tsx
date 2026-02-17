"use client";

export function StorageWarning() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
      localStorage is not available. Your todos will not persist after closing this page.
    </div>
  );
}
