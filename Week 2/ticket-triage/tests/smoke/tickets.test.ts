const BASE_URL = process.env["BASE_URL"] ?? "http://localhost:3000";

describe("GET /api/tickets", () => {
  it("returns 200 with an array", async () => {
    const res = await fetch(`${BASE_URL}/api/tickets`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  it("each ticket has id, title, status fields", async () => {
    const res = await fetch(`${BASE_URL}/api/tickets`);
    const tickets = (await res.json()) as unknown[];
    for (const ticket of tickets) {
      expect(ticket).toMatchObject({
        id: expect.any(Number),
        title: expect.any(String),
        status: "open",
      });
    }
  });
});
