import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userRole = pgEnum("user_role", ["customer", "technician", "admin", "owner"]);
export const subscriptionTier = pgEnum("subscription_tier", ["guided", "autopilot"]);
export const taskStatus = pgEnum("task_status", ["planned", "scheduled", "completed", "skipped", "archived"]);
export const handlingMode = pgEnum("handling_mode", ["NOTIFY", "GUIDE", "AUTOPILOT", "IGNORE"]);
export const memoryType = pgEnum("memory_type", ["household_fact", "preference", "behavior", "conversation", "aggregated_pattern"]);
export const jobStatus = pgEnum("job_status", ["draft", "estimate_pending", "approval_required", "scheduled", "assigned", "in_progress", "completed", "cancelled"]);
export const paymentStatus = pgEnum("payment_status", ["not_required", "estimate", "authorized", "deposit_paid", "paid", "failed", "refunded"]);

export const households = pgTable("households", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  addressEncrypted: text("address_encrypted"),
  zip: text("zip").notNull(),
  homeType: text("home_type").notNull(),
  ownership: text("ownership").notNull(),
  hasYard: boolean("has_yard").notNull().default(false),
  householdSize: integer("household_size").notNull(),
  hasVehicles: boolean("has_vehicles").notNull().default(false),
  automationPreference: text("automation_preference").notNull(),
  autoApprovalLimitCents: integer("auto_approval_limit_cents").notNull().default(15000),
  subscriptionTier: subscriptionTier("subscription_tier").notNull().default("guided"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  householdId: uuid("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  clerkUserId: text("clerk_user_id").notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: userRole("role").notNull().default("customer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  householdIdx: index("users_household_idx").on(table.householdId),
  clerkIdx: uniqueIndex("users_clerk_idx").on(table.clerkUserId),
}));

export const taskTemplates = pgTable("task_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  cadence: text("cadence").notNull(),
  season: text("season").notNull().default("all"),
  defaultEstimatedMinutes: integer("default_estimated_minutes").notNull(),
  allowedModes: jsonb("allowed_modes").$type<string[]>().notNull(),
  serviceType: text("service_type"),
  riskLevel: text("risk_level").notNull().default("low"),
  source: text("source").notNull().default("library"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  slugIdx: uniqueIndex("task_templates_slug_idx").on(table.slug),
}));

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  householdId: uuid("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  templateId: uuid("template_id").references(() => taskTemplates.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  cadence: text("cadence").notNull(),
  season: text("season").notNull().default("all"),
  status: taskStatus("status").notNull().default("planned"),
  handlingMode: handlingMode("handling_mode").notNull().default("NOTIFY"),
  allowedModes: jsonb("allowed_modes").$type<string[]>().notNull(),
  serviceType: text("service_type"),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  lastCompletedAt: timestamp("last_completed_at", { withTimezone: true }),
  nextEligibleAt: timestamp("next_eligible_at", { withTimezone: true }),
  source: text("source").notNull().default("library"),
  aiRationale: text("ai_rationale"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantDueIdx: index("tasks_household_due_idx").on(table.householdId, table.dueAt),
  tenantStatusIdx: index("tasks_household_status_idx").on(table.householdId, table.status),
}));

export const vendors = pgTable("vendors", {
  id: uuid("id").primaryKey().defaultRandom(),
  householdId: uuid("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  serviceTypes: jsonb("service_types").$type<string[]>().notNull(),
  coverageZipPrefixes: jsonb("coverage_zip_prefixes").$type<string[]>().notNull(),
  hourlyRateCents: integer("hourly_rate_cents").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index("vendors_household_idx").on(table.householdId),
}));

export const technicians = pgTable("technicians", {
  id: uuid("id").primaryKey().defaultRandom(),
  householdId: uuid("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  serviceTypes: jsonb("service_types").$type<string[]>().notNull(),
  certifications: jsonb("certifications").$type<string[]>().notNull().default([]),
  homeBaseZip: text("home_base_zip").notNull(),
  geoRadiusMiles: integer("geo_radius_miles").notNull(),
  availability: jsonb("availability").$type<Record<string, unknown>>().notNull().default({}),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index("technicians_household_idx").on(table.householdId),
}));

export const serviceCapabilities = pgTable("service_capabilities", {
  id: uuid("id").primaryKey().defaultRandom(),
  householdId: uuid("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  serviceType: text("service_type").notNull(),
  available: boolean("available").notNull().default(false),
  coverageZipPrefixes: jsonb("coverage_zip_prefixes").$type<string[]>().notNull().default([]),
  technicianIds: jsonb("technician_ids").$type<string[]>().notNull().default([]),
  vendorIds: jsonb("vendor_ids").$type<string[]>().notNull().default([]),
  baseTripFeeCents: integer("base_trip_fee_cents").notNull().default(6500),
  hourlyRateCents: integer("hourly_rate_cents").notNull().default(9500),
  materialMarkupPct: numeric("material_markup_pct", { precision: 5, scale: 2 }).notNull().default("25"),
  active: boolean("active").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantServiceIdx: uniqueIndex("service_capabilities_household_service_idx").on(table.householdId, table.serviceType),
}));

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  householdId: uuid("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  taskId: uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  status: jobStatus("status").notNull().default("draft"),
  serviceType: text("service_type").notNull(),
  estimateCents: integer("estimate_cents").notNull().default(0),
  approvalRequired: boolean("approval_required").notNull().default(false),
  paymentStatus: paymentStatus("payment_status").notNull().default("estimate"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  assignedTechnicianId: uuid("assigned_technician_id").references(() => technicians.id),
  assignedVendorId: uuid("assigned_vendor_id").references(() => vendors.id),
  scheduledStart: timestamp("scheduled_start", { withTimezone: true }),
  scheduledEnd: timestamp("scheduled_end", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantStatusIdx: index("jobs_household_status_idx").on(table.householdId, table.status),
  tenantTaskIdx: index("jobs_household_task_idx").on(table.householdId, table.taskId),
}));

export const aiMemories = pgTable("ai_memories", {
  id: uuid("id").primaryKey().defaultRandom(),
  householdId: uuid("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  type: memoryType("type").notNull(),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 1536 }),
  source: text("source").notNull(),
  confidence: doublePrecision("confidence").notNull(),
  importance: integer("importance").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantTypeIdx: index("ai_memories_household_type_idx").on(table.householdId, table.type),
  embeddingIdx: index("ai_memories_embedding_idx").using("hnsw", table.embedding.op("vector_cosine_ops")),
}));

export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  householdId: uuid("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  taskId: uuid("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  jobId: uuid("job_id").references(() => jobs.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index("feedback_household_idx").on(table.householdId),
}));

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  householdId: uuid("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  taskId: uuid("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  channel: text("channel").notNull(),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
}, (table) => ({
  tenantScheduleIdx: index("notifications_household_scheduled_idx").on(table.householdId, table.scheduledFor),
}));

export const behaviorEvents = pgTable("behavior_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  householdId: uuid("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id),
  eventType: text("event_type").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantEventIdx: index("behavior_events_household_event_idx").on(table.householdId, table.eventType),
}));

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  householdId: uuid("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  actorUserId: uuid("actor_user_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id"),
  ipHash: text("ip_hash"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantActionIdx: index("audit_logs_household_action_idx").on(table.householdId, table.action),
}));

export const oneHouseholdCheck = sql`household_id is not null`;
