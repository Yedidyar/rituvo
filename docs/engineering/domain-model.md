# Domain Model

This is the initial conceptual model. It should guide naming and state transitions without forcing premature database complexity.

## User

Represents a person using Rituvo.

Suggested fields:

- `id`
- `displayName`
- `avatarUrl`
- `timezone`
- `createdAt`

## Habit

Defines repeated behavior.

Suggested fields:

- `id`
- `ownerId`
- `title`
- `motivation`
- `schedule`
- `minimumRule`
- `privacy`
- `status`
- `createdAt`

Suggested status values:

- `active`
- `paused`
- `completed`
- `archived`

## AccountabilityRelationship

Defines the accountability connection between users.

Suggested fields:

- `id`
- `habitId`
- `ownerId`
- `partnerId`
- `status`
- `visibility`
- `createdAt`
- `acceptedAt`

Suggested status values:

- `pending`
- `active`
- `paused`
- `ended`
- `declined`

## CommitmentPeriod

Represents one expected occurrence of a habit.

Suggested fields:

- `id`
- `habitId`
- `startsAt`
- `endsAt`
- `status`

Suggested status values:

- `scheduled`
- `due`
- `completed`
- `missed`
- `skipped`

For a lightweight demo, commitment periods may be derived from seeded data rather than generated dynamically.

## CheckIn

Records the outcome of a commitment period.

Suggested fields:

- `id`
- `commitmentPeriodId`
- `userId`
- `outcome`
- `note`
- `evidence`
- `createdAt`

Suggested outcome values:

- `completed`
- `partial`
- `missed`
- `skipped`

The first demo only requires `completed` and `missed`.

## PartnerResponse

Represents an accountability response.

Suggested fields:

- `id`
- `relationshipId`
- `checkInId`
- `authorId`
- `type`
- `message`
- `createdAt`

Suggested type values:

- `encouragement`
- `acknowledgment`
- `recovery`

## RecoveryCommitment

Records the user's response after a miss.

Suggested fields:

- `id`
- `missedCheckInId`
- `nextCommitmentPeriodId`
- `action`
- `createdAt`

For the first demo, this can be represented as an event rather than a dedicated persistent entity.

## ProgressSummary

A derived view, not necessarily a stored entity.

Suggested fields:

- `habitId`
- `completedCount`
- `expectedCount`
- `completionRate`
- `currentStreak`
- `bestStreak`
- `lastMissAt`
- `recoveredAfterLastMiss`

## Core relationships

- A user owns many habits.
- A habit has many commitment periods.
- A commitment period has zero or one final check-in.
- A habit may have an active accountability relationship.
- A check-in may have many partner responses.
- A missed check-in may lead to a recovery commitment.

## Invariants

- A final check-in belongs to exactly one commitment period.
- A commitment period cannot be both completed and missed.
- A partner response must come from a user allowed by the accountability relationship.
- Recommitting after a miss does not change the original miss.
- Progress metrics must be derived from commitment and check-in data.
- Streak rules must be explicit and deterministic.
