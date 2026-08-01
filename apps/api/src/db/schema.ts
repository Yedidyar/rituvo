import {
  date,
  numeric,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const habitFrequencyEnum = pgEnum('habit_frequency', [
  'daily',
  'specific_days',
])

export const habitStatusEnum = pgEnum('habit_status', [
  'active',
  'paused',
  'archived',
])

export const users = pgTable('users', {
  // Primary key is the Clerk user id (e.g. "user_2abc..."). Capped generously
  // — Clerk does not contractually fix the length, so this guards against
  // garbage rather than assuming a tight size.
  id: varchar({ length: 255 }).primaryKey(),
  email: text().unique(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const habits = pgTable('habits', {
  id: uuid().primaryKey().defaultRandom(),
  ownerId: varchar('owner_id', { length: 255 })
    .notNull()
    .references(() => users.id),
  name: text().notNull(),
  description: text(),
  frequency: habitFrequencyEnum().notNull(),
  // 0 = Sunday … 6 = Saturday (matches JS Date#getDay). Null when daily.
  scheduleDays: smallint('schedule_days').array(),
  reminderTime: varchar('reminder_time', { length: 5 }),
  startDate: date('start_date').notNull(),
  targetValue: numeric('target_value', { precision: 10, scale: 2 }),
  targetUnit: text('target_unit'),
  partnerUserId: varchar('partner_user_id', { length: 255 }).references(
    () => users.id,
  ),
  status: habitStatusEnum().notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

/** User-level partnerships used to populate the partner picker. */
export const accountabilityPartnerships = pgTable(
  'accountability_partnerships',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id),
    partnerUserId: varchar('partner_user_id', { length: 255 })
      .notNull()
      .references(() => users.id),
    status: varchar({ length: 32 }).notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
)
