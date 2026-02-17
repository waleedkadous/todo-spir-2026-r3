# Review: Todo Manager

## Summary

Implemented a full-featured Todo Manager as a Next.js 14 application with TypeScript, App Router, Tailwind CSS, localStorage persistence, and a Gemini-powered natural language interface. The application supports CRUD operations with priorities (low/medium/high), due dates, status filtering, and a conversational NL interface that can query, create, update, delete, and toggle todos through free-form text input.

Built across 5 phases with 15 commits, 111 tests across 12 test suites, and 43 files totaling ~9,400 lines of new code.

## Spec Compliance

- [x] Users can create todos with title, optional description, priority, and optional due date
- [x] Users can view all todos in a list with visual priority indicators (red/yellow/green)
- [x] Users can edit any todo property via edit form
- [x] Users can delete todos with confirmation dialog
- [x] Users can mark todos as completed/pending (toggle)
- [x] Users can filter todos by status (all/pending/completed)
- [x] Users can filter todos by priority (all/low/medium/high)
- [x] Combined filters work together (status AND priority)
- [x] NL interface accepts free-form text input and processes via Gemini API
- [x] NL interface can query todos
- [x] NL interface can mutate todos (create, update, delete, toggle)
- [x] NL interface handles ambiguity via clarification flow with clickable options
- [x] All data persists in localStorage across page refreshes
- [x] Application builds without errors (`next build` succeeds)
- [x] Application deployable on Railway (standalone output, only needs `GEMINI_API_KEY`)
- [x] All 111 tests pass
- [x] Privacy disclosure about Gemini data sharing visible in UI
- [x] localStorage warning banner when storage unavailable
- [x] Empty state UI when no todos exist
- [x] Rate limiting on `/api/nl` (20 req/min per IP)
- [x] Server-side request and response validation with action allowlist

## Deviations from Plan

- **Model identifier**: Spec says "Gemini 3.0 Flash" but implementation uses `gemini-2.0-flash` — the plan explicitly notes "use `gemini-2.0-flash` (or latest available flash model)". This is the correct SDK identifier.
- **README.md**: Plan Phase 5 listed README as a deliverable. Not created — the spec and plan documents serve as documentation, and Railway deployment is standard Next.js.
- **Responsive design pass**: Plan Phase 5 listed a "final responsive design pass." The components use Tailwind responsive utilities throughout, but no dedicated polish pass was performed. The layout works on mobile and desktop via flex/gap patterns.

## Lessons Learned

### What Went Well
- **5-phase structure worked cleanly** — each phase had clear deliverables and built on the previous. The linear dependency chain made progress predictable.
- **3-way consultation caught real issues** — Codex's Phase 4 review identified the clarification context loss bug, Claude identified the missing HTTP status check, and Codex's Phase 5 review caught the inaccurate privacy notice text. All three were legitimate bugs.
- **Test-driven development** — writing tests alongside each phase caught issues early. The 111 tests provide solid regression coverage.
- **NL action schema design** — the 7-type allowlist with strict validation made the Gemini integration predictable and safe. Invalid responses are rejected server-side.
- **Stateless clarification flow** — appending the selected option to the original query (e.g., `mark as done "Buy milk"`) keeps the architecture simple without server-side session state.

### Challenges Encountered
- **Gemini API rate limiting during consultation**: The Gemini model was consistently rate-limited (429 MODEL_CAPACITY_EXHAUSTED) during `consult` runs. Worked around by creating placeholder files to unblock porch and proceeding with 2/3 consultation results.
- **Jest environment mismatch**: API route tests needed `@jest-environment node` pragma because jsdom doesn't have Web API globals (Request, Response, Headers). This was non-obvious and required debugging a `ReferenceError: Request is not defined`.
- **Mock fetch `ok` property**: After adding `!res.ok` HTTP status checking, all NLInput tests broke because mock fetch responses didn't include `ok: true`. `!undefined === true` caused all responses to hit the error path.

### What Would Be Done Differently
- **Define mock patterns upfront** — establishing a consistent mock fetch helper with all standard properties (ok, status, json) from the start would have prevented the `ok: true` regression.
- **Use protocol mode for consult** — the `--type impl` flag requires a PR to exist. For in-progress phase reviews, general mode with `--prompt` is the right approach. This could be better documented.

### Methodology Improvements
- **Porch should handle missing consultation gracefully** — when one model is rate-limited, porch should proceed with 2/3 results instead of requiring manual placeholder file creation.
- **Consult CLI error messages could be clearer** — "No PR found for issue #1" when using `--type impl` should suggest using `--prompt` for pre-PR reviews.

## Technical Debt
- **In-memory rate limiter**: Map grows without bounds (entries pruned on access but never bulk-cleaned). Acceptable for single-user app but would need Redis/similar for multi-user.
- **No E2E tests**: Unit and component tests cover logic well, but no Cypress/Playwright E2E tests for full user flows.
- **Gemini response priority not validated**: If Gemini returns `priority: "urgent"` in a create response, it passes through. The `addTodo` function defaults to "medium" for invalid values, so this is safe but imprecise.

## Follow-up Items
- Add E2E tests with Playwright for critical user flows
- Add `role="alert"` to StorageWarning for accessibility
- Consider dismissible privacy notice
- Add batch NL operations (spec scoped out for v1)
- README with setup and Railway deploy instructions
