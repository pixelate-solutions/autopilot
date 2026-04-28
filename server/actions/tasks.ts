"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { tasks } from "@/db/schema";
import { taskModeUpdateSchema } from "@/lib/validation";
import { assertSameHousehold, requireTenant } from "@/permissions/rbac";
import { evaluateAutopilotCapability } from "@/server/services/capabilities";
import { writeAuditLog } from "@/server/services/audit";

export async function updateTaskHandlingMode(input: unknown) {
  const ctx = await requireTenant("customer");
  const data = taskModeUpdateSchema.parse(input);
  assertSameHousehold(ctx, data.householdId);

  const db = getDb();
  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.householdId, data.householdId), eq(tasks.id, data.taskId)))
    .limit(1);
  if (!task) throw new Error("Task not found.");

  if (!task.allowedModes.includes(data.mode)) {
    throw new Error("Handling mode is not allowed for this task.");
  }

  if (data.mode === "AUTOPILOT") {
    const capability = await evaluateAutopilotCapability({
      householdId: data.householdId,
      serviceType: task.serviceType,
    });
    if (!capability.enabled) {
      throw new Error(capability.reason ?? "Autopilot is not enabled for this task.");
    }
  }

  await db
    .update(tasks)
    .set({ handlingMode: data.mode, updatedAt: new Date() })
    .where(and(eq(tasks.householdId, data.householdId), eq(tasks.id, data.taskId)));

  await writeAuditLog({
    householdId: data.householdId,
    actorUserId: ctx.userId,
    action: "task.handling_mode_updated",
    entityType: "task",
    entityId: data.taskId,
    metadata: { mode: data.mode },
  });

  revalidatePath("/");
}
