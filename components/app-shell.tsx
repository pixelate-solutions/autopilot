import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { households, users } from "@/db/schema";
import { ClientAppShell } from "@/components/client-app-shell";
import type { UserRole } from "@/lib/types";

export async function AppShell({
  children,
  section = "Dashboard",
}: {
  children: React.ReactNode;
  section?: string;
}) {
  const session = await auth();
  if (!session.userId) redirect("/");

  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, session.userId))
    .limit(1);

  if (!user) redirect("/onboarding");

  const [household] = await db
    .select()
    .from(households)
    .where(eq(households.id, user.householdId))
    .limit(1);

  return (
    <ClientAppShell
      section={section}
      role={user.role as UserRole}
      householdName={household?.name ?? "Autopilot"}
      userName={user.name}
      zip={household?.zip ?? "00000"}
    >
      {children}
    </ClientAppShell>
  );
}
