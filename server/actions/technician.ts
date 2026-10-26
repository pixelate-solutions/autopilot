"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { jobs, technicians } from "@/db/schema";
import { requireTenant } from "@/permissions/rbac";
import { writeAuditLog } from "@/server/services/audit";

export async function updateTechnicianJobStatus(formData: FormData) {
  const ctx = await requireTenant("technician");
  const jobId = String(formData.get("jobId"));
  const status = String(formData.get("status"));
  if (!["in_progress", "completed", "cancelled"].includes(status)) {
    throw new Error("Invalid job status.");
  }

  const db = getDb();
  const [technician] = await db
    .select()
    .from(technicians)
    .where(and(eq(technicians.householdId, ctx.householdId), eq(technicians.userId, ctx.userId)))
    .limit(1);
  if (!technician && ctx.role !== "owner" && ctx.role !== "admin") {
    throw new Error("Technician profile required.");
  }

  const [job] = await db
    .select()
    .from(jobs)
    .where(
      technician
        ? and(eq(jobs.id, jobId), eq(jobs.assignedTechnicianId, technician.id))
        : eq(jobs.id, jobId),
    )
    .limit(1);
  if (!job) throw new Error("Job not found.");

  await db
    .update(jobs)
    .set({ status: status as "in_progress" | "completed" | "cancelled", updatedAt: new Date() })
    .where(eq(jobs.id, jobId));

  await writeAuditLog({
    householdId: job.householdId,
    actorUserId: ctx.userId,
    action: "technician.job_status_updated",
    entityType: "job",
    entityId: jobId,
    metadata: { status },
  });

  revalidatePath("/technician");
  revalidatePath(`/technician/jobs/${jobId}`);
  revalidatePath("/calendar");
}
