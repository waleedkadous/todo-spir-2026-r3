# Phase 5 (polish-tests) Consultation Rebuttals — Iteration 1

## Consultation Results

| Model | Verdict |
|-------|---------|
| Gemini | APPROVE |
| Codex | REQUEST_CHANGES |
| Claude | APPROVE |

## Issues Addressed

### 1. Privacy notice text inaccurate (Codex — blocking)

**Verdict: ACCEPTED — Fixed**

Codex correctly identified that the privacy notice said "Todo titles and descriptions are sent" when the NL endpoint actually sends full todo objects (id, title, description, status, priority, dueDate, timestamps) plus the query, timezone, and currentTime.

**Fix:** Updated `PrivacyNotice.tsx` to read "Your todo data is sent to the Google Gemini API for natural language processing." — accurate and concise.

### 2. No page-level integration tests (Codex — non-blocking)

**Verdict: ACKNOWLEDGED — Acceptable**

The existing component-level tests verify each component renders correctly. Page-level tests for conditional rendering (EmptyState when empty, StorageWarning when unavailable) would require mocking `useTodos` hook state which adds complexity for minimal coverage gain. The conditional logic in page.tsx is straightforward ternary/boolean checks.

### 3. PrivacyNotice not dismissible (Claude — non-blocking)

**Verdict: ACKNOWLEDGED — Out of scope**

A dismiss mechanism was not specified in the plan. The static footer notice satisfies the spec requirement. This could be a future enhancement.

### 4. StorageWarning missing ARIA role (Claude — non-blocking)

**Verdict: ACKNOWLEDGED — Enhancement**

Adding `role="alert"` would be a good accessibility improvement. The spec doesn't call out accessibility requirements, and this doesn't block the phase.

## Summary

One blocking issue addressed (privacy notice accuracy). Two approvals from Claude and Gemini. 111 tests passing. Build succeeds. Phase 5 complete.
