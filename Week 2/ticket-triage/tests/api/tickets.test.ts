import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Hoist mock fns so they are available inside vi.mock factory (which is hoisted too)
const { mockFindMany, mockCreate, mockUpdate } = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    ticket: {
      findMany: mockFindMany,
      create: mockCreate,
      update: mockUpdate,
    },
  },
}));

import { GET, POST } from "@/app/api/tickets/route";
import { PATCH } from "@/app/api/tickets/[id]/route";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CREATED_AT = "2026-01-01T00:00:00.000Z";

function makePostRequest(body: unknown): Request {
  return new Request("http://localhost/api/tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makePatchRequest(
  id: string,
  body: unknown,
): [NextRequest, { params: Promise<{ id: string }> }] {
  const req = new NextRequest(`http://localhost/api/tickets/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return [req, { params: Promise.resolve({ id }) }];
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// US1 — View All Open Tickets at a Glance
// ---------------------------------------------------------------------------

describe("GET /tickets — US1: view all open tickets", () => {
  it("returns all open tickets, each with id, title, priority, and owner", async () => {
    mockFindMany.mockResolvedValue([
      { id: 1, title: "Login bug", priority: "P1", owner: "Alice", status: "open", createdAt: CREATED_AT },
      { id: 2, title: "Deploy failure", priority: "P0", owner: "Bob", status: "open", createdAt: CREATED_AT },
    ]);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body[0]).toMatchObject({ id: 1, title: "Login bug", priority: "P1", owner: "Alice" });
    expect(body[1]).toMatchObject({ id: 2, title: "Deploy failure", priority: "P0", owner: "Bob" });
  });

  it("includes a ticket whose priority is null — it appears with a null priority field", async () => {
    // US1 scenario 2: untagged tickets still appear in the list
    mockFindMany.mockResolvedValue([
      { id: 3, title: "Untagged ticket", priority: null, owner: "Carol", status: "open", createdAt: CREATED_AT },
    ]);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ id: 3, priority: null });
  });

  it("includes a ticket whose owner is null — it appears with a null owner field", async () => {
    // US1 scenario 3: ownerless tickets still appear in the list
    mockFindMany.mockResolvedValue([
      { id: 4, title: "Ownerless ticket", priority: "P2", owner: null, status: "open", createdAt: CREATED_AT },
    ]);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ id: 4, owner: null });
  });
});

// ---------------------------------------------------------------------------
// US2 — Tag a Ticket with Priority Inline
// ---------------------------------------------------------------------------

describe("PATCH /tickets/:id priority — US2: tag ticket with priority", () => {
  it("persists P0 and returns 200 with the updated ticket", async () => {
    // US2 scenario 1
    mockUpdate.mockResolvedValue({ id: 1, title: "Login bug", priority: "P0", owner: "Alice", status: "open", createdAt: CREATED_AT });

    const [req, ctx] = makePatchRequest("1", { priority: "P0" });
    const res = await PATCH(req, ctx);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.priority).toBe("P0");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 }, data: expect.objectContaining({ priority: "P0" }) }),
    );
  });

  it("persists P1 and returns 200 with the updated ticket", async () => {
    // US2 scenario 2
    mockUpdate.mockResolvedValue({ id: 2, title: "Deploy failure", priority: "P1", owner: "Bob", status: "open", createdAt: CREATED_AT });

    const [req, ctx] = makePatchRequest("2", { priority: "P1" });
    const res = await PATCH(req, ctx);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.priority).toBe("P1");
  });

  it("rejects an unrecognised priority with 400 and does not write to the DB", async () => {
    // US2 scenario 3 / failure mode: invalid priority outside {P0, P1, P2}
    const [req, ctx] = makePatchRequest("1", { priority: "P3" });
    const res = await PATCH(req, ctx);

    expect(res.status).toBe(400);
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// US3 — Assign a Ticket Owner Inline
// ---------------------------------------------------------------------------

describe("PATCH /tickets/:id owner — US3: assign ticket owner", () => {
  it("sets an owner on an unowned ticket and returns 200", async () => {
    // US3 scenario 1
    mockUpdate.mockResolvedValue({ id: 1, title: "Login bug", priority: "P1", owner: "Alice", status: "open", createdAt: CREATED_AT });

    const [req, ctx] = makePatchRequest("1", { owner: "Alice" });
    const res = await PATCH(req, ctx);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.owner).toBe("Alice");
  });

  it("overwrites an existing owner and returns 200 with the new owner", async () => {
    // US3 scenario 2
    mockUpdate.mockResolvedValue({ id: 1, title: "Login bug", priority: "P1", owner: "Bob", status: "open", createdAt: CREATED_AT });

    const [req, ctx] = makePatchRequest("1", { owner: "Bob" });
    const res = await PATCH(req, ctx);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.owner).toBe("Bob");
  });

  it("clears the owner when set to null and returns 200 with a null owner", async () => {
    // US3 scenario 3
    mockUpdate.mockResolvedValue({ id: 1, title: "Login bug", priority: "P1", owner: null, status: "open", createdAt: CREATED_AT });

    const [req, ctx] = makePatchRequest("1", { owner: null });
    const res = await PATCH(req, ctx);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.owner).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// US4 — View Tickets Grouped by Priority with Count Badges
// ---------------------------------------------------------------------------

describe("GET /tickets priority distribution — US4: grouped by priority", () => {
  it("returns tickets across all priority values (P0, P1, P2, null) enabling client-side grouping", async () => {
    // US4 scenario 1: the API surfaces the priority field for all tickets
    mockFindMany.mockResolvedValue([
      { id: 1, title: "Critical", priority: "P0", owner: "Alice", status: "open", createdAt: CREATED_AT },
      { id: 2, title: "High", priority: "P1", owner: "Bob", status: "open", createdAt: CREATED_AT },
      { id: 3, title: "Low", priority: "P2", owner: "Carol", status: "open", createdAt: CREATED_AT },
      { id: 4, title: "Untagged", priority: null, owner: null, status: "open", createdAt: CREATED_AT },
    ]);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(4);
    const priorities = (body as Array<{ priority: string | null }>).map((t) => t.priority);
    expect(priorities).toContain("P0");
    expect(priorities).toContain("P1");
    expect(priorities).toContain("P2");
    expect(priorities).toContain(null);
  });

  it("returns only the tickets that exist when some priority buckets are empty", async () => {
    // US4 scenario 2: empty groups are a UI concern — the API returns a flat array
    // with whatever priorities are present; no special structure is added for empty groups
    mockFindMany.mockResolvedValue([
      { id: 1, title: "Only P1 ticket", priority: "P1", owner: "Alice", status: "open", createdAt: CREATED_AT },
    ]);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].priority).toBe("P1");
  });

  it("PATCH from null to P1 returns 200 with P1, enabling the ticket to move to the P1 group", async () => {
    // US4 scenario 3: tagging an untagged ticket updates its priority
    mockUpdate.mockResolvedValue({ id: 4, title: "Untagged", priority: "P1", owner: null, status: "open", createdAt: CREATED_AT });

    const [req, ctx] = makePatchRequest("4", { priority: "P1" });
    const res = await PATCH(req, ctx);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.priority).toBe("P1");
  });
});

// ---------------------------------------------------------------------------
// Failure modes (not already covered above)
// ---------------------------------------------------------------------------

describe("failure modes", () => {
  it("POST without title returns 400 and does not write to the DB", async () => {
    const req = makePostRequest({ owner: "Alice" }); // title is missing
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("PATCH on an unknown ticket id returns 404", async () => {
    mockUpdate.mockRejectedValue(new Error("Record to update not found"));

    const [req, ctx] = makePatchRequest("9999", { priority: "P1" });
    const res = await PATCH(req, ctx);

    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe("edge cases", () => {
  it("GET on an empty database returns 200 with an empty array, not an error", async () => {
    mockFindMany.mockResolvedValue([]);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual([]);
  });
});
