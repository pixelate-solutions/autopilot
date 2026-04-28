# Autopilot

Autopilot is a production-oriented household operating system built on Next.js 16, Clerk, Drizzle/Postgres, Stripe, OpenAI, pgvector, Inngest, and AWS S3.

## Architecture

The codebase is organized around the required four layers:

- Data layer: `db/schema`, `db/migrations`, `db/index.ts`
- Intelligence layer: `ai`, `memory`
- Decision layer: `scheduling`, `server/services/capabilities.ts`, `server/services/pricing.ts`
- Execution layer: `server/actions`, `server/services/jobs.ts`, `notifications`, API routes

Tenant data is modeled with `householdId` and server-side access helpers in `permissions/rbac.ts`. Server actions validate inputs with Zod and scope mutations by household.

## Core Product Surfaces

- Customer dashboard: `/`
- Onboarding: `/onboarding`
- Calendar: `/calendar`
- Task detail and handling modes: `/tasks/[taskId]`
- AI assistant: `/assistant`
- Settings and billing controls: `/settings`
- Admin operations: `/admin`
- Technician mobile workflow: `/technician`

## Environment

Copy `.env.example` to `.env.local` and configure production providers:

```bash
cp .env.example .env.local
```

Required for live operations:

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `OPENAI_API_KEY`
- AWS S3 credentials
- Weather, property records, and manufacturer schedule API credentials

Without provider secrets, the UI still builds and runs with local sample data. Server actions that touch external systems intentionally fail closed until credentials are configured.

## Database

The initial SQL migration enables `pgvector` and creates the household, user, task, job, technician, vendor, service capability, memory, feedback, notification, behavior, and audit tables.

```bash
npm run db:migrate
```

## Verification

```bash
npm run typecheck
npm run lint
npm run build
```
