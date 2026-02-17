# Plan: Todo Manager

## Metadata
- **ID**: plan-2026-02-17-todo-manager
- **Status**: draft
- **Specification**: codev/specs/0001-todo-manager.md
- **Created**: 2026-02-17

## Executive Summary

Implement a Next.js 14+ Todo Manager with TypeScript, App Router, Tailwind CSS, localStorage persistence, and a Gemini 3.0 Flash-powered natural language interface. The architecture follows the spec's Approach 1: server-side API route for Gemini calls + client-side localStorage for data.

The plan is structured into 5 phases: project scaffolding, core todo CRUD with localStorage, UI with filtering, NL API integration, and final polish with tests.

## Success Metrics
- [ ] All specification success criteria met
- [ ] Test coverage on core logic
- [ ] `next build` completes without errors
- [ ] NL action schema contract validated
- [ ] Application deployable on Railway with `GEMINI_API_KEY` env var
- [ ] Responsive design on mobile and desktop

## Phases (Machine Readable)

```json
{
  "phases": [
    {"id": "project-setup", "title": "Phase 1: Project Setup & Configuration"},
    {"id": "todo-core", "title": "Phase 2: Todo Data Layer & CRUD Logic"},
    {"id": "ui-filters", "title": "Phase 3: UI Components & Filtering"},
    {"id": "nl-interface", "title": "Phase 4: Natural Language Interface"},
    {"id": "polish-tests", "title": "Phase 5: Polish, Tests & Deploy Readiness"}
  ]
}
```

## Phase Breakdown

### Phase 1: Project Setup & Configuration
**Dependencies**: None

#### Objectives
- Scaffold Next.js 14+ project with TypeScript and App Router
- Configure Tailwind CSS
- Set up project structure, testing framework, and Railway deploy config

#### Deliverables
- [ ] Next.js project with TypeScript, App Router, Tailwind CSS
- [ ] Jest + React Testing Library configured
- [ ] Railway-compatible configuration (standalone output)
- [ ] Environment variable setup for `GEMINI_API_KEY`
- [ ] Base layout with app shell (header, main content area)
- [ ] `.gitignore` properly configured

#### Implementation Details
- Files to create:
  - `package.json` — dependencies: next, react, react-dom, tailwindcss, @google/generative-ai, uuid
  - `tsconfig.json` — TypeScript configuration
  - `tailwind.config.ts` — Tailwind configuration
  - `postcss.config.mjs` — PostCSS for Tailwind
  - `next.config.ts` — Next.js config with `output: "standalone"` for Railway
  - `jest.config.ts` — Jest with ts-jest and jsdom
  - `jest.setup.ts` — Testing library setup
  - `src/app/layout.tsx` — Root layout with metadata, fonts, Tailwind globals
  - `src/app/page.tsx` — Main page (placeholder)
  - `src/app/globals.css` — Tailwind directives + base styles
  - `.env.example` — Document required env vars
  - `.gitignore` — Node/Next.js ignores

#### Acceptance Criteria
- [ ] `npm run build` succeeds
- [ ] `npm run dev` serves the app at localhost:3000
- [ ] `npm test` runs (even with no tests yet)
- [ ] Tailwind styles render correctly

#### Test Plan
- **Manual Testing**: Dev server starts, page renders, Tailwind classes work

#### Rollback Strategy
- Delete generated files and re-scaffold

---

### Phase 2: Todo Data Layer & CRUD Logic
**Dependencies**: Phase 1

#### Objectives
- Define the Todo TypeScript types matching the spec's data model
- Implement localStorage persistence layer with full CRUD
- Handle localStorage unavailability gracefully

#### Deliverables
- [ ] Todo type definitions
- [ ] localStorage hook with CRUD operations
- [ ] UUID generation for todo IDs
- [ ] Unit tests for all CRUD operations

#### Implementation Details
- Files to create:
  - `src/types/todo.ts` — `Todo` interface, `Priority`, `Status` types, NL request/response types
  - `src/hooks/useTodos.ts` — Custom React hook: `useTodos()` providing `todos`, `addTodo`, `updateTodo`, `deleteTodo`, `toggleTodo`, plus localStorage read/write
  - `src/lib/storage.ts` — Low-level localStorage wrapper: `loadTodos()`, `saveTodos()`, `isStorageAvailable()`
  - `__tests__/lib/storage.test.ts` — Unit tests for storage layer
  - `__tests__/hooks/useTodos.test.ts` — Unit tests for useTodos hook

- Todo interface (from spec):
  ```typescript
  interface Todo {
    id: string;              // UUID v4
    title: string;
    description?: string;
    priority: "low" | "medium" | "high";
    status: "pending" | "completed";
    dueDate?: string;        // ISO 8601 YYYY-MM-DD
    createdAt: string;       // ISO 8601
    updatedAt: string;       // ISO 8601
  }
  ```

