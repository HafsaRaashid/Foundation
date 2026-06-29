# Contract: GET /tickets

**Route**: `GET /api/tickets`
**Handler**: `app/api/tickets/route.ts`
**Auth**: None (single shared dashboard)

---

## Request

No body. No query parameters. No path parameters.

---

## Response — 200 OK

Returns an array of all open tickets, ordered by `createdAt ASC` within each priority
group. Grouping is handled client-side (in `app/page.tsx`); this endpoint returns a
flat array.

```json
[
  {
    "id": 1,
    "title": "Clarify budget approval process for Q3",
    "priority": "P0",
    "owner": "Kavya Nair",
    "status": "open",
    "createdAt": "2026-06-01T08:00:00.000Z"
  },
  {
    "id": 2,
    "title": "Update onboarding checklist",
    "priority": null,
    "owner": null,
    "status": "open",
    "createdAt": "2026-06-02T09:30:00.000Z"
  }
]
```

### Response Schema (TypeScript)

```ts
type TicketResponse = {
  id: number;
  title: string;
  priority: "P0" | "P1" | "P2" | null;
  owner: string | null;
  status: string;
  createdAt: string; // ISO 8601
};

type GetTicketsResponse = TicketResponse[];
```

---

## Response — 500 Internal Server Error

Returned if the database is unavailable.

```json
{ "error": "Failed to fetch tickets" }
```

---

## Performance Contract

- p95 response time MUST be ≤ 150ms with seed data loaded (≤ 500 tickets).
- Implementation MUST use a single `prisma.ticket.findMany` call — no N+1 queries.

---

## Smoke Test Assertion

```ts
const res = await fetch("http://localhost:3000/api/tickets");
expect(res.status).toBe(200);
const body = await res.json();
expect(Array.isArray(body)).toBe(true);
```
