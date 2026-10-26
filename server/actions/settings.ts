"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { households } from "@/db/schema";
import { settingsUpdateSchema } from "@/lib/validation";
import { assertSameHousehold, requireTenant } from "@/permissions/rbac";
import { writeAuditLog } from "@/server/services/audit";

export async function updateHouseholdSettings(formData: FormData) {
  const ctx = await requireTenant("customer");
  const householdId = String(formData.get("householdId"));
  const windows = parseAvailability(formData.get("customerAvailability")?.toString() ?? "");
  const data = settingsUpdateSchema.parse({
    householdId,
    householdName: formData.get("householdName"),
    automationPreference: formData.get("automationPreference"),
    autoApprovalLimitCents: Math.round(Number(formData.get("autoApprovalLimitDollars") ?? 0) * 100),
    customerAvailability: windows,
  });
  assertSameHousehold(ctx, data.householdId);

  const db = getDb();
  await db
    .update(households)
    .set({
      name: data.householdName,
      automationPreference: data.automationPreference,
      autoApprovalLimitCents: data.autoApprovalLimitCents,
      customerAvailability: data.customerAvailability,
      updatedAt: new Date(),
    })
    .where(and(eq(households.id, data.householdId), eq(households.id, ctx.householdId)));

  await writeAuditLog({
    householdId: data.householdId,
    actorUserId: ctx.userId,
    action: "settings.updated",
    entityType: "household",
    entityId: data.householdId,
  });

  revalidatePath("/settings");
  revalidatePath("/calendar");
}

function parseAvailability(input: string) {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [day, times] = line.split(/\s+/);
      const [start, end] = (times ?? "").split("-");
      return { day: day?.toLowerCase(), start, end };
    });
}
