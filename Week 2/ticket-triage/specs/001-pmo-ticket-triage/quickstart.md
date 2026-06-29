# Quickstart & Validation Guide: PMO Ticket Triage Dashboard

**Feature**: `specs/001-pmo-ticket-triage`
**Date**: 2026-06-29

This guide walks through running the application locally and verifying each user story
end-to-end. It is a **validation** guide, not an implementation guide — no source code
is included here.

---

## Prerequisites

- Node.js 20+
- npm 10+
- Git (for signed commits)

---

## Setup

```bash
# 1. Install dependencies
npm ci

# 2. Apply database migrations and seed with fixture data
npx prisma migrate dev --name init
npx prisma db seed

# 3. Start the development server
npm run dev
```

The app is available at `http://localhost:3000`.

---

## Validating User Story 1 — View All Open Tickets

1. Open `http://localhost:3000` in a browser.
2. Confirm tickets from `prisma/fixtures/tickets.json` appear in the list.
3. Each row shows: ticket ID, title, priority label (or "Untagged"), and owner (or empty).
4. **No additional clicks** are required to see all tickets.

**Expected**: All open tickets visible on page load.

---

## Validating User Story 2 — Tag a Ticket with Priority Inline

1. Locate any ticket row.
2. Select a priority (P0, P1, or P2) from the inline control.
3. Confirm the row immediately reflects the new priority without a page reload.
4. Refresh the page — confirm the priority persists.

**Expected**: Priority updates instantly and survives a refresh.

**Error path**: Attempting to submit an invalid priority (e.g., via `curl`):

```bash
curl -X PATCH http://localhost:3000/api/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{"priority": "HIGH"}'
```

Expected: HTTP 400 with a JSON body containing `error` and `issues`. Ticket unchanged.

---

## Validating User Story 3 — Assign a Ticket Owner Inline

1. Locate any ticket row with no owner.
2. Enter an owner name in the inline input and confirm (Enter or blur).
3. Confirm the row immediately shows the owner without a page reload.
4. Refresh the page — confirm the owner persists.
5. Clear the owner field — confirm the ticket shows as unowned after save.

**Expected**: Owner updates instantly and survives a refresh.

---

## Validating User Story 4 — Priority Groups with Count Badges

1. Open `http://localhost:3000`.
2. Confirm four sections are visible: **P0**, **P1**, **P2**, and **Untagged**.
3. Each section header shows a count badge matching the number of tickets in that group.
4. Tag an untagged ticket as P1.
5. Confirm the ticket moves to the P1 section and both the P1 and Untagged counts update.

**Expected**: Groups and badges reflect current priorities; live updates after tagging.

---

## Running the CI Pipeline Locally

```bash
# Lint (must pass with zero errors)
npm run lint

# Build (type-check + bundle)
npm run build

# Smoke test (requires a running dev server or test server on port 3000)
npx prisma migrate deploy
npx prisma db seed
npx jest tests/smoke
```

All three steps MUST complete in ≤ 3 minutes combined (CI budget).

---

## Smoke Test Contract Reference

See [`contracts/get-tickets.md`](contracts/get-tickets.md) for the exact assertion
the smoke test exercises.

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tickets` | Returns all open tickets |
| PATCH | `/api/tickets/:id` | Updates priority and/or owner |

Full contracts: [`contracts/get-tickets.md`](contracts/get-tickets.md),
[`contracts/patch-ticket.md`](contracts/patch-ticket.md).

---

## Data Model Reference

See [`data-model.md`](data-model.md) for the Ticket entity schema, field constraints,
and grouping logic.
