export const USER_ROLES = ["customer", "technician", "admin", "owner"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const HANDLING_MODES = ["NOTIFY", "GUIDE", "AUTOPILOT", "IGNORE"] as const;
export type HandlingMode = (typeof HANDLING_MODES)[number];

export const TASK_STATUSES = [
  "planned",
  "scheduled",
  "completed",
  "skipped",
  "archived",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const MEMORY_TYPES = [
  "household_fact",
  "preference",
  "behavior",
  "conversation",
  "aggregated_pattern",
] as const;
export type MemoryType = (typeof MEMORY_TYPES)[number];

export const JOB_STATUSES = [
  "draft",
  "estimate_pending",
  "approval_required",
  "scheduled",
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export type AutopilotCapability = {
  enabled: boolean;
  reason?: string;
  serviceCapabilityId?: string;
  assignmentType?: "technician" | "vendor";
  assigneeId?: string;
};
