# Feature Specification: PMO Ticket Triage Dashboard

**Feature Branch**: `001-pmo-ticket-triage`

**Created**: 2026-06-29

**Status**: Draft

**Input**: Derived from `docs/spec/Hafsa-month1-spec.md`

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View All Open Tickets at a Glance (Priority: P1)

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

---

### User Story 2 — Tag a Ticket with Priority Inline (Priority: P1)

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

---

### User Story 3 — Assign a Ticket Owner Inline (Priority: P1)

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

---

### User Story 4 — View Tickets Grouped by Priority with Count Badges (Priority: P2)

When the dashboard renders, tickets are visually grouped into P0, P1, and P2 sections.
Each section header displays a count badge showing how many tickets are in that group.
Tickets without a priority appear in a separate "Untagged" group. Rohan can open the
dashboard to get an instant workload summary without asking Kavya.

**Why this priority**: Queue structure and counts give Rohan the visibility he needs
without interrupting Kavya. Priority grouping also helps Kavya process high-urgency items
first. It is P2 because the list view (US1–US3) delivers triage value on its own.

**Independent Test**: Load the dashboard with a mix of P0, P1, P2, and untagged tickets.
Confirm four visible sections appear (P0, P1, P2, Untagged), each showing the correct
count badge. Tag an untagged ticket and confirm it moves to the correct group with counts
updated.

**Acceptance Scenarios**:

1. **Given** tickets with mixed priorities exist, **When** the dashboard loads,
   **Then** tickets are displayed in four sections: P0, P1, P2, and Untagged, each with a
   visible count badge.
2. **Given** a section has zero tickets, **When** the dashboard loads,
   **Then** that section either shows a zero count or is hidden — both are acceptable.
3. **Given** Kavya tags an untagged ticket as P1, **When** the change is saved,
   **Then** the ticket moves to the P1 group and both the P1 and Untagged count badges
   update to reflect the new totals.

---

### Edge Cases

- What happens when the seed file has no tickets? Dashboard should render an empty state
  with a clear "no open tickets" message.
- What happens if an owner name exceeds a reasonable length? The row layout must not break.
- What happens when two users simultaneously update the same ticket? Last-write-wins is
  acceptable for this single-user PMO tool scope.
- What happens if a ticket has a priority value outside P0/P1/P2? The system must reject
  the stored value and treat the ticket as untagged.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all open tickets in a single view, each showing ticket
  ID, title, current priority, and assigned owner — no additional navigation required.
- **FR-002**: System MUST allow a user to assign a priority (P0, P1, or P2) to a ticket
  directly from the ticket row, with the change persisted and reflected immediately.
- **FR-003**: System MUST allow a user to assign or update an owner name on a ticket
  directly from the ticket row, with the change persisted and reflected immediately.
- **FR-004**: System MUST group tickets into P0, P1, P2, and Untagged sections, each
  displaying a count badge; untagged tickets MUST appear in a dedicated "Untagged" group,
  visually distinct from the P0/P1/P2 sections.
- **FR-005**: System MUST reject any update to a ticket's priority that uses a value
  outside the allowed set (P0, P1, P2), return a clear error to the user, and leave the
  ticket record unchanged.

### Key Entities

- **Ticket**: Represents a single work request. Key attributes: unique ID, title,
  priority (P0 / P1 / P2 / untagged), owner (person's name or empty), status
  (open / closed). Relationships: belongs to exactly one priority group at any time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A PMO coordinator completes a full triage session (reviewing all open
  tickets, setting priorities, assigning owners) in ≤ 10 minutes per day — down from
  the current 45–60 minutes.
- **SC-002**: 100% of open tickets have a visible priority label (P0, P1, P2, or
  "Untagged") with no tickets hidden or missing from the dashboard view.
- **SC-003**: 100% of open tickets have an owner assignment visible on the dashboard
  within one triage session.
- **SC-004**: A PMO manager can produce a complete workload summary (count per priority
  group, who owns what) in ≤ 5 minutes by reading the dashboard — without asking the
  PMO coordinator directly.
- **SC-005**: Any attempt to store an invalid priority value results in a visible error
  message and zero data corruption — the ticket retains its previous state.

## Clarifications

### Session 2026-06-29

- Q: FR-006 (untagged-group visual distinction) was split from FR-004 during spec
  generation — should it be a standalone requirement? → A: No. Merge back into FR-004;
  untagged-group handling is part of the grouping requirement (FR-4 in source PRD). Final
  functional requirements list: FR-001 through FR-005 (five total).
- Q: T024 (tasks.md) locked empty-group behavior to "zero count badge, never hidden",
  but US4 acceptance scenario 2 explicitly permits both. Should tasks over-specify? →
  A: No. T024 relaxed to allow either a zero count badge or an omitted section — both
  remain valid implementations. Do not constrain what the spec leaves open.
- Q: T016 and T017 were marked [P] (parallelizable) but both modify `app/page.tsx` —
  is this correct? → A: No. [P] marker removed from both; T015, T016, T017 are
  sequential since they all edit the same file.

## Assumptions

- Ticket data is pre-loaded from a seed file; the tool does not handle ticket intake or
  submission from external channels (Slack, email, shared inbox).
- The tool is used by a small internal PMO team — no per-user authentication is required
  for this release. All PMO staff share a single dashboard view.
- The expected ticket volume is under 500 open tickets at any time; no pagination or
  search is required for this release.
- Mobile-native support is out of scope; a desktop browser experience is sufficient.
- Historical analytics and trend reporting are out of scope for this release.
- Ticket status (open vs. closed) is read-only in this release — the tool does not
  support closing or re-opening tickets.
- The seed data is the authoritative source of ticket records; no external system
  integration is required.
