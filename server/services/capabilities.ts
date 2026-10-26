import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { households, serviceCapabilities, technicians, vendors } from "@/db/schema";
import type { AutopilotCapability } from "@/lib/types";

export async function evaluateAutopilotCapability(input: {
  householdId: string;
  serviceType: string | null;
}): Promise<AutopilotCapability> {
  if (!input.serviceType) {
    return { enabled: false, reason: "No executable service is attached to this task." };
  }
  const serviceType = input.serviceType;

  const db = getDb();
  const [household] = await db.select().from(households).where(eq(households.id, input.householdId)).limit(1);
  if (!household) return { enabled: false, reason: "Household not found." };

  const [capability] = await db
    .select()
    .from(serviceCapabilities)
    .where(and(
      eq(serviceCapabilities.householdId, input.householdId),
      eq(serviceCapabilities.serviceType, serviceType),
      eq(serviceCapabilities.active, true),
      eq(serviceCapabilities.available, true),
    ))
    .limit(1);

  if (!capability) {
    const [technician] = await db
      .select()
      .from(technicians)
      .where(eq(technicians.active, true))
      .then((rows) => rows.filter((tech) => tech.serviceTypes.includes(serviceType)))
      .then((rows) => rows.slice(0, 1));

    if (technician) {
      return {
        enabled: true,
        assignmentType: "technician",
        assigneeId: technician.id,
      };
    }

    return { enabled: false, reason: "Service is not available yet." };
  }

  const covered = capability.coverageZipPrefixes.some((prefix) => household.zip.startsWith(prefix));
  if (!covered) {
    return { enabled: false, reason: "Coverage does not match the household location." };
  }

  const techRows = capability.technicianIds.length
    ? await db
        .select()
        .from(technicians)
        .where(and(eq(technicians.householdId, input.householdId), eq(technicians.active, true)))
    : [];

  const technician = techRows.find((tech) =>
    capability.technicianIds.includes(tech.id) && tech.serviceTypes.includes(serviceType),
  );
  if (technician) {
    return {
      enabled: true,
      serviceCapabilityId: capability.id,
      assignmentType: "technician",
      assigneeId: technician.id,
    };
  }

  const vendorRows = capability.vendorIds.length
    ? await db
        .select()
        .from(vendors)
        .where(and(eq(vendors.householdId, input.householdId), eq(vendors.active, true)))
    : [];
  const vendor = vendorRows.find((candidate) =>
    capability.vendorIds.includes(candidate.id) && candidate.serviceTypes.includes(serviceType),
  );

  if (vendor) {
    return {
      enabled: true,
      serviceCapabilityId: capability.id,
      assignmentType: "vendor",
      assigneeId: vendor.id,
    };
  }

  return { enabled: false, reason: "No technician or vendor is currently available." };
}
