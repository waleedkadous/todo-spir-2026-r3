# Specification: Todo Manager

## Metadata
- **ID**: spec-2026-02-17-todo-manager
- **Status**: draft
- **Created**: 2026-02-17

## Clarifying Questions Asked

The user provided comprehensive requirements upfront. Key decisions already made:

1. **Q: What framework?** A: Next.js 14+ with TypeScript and App Router
2. **Q: Database/backend?** A: No backend database. Use browser localStorage for persistence.
3. **Q: Deployment target?** A: Railway (deploy-ready)
4. **Q: What features?** A: Full CRUD with priority levels (low/medium/high), due dates, status (pending/completed), filtering by status and priority
5. **Q: Natural language interface?** A: Yes — fully powered NL interface using Gemini 3.0 Flash. Must understand arbitrary phrasing, handle ambiguity, and support complex queries. NOT a simple grammar/regex parser.

## Problem Statement

Users need a modern, responsive task management application that combines traditional UI interactions with a natural language interface. The key differentiator is the conversational NL interface powered by Gemini 3.0 Flash, allowing users to manage their todos through natural language commands like "show me all high priority todos due this week" or "mark the grocery shopping todo as done."

The application must be entirely client-side for data storage (localStorage), making it simple to deploy and use without backend infrastructure, while still leveraging an AI API (Gemini) for NL processing.

## Current State

No application exists. This is a greenfield project.

## Desired State

A fully functional, deploy-ready Next.js application with:
- Clean, responsive UI for managing todos
- Full CRUD operations on todos
- Rich todo properties: title, description, priority (low/medium/high), due date, status (pending/completed)
- Filtering and sorting capabilities
- A conversational NL interface powered by Gemini 3.0 Flash that understands arbitrary queries and commands
- All data persisted in browser localStorage
- Ready to deploy on Railway (only requires setting `GEMINI_API_KEY` env var)

## Stakeholders
- **Primary Users**: Individual users managing personal tasks
- **Technical Team**: Solo developer using AI-assisted development
- **Business Owners**: Project owner (user)

## Success Criteria
- [ ] Users can create todos with title, optional description, priority (low/medium/high), and optional due date
- [ ] Users can view all todos in a list with visual priority indicators
- [ ] Users can edit any todo property inline or via edit form
- [ ] Users can delete todos with confirmation
- [ ] Users can mark todos as completed/pending (toggle)
- [ ] Users can filter todos by status (all/pending/completed)
- [ ] Users can filter todos by priority (all/low/medium/high)
- [ ] Combined filters work together (e.g., high priority + pending)
- [ ] NL interface accepts free-form text input and processes via Gemini 3.0 Flash
- [ ] NL interface can query todos (e.g., "show high priority", "what's due tomorrow")
- [ ] NL interface can mutate todos (e.g., "mark X as done", "add a new todo to buy groceries")
- [ ] NL interface handles ambiguity gracefully (e.g., asks for clarification when multiple matches)
- [ ] All data persists in localStorage across page refreshes
- [ ] Application builds and runs without errors
- [ ] Application deploys to Railway (requires only `GEMINI_API_KEY` env var)
- [ ] All tests pass
- [ ] Responsive design works on mobile and desktop

## Constraints

### Technical Constraints
- **Framework**: Next.js 14+ with App Router and TypeScript (mandatory)
- **Data Storage**: Browser localStorage only — no backend database, no server-side state
- **NL Backend**: Gemini 3.0 Flash API — requires `GEMINI_API_KEY` environment variable
- **Deployment**: Must be Railway-compatible (standard Next.js deployment)
- **API Route**: Gemini API calls must go through a Next.js API route to protect the API key (server-side proxy)

### Business Constraints
- Single-user application (no auth, no multi-tenancy)
- Free-tier friendly (minimal API usage per interaction)

## Assumptions
- User will provide their own Gemini API key via environment variable
- Modern browser with localStorage support
- Railway supports standard Next.js deployments via `next start`
- Gemini 3.0 Flash is capable of structured JSON output for function-calling-style NL processing

## Solution Approaches

### Approach 1: Server-Side API Route + Client localStorage (Recommended)

**Description**: Use Next.js App Router with client components for the UI and todo management. All todos stored in localStorage on the client. NL processing goes through a Next.js API route (`/api/nl`) that calls Gemini 3.0 Flash server-side, keeping the API key secure. The API route receives the user's NL query plus the current todo list context, and returns structured actions (query results, mutations) that the client applies.

