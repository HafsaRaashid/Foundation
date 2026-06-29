<!--
SYNC IMPACT REPORT
==================
Version change: [TEMPLATE] → 1.0.0 (initial ratification — all placeholders resolved)

Modified principles: N/A (first fill of template)

Added sections:
  - Core Principles (5 principles)
  - Technology Stack
  - Development Workflow
  - Governance

Removed sections: N/A

Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check section aligns with principles below
  ✅ .specify/templates/spec-template.md — Requirements/NFR columns align with P1–P5 gates
  ✅ .specify/templates/tasks-template.md — Task categories (tests, observability, type safety) reflect principles

Follow-up TODOs: None — all placeholders resolved.
-->

# Ticket Triage Tool Constitution

## Core Principles

### I. TypeScript Strict-First (NON-NEGOTIABLE)

All TypeScript source MUST compile with `strict: true` in `tsconfig.json`. Zero `any`
types are permitted anywhere in the codebase. Prisma-generated types MUST be used for
all database access; no manual type casting with `as any` or `as unknown`. ESLint MUST
be configured to error on `@typescript-eslint/no-explicit-any`.

**Rationale**: Weak types are the primary vector for silent data corruption in a tool
where priority and owner assignments drive real-world decisions. Type safety is a
first-class correctness guarantee, not a style preference (NFR-03).

### II. API Contract with Zod Validation

Every API route handler that accepts a request body or URL parameter MUST validate
input with a Zod schema before any database interaction. Invalid input MUST return
HTTP 400 with a structured JSON error body. No database write MAY occur if validation
fails. Zod schemas MUST be co-located with their route handler unless shared across
multiple routes (in which case they belong in `lib/schemas/`).

**Rationale**: The `PATCH /tickets/:id` endpoint is the only write surface. A malformed
priority value silently stored in the DB would corrupt the queue view for all PMO staff
(FR-2, FR-5). Zod errors at the boundary prevent this without bespoke validation code.

### III. Test-Gated CI (NON-NEGOTIABLE)

The GitHub Actions pipeline MUST include: lint (ESLint — fail on error), build, and at
least one smoke test calling `GET /tickets` asserting HTTP 200. The total pipeline
duration MUST NOT exceed 3 minutes end-to-end. No merge to `main` is permitted if
any gate fails. Tests for a user story MUST be written and confirmed failing BEFORE
implementation begins (Red-Green-Refactor).

**Rationale**: A CI pipeline that exceeds 3 minutes blocks iteration cadence for a
single-developer tool and was an explicit constraint in the project brief (NFR-04,
NFR-06, NFR-07).

### IV. Performance Contracts

The initial page render (SSR, localhost) MUST complete in ≤ 1.5 seconds. The
`GET /tickets` API p95 response time MUST be ≤ 150ms with seed data loaded. These
are verified in CI by the smoke test suite. Any change to the data-access path
(queries, serialization) MUST be accompanied by a confirmation that these thresholds
are not violated.

**Rationale**: Kavya's triage workflow target is ≤ 10 minutes per day. A sluggish
dashboard defeats the primary user goal (G1, NFR-01, NFR-02).

### V. Simplicity & YAGNI

This is a single-user PMO triage tool. Features outside the functional requirements
(FR-1 through FR-5) MUST NOT be implemented without an explicit amendment to the spec.
No additional dependencies may be added without a recorded rationale (ADR or inline
comment). Complexity MUST be justified in the plan's Complexity Tracking table. Avoid
abstractions that do not have at least two concrete call sites in the current scope.

**Rationale**: A single Prisma + SQLite file running in a Next.js App Router project
is the entire data layer. Adding ORMs, caching layers, or microservice patterns would
introduce maintenance burden without measurable benefit at the current ticket volume
(<500 tickets) (ADR-002).

## Technology Stack

**Frontend**: Next.js 15 App Router — React Server Components where possible; Client
Components only for interactive controls (priority selector, owner input).

**Language**: TypeScript with `strict: true` — zero `any` is a constitution-level
constraint (Principle I).

**Styling**: Tailwind CSS — no CSS-in-JS, no additional styling libraries.

**Data Layer**: Prisma ORM + SQLite — Prisma Client for all queries; no raw SQL.
Database file excluded from version control; seeded fresh in CI (ADR-002).

**Validation**: Zod — all API input validation; schemas co-located with route
handlers unless shared (Principle II).

**CI**: GitHub Actions — lint → build → smoke test pipeline, ≤ 3 minutes (Principle III).

## Development Workflow

1. **Branch naming**: `###-kebab-description` (e.g. `001-list-tickets`).
2. **Commit format**: Conventional Commits MUST be followed (`feat:`, `fix:`,
   `chore:`, `docs:`, `test:`, `refactor:`). Commits MUST be signed (NFR-05).
3. **Spec artefacts**: PRD, ADRs, and user stories MUST live under `/docs/spec/`
   in Markdown format (NFR-08).
4. **Spec-first**: A feature MUST have a spec (`/speckit-specify`) and a plan
   (`/speckit-plan`) before implementation begins.
5. **TDD order**: Write tests → confirm they fail → implement → confirm they pass.
6. **ADR gate**: Any technology addition or architectural deviation MUST be
   documented as an ADR under `/docs/spec/` before the code is merged.

## Governance

This constitution supersedes all other development practices and informal agreements
for the Ticket Triage Tool project. It is binding on all contributors.

**Amendment procedure**: Amendments require (a) a draft PR updating this file,
(b) a Sync Impact Report (HTML comment at top) listing changed sections and
affected templates, and (c) an updated version number following semver rules
(MAJOR: removals/redefinitions; MINOR: additions; PATCH: clarifications).

**Versioning policy**:
- MAJOR: Backward-incompatible principle removal or redefinition.
- MINOR: New principle or section added.
- PATCH: Wording clarification, typo fix, non-semantic refinement.

**Compliance review**: Every PR description MUST include a "Constitution Check"
section confirming no principle is violated. The plan template's Constitution Check
gate enforces this at design time.

**Runtime guidance**: For day-to-day development context, refer to `CLAUDE.md` and
the current plan at `.specify/memory/`.

**Version**: 1.0.0 | **Ratified**: 2026-06-29 | **Last Amended**: 2026-06-29
