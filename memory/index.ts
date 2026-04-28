import { and, cosineDistance, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { aiMemories } from "@/db/schema";
import { embedText } from "@/ai/openai";
import {
  createMemorySchema,
  retrieveMemorySchema,
  updateMemorySchema,
  uuidSchema,
} from "@/lib/validation";
import type { MemoryType } from "@/lib/types";

export async function createMemory(input: unknown) {
  const data = createMemorySchema.parse(input);
  const db = getDb();
  const embedding = await embedText(data.content);
  const [memory] = await db
    .insert(aiMemories)
    .values({
      ...data,
      embedding,
    })
    .returning();

  return memory;
}

export async function retrieveRelevantMemories(input: unknown) {
  const data = retrieveMemorySchema.parse(input);
  const db = getDb();
  const embedding = await embedText(data.query);
  const similarity = sql<number>`1 - (${cosineDistance(aiMemories.embedding, embedding)})`;

  const where = and(
    eq(aiMemories.householdId, data.householdId),
    isNull(aiMemories.archivedAt),
    data.types?.length ? inArray(aiMemories.type, data.types as MemoryType[]) : undefined,
  );

  return db
    .select({
      id: aiMemories.id,
      type: aiMemories.type,
      content: aiMemories.content,
      source: aiMemories.source,
      confidence: aiMemories.confidence,
      importance: aiMemories.importance,
      metadata: aiMemories.metadata,
      createdAt: aiMemories.createdAt,
      similarity,
    })
    .from(aiMemories)
    .where(where)
    .orderBy(desc(similarity), desc(aiMemories.importance), desc(aiMemories.updatedAt))
    .limit(data.limit);
}

export async function updateMemory(input: unknown) {
  const data = updateMemorySchema.parse(input);
  const db = getDb();
  const values: Partial<typeof aiMemories.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (data.content) {
    values.content = data.content;
    values.embedding = await embedText(data.content);
  }
  if (data.confidence !== undefined) values.confidence = data.confidence;
  if (data.importance !== undefined) values.importance = data.importance;
  if (data.metadata !== undefined) values.metadata = data.metadata;

  const [memory] = await db
    .update(aiMemories)
    .set(values)
    .where(and(eq(aiMemories.householdId, data.householdId), eq(aiMemories.id, data.memoryId)))
    .returning();

  return memory;
}

export async function archiveMemory(householdId: string, memoryId: string) {
  uuidSchema.parse(householdId);
  uuidSchema.parse(memoryId);

  const db = getDb();
  const [memory] = await db
    .update(aiMemories)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(aiMemories.householdId, householdId), eq(aiMemories.id, memoryId)))
    .returning();

  return memory;
}
