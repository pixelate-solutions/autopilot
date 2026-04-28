import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { households, jobs, tasks } from "@/db/schema";
import { jobRequestSchema } from "@/lib/validation";
import { evaluateAutopilotCapability } from "@/server/services/capabilities";
import { generateEstimate } from "@/server/services/pricing";
import { paymentRuleForEstimate } from "@/server/services/payments";

export async function createAutopilotJobDraft(input: unknown) {
  const data = jobRequestSchema.parse(input);
  const db = getDb();

  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.householdId, data.householdId), eq(tasks.id, data.taskId)))
    .limit(1);
  if (!task) throw new Error("Task not found.");

  const capability = await evaluateAutopilotCapability({
    householdId: data.householdId,
    serviceType: task.serviceType,
  });
  if (!capability.enabled || !task.serviceType) {
    throw new Error(capability.reason ?? "Autopilot is not available for this task.");
  }

  const [household] = await db.select().from(households).where(eq(households.id, data.householdId)).limit(1);
  if (!household) throw new Error("Household not found.");

  const estimate = await generateEstimate({
    householdId: data.householdId,
    serviceType: task.serviceType,
  });
  const paymentRule = paymentRuleForEstimate(estimate.estimateCents);
  const underAutoApproval = estimate.estimateCents <= household.autoApprovalLimitCents;
  const approvalRequired = paymentRule !== "auto_charge" || !underAutoApproval;

  const [job] = await db
    .insert(jobs)
    .values({
      householdId: data.householdId,
      taskId: task.id,
      serviceType: task.serviceType,
      estimateCents: estimate.estimateCents,
      approvalRequired,
      status: approvalRequired ? "approval_required" : "scheduled",
      paymentStatus: "estimate",
      assignedTechnicianId: capability.assignmentType === "technician" ? capability.assigneeId : undefined,
      assignedVendorId: capability.assignmentType === "vendor" ? capability.assigneeId : undefined,
      scheduledStart: approvalRequired ? null : data.requestedWindowStart ?? new Date(Date.now() + 48 * 60 * 60 * 1000),
      scheduledEnd: approvalRequired ? null : data.requestedWindowEnd ?? new Date(Date.now() + 50 * 60 * 60 * 1000),
    })
    .returning();

  return { job, estimate, paymentRule };
}