#### Acceptance Criteria
- [ ] Can create a todo with all required fields
- [ ] Can read all todos from localStorage
- [ ] Can update any todo property
- [ ] Can delete a todo by ID
- [ ] Can toggle todo status
- [ ] Data persists across hook re-renders (localStorage)
- [ ] Graceful handling when localStorage is unavailable
- [ ] All unit tests pass

#### Test Plan
- **Unit Tests**: CRUD operations, localStorage serialization/deserialization, edge cases (empty list, invalid data, storage full)
- **Integration Tests**: Hook behavior with React rendering

#### Rollback Strategy
- Revert the files; Phase 1 remains intact

---

### Phase 3: UI Components & Filtering
**Dependencies**: Phase 2

#### Objectives
- Build the complete todo management UI
- Implement filtering by status and priority
- Responsive design for mobile and desktop

#### Deliverables
- [ ] Todo list component with visual priority indicators
- [ ] Create todo form
- [ ] Edit todo functionality
- [ ] Delete todo with confirmation
- [ ] Status toggle (checkbox)
- [ ] Filter controls (status + priority)
- [ ] Responsive layout
- [ ] Component tests

#### Implementation Details
- Files to create/modify:
  - `src/app/page.tsx` — Main page composing all components
  - `src/components/TodoList.tsx` — Renders filtered list of todos
  - `src/components/TodoItem.tsx` — Single todo row with status toggle, priority badge, due date, edit/delete actions
  - `src/components/TodoForm.tsx` — Create/edit form with title, description, priority select, due date picker
  - `src/components/TodoFilters.tsx` — Filter bar: status (all/pending/completed), priority (all/low/medium/high)
  - `src/components/ConfirmDialog.tsx` — Reusable confirmation dialog for delete
  - `__tests__/components/TodoList.test.tsx` — Component tests
  - `__tests__/components/TodoForm.test.tsx` — Form component tests
  - `__tests__/components/TodoFilters.test.tsx` — Filter component tests

- Design notes:
  - Priority colors: high=red, medium=yellow, low=green
  - Completed todos: strikethrough text, muted colors
  - Filters combine with AND logic (status AND priority)
  - Mobile: stacked layout; Desktop: single-column list

#### Acceptance Criteria
- [ ] Can create todos via form with all fields
- [ ] Todos display with correct priority colors
- [ ] Can edit any todo inline or via form
- [ ] Delete shows confirmation, then removes
- [ ] Status toggle works with visual feedback
- [ ] Filters narrow the displayed list correctly
- [ ] Combined filters work (e.g., high + pending)
- [ ] Layout is responsive
- [ ] All component tests pass

#### Test Plan
- **Unit Tests**: Component rendering, filter logic, form validation
- **Integration Tests**: Full CRUD flow through UI components
- **Manual Testing**: Visual appearance, responsive breakpoints, interactions

#### Rollback Strategy
- Revert component files; data layer from Phase 2 unaffected

---

### Phase 4: Natural Language Interface
**Dependencies**: Phase 2, Phase 3

#### Objectives
- Implement the `/api/nl` server-side API route with Gemini 3.0 Flash integration
- Build the NL chat input component on the client
- Implement the full NL action schema from the spec
- Handle ambiguity, errors, and graceful degradation

#### Deliverables
- [ ] API route `/api/nl` with Gemini integration
- [ ] NL request/response validation
- [ ] Rate limiting middleware
- [ ] Client-side NL input component
- [ ] Action processing (query, create, update, delete, toggle, clarification, error)
- [ ] Graceful degradation when API key is missing
- [ ] API route tests with mocked Gemini responses
- [ ] NL contract tests

#### Implementation Details
- Files to create/modify:
  - `src/app/api/nl/route.ts` — POST handler: validates request, constructs Gemini prompt with system instructions + todo context + user query, calls Gemini, validates response against action allowlist, returns structured response
  - `src/lib/gemini.ts` — Gemini client wrapper: initialize `@google/generative-ai` with API key, send prompt, parse response
  - `src/lib/nl-prompt.ts` — System prompt template for Gemini: defines available actions, todo schema, current time context, response format instructions
  - `src/lib/nl-validation.ts` — Request validation (schema, max query length 500, max 1000 todos) and response validation (action allowlist, field checks)
  - `src/lib/rate-limit.ts` — In-memory rate limiter (20 req/min per IP)
  - `src/components/NLInput.tsx` — Chat-style input bar: text input, send button, displays response messages, clarification options
  - `src/components/NLResponse.tsx` — Renders NL responses: query results, action confirmations, clarification prompts, errors
  - `src/app/page.tsx` — Integrate NL input into main page
  - `__tests__/api/nl.test.ts` — API route tests with mocked Gemini
  - `__tests__/lib/nl-validation.test.ts` — Validation logic tests
  - `__tests__/components/NLInput.test.tsx` — NL component tests

