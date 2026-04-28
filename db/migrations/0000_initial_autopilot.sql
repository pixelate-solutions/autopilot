CREATE EXTENSION IF NOT EXISTS vector;
CREATE TYPE user_role AS ENUM ('customer', 'technician', 'admin', 'owner');
CREATE TYPE subscription_tier AS ENUM ('guided', 'autopilot');
CREATE TYPE task_status AS ENUM ('planned', 'scheduled', 'completed', 'skipped', 'archived');
CREATE TYPE handling_mode AS ENUM ('NOTIFY', 'GUIDE', 'AUTOPILOT', 'IGNORE');
CREATE TYPE memory_type AS ENUM ('household_fact', 'preference', 'behavior', 'conversation', 'aggregated_pattern');
CREATE TYPE job_status AS ENUM ('draft', 'estimate_pending', 'approval_required', 'scheduled', 'assigned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('not_required', 'estimate', 'authorized', 'deposit_paid', 'paid', 'failed', 'refunded');

CREATE TABLE households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address_encrypted text,
  zip text NOT NULL,
  home_type text NOT NULL,
  ownership text NOT NULL,
  has_yard boolean NOT NULL DEFAULT false,
  household_size integer NOT NULL,
  has_vehicles boolean NOT NULL DEFAULT false,
  automation_preference text NOT NULL,
  auto_approval_limit_cents integer NOT NULL DEFAULT 15000,
  subscription_tier subscription_tier NOT NULL DEFAULT 'guided',
  stripe_customer_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  clerk_user_id text NOT NULL,
  email text NOT NULL,
  name text NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_clerk_idx ON users(clerk_user_id);
CREATE INDEX users_household_idx ON users(household_id);

CREATE TABLE task_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  cadence text NOT NULL,
  season text NOT NULL DEFAULT 'all',
  default_estimated_minutes integer NOT NULL,
  allowed_modes jsonb NOT NULL,
  service_type text,
  risk_level text NOT NULL DEFAULT 'low',
  source text NOT NULL DEFAULT 'library',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX task_templates_slug_idx ON task_templates(slug);

CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  template_id uuid REFERENCES task_templates(id),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  cadence text NOT NULL,
  season text NOT NULL DEFAULT 'all',
  status task_status NOT NULL DEFAULT 'planned',
  handling_mode handling_mode NOT NULL DEFAULT 'NOTIFY',
  allowed_modes jsonb NOT NULL,
  service_type text,
  due_at timestamptz NOT NULL,
  last_completed_at timestamptz,
  next_eligible_at timestamptz,
  source text NOT NULL DEFAULT 'library',
  ai_rationale text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tasks_household_due_idx ON tasks(household_id, due_at);
CREATE INDEX tasks_household_status_idx ON tasks(household_id, status);

CREATE TABLE vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name text NOT NULL,
  service_types jsonb NOT NULL,
  coverage_zip_prefixes jsonb NOT NULL,
  hourly_rate_cents integer NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX vendors_household_idx ON vendors(household_id);

CREATE TABLE technicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  name text NOT NULL,
  email text NOT NULL,
  service_types jsonb NOT NULL,
  certifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  home_base_zip text NOT NULL,
  geo_radius_miles integer NOT NULL,
  availability jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX technicians_household_idx ON technicians(household_id);

CREATE TABLE service_capabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  service_type text NOT NULL,
  available boolean NOT NULL DEFAULT false,
  coverage_zip_prefixes jsonb NOT NULL DEFAULT '[]'::jsonb,
  technician_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  vendor_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  base_trip_fee_cents integer NOT NULL DEFAULT 6500,
  hourly_rate_cents integer NOT NULL DEFAULT 9500,
  material_markup_pct numeric(5,2) NOT NULL DEFAULT 25,
  active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX service_capabilities_household_service_idx ON service_capabilities(household_id, service_type);

CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  status job_status NOT NULL DEFAULT 'draft',
  service_type text NOT NULL,
  estimate_cents integer NOT NULL DEFAULT 0,
  approval_required boolean NOT NULL DEFAULT false,
  payment_status payment_status NOT NULL DEFAULT 'estimate',
  stripe_payment_intent_id text,
  assigned_technician_id uuid REFERENCES technicians(id),
  assigned_vendor_id uuid REFERENCES vendors(id),
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX jobs_household_status_idx ON jobs(household_id, status);
CREATE INDEX jobs_household_task_idx ON jobs(household_id, task_id);

CREATE TABLE ai_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  type memory_type NOT NULL,
  content text NOT NULL,
  embedding vector(1536),
  source text NOT NULL,
  confidence double precision NOT NULL,
  importance integer NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_memories_household_type_idx ON ai_memories(household_id, type);
CREATE INDEX ai_memories_embedding_idx ON ai_memories USING hnsw (embedding vector_cosine_ops);

CREATE TABLE feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  rating integer NOT NULL,
  comment text,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX feedback_household_idx ON feedback(household_id);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  channel text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  sent_at timestamptz,
  cancelled_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX notifications_household_scheduled_idx ON notifications(household_id, scheduled_for);

CREATE TABLE behavior_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  event_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX behavior_events_household_event_idx ON behavior_events(household_id, event_type);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  ip_hash text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_household_action_idx ON audit_logs(household_id, action);
