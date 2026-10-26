CREATE TYPE ticket_status AS ENUM ('open', 'waiting_on_customer', 'waiting_on_team', 'resolved', 'closed');

ALTER TABLE households
  ADD COLUMN customer_availability jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE jobs
  ALTER COLUMN task_id DROP NOT NULL;

ALTER TABLE technicians
  ALTER COLUMN availability SET DEFAULT '[]'::jsonb;

CREATE TABLE tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  created_by_user_id uuid REFERENCES users(id),
  assigned_user_id uuid REFERENCES users(id),
  status ticket_status NOT NULL DEFAULT 'open',
  subject text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  customer_availability jsonb NOT NULL DEFAULT '[]'::jsonb,
  external_email_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX tickets_household_status_idx ON tickets(household_id, status);
CREATE INDEX tickets_household_created_idx ON tickets(household_id, created_at);

CREATE TABLE ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  author_user_id uuid REFERENCES users(id),
  author_type text NOT NULL,
  body text NOT NULL,
  external_email_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX ticket_messages_ticket_idx ON ticket_messages(ticket_id, created_at);
CREATE INDEX ticket_messages_household_idx ON ticket_messages(household_id);
