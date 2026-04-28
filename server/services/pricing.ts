import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { serviceCapabilities } from "@/db/schema";

const taskHourDefaults: Record<string, number> = {
  hvac: 1.5,
  plumbing: 1.25,
  electrical: 1.5,
  handyman: 2,
  landscaping: 2,
  appliance_repair: 1.5,
  pest_control: 1,
  smart_home: 1.25,
  auto: 1,
};

export async function generateEstimate(input: {
  householdId: string;
  serviceType: string;
  materialCostCents?: number;
}) {
  const db = getDb();
  const [capability] = await db
    .select()
    .from(serviceCapabilities)
    .where(and(
      eq(serviceCapabilities.householdId, input.householdId),
      eq(serviceCapabilities.serviceType, input.serviceType),
    ))
    .limit(1);

  if (!capability) {
    throw new Error("Cannot estimate without a matching service capability.");
  }

  const hours = taskHourDefaults[input.serviceType] ?? 1.5;
  const labor = Math.round(hours * capability.hourlyRateCents);
  const materialCost = input.materialCostCents ?? 0;
  const markupPct = Number(capability.materialMarkupPct) / 100;
  const materials = Math.round(materialCost * (1 + markupPct));

  return {
    estimateCents: capability.baseTripFeeCents + labor + materials,
    laborCents: labor,
    materialsCents: materials,
    tripFeeCents: capability.baseTripFeeCents,
    markupPct,
  };
}
