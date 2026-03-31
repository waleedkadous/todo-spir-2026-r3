import { NLRequest, NLResponse, NLResponseType } from "@/types/todo";

const ALLOWED_ACTIONS: NLResponseType[] = [
  "query",
  "create",
  "update",
  "delete",
  "toggle",
  "clarification",
  "error",
];

const MAX_QUERY_LENGTH = 500;
const MAX_TODOS = 1000;
const VALID_PRIORITIES = ["low", "medium", "high"];
const VALID_STATUSES = ["pending", "completed"];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ALLOWED_UPDATE_KEYS = new Set(["title", "description", "priority", "dueDate", "status"]);

export interface ValidationError {
  field: string;
  message: string;
}

export function validateNLRequest(
  body: unknown
): { valid: true; data: NLRequest } | { valid: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== "object") {
    return { valid: false, errors: [{ field: "body", message: "Request body must be a JSON object" }] };
  }

  const obj = body as Record<string, unknown>;

  if (typeof obj.query !== "string" || obj.query.trim().length === 0) {
    errors.push({ field: "query", message: "query must be a non-empty string" });
  } else if (obj.query.length > MAX_QUERY_LENGTH) {
    errors.push({ field: "query", message: `query must be at most ${MAX_QUERY_LENGTH} characters` });
  }

  if (!Array.isArray(obj.todos)) {
    errors.push({ field: "todos", message: "todos must be an array" });
  } else if (obj.todos.length > MAX_TODOS) {
    errors.push({ field: "todos", message: `todos must have at most ${MAX_TODOS} items` });
  }

  if (typeof obj.timezone !== "string" || obj.timezone.trim().length === 0) {
    errors.push({ field: "timezone", message: "timezone must be a non-empty string" });
  }

  if (typeof obj.currentTime !== "string" || obj.currentTime.trim().length === 0) {
    errors.push({ field: "currentTime", message: "currentTime must be a non-empty string" });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      query: (obj.query as string).trim(),
      todos: obj.todos as NLRequest["todos"],
      timezone: obj.timezone as string,
      currentTime: obj.currentTime as string,
    },
  };
}

export function validateNLResponse(
  raw: unknown
): { valid: true; data: NLResponse } | { valid: false; error: string } {
  if (!raw || typeof raw !== "object") {
    return { valid: false, error: "Response must be a JSON object" };
  }

  const obj = raw as Record<string, unknown>;

  if (typeof obj.type !== "string") {
    return { valid: false, error: "Response must have a 'type' field" };
  }

  if (!ALLOWED_ACTIONS.includes(obj.type as NLResponseType)) {
    return { valid: false, error: `Unrecognized action type: '${obj.type}'` };
  }

  if (typeof obj.message !== "string") {
    return { valid: false, error: "Response must have a 'message' field" };
  }

  const type = obj.type as NLResponseType;

  switch (type) {
    case "query":
      if (!Array.isArray(obj.todoIds)) {
        return { valid: false, error: "query response must have a 'todoIds' array" };
      }
      break;
    case "create": {
      if (!obj.todo || typeof obj.todo !== "object") {
        return { valid: false, error: "create response must have a 'todo' object" };
      }
      const todo = obj.todo as Record<string, unknown>;
      if (typeof todo.title !== "string") {
        return { valid: false, error: "create response todo must have a 'title' string" };
      }
      if (todo.priority !== undefined && !VALID_PRIORITIES.includes(todo.priority as string)) {
        return { valid: false, error: `create response todo has invalid priority: '${todo.priority}'` };
      }
      if (todo.dueDate !== undefined && (typeof todo.dueDate !== "string" || !DATE_REGEX.test(todo.dueDate))) {
        return { valid: false, error: "create response todo has invalid dueDate (expected YYYY-MM-DD)" };
      }
      break;
    }
    case "update": {
      if (typeof obj.todoId !== "string") {
        return { valid: false, error: "update response must have a 'todoId' string" };
      }
      if (!obj.changes || typeof obj.changes !== "object") {
        return { valid: false, error: "update response must have a 'changes' object" };
      }
      const changes = obj.changes as Record<string, unknown>;
      // Strip unknown keys
      for (const key of Object.keys(changes)) {
        if (!ALLOWED_UPDATE_KEYS.has(key)) {
          delete changes[key];
        }
      }
      // Validate field values
      if (changes.priority !== undefined && !VALID_PRIORITIES.includes(changes.priority as string)) {
        return { valid: false, error: `update response has invalid priority: '${changes.priority}'` };
      }
      if (changes.status !== undefined && !VALID_STATUSES.includes(changes.status as string)) {
        return { valid: false, error: `update response has invalid status: '${changes.status}'` };
      }
      if (changes.dueDate !== undefined && (typeof changes.dueDate !== "string" || !DATE_REGEX.test(changes.dueDate))) {
        return { valid: false, error: "update response has invalid dueDate (expected YYYY-MM-DD)" };
      }
      break;
    }
    case "delete":
    case "toggle":
      if (typeof obj.todoId !== "string") {
        return { valid: false, error: `${type} response must have a 'todoId' string` };
      }
      break;
    case "clarification":
      // options is optional
      if (obj.options !== undefined && !Array.isArray(obj.options)) {
        return { valid: false, error: "clarification 'options' must be an array if present" };
      }
      break;
    case "error":
      // message already validated
      break;
  }

  return { valid: true, data: raw as NLResponse };
}
