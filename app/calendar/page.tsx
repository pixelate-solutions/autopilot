import { eachDayOfInterval, endOfMonth, format, getDay, isSameDay, startOfMonth } from "date-fns";
import { asc, eq } from "drizzle-orm";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { jobs, tasks } from "@/db/schema";
import { requirePageContext } from "@/permissions/page-context";

export default async function CalendarPage() {
  const { db, householdId } = await requirePageContext();
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const prefixDays = Array.from({ length: getDay(monthStart) });

  const taskRows = await db.select().from(tasks).where(eq(tasks.householdId, householdId)).orderBy(asc(tasks.dueAt));
  const jobRows = await db.select().from(jobs).where(eq(jobs.householdId, householdId)).orderBy(asc(jobs.scheduledStart));

  return (
    <AppShell section="Calendar">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{format(today, "MMMM yyyy")}</CardTitle>
            <div className="flex gap-2">
              <Badge tone="teal">Tasks</Badge>
              <Badge tone="green">Jobs</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="bg-muted p-2 text-center text-xs font-semibold uppercase text-muted-foreground">
                {day}
              </div>
            ))}
            {prefixDays.map((_, index) => (
              <div key={`blank-${index}`} className="min-h-32 bg-card p-2" />
            ))}
            {days.map((day) => {
              const dayTasks = taskRows.filter((task) => isSameDay(task.dueAt, day));
              const dayJobs = jobRows.filter((job) => job.scheduledStart && isSameDay(job.scheduledStart, day));
              return (
                <div key={day.toISOString()} className="min-h-32 bg-card p-2">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold">{format(day, "d")}</span>
                    {isSameDay(day, today) && <Badge small tone="amber">Today</Badge>}
                  </div>
                  <div className="space-y-1">
                    {dayJobs.map((job) => (
                      <div key={job.id} className="rounded bg-green-50 px-2 py-1 text-[11px] text-green-900">
                        {format(job.scheduledStart!, "h:mm a")} · {job.serviceType}
                      </div>
                    ))}
                    {dayTasks.map((task) => (
                      <div key={task.id} className="rounded bg-cyan-50 px-2 py-1 text-[11px] text-cyan-950">
                        Due · {task.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
