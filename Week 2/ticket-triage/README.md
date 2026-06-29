# PMO Ticket Triage Dashboard

A single-view triage tool for the Bistec PMO: lists open tickets from seed data, tags priority (P0/P1/P2) and assigns owners inline, and groups the queue by priority with count badges. Next.js (App Router) · TypeScript · Prisma + SQLite · Zod · Tailwind.

## Prerequisites

Node.js 20+ and npm. (SQLite is a local file — no database server needed.)

## Run it

```bash
npm install
npx prisma migrate dev --name init   # create dev.db + apply schema
npx prisma db seed                   # load sample tickets
npm run dev                          # start the server
```

- Dashboard: http://localhost:3000
- Tickets API (JSON): http://localhost:3000/api/tickets

## API surface (FR → endpoint)

| FR | Behaviour | Method & route |
|---|---|---|
| FR-1 | List all open tickets | `GET /api/tickets` |
| FR-2 | Tag priority (P0/P1/P2) | `PATCH /api/tickets/:id` |
| FR-3 | Assign / update owner | `PATCH /api/tickets/:id` |
| FR-4 | Group by priority + count badges, Untagged group | dashboard render of `GET` data |
| FR-5 | Reject invalid priority (400, no DB write) | validation inside `PATCH` |

## Regenerate from specs

The spec is the source of truth. Clone, `npm install`, open Claude Code (`claude`) in the project root, and run `/speckit.implement` — it rebuilds the scaffold from `specs/`, then run the steps above.