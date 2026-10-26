import Link from "next/link";
import { CalendarClock, Lock, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { currency } from "@/lib/utils";
import { triggerAutopilotJobFromForm } from "@/server/actions/jobs";

type TaskRow = {
  id: string;
  householdId: string;
  title: string;
  category: string;
  handlingMode: string;
  allowedModes: string[];
  serviceType: string | null;
  dueAt: Date;
  metadata: Record<string, unknown>;
};

const modeTone = (mode: string) =>
  mode === "AUTOPILOT" ? "teal" : mode === "GUIDE" ? "amber" : "neutral";

export function TaskList({ tasks, limit = tasks.length }: { tasks: TaskRow[]; limit?: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      {tasks.slice(0, limit).map((task) => {
        const canBook = Boolean(task.serviceType);
        const estimatedMinutes = Number(task.metadata?.estimatedMinutes ?? 90);
        return (
          <Card key={task.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="flex gap-2.5 items-start p-3.5">
              <Link href={`/tasks/${task.id}`} className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  <Badge tone={modeTone(task.handlingMode) as "teal" | "amber" | "neutral"} small>
                    {task.handlingMode}
                  </Badge>
                  <Badge small>{task.category}</Badge>
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                    <CalendarClock size={11} />
                    {task.dueAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <div className="font-medium text-[13px]">{task.title}</div>
              </Link>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                  {currency((estimatedMinutes / 60) * 9500 + 6500)}
                </span>
                {task.serviceType && (
                  <form action={triggerAutopilotJobFromForm}>
                    <input type="hidden" name="householdId" value={task.householdId} />
                    <input type="hidden" name="taskId" value={task.id} />
                    <Button size="sm" disabled={!canBook} title={canBook ? "Book this job" : "Service unavailable"}>
                      {canBook ? <Wrench size={11} /> : <Lock size={11} />}
                      {canBook ? "Book" : "Locked"}
                    </Button>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
