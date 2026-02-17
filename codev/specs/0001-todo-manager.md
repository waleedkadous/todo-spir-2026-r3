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
- Ready to deploy on Railway with zero configuration

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
- [ ] Application deploys to Railway without additional configuration
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

## Security Considerations
- Gemini API key must NEVER be exposed to the client — all API calls go through server-side API route
- `GEMINI_API_KEY` set as environment variable (Railway env vars)
- No user authentication (single-user, local data)
- Input sanitization on NL queries to prevent prompt injection
- XSS prevention via React's built-in escaping

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

### Non-Functional Tests
1. **Performance**: Verify localStorage operations complete in < 100ms with 100+ todos
2. **Responsive Design**: Verify layout on mobile and desktop viewports
3. **Error Handling**: Verify graceful degradation when Gemini API is unavailable
4. **Build Validation**: `next build` completes without errors

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

### NL Processing Architecture
- Client sends: `{ query: string, todos: Todo[] }` to `/api/nl`
- Server sends todo context + user query to Gemini 3.0 Flash with a system prompt defining available actions
- Gemini returns structured JSON: `{ action: string, params: object }` or `{ response: string, results: Todo[] }`
- Client applies the action or displays the response

## Approval
- [ ] Technical Lead Review
- [ ] Product Owner Review
- [ ] Stakeholder Sign-off
- [ ] Expert AI Consultation Complete

## Notes
- The NL interface is the primary differentiator — it must feel natural and intelligent, not like a command parser
- Gemini 3.0 Flash was chosen for its speed and cost-effectiveness for real-time conversational interactions
- The application should work fully (minus NL features) even without a Gemini API key configured

---

## Amendments
