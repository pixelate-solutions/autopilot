import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { jobs, technicians } from "@/db/schema";
import { requirePageContext } from "@/permissions/page-context";

export default async function TechnicianPage() {
  const { db, householdId, user } = await requirePageContext();
  if (!["technician", "admin", "owner"].includes(user.role)) redirect("/dashboard");

  const [technician] = await db
    .select()
    .from(technicians)
    .where(and(eq(technicians.householdId, householdId), eq(technicians.userId, user.id)))
    .limit(1);
  const baseJobQuery = db.select().from(jobs);
  const jobRows = technician
    ? await baseJobQuery.where(eq(jobs.assignedTechnicianId, technician.id)).orderBy(desc(jobs.createdAt))
    : await db.select().from(jobs).orderBy(desc(jobs.createdAt));

  return (
    <AppShell section="Technician">
      <div className="mx-auto max-w-xl space-y-3">
        {jobRows.length === 0 && (
          <Card><CardContent className="p-4 text-sm text-muted-foreground">No assigned jobs.</CardContent></Card>
        )}
        {jobRows.map((job) => (
          <Card key={job.id}>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-medium capitalize">{job.serviceType}</div>
                <Badge tone={job.status === "scheduled" ? "green" : "amber"}>{job.status}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {job.scheduledStart ? job.scheduledStart.toLocaleString() : "Pending schedule"}
              </div>
              <Button asChild className="mt-4 w-full">
                <Link href={`/technician/jobs/${job.id}`}>Open job</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
