import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { demoJobs } from "@/lib/demo-data";
import { currency } from "@/lib/utils";

export default function AdminJobsPage() {
  return (
    <AppShell section="Admin">
      <div className="space-y-3">
        {demoJobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{job.serviceType}</div>
                <div className="text-sm text-muted-foreground">{job.assignee} · {job.window}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm">{currency(job.estimateCents)}</span>
                <Badge tone={job.status === "scheduled" ? "green" : "amber"}>{job.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
