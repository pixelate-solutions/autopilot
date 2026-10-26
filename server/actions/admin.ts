"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { jobs, technicians, users } from "@/db/schema";
import { employeeRoleUpdateSchema, jobAssignmentSchema, technicianUpdateSchema } from "@/lib/validation";
import { assertSameHousehold, requireTenant } from "@/permissions/rbac";
import { findAutomaticAssignment } from "@/scheduling/assignment";
import { writeAuditLog } from "@/server/services/audit";

export async function updateEmployeeRole(formData: FormData) {
  const ctx = await requireTenant("owner");
  const data = employeeRoleUpdateSchema.parse({
    householdId: formData.get("householdId"),
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  assertSameHousehold(ctx, data.householdId);

  const db = getDb();
  await db
    .update(users)
    .set({ role: data.role, updatedAt: new Date() })
    .where(and(eq(users.householdId, data.householdId), eq(users.id, data.userId)));

  await writeAuditLog({
    householdId: data.householdId,
    actorUserId: ctx.userId,
    action: "employee.role_updated",
    entityType: "user",
    entityId: data.userId,
    metadata: { role: data.role },
  });

  revalidatePath("/admin/technicians");
}

export async function upsertTechnician(formData: FormData) {
  const ctx = await requireTenant("owner");
  const data = technicianUpdateSchema.parse({
    householdId: formData.get("householdId"),
    technicianId: formData.get("technicianId") || undefined,
    userId: formData.get("userId") || undefined,
    name: formData.get("name"),
    email: formData.get("email"),
    serviceTypes: String(formData.get("serviceTypes") ?? "").split(",").map((item) => item.trim()).filter(Boolean),
    homeBaseZip: formData.get("homeBaseZip"),
    geoRadiusMiles: formData.get("geoRadiusMiles"),
    availability: parseAvailability(formData.get("availability")?.toString() ?? ""),
    active: formData.get("active") !== "off",
  });
  assertSameHousehold(ctx, data.householdId);

  const db = getDb();
  const values = {
    householdId: data.householdId,
    userId: data.userId,
    name: data.name,
    email: data.email,
    serviceTypes: data.serviceTypes,
    homeBaseZip: data.homeBaseZip,
    geoRadiusMiles: data.geoRadiusMiles,
    availability: data.availability,
    active: data.active,
  };

  if (data.technicianId) {
    await db
      .update(technicians)
      .set(values)
      .where(and(eq(technicians.householdId, data.householdId), eq(technicians.id, data.technicianId)));
  } else {
    await db.insert(technicians).values(values);
  }

  if (data.userId) {
    await db
      .update(users)
      .set({ role: "technician", updatedAt: new Date() })
      .where(and(eq(users.householdId, data.householdId), eq(users.id, data.userId)));
  }

  await writeAuditLog({
    householdId: data.householdId,
    actorUserId: ctx.userId,
    action: "technician.upserted",
    entityType: "technician",
    entityId: data.technicianId,
    metadata: { serviceTypes: data.serviceTypes },
  });

  revalidatePath("/admin/technicians");
}

export async function updateJobAssignment(formData: FormData) {
  const ctx = await requireTenant("owner");
  const data = jobAssignmentSchema.parse({
    householdId: formData.get("householdId"),
    jobId: formData.get("jobId"),
    technicianId: formData.get("technicianId") || undefined,
    scheduledStart: formData.get("scheduledStart") || undefined,
    scheduledEnd: formData.get("scheduledEnd") || undefined,
    status: formData.get("status") || undefined,
  });
  assertSameHousehold(ctx, data.householdId);

  const db = getDb();
  await db
    .update(jobs)
    .set({
      assignedTechnicianId: data.technicianId,
      scheduledStart: data.scheduledStart,
      scheduledEnd: data.scheduledEnd,
      status: data.status ?? "scheduled",
      updatedAt: new Date(),
    })
    .where(and(eq(jobs.householdId, data.householdId), eq(jobs.id, data.jobId)));

  await writeAuditLog({
    householdId: data.householdId,
    actorUserId: ctx.userId,
    action: "job.assignment_updated",
    entityType: "job",
    entityId: data.jobId,
  });

  revalidatePath("/admin/jobs");
  revalidatePath("/calendar");
}

export async function autoScheduleJob(formData: FormData) {
  const ctx = await requireTenant("owner");
  const householdId = String(formData.get("householdId"));
  const jobId = String(formData.get("jobId"));
  assertSameHousehold(ctx, householdId);

  const db = getDb();
  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.householdId, householdId), eq(jobs.id, jobId)))
    .limit(1);
  if (!job) throw new Error("Job not found.");

  const assignment = await findAutomaticAssignment({ householdId, serviceType: job.serviceType });
  if (!assignment) throw new Error("No matching customer and technician availability window found.");

  await db
    .update(jobs)
    .set({
      assignedTechnicianId: assignment.technician.id,
      scheduledStart: assignment.scheduledStart,
      scheduledEnd: assignment.scheduledEnd,
      status: job.approvalRequired ? "approval_required" : "scheduled",
      notes: "Automatically scheduled from customer and technician availability.",
      updatedAt: new Date(),
    })
    .where(and(eq(jobs.householdId, householdId), eq(jobs.id, jobId)));

  revalidatePath("/admin/jobs");
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
