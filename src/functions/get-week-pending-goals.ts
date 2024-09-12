import dayjs from "dayjs";
import { db } from "../db";
import { goalCompletions, goals } from "../db/schema";
import { and, sql, lte, count, gte, eq } from 'drizzle-orm';

export async function getWeekPendingGoals(){
    const firstDayOfWeek = dayjs().startOf('week').toDate()
    const lastDayOfWeek = dayjs().endOf('week').toDate()

    //É um exemplo de uma (COLUMN TABLE EXPRESSION) DO SQL
    const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
        /*
            No Drizzle ORM, a cláusula lte (abreviação de less than or equal to) 
            é usada para realizar consultas em que você deseja comparar se o valor de 
            um campo é menor ou igual a um determinado valor.
        */
        db.select({
            id: goals.id,
            title: goals.title,
            desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
            createdAt: goals.createdAt,
        })
        .from(goals)
        .where(lte(goals.createdAt, lastDayOfWeek))
    )

    const goalCompletionCounts = db.$with('goal_completion_counts').as(
        db.select({
            goalId: goalCompletions.goalId,
            completionCount: count(goalCompletions.id).as('completionCount'),
        })
        .from(goalCompletions)
        .where(
            and(
                gte(goalCompletions.createdAt, firstDayOfWeek),
                lte(goalCompletions.createdAt, lastDayOfWeek)
            )
        )
        .groupBy(goalCompletions.goalId)
    )

    //Observar que quando não adiciono o $ no with, siginifica que ele não será uma COLUMN TABLE EXPRESSION
    const pendingGoals = await db
    .with(goalsCreatedUpToWeek, goalCompletionCounts)
    .select({
        id: goalsCreatedUpToWeek.id,
        title: goalsCreatedUpToWeek.title,
        desiredWeeklyFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
        completionCount: sql`
            COALESCE(${goalCompletionCounts.completionCount}, 0)
        `.mapWith(Number),
    })
    .from(goalsCreatedUpToWeek)
    .leftJoin(
        goalCompletionCounts, 
        eq(goalCompletionCounts.goalId, goalsCreatedUpToWeek.id)
    )

    return { pendingGoals }
}