# Ticket Triage Tool — PRD

**Status:** Draft
**Last Updated:** 2026-06-16

---

## 1. Persona

**Primary User: PMO Coordinator**
**Name:** Kavya Nair
**Role:** PMO Coordinator, Bistec Global
**Context:** Kavya receives 20–40 inbound requests per week across Slack, email, and a shared inbox. She manually reads each one to judge urgency, copies details into a spreadsheet, and assigns owners by memory. There is no shared view of who owns what or what is overdue.
**Pain Point:** High-priority work regularly waits behind low-urgency requests because the queue has no visible order.

---

**Secondary User: PMO Manager**
**Name:** Rohan Perera
**Role:** PMO Manager, Bistec Global
**Context:** Rohan oversees the PMO team and is accountable to leadership for queue health and SLA compliance. He currently gets his queue summary by asking Kavya directly.
**Pain Point:** The shared spreadsheet is updated inconsistently — Rohan cannot trust it reflects the current state of the queue without confirming with Kavya directly.

---

## 2. Problem Statement

### What breaks today

Bistec PMO has no purpose-built triage tool. Tickets arrive through multiple channels and are tracked in a shared spreadsheet that is updated manually and inconsistently. Priority is implicit — it exists in Kavya's head, not in the system. Owners are assigned verbally or via Slack messages that are not linked to the ticket record.

### Who is affected

| Person | Impact |
|---|---|
| Kavya Nair (PMO Coordinator) | Spends 45–60 min per day on triage that should take under 10 min |
| Rohan Perera (PMO Manager) | Cannot produce a workload summary without asking Kavya directly |

### Why now

The PMO headcount is fixed. Ticket volume is growing. The current spreadsheet approach breaks down above ~30 open tickets — items get missed, SLAs are breached after the fact, and Kavya cannot take leave without the queue becoming unmanageable. A lightweight structured tool is the minimum intervention needed before volume makes the problem unrecoverable.

---

## 3. Goals & Non-Goals

### Goals

Measurable outcomes within 30 days of go-live:

| # | Goal | Metric | Target |
|---|---|---|---|
| G1 | Reduce daily triage time | Minutes Kavya spends triaging per day | ≤ 10 min |
| G2 | All tickets have a visible priority | Percentage of open tickets with a P0/P1/P2 tag | 100% |
| G3 | All tickets have an assigned owner | Percentage of open tickets with a named owner | 100% |
| G4 | Give Rohan queue visibility without interrupting Kavya | Time to produce a workload summary | ≤ 5 min |
| G5 | API reliability | p95 response time on `GET /tickets` with seed data | ≤ 150ms |

### Non-Goals

- **Ticket creation or intake.** The tool reads from a JSON seed file. It does not replace the submission channel.
- **Email or Slack integration.** Pulling tickets automatically from external channels is a future phase.
- **Submitter-facing status view.** No external or internal portal for ticket submitters is included in this release.
- **Historical analytics.** Trend reporting across time periods is out of scope for this release.
- **Mobile-native app.** A responsive web experience is sufficient; a dedicated iOS/Android app is not required.
- **Manual code edits before the scaffold exists.** All code is Claude Code generated until Deliverable 4.

---

## 4. Functional Requirements

### FR-1 — List open tickets

> **Given** a PMO staff member opens the dashboard,
> **When** the page loads,
> **Then** all open tickets from the JSON seed file are displayed in a list, each showing ticket ID, title, current priority, and assigned owner, with no additional clicks required.

---

### FR-2 — Tag ticket with priority

> **Given** a PMO staff member is viewing a ticket row,
> **When** they select a priority value (P0, P1, or P2) from the inline control,
> **Then** a `PATCH /tickets/:id` request is issued, the ticket record is updated, and the row reflects the new priority without a full page reload.

---

### FR-3 — Assign ticket owner

> **Given** a PMO staff member is viewing a ticket row,
> **When** they enter or select an owner name,
> **Then** a `PATCH /tickets/:id` request is issued, the ticket record is updated, and the row reflects the new owner without a full page reload.

---

### FR-4 — Dashboard grouped by priority with count badges

