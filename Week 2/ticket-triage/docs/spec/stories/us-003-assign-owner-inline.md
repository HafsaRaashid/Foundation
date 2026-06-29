# User Story 3 — Assign a Ticket Owner Inline (Priority: P1)

Kavya enters or selects an owner name directly from the ticket row. The assignment is
immediately saved and reflected without a page reload.

**Why this priority**: Owner assignment is the second action Kavya performs on every
ticket. Keeping it inline eliminates the round-trip to a separate screen or spreadsheet
column.

**Independent Test**: Enter or select an owner name for any ticket row. Confirm the row
immediately reflects the new owner name, and that refreshing the page shows the same
owner persisted.

**Acceptance Scenarios**:

1. **Given** Kavya is viewing an unowned ticket row, **When** she enters an owner name,
   **Then** the row immediately shows that owner and the change is persisted.
2. **Given** Kavya is viewing a ticket with an existing owner, **When** she changes the
   owner name, **Then** the row reflects the new owner and the previous owner is
   overwritten.
3. **Given** Kavya clears the owner field, **When** she saves, **Then** the ticket shows
   as unowned and the change is persisted.
