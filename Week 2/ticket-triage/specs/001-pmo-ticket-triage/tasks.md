---
description: "Task list for PMO Ticket Triage Dashboard"
---

# Tasks: PMO Ticket Triage Dashboard

**Input**: Design documents from `specs/001-pmo-ticket-triage/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**Tests**: Smoke test only (CI gate — see T026). No unit/integration test tasks unless
explicitly requested.

**Organization**: Tasks grouped by user story to enable independent implementation and
testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths are included in every description

## Path Conventions

Single Next.js project at repository root — `app/`, `components/`, `lib/`, `prisma/`,
`tests/`, `.github/`.

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Scaffold the project and configure all tooling so subsequent phases have a
clean, runnable baseline.

- [x] T001 Scaffold Next.js 15 project at repository root with App Router, TypeScript strict, Tailwind CSS, and ESLint (`npx create-next-app@latest . --ts --tailwind --eslint --app --no-src-dir`)
- [x] T002 Add Prisma ORM and SQLite provider (`npm install prisma @prisma/client` then `npx prisma init --datasource-provider sqlite`)
- [x] T003 [P] Add Zod dependency (`npm install zod`)
- [x] T004 [P] Add `@typescript-eslint/no-explicit-any: "error"` rule to `.eslintrc.json` (Constitution Principle I gate)
- [x] T005 Define Ticket model in `prisma/schema.prisma` (fields: id Int @id @default(autoincrement()), title String, priority String?, owner String?, status String @default("open"), createdAt DateTime @default(now()))
- [x] T006 [P] Create seed fixture `prisma/fixtures/tickets.json` with ≥ 10 sample tickets spanning P0, P1, P2, and null priorities in the shape `[{ "id", "title", "priority", "owner", "status" }]`
- [x] T007 Write upsert-based seed script `prisma/seed.ts` that reads `prisma/fixtures/tickets.json` and calls `prisma.ticket.upsert` per record; register under `"prisma": { "seed": "ts-node prisma/seed.ts" }` in `package.json`
- [x] T008 Run initial migration (`npx prisma migrate dev --name init`) and confirm `prisma/dev.db` is created and `prisma/migrations/` contains the migration file; add `prisma/dev.db` to `.gitignore`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure that every user story's API routes and UI components
depend on. No user story work can begin until this phase is complete.

**⚠️ CRITICAL**: Phases 3–6 MUST NOT start until this phase is complete.

- [x] T009 Create Prisma Client singleton in `lib/prisma.ts` using the `globalThis` guard pattern from `research.md` Decision 2 (prevents connection exhaustion on hot reload)
- [x] T010 Create `TicketPatchSchema` Zod schema in `lib/schemas/ticket.ts`: `priority` as `z.enum(["P0","P1","P2"]).nullable().optional()`, `owner` as `z.string().max(100).nullable().optional()`, refined to require at least one field present
- [x] T011 Implement `GET /tickets` route handler in `app/api/tickets/route.ts`: call `prisma.ticket.findMany({ where: { status: "open" }, orderBy: { createdAt: "asc" } })`, return `Response.json(tickets)`; return 500 JSON on error
- [x] T012 Implement `PATCH /tickets/:id` route handler in `app/api/tickets/[id]/route.ts`: parse `id` param as integer (400 if non-numeric), import `TicketPatchSchema` from `lib/schemas/ticket.ts`, call `schema.safeParse(body)`, return 400 + `{ error, issues }` on failure, call `prisma.ticket.update` on success, return 404 if record missing, return updated ticket on 200
- [x] T013 [P] Create root layout `app/layout.tsx` with `<html lang="en">`, `<body>` with Tailwind base class `antialiased`, and import for `globals.css`
- [x] T014 [P] Add Tailwind CSS directives (`@tailwind base; @tailwind components; @tailwind utilities`) to `app/globals.css`

**Checkpoint**: Foundation ready — run `npm run dev`, confirm `GET http://localhost:3000/api/tickets` returns 200 with the seeded ticket array before proceeding to user story phases.

---

## Phase 3: User Story 1 — View All Open Tickets (Priority: P1) 🎯 MVP

**Goal**: Kavya opens the dashboard and immediately sees every open ticket with ID,
title, priority label, and owner in a flat list — no additional clicks required.

**Independent Test**: Run `npm run dev`, open `http://localhost:3000`. Every ticket from
the seed fixture must appear. Each row must show ticket ID, title, priority (or
"Untagged" if null), and owner (or empty). No JS errors in the console.

### Implementation for User Story 1