> **Given** the dashboard is displaying open tickets,
> **When** the page renders,
> **Then** tickets are visually grouped into P0, P1, and P2 sections, each section displays a count badge showing the number of tickets in that group, and untagged tickets appear in a separate group.

---

### FR-5 — API with Zod-validated input

> **Given** a client sends a `PATCH /tickets/:id` request,
> **When** the request body fails Zod schema validation (e.g. invalid priority value, missing required field),
> **Then** the API returns a `400` status with a structured error body describing the validation failure, and no database write occurs.

---

## 5. Non-Functional Requirements

| # | Attribute | Requirement |
|---|---|---|
| NFR-01 | **Page render time** | Initial page render must complete in ≤ 1.5 seconds on localhost |
| NFR-02 | **API response time** | `GET /tickets` p95 response time must be ≤ 150ms with seed data loaded |
| NFR-03 | **Type safety** | Zero `any` types permitted in the TypeScript codebase; `strict` mode enabled in `tsconfig.json` |
| NFR-04 | **CI pipeline duration** | GitHub Actions pipeline (lint + build + smoke test) must complete in ≤ 3 minutes end-to-end |
| NFR-05 | **Commit standards** | All commits must be signed and follow Conventional Commits format (`feat:`, `fix:`, `chore:` etc.) |
| NFR-06 | **Lint gate** | CI must fail on any ESLint error; warnings do not block the pipeline |
| NFR-07 | **Smoke test gate** | CI must include at least one smoke test that calls `GET /tickets` and asserts a 200 response |
| NFR-08 | **Spec artefacts location** | PRD, ADRs, and user stories must live under `/docs/spec/` in Markdown format |

---

## 6. Architecture Decision Records

---

### ADR-001: Frontend Framework — Next.js 15 App Router

**Status:** Accepted

**Context:**
The tool needs a server-rendered dashboard with API routes in the same codebase. The challenge brief mandates a TypeScript strict stack with Tailwind CSS. A framework choice is needed that supports App Router conventions, API route handlers, and fast local development with minimal configuration.

**Decision:**
Use Next.js 15 with the App Router. API routes are implemented as Route Handlers under `app/api/`. UI components are React Server Components where possible, with client components only where interactivity requires it (priority tagging, owner assignment).

**Alternatives Rejected:**

*1. Vite + React SPA with a separate Express API*
Rejected because it requires maintaining two separate servers (frontend dev server + Express), two separate build pipelines, and manual CORS configuration. This increases CI complexity and violates the spirit of the ≤ 3 minute CI constraint. Next.js collocates frontend and API in one build.

*2. Remix*
Rejected because the team's existing tooling, Claude Code scaffolding patterns, and the challenge's reference stack all assume Next.js. Remix would introduce an unfamiliar loader/action model with no productivity benefit for a tool of this scope.


---

### ADR-002: Data Layer — Prisma + SQLite

**Status:** Accepted

**Context:**
The tool needs to persist ticket state (priority tags, owner assignments) across page loads. The data volume is small — seed data is a JSON file, expected ticket count is under 500 at any time. The challenge brief mandates Prisma + SQLite explicitly. A decision is needed on schema management and query approach.

**Decision:**
Use Prisma ORM with a SQLite database file. The seed script reads from `prisma/fixtures/tickets.json` and populates the database on first run. Prisma Client provides type-safe queries with no `any` leakage, satisfying NFR-03.

**Alternatives Rejected:**

*1. Raw SQL with better-sqlite3*
Rejected because raw SQL queries return untyped objects, making it difficult to satisfy the zero `any` constraint (NFR-03) without significant manual type annotation. Prisma generates types from the schema automatically, reducing the surface area for type errors.

*2. PostgreSQL via Prisma*
Rejected for this release because it requires a running database server in CI, adding setup time and pushing the pipeline toward or beyond the 3-minute limit (NFR-04). SQLite runs in-process with no server dependency. PostgreSQL remains the natural migration path if the tool moves to a shared hosted environment.

**Consequences:**
- SQLite is a file on disk — concurrent write performance is limited, but acceptable for a single-user PMO tool.
- The database file must be excluded from version control (`.gitignore`) and seeded fresh in CI on each run.
- Prisma migrations must be committed to `/prisma/migrations/` so the schema is reproducible across environments.

---

