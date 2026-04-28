import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { demoHousehold } from "@/lib/demo-data";

export default function AdminHouseholdsPage() {
  return (
    <AppShell section="Admin">
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <div className="font-medium">{demoHousehold.name}</div>
            <div className="text-sm text-muted-foreground">ZIP {demoHousehold.zip}</div>
          </div>
          <Badge tone="green">guided</Badge>
        </CardContent>
      </Card>
    </AppShell>
  );
}
