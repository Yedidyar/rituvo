# Rituvo Agent Guide

This file defines how coding agents should use the repository documentation.

## Required reading order

Before implementing product behavior, read:

1. `docs/README.md`
2. `docs/product/vision.md`
3. `docs/product/principles.md`
4. `docs/demo/scope.md`
5. `docs/demo/user-flow.md`
6. The relevant engineering document for the task

## Source of truth

Use the following priority order when documents conflict:

1. Accepted decision records in `docs/decisions/`
2. Demo acceptance criteria in `docs/demo/acceptance-criteria.md`
3. Demo scope in `docs/demo/scope.md`
4. Product principles in `docs/product/principles.md`
5. Product vision and feature descriptions
6. Existing implementation

Existing code is not automatically authoritative. If code conflicts with a higher-priority document, preserve the documented behavior unless the task explicitly changes the product decision.

## Product identity

Rituvo is a social accountability platform for building habits, reaching goals, and reducing procrastination.

It is not primarily:

- A task manager
- A calendar replacement
- A generic social network
- A passive habit tracker
- A motivational quote application

The core product mechanism is commitment between people.

## Demo implementation rule

For demo work, optimize for the smallest believable end-to-end experience.

Do not add:

- Complex recommendation systems
- Real payment processing
- Marketplace fulfillment
- Advanced moderation automation
- Large-scale gamification economies
- Premature microservices
- Features that are outside `docs/demo/scope.md`

Prefer realistic mocked data over incomplete infrastructure when the user experience can still be evaluated.

## Domain language

Use the canonical terms defined in `docs/product/terminology.md`.

Do not invent competing names for core entities without updating the terminology document.

## Documentation updates

Update documentation in the same change when you alter:

- A user flow
- A domain entity
- A business rule
- Demo scope
- Acceptance criteria
- Architecture boundaries
- A product decision

For significant or difficult-to-reverse choices, add a decision record under `docs/decisions/`.

## Implementation standards

- Keep business rules separate from UI rendering.
- Model accountability relationships explicitly.
- Make all meaningful state transitions observable in the UI.
- Prefer simple, testable domain logic.
- Avoid hidden automation that makes the demo difficult to understand.
- Include empty, loading, success, and failure states for core flows.
- Preserve accessibility and mobile-first usability.
- Never expose secrets or personal data in fixtures, logs, screenshots, or commits.

## Before completing a task

Confirm that:

- The implementation matches the documented scope.
- Acceptance criteria are satisfied.
- Relevant tests exist.
- New terminology is documented.
- Product or architecture decisions are recorded.
- No unnecessary feature expansion was introduced.
