import { notFound } from "next/navigation";
import { ShieldCheck, Wrench } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoTasks } from "@/lib/demo-data";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const task = demoTasks.find((item) => item.id === taskId);
  if (!task) notFound();

  return (
    <AppShell section="Tasks">
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={task.handlingMode === "AUTOPILOT" ? "green" : "neutral"}>{task.handlingMode}</Badge>
              <Badge>{task.category}</Badge>
            </div>
            <CardTitle className="mt-3 text-2xl">{task.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-muted-foreground">{task.description}</p>
            <div className="rounded-md border border-border bg-muted p-4">
              <div className="mb-1 flex items-center gap-2 font-medium">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Execution gating
              </div>
              <p className="text-sm text-muted-foreground">
                AUTOPILOT requires service availability, coverage match, and technician or vendor capacity. The toggle remains disabled until all checks pass.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Handling Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["NOTIFY", "GUIDE", "AUTOPILOT", "IGNORE"].map((mode) => (
              <Button
                key={mode}
                variant={mode === task.handlingMode ? "default" : "secondary"}
                className="w-full justify-start"
                disabled={mode === "AUTOPILOT" && !task.autopilotEnabled}
              >
                {mode === "AUTOPILOT" ? <Wrench className="h-4 w-4" /> : null}
                {mode}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
