import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { demoTasks } from "@/lib/demo-data";

export default function CalendarPage() {
  return (
    <AppShell section="Calendar">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {demoTasks.slice(0, 9).map((task) => (
          <Card key={task.id}>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-medium">
                  {task.dueAt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </div>
                <Badge>{task.cadence}</Badge>
              </div>
              <div className="font-medium">{task.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{task.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
