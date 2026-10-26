import type { Metadata } from "next";
import Link from "next/link";
import { Zap, Wrench, Cpu, Clock, CreditCard } from "lucide-react";
import { asc, desc, eq } from "drizzle-orm";
import { AppShell } from "@/components/app-shell";
import { StatGrid } from "@/components/stat-grid";
import { TaskList } from "@/components/task-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currency } from "@/lib/utils";
import { jobs, tasks, technicians, vendors } from "@/db/schema";
import { requirePageContext } from "@/permissions/page-context";

export const metadata: Metadata = {
  title: "Dashboard — Autopilot",
};

export default async function DashboardPage() {
  const { db, householdId } = await requirePageContext();
  const taskRows = await db
    .select()
    .from(tasks)
    .where(eq(tasks.householdId, householdId))
    .orderBy(asc(tasks.dueAt))
    .limit(12);
  const jobRows = await db
    .select()
    .from(jobs)
    .where(eq(jobs.householdId, householdId))
    .orderBy(desc(jobs.createdAt))
    .limit(5);
  const techRows = await db.select().from(technicians).where(eq(technicians.householdId, householdId));
  const vendorRows = await db.select().from(vendors).where(eq(vendors.householdId, householdId));

  return (
    <AppShell section="Dashboard">
      <div className="space-y-5">
        <StatGrid stats={[
          { label: "Tasks this month", value: String(taskRows.length), sub: "Open maintenance plan", icon: Wrench, color: "var(--primary)" },
          { label: "Autopilot-ready", value: String(taskRows.filter((task) => task.serviceType).length), sub: "Executable services", icon: Zap, color: "var(--primary)" },
          { label: "Jobs active", value: String(jobRows.filter((job) => !["completed", "cancelled"].includes(job.status)).length), sub: "Scheduled or pending", icon: Wrench, color: "#a16207" },
          { label: "Needs approval", value: String(jobRows.filter((job) => job.approvalRequired).length), sub: "Owner/customer decision", icon: Cpu, color: "var(--foreground)" },
        ]} />

        <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold">Upcoming tasks</h2>
              <Badge tone="teal" small>20–30 tasks generated</Badge>
            </div>
            <TaskList tasks={taskRows} limit={6} />
          </section>

          <aside className="flex flex-col gap-3">
            {/* Active Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Active Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {jobRows.length === 0 && (
                  <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                    No active jobs yet. Book a service from an executable task.
                  </div>
                )}
                {jobRows.map((job) => {
                  const assignee =
                    techRows.find((tech) => tech.id === job.assignedTechnicianId)?.name ??
                    vendorRows.find((vendor) => vendor.id === job.assignedVendorId)?.name ??
                    "Unassigned";
                  return (
                    <Link
                      key={job.id}
                      href="/calendar"
                      className="rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      style={{ borderColor: "var(--border)" }}
                    >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex items-center justify-center rounded-full text-[10px] font-bold shrink-0"
                          style={{ width: 22, height: 22, background: "var(--primary)", color: "var(--primary-foreground)" }}
                        >
                          {assignee.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="text-[12px] font-semibold capitalize">{job.serviceType}</span>
                      </div>
                      <Badge tone={job.status === "scheduled" ? "green" : "amber"} small>
                        {job.status === "scheduled" ? "Scheduled" : "Needs approval"}
                      </Badge>
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                      {assignee}
                    </div>
                    <div className="mt-1.5 flex gap-2 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                      <span className="flex items-center gap-1">
                        <CreditCard size={10} />{currency(job.estimateCents)}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {job.scheduledStart
                          ? job.scheduledStart.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric" })
                          : "Pending schedule"}
                      </span>
                    </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>

            {/* Autopilot status */}
            <Card>
              <CardContent className="p-3.5">
                <div className="flex gap-2.5 items-start">
                  <div
                    className="flex items-center justify-center rounded-lg shrink-0"
                    style={{ width: 28, height: 28, background: "#e0f5f8" }}
                  >
                    <Zap size={13} color="var(--primary)" />
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold mb-0.5">Autopilot active</div>
                    <p className="text-[11px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                      Weather-aware scheduling running. Next outdoor task deferred to Tuesday due to rain forecast.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Decision engine */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu size={14} className="text-primary" /> Decision Engine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  ["Data", "Weather, property records, home profile"],
                  ["Intelligence", "Memory retrieval, preferences, behavior"],
                  ["Decision", "Due dates, modes, pricing approval"],
                  ["Execution", "Jobs, technicians, payments, feedback"],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-2.5">
                    <div
                      className="mt-0.5 shrink-0 rounded-full"
                      style={{ width: 6, height: 6, background: "var(--primary)", marginTop: 6 }}
                    />
                    <div>
                      <div className="text-[12px] font-medium">{label}</div>
                      <div className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{value}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
