# Demo Implementation Plan

## Phase 0: Repository orientation

- Identify framework and package manager.
- Confirm existing routing and design system.
- Confirm current persistence layer.
- Document setup commands.
- Locate existing authentication assumptions.
- Avoid replacing working infrastructure without a clear need.

## Phase 1: Demo foundation

Create:

- Demo users
- Demo habit
- Commitment history
- Partner relationship
- Partner response fixtures
- Centralized repository or service interface

Deliverable:

The application can load a complete demo state from one source.

## Phase 2: Today view

Implement:

- Habit summary
- Completion rule
- Progress summary
- Partner identity
- Main check-in action
- Pending, completed, and missed states

Deliverable:

A viewer immediately understands what the user should do today.

## Phase 3: Check-in flow

Implement:

- Completed outcome
- Missed outcome
- Optional note
- Validation
- Loading and error states
- Duplicate submission prevention

Deliverable:

The user can change today's commitment from pending to a final state.

## Phase 4: Partner response

Implement deterministic responses for:

- Completion acknowledgment
- Miss recovery
- Recommitment encouragement

Deliverable:

The accountability mechanism is visible after the user's action.

## Phase 5: Progress and habit detail

Implement:

- Recent commitment history
- One consistency metric
- Habit definition
- Partner relationship summary
- Recovery event

Deliverable:

The user can understand recent behavior and progress.

## Phase 6: Recovery loop

Implement:

- Miss confirmation
- Next commitment display
- Recommit action
- Recovery event persistence
- Constructive copy

Deliverable:

A miss leads to a clear next step instead of a dead end.

## Phase 7: Demo hardening

Add:

- Responsive behavior
- Accessibility pass
- Empty states
- Error states
- Core unit tests
- One end-to-end flow
- Setup documentation
- Consistent seeded state

## Recommended build order

1. Domain types
2. Seed data
3. Repository interface
4. Progress calculations
5. Today query
6. Today UI
7. Check-in mutation
8. Partner response simulation
9. History UI
10. Recovery mutation
11. Tests and polish

## Definition of done

The first demo is complete when:

- The main flow works without developer intervention.
- The product value is understandable within two minutes.
- Acceptance criteria pass.
- The implementation matches documented scope.
- The project can be run from a clean checkout.
