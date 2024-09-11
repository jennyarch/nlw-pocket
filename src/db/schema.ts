import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

//Observar que entre 'goals' é o nome q ira estar no banco de dado, por isso é interessante não fazer kamelcase, já o nome da const pode ser normal pois será utilizado dentro do js
export const goals = pgTable('goals', {
    id: text('id').primaryKey().$defaultFn(() => createId()),//Essa função ocorre do lado do js, nesse caso não necessica de migration
    title: text('title').notNull(),
    desiredWeeklyFrequency: integer('desired_weekly_frequency').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const goalCompletions = pgTable('goal_completions', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    goalId: text('goal_id')
    .references(() => goals.id)//a references está referenciando como o nome já diz uma forenkey, ou seja chave estrangeira da Table acima a goals
    .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})