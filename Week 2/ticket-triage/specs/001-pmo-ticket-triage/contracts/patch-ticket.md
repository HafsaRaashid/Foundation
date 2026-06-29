# Contract: PATCH /tickets/:id

**Route**: `PATCH /api/tickets/:id`
**Handler**: `app/api/tickets/[id]/route.ts`
**Auth**: None (single shared dashboard)

---

## Request

### Path Parameter

| Param | Type | Notes |
|-------|------|-------|
| `id` | integer string | Must be a valid integer. Non-numeric strings → 400. |

### Request Body (JSON)

At least one field MUST be present. Both fields are optional but the body MUST NOT be
empty.

```json
{
  "priority": "P1",
  "owner": "Rohan Perera"
}
```

| Field | Type | Nullable | Constraints |
|-------|------|----------|-------------|
| `priority` | `"P0" \| "P1" \| "P2" \| null` | Yes | `null` clears the tag (sets to untagged). Omitting the field leaves it unchanged. |
| `owner` | `string \| null` | Yes | Max 100 characters. `null` clears the assignment. Omitting the field leaves it unchanged. |

### Zod Schema (implementation reference)

```ts
const TicketPatchSchema = z.object({
  priority: z.enum(["P0", "P1", "P2"]).nullable().optional(),
  owner: z.string().max(100).nullable().optional(),
}).refine(
  (data) => data.priority !== undefined || data.owner !== undefined,
  { message: "At least one field (priority or owner) must be provided" }
);
```

---

## Response — 200 OK

Returns the full updated ticket record.

```json
{
  "id": 2,
  "title": "Update onboarding checklist",
  "priority": "P1",
  "owner": "Rohan Perera",
  "status": "open",
  "createdAt": "2026-06-02T09:30:00.000Z"
}
```

---

## Response — 400 Bad Request

Returned when Zod schema validation fails. **No database write occurs.**

```json
{
  "error": "Validation failed",
  "issues": [
    {
      "code": "invalid_enum_value",
      "path": ["priority"],
      "message": "Invalid enum value. Expected 'P0' | 'P1' | 'P2', received 'HIGH'"
    }
  ]
}
```

---

## Response — 404 Not Found

Returned when no ticket with the given `id` exists.

```json
{ "error": "Ticket not found" }
```

---

## Response — 500 Internal Server Error

```json
{ "error": "Failed to update ticket" }
```

---

## Validation Gate (Constitution Principle II)

The Zod schema MUST be evaluated **before** any call to `prisma.ticket.update`.
The handler MUST return 400 immediately if `safeParse` returns `success: false`.
Under no circumstances may a partial or invalid write reach the database.
