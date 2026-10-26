import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ShieldCheck, Wrench } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tasks } from "@/db/schema";
import { requirePageContext } from "@/permissions/page-context";
import { updateTaskHandlingModeFromForm } from "@/server/actions/tasks";
import { triggerAutopilotJobFromForm } from "@/server/actions/jobs";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const { db, householdId } = await requirePageContext();
  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.householdId, householdId), eq(tasks.id, taskId)))
    .limit(1);
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
                AUTOPILOT requires service coverage, customer availability, and a technician with matching skills and open schedule capacity.
              </p>
            </div>
            {task.serviceType && (
              <form action={triggerAutopilotJobFromForm} className="flex flex-wrap gap-3 rounded-md border border-border p-4">
                <input type="hidden" name="householdId" value={householdId} />
                <input type="hidden" name="taskId" value={task.id} />
                <label className="text-sm font-medium">
                  Earliest window
                  <input name="requestedWindowStart" type="datetime-local" className="mt-1 h-10 rounded-md border border-border bg-white px-3" />
                </label>
                <label className="text-sm font-medium">
                  Latest window
                  <input name="requestedWindowEnd" type="datetime-local" className="mt-1 h-10 rounded-md border border-border bg-white px-3" />
                </label>
                <Button type="submit" className="self-end">
                  <Wrench className="h-4 w-4" />
                  Book with Autopilot
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Handling Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["NOTIFY", "GUIDE", "AUTOPILOT", "IGNORE"].map((mode) => (
              <form key={mode} action={updateTaskHandlingModeFromForm}>
                <input type="hidden" name="householdId" value={householdId} />
                <input type="hidden" name="taskId" value={task.id} />
                <input type="hidden" name="mode" value={mode} />
                <Button
                  type="submit"
                  variant={mode === task.handlingMode ? "default" : "secondary"}
                  className="w-full justify-start"
                  disabled={!task.allowedModes.includes(mode)}
                >
                  {mode === "AUTOPILOT" ? <Wrench className="h-4 w-4" /> : null}
                  {mode}
                </Button>
              </form>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
