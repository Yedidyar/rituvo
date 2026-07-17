# Demo Acceptance Criteria

## Product comprehension

- A first-time viewer can identify the user's habit within 10 seconds.
- A first-time viewer can identify today's required action within 10 seconds.
- The accountability partner is visible without opening a secondary settings screen.
- The UI clearly distinguishes pending, completed, and missed states.

## Today view

- The current commitment displays its title and minimum completion rule.
- The primary action is visible at common mobile widths.
- Current progress is shown with plain language.
- Partner context is displayed.
- Completed commitments cannot accidentally be submitted twice.

## Check-in

- The user can submit a completed check-in.
- The user can submit a missed check-in.
- A note is optional.
- Submission updates the visible state immediately.
- A failed submission produces a recoverable error state.
- Check-in data remains consistent after navigation or refresh when persistence is implemented.

## Partner response

- A partner acknowledgment appears after a completed check-in.
- A supportive recovery response appears after a missed check-in.
- Seeded or simulated responses are clearly implemented as deterministic demo behavior.
- The interface does not falsely imply real-time human activity.

## Progress

- The recent history shows at least seven commitment periods.
- Completed and missed periods are visually distinguishable.
- One consistency metric is displayed.
- The metric matches the seeded check-in data.
- A recovery event is visible in the history or summary.

## Recovery

- A miss does not lead to a dead end.
- The next commitment is shown.
- The user can recommit.
- Recommitting does not erase the miss.
- Recovery copy is constructive and non-judgmental.

## Technical quality

- Core screens are responsive.
- Primary actions are keyboard accessible.
- Interactive controls have accessible labels.
- Loading, empty, and error states exist.
- Business logic is not embedded only in presentation components.
- Seed data is centralized and easy to replace.
- No secrets are committed.
- The app can be started using documented commands.

## Demo readiness

- The primary journey can be completed from start to finish without manual database edits.
- The demo has a consistent visual language.
- No navigation item leads to an obviously unfinished screen.
- The core journey works in a clean local environment.
- The README includes setup and run instructions after implementation.
