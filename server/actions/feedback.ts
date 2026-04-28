"use server";

import { getDb } from "@/db";
import { feedback } from "@/db/schema";
import { createMemory } from "@/memory";
import { feedbackSchema } from "@/lib/validation";
import { assertSameHousehold, requireTenant } from "@/permissions/rbac";

export async function submitFeedback(input: unknown) {
  const ctx = await requireTenant("customer");
  const data = feedbackSchema.parse(input);
  assertSameHousehold(ctx, data.householdId);
  const db = getDb();

  const [created] = await db.insert(feedback).values(data).returning();
  await createMemory({
    householdId: data.householdId,
    type: "behavior",
    content: `Feedback rating ${data.rating}/5. ${data.comment ?? ""}`.trim(),
    source: "feedback",
    confidence: 0.85,
    importance: data.rating <= 2 ? 9 : 6,
    metadata: { feedbackId: created.id, taskId: data.taskId, jobId: data.jobId },
  });

  return created;
}
