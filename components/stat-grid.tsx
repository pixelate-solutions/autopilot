import { CheckSquare, Zap, Wrench, Cpu } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const DEFAULT_STATS = [
  { label: "Tasks this month", value: "24", sub: "+3 vs last month",   icon: CheckSquare, color: "var(--primary)" },
  { label: "Autopilot-ready",  value: "14", sub: "58% of your plan",   icon: Zap,         color: "var(--primary)" },
  { label: "Jobs active",      value: "2",  sub: "1 needs your approval", icon: Wrench,   color: "#a16207" },
  { label: "Learning signals", value: "38", sub: "Recorded this week",  icon: Cpu,         color: "var(--foreground)" },
];

export function StatGrid({ stats = DEFAULT_STATS }: { stats?: typeof DEFAULT_STATS }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="p-4.5">
            <div className="flex items-start justify-between mb-2.5">
              <div
                className="text-[11px] font-semibold uppercase leading-snug"
                style={{ letterSpacing: "0.5px", color: "var(--muted-foreground)", maxWidth: 120 }}
              >
                {s.label}
              </div>
              <div
                className="flex items-center justify-center rounded-lg shrink-0"
                style={{ padding: 7, background: "var(--muted)" }}
              >
                <s.icon size={13} color="var(--primary)" />
              </div>
            </div>
            <div
              className="font-bold leading-none"
              style={{ fontSize: 30, letterSpacing: "-1px", color: s.color }}
            >
              {s.value}
            </div>
            <div className="mt-1.5 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
              {s.sub}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
