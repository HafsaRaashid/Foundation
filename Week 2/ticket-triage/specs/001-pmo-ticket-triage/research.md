# Research: PMO Ticket Triage Dashboard

**Feature**: `specs/001-pmo-ticket-triage`
**Date**: 2026-06-29

All technology choices are locked by the project constitution (v1.0.0) and ADR-001/ADR-002.
No NEEDS CLARIFICATION items remain. This document records the key patterns and
conventions that apply to implementation.

---

## Decision 1: Next.js 15 App Router — RSC vs Client Component boundary

**Decision**: Use React Server Components (RSC) for the dashboard page and ticket
grouping layout. Use `"use client"` Client Components only for `PrioritySelector`
(dropdown) and `OwnerInput` (text input), which require browser event handlers.

**Rationale**: RSCs render on the server and ship no JavaScript to the browser for
read-only UI, reducing bundle size and eliminating client-side data-fetching waterfalls.
The dashboard's primary view (listing tickets) is pure read — only the two interactive
controls need hydration. This is the canonical Next.js 15 App Router pattern for
dashboard applications.

**Alternatives considered**:
- Full client-side rendering with `useEffect` fetch — rejected: adds a loading flash,
  ships more JS, and violates the ≤ 1.5 s render target for a simple list.
- RSC with Suspense streaming — deferred: unnecessary for < 500 tickets; adds complexity
  without a measurable user benefit.

---

## Decision 2: Prisma Client singleton pattern

**Decision**: Export a single `PrismaClient` instance from `lib/prisma.ts`, guarded
by a `globalThis` check in development to prevent connection exhaustion across hot
reloads.

```ts
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

**Rationale**: Next.js hot module replacement re-evaluates modules on each save,
causing a new `PrismaClient` per reload without the guard. SQLite's write-lock
semantics mean multiple client instances during development can produce
`SQLITE_BUSY` errors. The `globalThis` guard is the officially recommended Prisma
pattern for Next.js.

**Alternatives considered**:
- Instantiating `PrismaClient` inline in route handlers — rejected: causes connection
  churn and intermittent failures during rapid development iteration.

---

## Decision 3: Zod schema placement and validation pattern for Route Handlers

**Decision**: Co-locate the Zod validation schema with its route handler file.
If the same schema is referenced by more than one route, move it to
`lib/schemas/ticket.ts`. Parse the request body with `schema.safeParse()` (not
`parse()`); return HTTP 400 + `{ error, issues }` JSON on failure.

```ts
// Canonical pattern for PATCH /tickets/:id
const TicketPatchSchema = z.object({
  priority: z.enum(["P0", "P1", "P2"]).nullable().optional(),
  owner: z.string().max(100).nullable().optional(),
}).refine(
  (data) => data.priority !== undefined || data.owner !== undefined,
  { message: "At least one field (priority or owner) must be provided" }
);
```

**Rationale**: `safeParse` returns a discriminated union instead of throwing, making
it easy to branch on success/failure without a try/catch. Co-location keeps the
schema visible next to the route it guards. The `.refine` prevents no-op PATCH
requests from reaching the database.

**Alternatives considered**:
- `schema.parse()` wrapped in try/catch — rejected: more verbose and loses
  Zod's structured `ZodError.issues` array in the catch block.
- Middleware-based validation — rejected: Next.js App Router middleware runs on the
  Edge runtime; Prisma requires Node.js runtime. Mixing runtimes adds complexity
  that violates Principle V.

---

## Decision 4: Seed script pattern (Prisma + JSON fixture)

**Decision**: Write a `prisma/seed.ts` script that reads `prisma/fixtures/tickets.json`
and upserts each record using `prisma.ticket.upsert`. Register it in `package.json`
under `prisma.seed`.

**Rationale**: `upsert` (keyed on `id`) is idempotent — running the seed twice in CI
does not duplicate rows. Registering under `prisma.seed` means `prisma migrate dev`
and `prisma migrate reset` automatically re-seed, keeping the development and CI
environments in sync without manual steps.

**Alternatives considered**:
- `createMany` without upsert — rejected: fails on re-run due to unique constraint
  violations, requiring a `deleteMany` prefix that is destructive in shared environments.

---

## Decision 5: GitHub Actions CI pipeline structure

**Decision**: Three sequential jobs sharing a single runner:
1. `lint` — `next lint` (ESLint, errors block)
2. `build` — `next build` (type-check + bundle)
3. `smoke` — `prisma migrate deploy && prisma db seed && jest tests/smoke`

Each step uses `actions/setup-node@v4` with Node 20 and `npm ci`. Prisma generates the
client in the `build` step via `postinstall`. The database file lives at
`./prisma/dev.db` and is excluded from the cache.

**Rationale**: Sequential jobs ensure lint failures do not waste build minutes. Using
a single runner with `npm ci` caching keeps total pipeline time within the 3-minute
budget for a small Next.js project. `prisma migrate deploy` (not `dev`) is used in CI
because `dev` prompts interactively; `deploy` applies committed migrations non-interactively.

**Alternatives considered**:
- Parallel lint + build — rejected: saves ~20s but risks confusing output when both
  fail simultaneously; marginal benefit given 3-minute budget.
- Docker-based CI — rejected: container spin-up overhead would push the pipeline past
  the 3-minute limit for a project of this size.
