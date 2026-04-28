import { and, eq, isNull, lte } from "drizzle-orm";
import { getDb } from "@/db";
import { notifications, tasks } from "@/db/schema";
import { notificationWindows } from "@/scheduling/engine";

export async function scheduleTaskNotifications(input: {
  householdId: string;
  taskId: string;
  dueAt: Date;
}) {
  const db = getDb();
  const windows = notificationWindows(input.dueAt).filter((date) => date > new Date());
  if (!windows.length) return [];

  return db
    .insert(notifications)
    .values(
      windows.map((scheduledFor) => ({
        householdId: input.householdId,
        taskId: input.taskId,
        channel: "email",
        scheduledFor,
        payload: { template: "task_due" },
      })),
    )
    .returning();
}

export async function cancelTaskNotifications(input: { householdId: string; taskId: string }) {
  const db = getDb();
  await db
    .update(notifications)
    .set({ cancelledAt: new Date() })
    .where(and(
      eq(notifications.householdId, input.householdId),
      eq(notifications.taskId, input.taskId),
      isNull(notifications.sentAt),
      isNull(notifications.cancelledAt),
    ));
}

export async function sendDueNotifications(householdId: string) {
  const db = getDb();
  const due = await db
    .select()
    .from(notifications)
    .where(and(
      eq(notifications.householdId, householdId),
      isNull(notifications.sentAt),
      isNull(notifications.cancelledAt),
      lte(notifications.scheduledFor, new Date()),
    ));

  for (const notification of due) {
    if (notification.taskId) {
      const [task] = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.householdId, householdId), eq(tasks.id, notification.taskId)))
        .limit(1);
      if (task?.status === "completed") {
        await cancelTaskNotifications({ householdId, taskId: task.id });
        continue;
      }
    }

    await db
      .update(notifications)
      .set({ sentAt: new Date() })
      .where(and(eq(notifications.householdId, householdId), eq(notifications.id, notification.id)));
  }

  return due.length;
}
