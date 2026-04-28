import { and, eq, lte } from "drizzle-orm";
import { getDb } from "@/db";
import { tasks } from "@/db/schema";
import { nextDueDate } from "@/scheduling/engine";

export async function generateRecurringTasks(householdId: string) {
  const db = getDb();
  const dueTasks = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.householdId, householdId), eq(tasks.status, "completed"), lte(tasks.nextEligibleAt, new Date())));

  const inserted = [];
  for (const task of dueTasks) {
    const next = nextDueDate({ cadence: task.cadence, from: task.lastCompletedAt ?? new Date() });
    const [created] = await db
      .insert(tasks)
      .values({
        householdId,
        templateId: task.templateId,
        title: task.title,
        description: task.description,
        category: task.category,
        cadence: task.cadence,
        season: task.season,
        allowedModes: task.allowedModes,
        serviceType: task.serviceType,
        dueAt: next,
        nextEligibleAt: next,
        source: task.source,
        metadata: task.metadata,
      })
      .returning();
    inserted.push(created);
  }

  return inserted;
}
