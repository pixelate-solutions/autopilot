import { getDb } from "@/db";
import { auditLogs } from "@/db/schema";

type AuditInput = {
  householdId: string;
  actorUserId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

export async function writeAuditLog(input: AuditInput) {
  const db = getDb();
  await db.insert(auditLogs).values({
    householdId: input.householdId,
    actorUserId: input.actorUserId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: input.metadata ?? {},
  });
}
