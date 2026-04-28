import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoJobs } from "@/lib/demo-data";
import { currency } from "@/lib/utils";

export default async function TechnicianJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = demoJobs.find((item) => item.id === jobId);
  if (!job) notFound();

  return (
    <AppShell section="Technician">
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{job.serviceType}</CardTitle>
            <Badge tone={job.status === "scheduled" ? "green" : "amber"}>{job.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-border p-3">
            <div className="text-sm text-muted-foreground">Estimate</div>
            <div className="text-xl font-semibold">{currency(job.estimateCents)}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button>Start</Button>
            <Button variant="secondary">Complete</Button>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
