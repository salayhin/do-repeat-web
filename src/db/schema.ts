import {
  pgTable,
  text,
  integer,
  real,
  timestamp,
  jsonb,
  unique,
  primaryKey,
} from 'drizzle-orm/pg-core'

export const habits = pgTable('habits', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull(),
  version: integer('version').default(1),
  name: text('name').notNull(),
  icon: text('icon'),
  color: text('color'),
  type: text('type').notNull(), // 'binary' | 'quantitative'
  goal_mode: text('goal_mode'), // 'target' | 'track'
  goal_value: real('goal_value'),
  goal_unit: text('goal_unit'),
  schedule_type: text('schedule_type').notNull(), // 'daily' | 'weekly' | 'frequency'
  schedule_days: jsonb('schedule_days'), // array of day strings like ["mon","wed"]
  frequency_target: integer('frequency_target'),
  reminder_enabled: integer('reminder_enabled').default(0),
  reminder_time: text('reminder_time'), // HH:MM
  share_token: text('share_token'), // UUID, nullable, for OG sharing
  created_at: timestamp('created_at').defaultNow(),
  version_start_date: text('version_start_date'), // YYYY-MM-DD ISO string
  archived_at: timestamp('archived_at'),
})

export const habit_completions = pgTable(
  'habit_completions',
  {
    id: text('id').primaryKey(),
    habit_id: text('habit_id').notNull(),
    user_id: text('user_id').notNull(),
    date: text('date').notNull(), // YYYY-MM-DD
    value: real('value').default(1),
    completed_at: text('completed_at').notNull(),
  },
  (table) => [unique().on(table.habit_id, table.date)]
)

export const habit_skips = pgTable(
  'habit_skips',
  {
    id: text('id').primaryKey(),
    habit_id: text('habit_id').notNull(),
    user_id: text('user_id').notNull(),
    date: text('date').notNull(),
    month: text('month').notNull(), // YYYY-MM
    created_at: text('created_at').notNull(),
  },
  (table) => [unique().on(table.habit_id, table.date)]
)

export const skip_token_usage = pgTable(
  'skip_token_usage',
  {
    habit_id: text('habit_id').notNull(),
    user_id: text('user_id').notNull(),
    month: text('month').notNull(), // YYYY-MM
    tokens_used: integer('tokens_used').default(0),
    tokens_max: integer('tokens_max').default(3),
  },
  (table) => [primaryKey({ columns: [table.habit_id, table.month] })]
)

export type Habit = typeof habits.$inferSelect
export type HabitInsert = typeof habits.$inferInsert
export type HabitCompletion = typeof habit_completions.$inferSelect
export type HabitCompletionInsert = typeof habit_completions.$inferInsert
export type HabitSkip = typeof habit_skips.$inferSelect
export type HabitSkipInsert = typeof habit_skips.$inferInsert
export type SkipTokenUsage = typeof skip_token_usage.$inferSelect
export type SkipTokenUsageInsert = typeof skip_token_usage.$inferInsert
