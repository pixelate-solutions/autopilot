"use server";

import { revalidatePath } from "next/cache";
import { jobRequestSchema } from "@/lib/validation";
import { assertSameHousehold, requireTenant } from "@/permissions/rbac";
import { createAutopilotJobDraft } from "@/server/services/jobs";
import { writeAuditLog } from "@/server/services/audit";

export async function triggerAutopilotJob(input: unknown) {
  const ctx = await requireTenant("customer");
  const data = jobRequestSchema.parse(input);
  assertSameHousehold(ctx, data.householdId);

  const result = await createAutopilotJobDraft(data);
  await writeAuditLog({
    householdId: data.householdId,
    actorUserId: ctx.userId,
    action: "job.created_from_task",
    entityType: "job",
    entityId: result.job.id,
    metadata: { paymentRule: result.paymentRule, estimateCents: result.estimate.estimateCents },
  });

  revalidatePath("/");
  return result;
}
