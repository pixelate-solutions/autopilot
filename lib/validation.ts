import { z } from "zod";
import { HANDLING_MODES, JOB_STATUSES, MEMORY_TYPES, TASK_STATUSES, USER_ROLES } from "@/lib/types";

export const uuidSchema = z.string().uuid();
export const householdIdSchema = uuidSchema;

export const roleSchema = z.enum(USER_ROLES);
export const handlingModeSchema = z.enum(HANDLING_MODES);
export const taskStatusSchema = z.enum(TASK_STATUSES);
export const memoryTypeSchema = z.enum(MEMORY_TYPES);
export const jobStatusSchema = z.enum(JOB_STATUSES);

export const onboardingSchema = z.object({
  address: z.string().trim().min(3).max(180).optional(),
  zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/).optional(),
  homeType: z.enum(["single_family", "townhome", "condo", "apartment", "multi_family"]),
  ownership: z.enum(["own", "rent", "managed"]),
  hasYard: z.boolean(),
  householdSize: z.coerce.number().int().min(1).max(12),
  hasVehicles: z.boolean(),
  automationPreference: z.enum(["mostly_notify", "guide_me", "autopilot_when_safe"]),
}).refine((data) => data.address || data.zip, {
  message: "Provide either an address or a ZIP code.",
  path: ["address"],
});

export const aiTaskSchema = z.object({
  title: z.string().trim().min(4).max(120),
  description: z.string().trim().min(12).max(1200),
  category: z.string().trim().min(2).max(80),
  cadence: z.enum(["once", "weekly", "monthly", "quarterly", "seasonal", "annual"]),
  season: z.enum(["winter", "spring", "summer", "fall", "all"]).default("all"),
  estimatedMinutes: z.number().int().min(5).max(480),
  handlingModes: z.array(handlingModeSchema).min(1),
  serviceType: z.string().trim().max(80).nullable(),
  riskLevel: z.enum(["low", "medium", "high"]),
  rationale: z.string().trim().min(8).max(800),
});

export const aiTaskPlanSchema = z.object({
  tasks: z.array(aiTaskSchema).min(20).max(30),
  householdSummary: z.string().trim().min(20).max(1200),
  profilingQuestions: z.array(z.string().trim().min(6).max(160)).max(5),
});

export const createMemorySchema = z.object({
  householdId: householdIdSchema,
  type: memoryTypeSchema,
  content: z.string().trim().min(2).max(4000),
  source: z.string().trim().min(2).max(80),
  confidence: z.number().min(0).max(1),
  importance: z.number().int().min(1).max(10),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const updateMemorySchema = z.object({
  householdId: householdIdSchema,
  memoryId: uuidSchema,
  content: z.string().trim().min(2).max(4000).optional(),
  confidence: z.number().min(0).max(1).optional(),
  importance: z.number().int().min(1).max(10).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const retrieveMemorySchema = z.object({
  householdId: householdIdSchema,
  query: z.string().trim().min(2).max(1000),
  limit: z.number().int().min(1).max(20).default(8),
  types: z.array(memoryTypeSchema).optional(),
});

export const taskModeUpdateSchema = z.object({
  householdId: householdIdSchema,
  taskId: uuidSchema,
  mode: handlingModeSchema,
});

export const jobRequestSchema = z.object({
  householdId: householdIdSchema,
  taskId: uuidSchema,
  requestedWindowStart: z.coerce.date().optional(),
  requestedWindowEnd: z.coerce.date().optional(),
});

export const feedbackSchema = z.object({
  householdId: householdIdSchema,
  taskId: uuidSchema.optional(),
  jobId: uuidSchema.optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1200).optional(),
}).refine((data) => data.taskId || data.jobId, {
  message: "Feedback must refer to a task or job.",
});