- [x] T015 [US1] Implement `app/page.tsx` as an async RSC: call `prisma.ticket.findMany({ where: { status: "open" }, orderBy: { createdAt: "asc" } })` directly (no fetch to self), render a `<table>` with columns ID, Title, Priority, Owner
- [x] T016 [US1] Add empty-state message to `app/page.tsx`: when the ticket array is empty, render a `<p>No open tickets</p>` element instead of the table
- [x] T017 [US1] Display `"Untagged"` label in the Priority column of `app/page.tsx` when `ticket.priority` is `null`; display an em-dash or "—" in the Owner column when `ticket.owner` is `null`

**Checkpoint**: User Story 1 is fully functional and independently testable. Every seed
ticket visible, priority and owner columns correct for null values.

---

## Phase 4: User Story 2 — Tag a Ticket with Priority Inline (Priority: P1)

**Goal**: Kavya selects P0/P1/P2 directly from a ticket row; the change persists
immediately without a page reload.

**Independent Test**: Select a priority on any ticket row. Row updates immediately.
Refresh page — priority persists. Submit `curl -X PATCH .../api/tickets/1 -d '{"priority":"HIGH"}'` and confirm HTTP 400 with `{ error, issues }` and no DB write.

### Implementation for User Story 2

- [x] T018 [US2] Create `components/PrioritySelector.tsx` as a `"use client"` component: renders a `<select>` with options P0, P1, P2, and a blank (Untagged); on change, calls `PATCH /api/tickets/:id` with `{ priority }`, calls `router.refresh()` on success (Next.js `useRouter`) to re-fetch RSC data
- [x] T019 [US2] Add inline error display to `components/PrioritySelector.tsx`: if PATCH returns non-200, show a brief error message adjacent to the select; revert the optimistic value
- [x] T020 [US2] Replace the static priority cell in `app/page.tsx` with `<PrioritySelector id={ticket.id} currentPriority={ticket.priority} />` for each ticket row

**Checkpoint**: User Stories 1 and 2 both work. Priority updates inline, persists on
refresh, and invalid priorities are rejected with a visible error.

---

## Phase 5: User Story 3 — Assign a Ticket Owner Inline (Priority: P1)

**Goal**: Kavya enters an owner name in the ticket row; the assignment persists
immediately without a page reload.

**Independent Test**: Enter an owner name and blur or press Enter. Row shows new owner.
Refresh — owner persists. Clear the field and save — ticket shows unowned (null) after refresh.

**Note**: Reuses `PATCH /api/tickets/:id` from T012 (Phase 2). No new API route required.

### Implementation for User Story 3

- [x] T021 [US3] Create `components/OwnerInput.tsx` as a `"use client"` component: renders a `<input type="text">` showing current owner; on blur or Enter, calls `PATCH /api/tickets/:id` with `{ owner: value || null }`, calls `router.refresh()` on success; shows inline error on failure
- [x] T022 [US3] Replace the static owner cell in `app/page.tsx` with `<OwnerInput id={ticket.id} currentOwner={ticket.owner} />` for each ticket row

**Checkpoint**: User Stories 1, 2, and 3 all work independently. Owner updates inline,
persists on refresh, clearing field sets owner to null.

---

## Phase 6: User Story 4 — Priority Groups with Count Badges (Priority: P2)

**Goal**: Dashboard renders four sections (P0, P1, P2, Untagged), each with a count
badge. Rohan can read the full workload summary without asking Kavya.

**Independent Test**: Load dashboard with mixed-priority seed data. Confirm four labeled
sections, each showing the correct count. Tag an untagged ticket as P1 — confirm it moves
to the P1 section and both P1 and Untagged counts update.

### Implementation for User Story 4

- [x] T023 [US4] Create `components/PriorityGroup.tsx` as a server component: accepts `label: string`, `tickets: Ticket[]` props; renders a `<section>` with a heading showing the group label and a count badge (`<span>{tickets.length}</span>`), followed by the ticket rows (with `PrioritySelector` and `OwnerInput` already wired)
- [x] T024 [US4] Refactor `app/page.tsx` to group tickets into four arrays (P0, P1, P2, Untagged) using `Array.filter`, then render four `<PriorityGroup>` components in order; remove the previous flat `<table>` render; empty groups MAY either show a zero count badge or be omitted — both are acceptable (per US4 scenario 2)
- [x] T025 [P] [US4] Verify `router.refresh()` in `PrioritySelector.tsx` and `OwnerInput.tsx` causes the RSC grouping in `app/page.tsx` to re-run so count badges update after an inline change (no additional code needed if `router.refresh()` is already in T018/T021 — this is a validation task only)

**Checkpoint**: All four user stories fully functional. Groups visible, counts correct,
inline edits move tickets between groups with live badge updates.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: CI pipeline, smoke test, and final validation across all user stories.

