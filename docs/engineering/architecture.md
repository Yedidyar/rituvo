# Architecture Guidance

## Goal

Support a fast, polished demo while keeping core product logic easy to evolve.

## Recommended shape

Use a modular application with clear boundaries:

- Presentation
- Application use cases
- Domain logic
- Data access
- Seeded demo services

Avoid microservices for the first demo.

## Presentation layer

Responsibilities:

- Render screens and states
- Capture user input
- Trigger application use cases
- Display loading and error states

Do not calculate progress metrics directly inside UI components.

## Application layer

Suggested use cases:

- `getTodayView`
- `submitCheckIn`
- `getHabitDetail`
- `getProgressHistory`
- `recommitAfterMiss`
- `getPartnerResponse`

Use cases coordinate domain rules and data access.

## Domain layer

Responsibilities:

- Check-in state transitions
- Progress calculation
- Streak calculation
- Recovery rules
- Relationship permissions
- Validation of completion outcomes

Domain logic should be testable without rendering the UI.

## Data layer

For the demo, choose the smallest suitable option:

1. In-memory or local seeded repository
2. Browser storage
3. Existing project backend
4. Lightweight hosted database if already configured

Do not introduce backend infrastructure only to make the demo look production-ready.

## Partner response simulation

The demo may use deterministic partner responses.

Example rule:

- Completed check-in returns an acknowledgment.
- Missed check-in returns a recovery message.
- Recommitment returns encouragement.

Keep this logic explicit and centralized. Do not simulate unpredictable real-time activity.

## State management

Use the framework's simplest maintainable state mechanism.

State should distinguish:

- Loading
- Ready
- Submitting
- Success
- Failure

Avoid a global state library unless multiple implemented screens genuinely require it.

## Persistence

Minimum requirement:

- Navigation should not discard submitted state.

Preferred demo requirement:

- Refresh preserves check-ins using the existing backend or local persistence.

## Testing

Prioritize:

- Progress metric calculation
- Completed check-in transition
- Missed check-in transition
- Recovery transition
- Duplicate submission prevention
- Today view state selection

Add at least one end-to-end test for the core demo journey when the stack supports it.

## Accessibility

Core requirements:

- Semantic controls
- Visible focus
- Accessible names
- Sufficient contrast
- No color-only status communication
- Mobile touch targets
- Status updates announced where appropriate

## Observability

For the demo, structured console logging is sufficient.

Do not log:

- Sensitive habit notes
- Evidence content
- Tokens
- Secrets
- Personal contact details

## Security

Even in demo code:

- Keep secrets in environment variables.
- Validate user-controlled input.
- Avoid rendering untrusted HTML.
- Do not imply permissions that are not enforced.
