import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { demoTechnicians } from "@/lib/demo-data";

export default function AdminTechniciansPage() {
  return (
    <AppShell section="Admin">
      <div className="grid gap-3 md:grid-cols-3">
        {demoTechnicians.map((tech) => (
          <Card key={tech.name}>
            <CardContent className="p-4">
              <div className="font-medium">{tech.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">{tech.radius} mile radius</div>
              <div className="my-3 flex flex-wrap gap-2">{tech.serviceTypes.map((type) => <Badge key={type}>{type}</Badge>)}</div>
              <div className="text-sm">{tech.availability}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
