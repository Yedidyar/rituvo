import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  // Primary key is the Clerk user id (e.g. "user_2abc..."). Capped generously
  // — Clerk does not contractually fix the length, so this guards against
  // garbage rather than assuming a tight size.
  id: varchar({ length: 255 }).primaryKey(),
  email: text(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
