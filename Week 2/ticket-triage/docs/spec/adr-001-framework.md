# ADR-001: Frontend Framework — Next.js 15 App Router

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
