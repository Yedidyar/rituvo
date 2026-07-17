# First Demo Scope

## Objective

Build the smallest polished product experience that proves the core hypothesis:

A user is more likely to complete a habit when the commitment is visible to an accountability partner and both people can respond to progress.

## Demo platform

Use a mobile-first web application unless the repository is already a native mobile project.

The interface should be usable at common phone widths and still work on desktop.

## Core demo story

The demo must support this journey:

1. A user sees today's habit commitment.
2. The user understands the completion rule.
3. The user checks in as completed or missed.
4. The accountability partner's presence is visible.
5. A partner response appears.
6. Progress updates immediately.
7. After a miss, the user receives a clear recovery action.

## In scope

### Authentication shell

A lightweight signed-in experience using:

- Mock authentication
- Demo account selection
- Seeded users

Real authentication is optional unless already present.

### Today view

Display:

- Today's commitment
- Completion rule
- Current status
- Current streak or consistency summary
- Accountability partner
- Primary check-in action
- Recent partner message

### Habit detail

Display:

- Habit title
- Motivation
- Schedule
- Minimum completion rule
- Progress history
- Partner relationship
- Recent check-ins

### Check-in flow

Support:

- Completed
- Missed
- Optional short note
- Immediate UI update
- A visible partner acknowledgment or recovery response

### Accountability partner

Show:

- Partner identity
- Relationship status
- A small shared activity area
- Seeded partner responses

The first demo does not require real-time messaging.

### Progress

Show a simple recent history and one understandable metric, such as:

- 5 of the last 7 commitments completed
- Current streak
- Recovery after the last miss

### Recovery flow

After a miss, show:

- A non-judgmental message
- A partner response
- The next scheduled commitment
- A small recovery action, such as recommitting to the next session

## Out of scope

Do not build for the first demo:

- Real payments
- Reward fulfillment
- Public social feed
- Advanced group features
- Automatic partner matching
- Complex notification infrastructure
- Video or live sessions
- Full chat
- AI coaching
- Advanced recommendation systems
- Multi-habit planning tools
- Enterprise administration
- Complex moderation dashboards
- Production-grade analytics pipelines
- Microservices
- Native applications unless the repository already uses a native stack

## Demo data

Seed at least:

- One primary demo user
- One accountability partner
- One active habit
- Seven to fourteen commitment periods
- A mix of completed and missed check-ins
- At least one recovery event
- Several partner responses

## Success condition

A viewer should understand the product's unique value within two minutes without explanation from the developer.
