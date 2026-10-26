import { asc, eq } from "drizzle-orm";
import { AppShell } from "@/components/app-shell";
import { TaskList } from "@/components/task-list";
import { Badge } from "@/components/ui/badge";
import { tasks } from "@/db/schema";
import { requirePageContext } from "@/permissions/page-context";

export default async function TasksPage() {
  const { db, householdId } = await requirePageContext();
  const taskRows = await db
    .select()
    .from(tasks)
    .where(eq(tasks.householdId, householdId))
    .orderBy(asc(tasks.dueAt));

  return (
    <AppShell section="Tasks">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Maintenance tasks</h2>
            <p className="text-sm text-muted-foreground">Review, change handling mode, or book executable work.</p>
          </div>
          <Badge tone="teal">{taskRows.length} active</Badge>
        </div>
        <TaskList tasks={taskRows} />
      </div>
    </AppShell>
  );
}
