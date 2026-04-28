import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import type { UserRole } from "@/lib/types";

const roleRank: Record<UserRole, number> = {
  customer: 1,
  technician: 2,
  admin: 3,
  owner: 4,
};

export type TenantContext = {
  householdId: string;
  userId: string;
  role: UserRole;
};

export async function requireTenant(requiredRole: UserRole = "customer"): Promise<TenantContext> {
  const session = await auth();
  if (!session.userId) {
    throw new Error("Authentication required.");
  }

  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, session.userId))
    .limit(1);

  if (!user) {
    throw new Error("No Autopilot user record exists for this Clerk identity.");
  }

  if (roleRank[user.role] < roleRank[requiredRole]) {
    throw new Error("Insufficient permissions.");
  }

  return {
    householdId: user.householdId,
    userId: user.id,
    role: user.role,
  };
}

export function assertSameHousehold(ctx: TenantContext, householdId: string) {
  if (ctx.householdId !== householdId) {
    throw new Error("Cross-tenant access denied.");
  }
}

export function scopedByHousehold<T extends { householdId: AnyPgColumn }>(
  table: T,
  householdId: string,
) {
  return eq(table.householdId, householdId);
}

export function scopedEntity<T extends { householdId: AnyPgColumn; id: AnyPgColumn }>(
  table: T,
  householdId: string,
  id: string,
) {
  return and(eq(table.householdId, householdId), eq(table.id, id));
}
