import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { demoCapabilities } from "@/lib/demo-data";

export default function AdminCapabilitiesPage() {
  return (
    <AppShell section="Admin">
      <div className="space-y-3">
        {demoCapabilities.map((capability) => (
          <Card key={capability.serviceType}>
            <CardContent className="grid gap-3 p-4 sm:grid-cols-4 sm:items-center">
              <div className="font-medium">{capability.serviceType}</div>
              <div className="text-sm text-muted-foreground">Coverage: {capability.coverage}</div>
              <div className="text-sm text-muted-foreground">Technicians: {capability.technicians}</div>
              <Badge tone={capability.available ? "green" : "red"}>{capability.available ? "available" : "disabled"}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