- [x] T026 Write smoke test `tests/smoke/tickets.test.ts`: start the Next.js server, call `GET http://localhost:3000/api/tickets`, assert HTTP 200 and that response body is a non-empty JSON array (satisfies NFR-07)
- [x] T027 [P] Create `.github/workflows/ci.yml` with three sequential steps: (1) `npm run lint` — ESLint errors block, (2) `npm run build` — type-check + bundle, (3) `npx prisma migrate deploy && npx prisma db seed && npx jest tests/smoke` — smoke gate; use `actions/setup-node@v4` with Node 20 and `npm ci` caching; total pipeline MUST complete in ≤ 3 minutes (NFR-04)
- [x] T028 [P] Update `.gitignore` to exclude `prisma/dev.db`, `.env`, `.env.local`, `.next/`, `node_modules/`
- [x] T029 Run `npm run lint` locally and fix any ESLint or TypeScript strict violations (`no-explicit-any`, unused imports, missing return types on exported functions)
- [x] T030 Run the full quickstart.md validation guide end-to-end: confirm all four user story scenarios pass and all edge-case curl commands return the expected status codes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — specifically T009 (Prisma singleton) and T013/T014 (layout)
- **US2 (Phase 4)**: Depends on Phase 2 — specifically T011 (GET route) and T012 (PATCH route); can start in parallel with US3 after Phase 2
- **US3 (Phase 5)**: Depends on Phase 2 — reuses T012 (PATCH route); can start in parallel with US2 after Phase 2
- **US4 (Phase 6)**: Depends on US1 (T015–T017 complete) and US2/US3 components (T018–T022) being wired so PriorityGroup can include them
- **Polish (Phase 7)**: Depends on all desired user stories complete

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2 — no dependency on other stories
- **US2 (P1)**: Starts after Phase 2 — no dependency on US1 (but wired into page.tsx in T020, so US1 rows must exist)
- **US3 (P1)**: Starts after Phase 2 — no dependency on US1 or US2 API layer; wired into page.tsx in T022
- **US4 (P2)**: Starts after US1, US2, US3 complete — refactors the page layout and wraps existing components

### Within Each User Story

- Models before services before route handlers (all in Phase 2 here)
- Server components before client components that wrap them
- Implementation before wiring into `app/page.tsx`
- Wiring complete before independent test checkpoint

### Parallel Opportunities

- T003, T004 can run in parallel with T002 (different files)
- T006 can run in parallel with T002, T003, T004 (fixture file only)
- T013, T014 can run in parallel with T009–T012 (layout files, no logic dependency)
- T015, T016, T017 within US1 are sequential — all modify `app/page.tsx`
- T018, T019 within US2 are sequential (T019 modifies T018's component)
- T021 (US3) can run in parallel with T018–T020 (US2) after Phase 2 completes — different component file
- T026, T027, T028 in Polish can all run in parallel

---

## Parallel Example: Phase 2 Foundational

```bash
# Launch independently (different files):
Task T009: "Create lib/prisma.ts singleton"
Task T010: "Create lib/schemas/ticket.ts Zod schema"
Task T013: "Create app/layout.tsx"
Task T014: "Update app/globals.css"

# T011 and T012 depend on T009 and T010 — run after those complete
Task T011: "Implement app/api/tickets/route.ts"
Task T012: "Implement app/api/tickets/[id]/route.ts"
```

## Parallel Example: US2 + US3 (after Phase 2)

```bash
# These can run simultaneously — different component files:
Task T021: "Create components/OwnerInput.tsx"   # US3
Task T018: "Create components/PrioritySelector.tsx"  # US2
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: US1 (flat ticket list)
4. **STOP and VALIDATE**: Open dashboard, confirm all seed tickets visible with ID, title, priority, owner
5. Ship / demo the read-only list as MVP

### Incremental Delivery

1. Setup + Foundational → baseline API and DB working
2. US1 → flat read-only list → **demo**
3. US2 → inline priority tagging → **demo**
4. US3 → inline owner assignment → **demo**
5. US4 → grouped view with counts → **demo**
6. Polish → CI pipeline green, smoke test passing → **ship**

---

## Notes

- `[P]` tasks operate on different files and have no incomplete task dependencies
- `[Story]` labels map each task to the user story it delivers
- Each story phase is independently completable and testable before the next begins
- `router.refresh()` (Next.js App Router) is the mechanism for RSC re-render after client mutations — no `useState` for ticket data needed
- Avoid: vague task descriptions, tasks that modify the same file without coordination, cross-story implementation dependencies that break independent testability
- Constitution Compliance: T004 (ESLint `no-explicit-any`), T010 (Zod schema), T012 (Zod before DB), T027 (CI pipeline) are the four enforcement points for Principles I–III
