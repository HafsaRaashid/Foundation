# Implementation Plan: PMO Ticket Triage Dashboard

**Branch**: `001-pmo-ticket-triage` | **Date**: 2026-06-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-pmo-ticket-triage/spec.md`

## Summary

Build a browser-based PMO ticket triage dashboard that displays all open tickets from a
JSON seed file, allows inline priority tagging (P0/P1/P2) and owner assignment, and groups
tickets into priority sections with count badges. The stack is Next.js 15 App Router
(single codebase for UI + API routes), Prisma ORM + SQLite for persistence, Zod for
API-boundary validation, and TypeScript strict mode throughout. CI runs lint → build →
smoke test in ≤ 3 minutes via GitHub Actions.

## Technical Context

**Language/Version**: TypeScript 5.x — `strict: true` enforced in `tsconfig.json`;
zero `any` permitted.

**Primary Dependencies**: Next.js 15 (App Router), Prisma ORM, Zod, Tailwind CSS,
ESLint (`@typescript-eslint/no-explicit-any` error).

**Storage**: SQLite via Prisma — single `dev.db` file, excluded from version control,
seeded from `prisma/fixtures/tickets.json` on first run.

**Testing**: Jest + `node-fetch` (or `undici`) for smoke tests; ESLint as lint gate.
All tests run inside the GitHub Actions pipeline.

**Target Platform**: Desktop web browser; Next.js 15 deployed locally or on any
Node.js 20+ host. No mobile-native target.

**Project Type**: Web application — single Next.js project collocating UI (RSC +
Client Components) and API route handlers under `app/`.

**Performance Goals**: `GET /tickets` p95 ≤ 150ms with seed data; initial SSR page
render ≤ 1.5 s (localhost).

**Constraints**: CI pipeline ≤ 3 min end-to-end; zero `any`; ESLint errors block
merge; all commits signed, Conventional Commits format.

**Scale/Scope**: < 500 open tickets; single shared dashboard; no authentication;
no pagination.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. TypeScript Strict-First | `strict: true` in tsconfig; ESLint `no-explicit-any` error; Prisma-generated types only | ✅ PASS — enforced via tsconfig and ESLint config |
| II. API Contract with Zod | Zod schema on every Route Handler accepting body/params; invalid input → HTTP 400 + JSON error; no DB write on failure | ✅ PASS — `PATCH /tickets/:id` is the sole write surface; Zod schema co-located in route file |
| III. Test-Gated CI | ESLint + build + smoke test (`GET /tickets` → 200); ≤ 3 min pipeline; Red-Green-Refactor | ✅ PASS — GitHub Actions workflow: lint → build → smoke; seed fresh in CI |
| IV. Performance Contracts | `GET /tickets` p95 ≤ 150ms; page render ≤ 1.5 s; verified in smoke suite | ✅ PASS — single Prisma `findMany` on < 500 rows; no N+1 queries |
| V. Simplicity & YAGNI | Single Next.js project; no extra abstractions; no features beyond FR-001–FR-005 | ✅ PASS — no separate backend/frontend projects; no caching layer; no auth middleware |

**Post-design re-check**: See end of Phase 1.

## Project Structure

### Documentation (this feature)

```text
specs/001-pmo-ticket-triage/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── get-tickets.md
│   └── patch-ticket.md
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
app/
├── layout.tsx                   # Root layout (Tailwind base styles)
├── page.tsx                     # Dashboard page (RSC — fetches tickets, renders groups)
├── globals.css
└── api/
    └── tickets/
        ├── route.ts             # GET /tickets
        └── [id]/
            └── route.ts         # PATCH /tickets/:id (Zod-validated)

components/
├── PriorityGroup.tsx            # Server component — section header + count badge + ticket rows
├── PrioritySelector.tsx         # Client component — inline P0/P1/P2 dropdown
└── OwnerInput.tsx               # Client component — inline owner name input

lib/
├── prisma.ts                    # Prisma Client singleton (prevents connection exhaustion in dev)
└── schemas/
    └── ticket.ts                # Shared Zod schema (TicketPatchSchema) — used by PATCH route

prisma/
├── schema.prisma                # Ticket model definition
├── migrations/                  # Committed Prisma migration files
└── fixtures/
    └── tickets.json             # Seed data source

tests/
└── smoke/
    └── tickets.test.ts          # GET /tickets → 200 + non-empty array assertion

.github/
└── workflows/
    └── ci.yml                   # lint → build → smoke (≤ 3 min)
```

**Structure Decision**: Single Next.js project (Option 1 variant). Next.js App Router
collocates UI pages and API route handlers in `app/`, eliminating the need for a
separate backend service. Components are split by interactivity: RSCs render static
ticket data server-side; Client Components (`PrioritySelector`, `OwnerInput`) handle
the interactive inline controls. The `lib/prisma.ts` singleton prevents hot-reload
from opening multiple Prisma connections during development.

## Complexity Tracking

> No constitution violations — this section is empty by design.

No abstractions beyond two concrete call sites; no patterns added without justification.
