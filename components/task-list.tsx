"use client";

import { CalendarClock, Lock, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { currency } from "@/lib/utils";
import { demoTasks } from "@/lib/demo-data";

const modeTone = (mode: string) =>
  mode === "AUTOPILOT" ? "teal" : mode === "GUIDE" ? "amber" : "neutral";

export function TaskList({ limit = demoTasks.length }: { limit?: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      {demoTasks.slice(0, limit).map((task) => (
        <Card key={task.id} className="cursor-pointer hover:shadow-sm transition-shadow">
          <CardContent className="flex gap-2.5 items-start p-3.5">
            <div className="flex-1 min-w-0">
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
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                {currency((task.estimatedMinutes / 60) * 9500 + 6500)}
              </span>
              {task.serviceType && (
                <button
                  disabled={!task.autopilotEnabled}
                  className="flex items-center gap-1 rounded-md border px-2.5 py-1 text-[12px] font-medium transition-colors"
                  style={{
                    background: task.autopilotEnabled ? "var(--primary)" : "var(--muted)",
                    color: task.autopilotEnabled ? "var(--primary-foreground)" : "var(--muted-foreground)",
                    borderColor: task.autopilotEnabled ? "var(--primary)" : "var(--border)",
                    opacity: task.autopilotEnabled ? 1 : 0.6,
                    cursor: task.autopilotEnabled ? "pointer" : "not-allowed",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {task.autopilotEnabled ? <Wrench size={11} /> : <Lock size={11} />}
                  {task.autopilotEnabled ? "Book" : "Locked"}
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
