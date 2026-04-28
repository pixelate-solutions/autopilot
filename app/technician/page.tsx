import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { demoJobs } from "@/lib/demo-data";

export default function TechnicianPage() {
  return (
    <AppShell section="Technician">
      <div className="mx-auto max-w-xl space-y-3">
        {demoJobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-medium">{job.serviceType}</div>
                <Badge tone={job.status === "scheduled" ? "green" : "amber"}>{job.status}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">{job.window}</div>
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
