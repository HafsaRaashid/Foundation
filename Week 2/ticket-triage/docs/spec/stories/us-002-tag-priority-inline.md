# User Story 2 — Tag a Ticket with Priority Inline (Priority: P1)

Kavya selects a priority level (P0, P1, or P2) directly from the ticket row. The change
is immediately saved and reflected in the row without a page reload.

**Why this priority**: Priority tagging is the primary action Kavya performs during triage.
Making it inline and instant reduces the per-ticket triage time from minutes (spreadsheet
copy-paste) to seconds.

**Independent Test**: Select a priority for any ticket row. Confirm the row immediately
reflects the new priority label, and that refreshing the page shows the same priority
persisted.

**Acceptance Scenarios**:

1. **Given** Kavya is viewing a ticket row, **When** she selects P0 from the priority
   control, **Then** the row immediately shows P0 and the change is persisted.
2. **Given** Kavya is viewing a ticket row, **When** she selects P1 from the priority
   control, **Then** the row immediately shows P1 and the change is persisted.
3. **Given** Kavya submits an unrecognised priority value, **When** the system processes
   the request, **Then** an error message is shown, the row is not updated, and the
   previously stored priority remains unchanged.