**Pros**:
- API key stays server-side (secure)
- Clean separation: UI logic on client, AI processing on server
- Standard Next.js patterns, easy to deploy
- localStorage keeps things simple with no database setup

**Cons**:
- Todos must be sent to the API route for NL context (network overhead for large lists)
- localStorage has ~5MB limit (sufficient for todos)
- No cross-device sync

**Estimated Complexity**: Medium
**Risk Level**: Low

### Approach 2: Full Client-Side with Exposed API Key

**Description**: Call Gemini API directly from the browser.

**Pros**:
- Simpler architecture, no API route needed

**Cons**:
- API key exposed in client bundle (critical security issue)
- Not suitable for production

**Estimated Complexity**: Low
**Risk Level**: High (security)

### Approach 3: Edge Functions for NL Processing

**Description**: Use Next.js Edge Runtime for the NL API route.

**Pros**:
- Lower latency for API calls
- Still keeps API key secure

**Cons**:
- Edge runtime has limitations (no Node.js APIs)
- May have issues with Gemini SDK compatibility
- Adds complexity without clear benefit for this use case

**Estimated Complexity**: Medium
**Risk Level**: Medium

**Selected Approach**: Approach 1 — Server-Side API Route + Client localStorage. It balances security, simplicity, and deployability.

## Open Questions

### Critical (Blocks Progress)
- [x] None — all critical decisions made by user requirements

### Important (Affects Design)
- [x] NL response format: Will use structured JSON responses from Gemini with function-calling style (action + parameters)
- [x] Error handling for NL: Will show user-friendly messages when Gemini is unavailable or returns unexpected responses

### Nice-to-Know (Optimization)
- [ ] Should completed todos auto-sort to bottom? (Default: yes, configurable via filter)
- [ ] Should there be a "clear completed" bulk action? (Will include as enhancement)

## Performance Requirements
- **Page Load**: < 1s for initial render (client-side data from localStorage is instant)
- **NL Response**: < 3s for Gemini API round-trip (dependent on API latency)
- **UI Interactions**: < 100ms for all local operations (create, edit, delete, filter)
- **localStorage**: Support up to 1000 todos without degradation
- **localStorage unavailable**: If localStorage is unavailable (private browsing, storage full), display a warning banner; app functions in-memory for the session but data will not persist

## Security Considerations
- Gemini API key must NEVER be exposed to the client — all API calls go through server-side API route
- `GEMINI_API_KEY` set as environment variable (Railway env vars)
- No user authentication (single-user, local data)
- **Prompt injection mitigation**: User query is delimited in the prompt; todo data passed as structured context, not interpolated. Gemini response is validated against strict action allowlist.
- **Server-side validation**: All `/api/nl` requests validated (schema check, max query length 500 chars, max 1000 todos). All Gemini responses validated against action type allowlist before returning to client.
- **Rate limiting**: In-memory rate limiting on `/api/nl` (20 req/min per IP) to prevent API key abuse
- XSS prevention via React's built-in escaping
- **Privacy disclosure**: UI notes that todo data is sent to Google Gemini API for NL processing

## Test Scenarios

### Functional Tests
1. **CRUD Operations**: Create, read, update, delete todos — verify localStorage persistence
2. **Priority Management**: Set and change priority levels, verify visual indicators
3. **Due Dates**: Set due dates, verify display and NL querying by date
4. **Status Toggle**: Mark todos complete/pending, verify filter behavior
5. **Filtering**: Test all filter combinations (status x priority)
6. **NL Queries**: Test various natural language inputs for querying todos
7. **NL Mutations**: Test NL commands for creating, updating, completing, deleting todos
8. **NL Ambiguity**: Test ambiguous queries and verify graceful handling
9. **Persistence**: Verify data survives page refresh

### NL Contract Tests
1. **Action Schema Validation**: Verify all response types conform to defined TypeScript interfaces
2. **Action Allowlist**: Verify unrecognized action types are rejected
3. **Ambiguity Flow**: Test multi-step clarification (ambiguous query → clarification → refined query → action)
4. **Date Parsing**: Test relative date queries ("tomorrow", "this week", "next Monday") with fixed timezone
5. **Gemini Mock**: Use mock Gemini responses for deterministic NL testing
6. **Invalid Response Handling**: Test malformed JSON, missing fields, and unexpected action types from Gemini
7. **Duplicate Title Matching**: Test NL mutations when multiple todos have similar titles

