import { Bot, Database, MessageSquare, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AssistantPage() {
  return (
    <AppShell section="Assistant">
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Autopilot Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="max-w-2xl rounded-lg border border-border bg-muted p-4">
                <div className="mb-2 flex items-center gap-2 font-medium"><Bot className="h-4 w-4" />Autopilot</div>
                <p className="text-sm text-muted-foreground">
                  Your HVAC filter is due this week. Rain is forecast this weekend, so outdoor drainage checks moved to Tuesday.
                </p>
              </div>
              <div className="ml-auto max-w-2xl rounded-lg bg-primary p-4 text-primary-foreground">
                <div className="mb-2 flex items-center gap-2 font-medium"><MessageSquare className="h-4 w-4" />You</div>
                <p className="text-sm">Explain why this matters and whether Autopilot can handle it.</p>
              </div>
              <div className="max-w-2xl rounded-lg border border-border bg-muted p-4">
                <div className="mb-2 flex items-center gap-2 font-medium"><Sparkles className="h-4 w-4" />Answer</div>
                <p className="text-sm text-muted-foreground">
                  The system retrieved household facts, service availability, and your preference for auto-scheduling low-cost routine work. It did not send full chat history.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Memory Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["household_fact", "preference", "behavior", "aggregated_pattern"].map((type) => (
              <div key={type} className="flex items-center gap-3 rounded-md border border-border p-3">
                <Database className="h-4 w-4 text-primary" />
                <span className="text-sm">{type}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
