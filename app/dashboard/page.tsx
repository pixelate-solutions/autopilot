import type { Metadata } from "next";
import { Zap, Wrench, Cpu, Clock, CreditCard } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatGrid } from "@/components/stat-grid";
import { TaskList } from "@/components/task-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoJobs } from "@/lib/demo-data";
import { currency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard — Autopilot",
};

export default function DashboardPage() {
  return (
    <AppShell section="Dashboard">
      <div className="space-y-5">
        <StatGrid />

        <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold">Upcoming tasks</h2>
              <Badge tone="teal" small>20–30 tasks generated</Badge>
            </div>
            <TaskList limit={6} />
          </section>

          <aside className="flex flex-col gap-3">
            {/* Active Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Active Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {demoJobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex items-center justify-center rounded-full text-[10px] font-bold shrink-0"
                          style={{ width: 22, height: 22, background: "var(--primary)", color: "var(--primary-foreground)" }}
                        >
                          {job.assignee.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="text-[12px] font-semibold capitalize">{job.serviceType}</span>
                      </div>
                      <Badge tone={job.status === "scheduled" ? "green" : "amber"} small>
                        {job.status === "scheduled" ? "Scheduled" : "Needs approval"}
                      </Badge>
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                      {job.assignee}
                    </div>
                    <div className="mt-1.5 flex gap-2 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                      <span className="flex items-center gap-1">
                        <CreditCard size={10} />{currency(job.estimateCents)}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />{job.window}
                      </span>
                    </div>
                  </div>
                ))}
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
