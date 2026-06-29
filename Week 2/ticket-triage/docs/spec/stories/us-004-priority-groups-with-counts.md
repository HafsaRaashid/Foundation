# User Story 4 — View Tickets Grouped by Priority with Count Badges (Priority: P2)

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