- Gemini system prompt will:
  - Define all 7 action types with JSON schema
  - Include current time and timezone from client
  - Pass todo list as structured JSON context
  - Instruct Gemini to return exactly one action type per response
  - Handle relative date resolution using provided timezone

#### Acceptance Criteria
- [ ] `/api/nl` returns valid action responses for queries
- [ ] `/api/nl` returns valid action responses for mutations
- [ ] Ambiguous queries return clarification responses
- [ ] Invalid requests return 400 errors
- [ ] Rate limiting rejects excessive requests (429)
- [ ] Missing API key returns graceful error (NL disabled notice)
- [ ] All 7 action types are handled by the client
- [ ] NL input component sends requests and displays responses
- [ ] All NL contract tests pass
- [ ] All API route tests pass

#### Test Plan
- **Unit Tests**: Request validation, response validation, rate limiter, prompt construction
- **Integration Tests**: Full NL flow with mocked Gemini (query → response → UI update)
- **NL Contract Tests**: All 7 action types validated, unrecognized types rejected, malformed JSON handled
- **Manual Testing**: Various NL queries and mutations, ambiguity scenarios

#### Rollback Strategy
- Remove API route and NL components; app works fully via traditional UI (Phase 3)

#### Risks
- **Risk**: Gemini response format inconsistency
  - **Mitigation**: Strict validation + clear system prompt + error fallback
- **Risk**: Rate limiting state lost on server restart
  - **Mitigation**: Acceptable for single-user app; in-memory is sufficient

---

### Phase 5: Polish, Tests & Deploy Readiness
**Dependencies**: Phase 4

#### Objectives
- Final UI polish and responsive design refinements
- Ensure comprehensive test coverage
- Verify Railway deployment readiness
- Add privacy notice for Gemini data sharing
- Build validation

#### Deliverables
- [ ] Privacy notice in UI about Gemini data sharing
- [ ] localStorage warning banner when unavailable
- [ ] Empty state UI (no todos yet)
- [ ] Loading states for NL requests
- [ ] Final responsive design pass
- [ ] All tests pass
- [ ] `next build` succeeds
- [ ] README.md with setup and deploy instructions

#### Implementation Details
- Files to create/modify:
  - `src/components/StorageWarning.tsx` — Banner when localStorage unavailable
  - `src/components/EmptyState.tsx` — Empty state illustration/message
  - `src/components/PrivacyNotice.tsx` — Small notice about data sent to Gemini
  - `src/app/page.tsx` — Integrate warning, empty state, privacy notice
  - `README.md` — Project overview, local dev setup, Railway deploy instructions, env vars
  - Various components — loading states, UI polish
  - `__tests__/` — Fill any remaining test gaps

#### Acceptance Criteria
- [ ] Privacy notice visible in UI
- [ ] localStorage warning appears when storage unavailable
- [ ] Empty state shown when no todos exist
- [ ] Loading spinner during NL requests
- [ ] `next build` produces no errors
- [ ] All tests pass
- [ ] README documents setup and deployment

#### Test Plan
- **Unit Tests**: Warning components, empty state rendering
- **Integration Tests**: Full app flow end-to-end
- **Build Test**: `npm run build` succeeds
- **Manual Testing**: Full walkthrough on mobile and desktop

#### Rollback Strategy
- Polish changes are cosmetic; revert individual files as needed

---

## Dependency Map
```
Phase 1 (Setup) ──→ Phase 2 (Data Layer) ──→ Phase 3 (UI) ──→ Phase 4 (NL) ──→ Phase 5 (Polish)
```

Linear dependency chain — each phase builds on the previous.

## Integration Points

### External Systems
- **Google Gemini API**: REST API via `@google/generative-ai` SDK
  - Integration in Phase 4
  - Fallback: NL features disabled, traditional UI still functional

## Risk Analysis

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Gemini response format instability | Medium | Medium | Strict validation, clear system prompt, error fallback |
| localStorage quota exceeded | Low | Low | Max 1000 todos enforced, warning banner |
| Next.js App Router SSR conflicts with localStorage | Medium | Medium | Use `"use client"` directive, check `typeof window` |

## Validation Checkpoints
1. **After Phase 1**: Dev server runs, build succeeds
2. **After Phase 2**: CRUD operations work, tests pass
3. **After Phase 3**: Full UI functional, filters work, responsive
4. **After Phase 4**: NL queries/mutations work with Gemini, contract tests pass
5. **After Phase 5**: Build succeeds, all tests pass, deploy-ready

## Approval
- [ ] Technical Lead Review
- [ ] Expert AI Consultation Complete

## Notes
- No time estimates per SPIR protocol
- Each phase ends with a single atomic commit
- Phase 4 (NL) is the highest-risk phase; all others are standard Next.js patterns
- The app is fully functional without Gemini (Phase 3 delivers a complete traditional todo app)

---

## Amendment History
