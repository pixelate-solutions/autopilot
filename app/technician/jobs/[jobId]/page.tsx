import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { jobs, technicians } from "@/db/schema";
import { currency } from "@/lib/utils";
import { requirePageContext } from "@/permissions/page-context";
import { updateTechnicianJobStatus } from "@/server/actions/technician";

export default async function TechnicianJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const { db, householdId, user } = await requirePageContext();
  if (!["technician", "admin", "owner"].includes(user.role)) redirect("/dashboard");

  const [technician] = await db
    .select()
    .from(technicians)
    .where(and(eq(technicians.householdId, householdId), eq(technicians.userId, user.id)))
    .limit(1);
  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);
  if (!job) notFound();
  if (technician && job.assignedTechnicianId !== technician.id) notFound();

  return (
    <AppShell section="Technician">
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="capitalize">{job.serviceType}</CardTitle>
            <Badge tone={job.status === "scheduled" ? "green" : "amber"}>{job.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-border p-3">
            <div className="text-sm text-muted-foreground">Estimate</div>
            <div className="text-xl font-semibold">{currency(job.estimateCents)}</div>
          </div>
          <div className="rounded-md border border-border p-3">
            <div className="text-sm text-muted-foreground">Schedule</div>
            <div className="font-medium">{job.scheduledStart ? job.scheduledStart.toLocaleString() : "Pending schedule"}</div>
          </div>
          {job.notes && <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">{job.notes}</p>}
          <div className="grid grid-cols-2 gap-2">
            <form action={updateTechnicianJobStatus}>
              <input type="hidden" name="jobId" value={job.id} />
              <input type="hidden" name="status" value="in_progress" />
              <Button type="submit" className="w-full">Start</Button>
            </form>
            <form action={updateTechnicianJobStatus}>
              <input type="hidden" name="jobId" value={job.id} />
              <input type="hidden" name="status" value="completed" />
              <Button type="submit" variant="secondary" className="w-full">Complete</Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