### Non-Functional Tests
1. **Performance**: Verify localStorage operations complete in < 100ms with 100+ todos
2. **Responsive Design**: Verify layout on mobile and desktop viewports
3. **Error Handling**: Verify graceful degradation when Gemini API is unavailable (timeout, 500, invalid JSON)
4. **Build Validation**: `next build` completes without errors
5. **Rate Limiting**: Verify `/api/nl` rejects excessive requests

## Dependencies
- **External Services**: Google Gemini 3.0 Flash API (via `@google/generative-ai` SDK)
- **Framework**: Next.js 14+, React 18+, TypeScript
- **Styling**: Tailwind CSS (standard for modern Next.js apps)
- **Testing**: Jest + React Testing Library
- **Deployment**: Railway (standard Node.js/Next.js deployment)

## Risks and Mitigation
| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| Gemini API rate limits | Low | Medium | Implement error handling with user-friendly messages |
| localStorage data loss (browser clear) | Medium | Medium | Document limitation; data is inherently ephemeral |
| NL misinterpretation of ambiguous queries | Medium | Low | Return clarification prompts instead of wrong actions |
| Gemini API changes | Low | High | Pin SDK version; use structured output format |
| Large todo list performance | Low | Low | localStorage is fast; limit to practical sizes |

## NL Interface Design

### Supported Interaction Patterns

**Queries** (read-only, return filtered/sorted results):
- "Show me all high priority todos"
- "What's due this week?"
- "How many pending todos do I have?"
- "Show completed todos from today"

**Mutations** (modify todos):
- "Add a new todo: buy groceries, high priority, due tomorrow"
- "Mark 'buy groceries' as done"
- "Change the priority of 'write report' to high"
- "Delete the 'old task' todo"

**Ambiguity Handling**:
- When multiple todos match, present options: "I found 3 todos matching 'shopping'. Which one?"
- When intent is unclear, ask for clarification: "Did you want to create a new todo or search for existing ones?"

### Todo Data Model

```typescript
interface Todo {
  id: string;              // UUID v4, generated on creation
  title: string;           // Required, user-provided
  description?: string;    // Optional, user-provided
  priority: "low" | "medium" | "high";  // Required, default: "medium"
  status: "pending" | "completed";      // Required, default: "pending"
  dueDate?: string;        // Optional, ISO 8601 date (YYYY-MM-DD)
  createdAt: string;       // ISO 8601 timestamp, set on creation
  updatedAt: string;       // ISO 8601 timestamp, updated on any change
}
```

### NL Action Schema (Contract)

The `/api/nl` endpoint accepts and returns well-defined JSON structures.

**Request**:
```typescript
interface NLRequest {
  query: string;           // User's natural language input
  todos: Todo[];           // Current todo list for context
  timezone: string;        // IANA timezone (e.g., "America/New_York")
  currentTime: string;     // ISO 8601 timestamp from client
}
```

**Response** — one of these action types:

```typescript
// Query action — returns filtered/matched todos
interface NLQueryResponse {
  type: "query";
  message: string;         // Human-readable summary
  todoIds: string[];       // IDs of matching todos
}

// Create action — creates a new todo
interface NLCreateResponse {
  type: "create";
  message: string;
  todo: { title: string; description?: string; priority: "low" | "medium" | "high"; dueDate?: string };
}

// Update action — modifies an existing todo
interface NLUpdateResponse {
  type: "update";
  message: string;
  todoId: string;
  changes: Partial<{ title: string; description: string; priority: string; dueDate: string; status: string }>;
}

// Delete action — removes a todo
interface NLDeleteResponse {
  type: "delete";
  message: string;
  todoId: string;
}

// Toggle action — marks complete/pending
interface NLToggleResponse {
  type: "toggle";
  message: string;
  todoId: string;
}

// Clarification — when intent or target is ambiguous
interface NLClarificationResponse {
  type: "clarification";
  message: string;         // Question to the user
  options?: string[];      // Suggested options (e.g., matching todo titles)
}

// Error — when query cannot be processed
interface NLErrorResponse {
  type: "error";
  message: string;
}
```

**Allowed action types** (strict allowlist): `query`, `create`, `update`, `delete`, `toggle`, `clarification`, `error`. Any unrecognized action type from Gemini is rejected and returns an error to the client.

### Ambiguity Resolution Flow

1. User sends NL command (e.g., "mark shopping as done")
2. Gemini receives todo list and finds multiple matches
3. Gemini returns `{ type: "clarification", message: "I found 3 todos with 'shopping'. Which one?", options: ["Grocery shopping", "Shopping list", "Online shopping"] }`
4. Client displays the clarification message with clickable options
5. User selects an option or types a more specific command
6. Client sends a follow-up request with the refined query

