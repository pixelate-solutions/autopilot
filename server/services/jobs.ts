import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { households, jobs, tasks } from "@/db/schema";
import { jobRequestSchema } from "@/lib/validation";
import { evaluateAutopilotCapability } from "@/server/services/capabilities";
import { generateEstimate } from "@/server/services/pricing";
import { paymentRuleForEstimate } from "@/server/services/payments";
import { findAutomaticAssignment } from "@/scheduling/assignment";

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
  const assignment = await findAutomaticAssignment({
    householdId: data.householdId,
    serviceType: task.serviceType,
    requestedWindowStart: data.requestedWindowStart,
    requestedWindowEnd: data.requestedWindowEnd,
  });

  const [job] = await db
    .insert(jobs)
    .values({
      householdId: data.householdId,
      taskId: task.id,
      serviceType: task.serviceType,
      estimateCents: estimate.estimateCents,
      approvalRequired,
      status: approvalRequired ? "approval_required" : assignment ? "scheduled" : "estimate_pending",
      paymentStatus: "estimate",
      assignedTechnicianId: assignment?.technician.id ?? (capability.assignmentType === "technician" ? capability.assigneeId : undefined),
      assignedVendorId: capability.assignmentType === "vendor" ? capability.assigneeId : undefined,
      scheduledStart: approvalRequired ? null : assignment?.scheduledStart ?? null,
      scheduledEnd: approvalRequired ? null : assignment?.scheduledEnd ?? null,
      notes: assignment ? "Automatically assigned from customer and technician availability." : "No matching schedule window was found automatically.",
    })
    .returning();

  return { job, estimate, paymentRule };
}
