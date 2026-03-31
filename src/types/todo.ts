export type Priority = "low" | "medium" | "high";
export type Status = "pending" | "completed";

export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  dueDate?: string; // ISO 8601 date (YYYY-MM-DD)
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  dueDate?: string | null;
}

// NL Interface Types
export interface NLRequest {
  query: string;
  todos: Todo[];
  timezone: string;
  currentTime: string;
}

export type NLResponseType =
  | "query"
  | "create"
  | "update"
  | "delete"
  | "toggle"
  | "clarification"
  | "error";

export interface NLQueryResponse {
  type: "query";
  message: string;
  todoIds: string[];
}

export interface NLCreateResponse {
  type: "create";
  message: string;
  todo: {
    title: string;
    description?: string;
    priority: Priority;
    dueDate?: string;
  };
}

export interface NLUpdateResponse {
  type: "update";
  message: string;
  todoId: string;
  changes: Partial<{
    title: string;
    description: string;
    priority: Priority;
    dueDate: string;
    status: Status;
  }>;
}

export interface NLDeleteResponse {
  type: "delete";
  message: string;
  todoId: string;
}

export interface NLToggleResponse {
  type: "toggle";
  message: string;
  todoId: string;
}

export interface NLClarificationResponse {
  type: "clarification";
  message: string;
  options?: string[];
}

export interface NLErrorResponse {
  type: "error";
  message: string;
}

export type NLResponse =
  | NLQueryResponse
  | NLCreateResponse
  | NLUpdateResponse
  | NLDeleteResponse
  | NLToggleResponse
  | NLClarificationResponse
  | NLErrorResponse;
