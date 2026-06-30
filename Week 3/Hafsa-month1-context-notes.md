# Context Engineering Journal — Month 1

## Prompt Strategy

- Which files were attached to each Claude Code task
Task: Add a POST /api/tickets endpoint.
Files to edit:
  - lib/schemas/ticket.ts        # add createTicketSchema
  - app/api/tickets/route.ts     # add POST handler

Task: Create Vitest tests for the tickets API.

Files to create:
- tests/api/tickets.test.ts

- Why those and not more

## Failure Modes
- Cases where the agent produced wrong code

create/patch priority nullability diverged because I didn't give it the existing schema to match

- What context was missing and what you added

## Re-Prompt Examples
1.
Before:
Task: Add a POST /api/tickets endpoint.
Files to edit:
  - lib/schemas/ticket.ts        # add createTicketSchema
  - app/api/tickets/route.ts     # add POST handler
Acceptance:
  - Given a valid body { title, priority?, owner? }, When POST /api/tickets,
    Then a Ticket is created and the response is 201 w
    an invalid body returns 400 with a structured erro
Do not:
  - Do not add any create-ticket UI.
  - Do not change GET or PATCH behaviour.

After:

make createTicketSchema's priority match TicketPatchSchema — nullable and optional

2.
Before:

Create Vitest tests for the tickets API.

Files to create:
- tests/api/tickets.test.ts

Create one test each for:
* Each user story — acceptance criteria in specs/001-pmo-ticket-triage/spec.md (US1-US4)
* Failure modes
  - invalid priority (outside P0/P1/P2) -> rejected, 400, no DB write
  - POST missing title -> 400
  - unknown id on PATCH -> 404
* Edge cases
  - empty database -> GET returns empty array (not an error)

Where a failure mode is also an acceptance scenario, write ONE test.

Do not:
- Do not test framework internals (Prisma persistence, Zod parsing, Next routing).
- Do not test language-level behaviour.

After:
Task: Add the missing 404 test to the Vitest API suite.

Files to edit:
- tests/api/tickets.test.ts

Acceptance:
- Given a non-existent ticket id, When PATCH /api/tickets/:id is called,
  Then the response is 404. Use a numeric id (the schema uses integer ids),
  and mock prisma.ticket.update to throw a Prisma "record not found" error
  so the handler's 404 branch is exercised.

Do not:
- Do not change existing tests.

Task: Make Vitest the only test runner.

Files to edit:
- package.json

Acceptance:
- "npm test" runs the Vitest suite (vitest run).
- The old Jest "test:api"/duplicate scripts and Jest devDependencies/config are removed.
- Any GET coverage the Jest smoke test had is already in tests/api/tickets.test.ts,
  so no test coverage is lost.

Do not:
- Do not change any test in tests/api/tickets.test.ts.
- Do not add new dependencies.

Task: Add a GitHub Actions CI workflow.

  Files to edit:
  - .github/workflows/ci.yml

  Acceptance:
  - Given a push or PR, When CI runs on Node 20, Then it runs: npm ci;
    npx prisma generate; npx prisma migrate deploy (env DATABASE_URL="file:./ci.db");
    npm run lint; npm run build; npm test — all green, under 3 minutes, with npm cache.

  Do not:
  - Do not add a database service container (SQLite is a file).