import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { households, users } from "@/db/schema";

export async function requirePageContext() {
  const session = await auth();
  if (!session.userId) redirect("/");

  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.clerkUserId, session.userId)).limit(1);
  if (!user) redirect("/onboarding");

  const [household] = await db.select().from(households).where(eq(households.id, user.householdId)).limit(1);
  if (!household) redirect("/onboarding");

  return { db, user, household, householdId: household.id };
}
