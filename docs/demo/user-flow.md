# Demo User Flow

## Entry

The user enters a signed-in demo account and lands on the Today view.

The page immediately communicates:

- The habit due today
- What counts as completion
- Whether it is complete
- Who is holding the user accountable
- The next available action

## Happy path

### 1. Review today's commitment

The user sees:

**Study Focus**  
Complete one focused 20-minute study session today.

Supporting information:

- Current streak: 3
- Recent consistency: 5 of 7
- Accountability partner: Alex
- Partner message: "You have this. Start with five minutes."

### 2. Start or complete the commitment

The main call to action is clear and prominent.

The user selects `Check in`.

### 3. Submit completion

The check-in form allows:

- Completed
- Missed
- Short optional note

For completion, the user may enter:

"I finished 25 minutes and reviewed chapter 4."

### 4. Confirm outcome

After submission:

- Today's card changes to completed.
- The progress summary updates.
- A confirmation message appears.
- A seeded partner acknowledgment appears.
- The check-in is visible in recent history.

### 5. View habit detail

The user opens the habit detail screen and sees:

- Habit definition
- Schedule
- Progress history
- Completed and missed periods
- Partner activity
- Current consistency metric

## Miss and recovery path

### 1. Submit a miss

The user selects `Missed` and may enter a short note.

Example:

"I started too late and did not finish."

### 2. Show honest state

The UI records the miss without hiding or dramatizing it.

The current streak may end depending on the explicit streak rule.

### 3. Partner response

Show a supportive seeded response:

"Thanks for checking in honestly. Let us protect tomorrow's session."

### 4. Recovery action

Offer one clear action:

`Recommit to tomorrow`

After recommitting:

- The next commitment is visible.
- The user sees a recovery confirmation.
- The history records the miss and recommitment separately.

## Navigation

Recommended demo navigation:

- Today
- Progress
- Profile

Habit detail can be opened from Today or Progress.

Keep navigation limited to implemented experiences.

## Empty and error states

The demo should include:

- No commitment due today
- Check-in submission failure
- Loading state
- Missing partner response
- Empty recent history

These states may use mocked behavior but should not break the experience.
