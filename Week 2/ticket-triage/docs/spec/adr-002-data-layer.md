# ADR-002: Data Layer — Prisma + SQLite

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