**Destructive action confirmation**: For `delete` actions, the client always shows a confirmation dialog before applying. For `update` and `toggle` actions, the client applies immediately (these are easily reversible).

**Multi-turn context**: The NL interface is stateless — each request is independent. For the clarification flow, the client appends the user's selection to a more specific query (e.g., "mark 'Grocery shopping' as done") rather than maintaining conversation history. This keeps the architecture simple and avoids server-side session state.

**Batch operations**: Out of scope for v1. NL mutations operate on a single todo at a time. If a user says "mark all shopping todos as done," Gemini should return a clarification asking which specific todo to update. Batch support can be added in a future amendment.

### Date/Time Handling Policy

- **Client responsibility**: Always sends `timezone` (IANA string from `Intl.DateTimeFormat().resolvedOptions().timeZone`) and `currentTime` (ISO 8601) with every NL request
- **Server responsibility**: Includes timezone and current time in the Gemini system prompt so relative date references ("tomorrow", "this week", "next Monday") resolve correctly
- **Due date storage**: All due dates stored as ISO 8601 date strings (YYYY-MM-DD) in localStorage
- **Display**: Due dates rendered in the user's local timezone using the browser's `Intl.DateTimeFormat`
- **"This week"**: Defined as Monday through Sunday of the current week in the user's timezone

### NL Processing Architecture
- Client sends: `NLRequest` to `POST /api/nl`
- Server validates the request schema
- Server constructs a Gemini prompt with: system instructions (available actions, todo schema, current time/timezone), the todo list as context, and the user's query
- Gemini returns structured JSON matching one of the response types above
- Server validates the response against the action allowlist and schema
- Server returns validated response or error to client
- Client applies the action or displays the message

### NL Security Controls
- **Server-side request validation**: Reject requests with missing/invalid fields, enforce max query length (500 chars), enforce max todo list size (1000 items)
- **Response validation**: Parse Gemini output as JSON, validate against action allowlist, reject unrecognized action types
- **Rate limiting**: Basic in-memory rate limiting on `/api/nl` (max 20 requests per minute per IP)
- **Prompt injection mitigation**: Todo content is passed as structured data (not interpolated into the prompt string); user query is clearly delimited in the prompt
- **Privacy note**: Todo titles and descriptions are sent to Google's Gemini API for NL processing. This is documented in the UI.

## Expert Consultation

**Date**: 2026-02-17
**Models Consulted**: Gemini 3.0 Flash, GPT-5 Codex, Claude (failed - API overloaded)

**Gemini Review** (APPROVE, HIGH confidence):
- Praised security approach (server-side API key), clarity, and architecture choice
- Suggested: Send client timezone/timestamp for relative date resolution → **Added to NL Action Schema**
- Suggested: Consider Gemini Function Calling API for structured output → **Noted for plan phase**
- Suggested: Optimize context size for large todo lists → **Noted; max 1000 items enforced**

**Codex Review** (REQUEST_CHANGES, HIGH confidence):
- NL action schema undefined → **Added complete NL Action Schema section with TypeScript interfaces**
- Ambiguity resolution underspecified → **Added Ambiguity Resolution Flow section**
- Date/timezone policy missing → **Added Date/Time Handling Policy section**
- Prompt injection/response validation needs concrete controls → **Added NL Security Controls section, updated Security Considerations**
- NL testing lacks mock/contract validation → **Added NL Contract Tests section with 7 test scenarios**
- "Zero configuration" conflicts with env var requirement → **Clarified to "requires only GEMINI_API_KEY env var"**

**Claude Review** (COMMENT, HIGH confidence):
- Missing `Todo` type definition → **Added Todo Data Model section with full TypeScript interface**
- Multi-turn NL context unclear → **Added clarification: stateless design, client appends refined query**
- Batch NL operations unscoped → **Explicitly scoped out for v1**
- localStorage unavailability unspecified → **Added behavior specification in Performance Requirements**

All consultation feedback has been incorporated into the relevant sections above.

## Approval
- [x] Expert AI Consultation Complete
- [ ] Technical Lead Review
- [ ] Product Owner Review
- [ ] Stakeholder Sign-off

## Notes
- The NL interface is the primary differentiator — it must feel natural and intelligent, not like a command parser
- Gemini 3.0 Flash was chosen for its speed and cost-effectiveness for real-time conversational interactions
- The application should work fully (minus NL features) even without a Gemini API key configured

---

## Amendments
