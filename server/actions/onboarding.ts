"use server";

import { auth } from "@clerk/nextjs/server";
import { addDays } from "date-fns";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { households, tasks, users } from "@/db/schema";
import { generateHouseholdPlan } from "@/ai/planner";
import { createMemory } from "@/memory";
import { onboardingSchema } from "@/lib/validation";
import { encryptSensitive } from "@/server/services/encryption";

export async function completeOnboarding(formData: FormData) {
  const session = await auth();
  if (!session.userId) throw new Error("Authentication required.");

  const parsed = onboardingSchema.parse({
    address: formData.get("address")?.toString() || undefined,
    zip: formData.get("zip")?.toString() || undefined,
    homeType: formData.get("homeType"),
    ownership: formData.get("ownership"),
    hasYard: formData.get("hasYard") === "on",
    householdSize: formData.get("householdSize"),
    hasVehicles: formData.get("hasVehicles") === "on",
    automationPreference: formData.get("automationPreference"),
  });

  const db = getDb();
  const [household] = await db
    .insert(households)
    .values({
      name: "My Household",
      addressEncrypted: parsed.address ? encryptSensitive(parsed.address) : null,
      zip: parsed.zip ?? parsed.address?.match(/\b\d{5}\b/)?.[0] ?? "00000",
      homeType: parsed.homeType,
      ownership: parsed.ownership,
      hasYard: parsed.hasYard,
      householdSize: parsed.householdSize,
      hasVehicles: parsed.hasVehicles,
      automationPreference: parsed.automationPreference,
    })
    .returning();

  await db.insert(users).values({
    householdId: household.id,
    clerkUserId: session.userId,
    email: session.sessionClaims?.email as string ?? "customer@example.com",
    name: session.sessionClaims?.name as string ?? "Customer",
    role: "owner",
  });

  const plan = await generateHouseholdPlan(household.id, parsed);
  await db.insert(tasks).values(
    plan.tasks.map((task, index) => ({
      householdId: household.id,
      title: task.title,
      description: task.description,
      category: task.category,
      cadence: task.cadence,
      season: task.season,
      allowedModes: task.handlingModes,
      serviceType: task.serviceType,
      dueAt: addDays(new Date(), index + 1),
      source: "ai",
      aiRationale: task.rationale,
      metadata: { riskLevel: task.riskLevel, estimatedMinutes: task.estimatedMinutes },
    })),
  );

  await createMemory({
    householdId: household.id,
    type: "household_fact",
    content: plan.householdSummary,
    source: "onboarding",
    confidence: 0.92,
    importance: 8,
    metadata: { onboarding: parsed },
  });

  redirect("/");
}
