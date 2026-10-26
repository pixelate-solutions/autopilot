import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { jobs, technicians } from "@/db/schema";
import { currency } from "@/lib/utils";
import { requirePageContext } from "@/permissions/page-context";
import { autoScheduleJob, updateJobAssignment } from "@/server/actions/admin";

export default async function AdminJobsPage() {
  const { db, user } = await requirePageContext();
  if (user.role !== "owner" && user.role !== "admin") redirect("/dashboard");

  const jobRows = await db.select().from(jobs).orderBy(desc(jobs.createdAt));
  const techRows = await db.select().from(technicians).where(eq(technicians.active, true));

  return (
    <AppShell section="Admin">
      <div className="space-y-3">
        {jobRows.length === 0 && (
          <Card><CardContent className="p-4 text-sm text-muted-foreground">No jobs yet.</CardContent></Card>
        )}
        {jobRows.map((job) => (
          <Card key={job.id}>
            <CardContent className="space-y-4 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium capitalize">{job.serviceType}</div>
                  <div className="text-sm text-muted-foreground">
                    {job.scheduledStart ? job.scheduledStart.toLocaleString() : "Unscheduled"} · {currency(job.estimateCents)}
                  </div>
                </div>
                <Badge tone={job.status === "scheduled" ? "green" : job.status === "cancelled" ? "red" : "amber"}>
                  {job.status}
                </Badge>
              </div>
              <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <form action={updateJobAssignment} className="grid gap-2 sm:grid-cols-4">
                  <input type="hidden" name="householdId" value={job.householdId} />
                  <input type="hidden" name="jobId" value={job.id} />
                  <select name="technicianId" defaultValue={job.assignedTechnicianId ?? ""} className="h-10 rounded-md border border-border bg-white px-3 text-sm">
                    <option value="">Unassigned</option>
                    {techRows.map((tech) => <option key={tech.id} value={tech.id}>{tech.name}</option>)}
                  </select>
                  <input name="scheduledStart" type="datetime-local" className="h-10 rounded-md border border-border bg-white px-3 text-sm" />
                  <input name="scheduledEnd" type="datetime-local" className="h-10 rounded-md border border-border bg-white px-3 text-sm" />
                  <select name="status" defaultValue={job.status} className="h-10 rounded-md border border-border bg-white px-3 text-sm">
                    <option value="approval_required">Approval required</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <Button type="submit" className="sm:col-span-4">Save assignment</Button>
                </form>
                <form action={autoScheduleJob}>
                  <input type="hidden" name="householdId" value={job.householdId} />
                  <input type="hidden" name="jobId" value={job.id} />
                  <Button type="submit" variant="secondary">Auto-schedule</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
