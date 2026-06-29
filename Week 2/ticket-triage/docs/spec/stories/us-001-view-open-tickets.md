# User Story 1 — View All Open Tickets at a Glance (Priority: P1)

Kavya opens the triage dashboard and immediately sees every open ticket in a single view.
Each row shows the ticket ID, title, current priority label, and assigned owner so she can
assess queue state without opening any individual ticket.

**Why this priority**: This is the entry point for the entire triage workflow. Without a
readable ticket list, none of the other features are accessible. It directly targets the
core pain point of replacing the shared spreadsheet.

**Independent Test**: Open the dashboard with seed data loaded. Confirm every ticket from
the seed file appears with its ID, title, priority, and owner visible — no additional
clicks required.

**Acceptance Scenarios**:

1. **Given** open tickets exist in the system, **When** Kavya loads the dashboard,
   **Then** all open tickets are displayed, each showing ticket ID, title, priority, and
   owner in a single view without additional navigation.
2. **Given** a ticket has no priority assigned, **When** the dashboard loads,
   **Then** that ticket still appears and its priority field shows a clear "untagged"
   or empty indicator.
3. **Given** a ticket has no owner assigned, **When** the dashboard loads,
   **Then** that ticket still appears and its owner field shows a clear empty indicator.
