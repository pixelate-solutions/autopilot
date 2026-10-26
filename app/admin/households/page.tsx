import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { households } from "@/db/schema";
import { requirePageContext } from "@/permissions/page-context";

export default async function AdminHouseholdsPage() {
  const { db, user } = await requirePageContext();
  if (user.role !== "owner" && user.role !== "admin") redirect("/dashboard");
  const rows = await db.select().from(households);

  return (
    <AppShell section="Admin">
      <div className="space-y-3">
        {rows.map((household) => (
          <Card key={household.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{household.name}</div>
                <div className="text-sm text-muted-foreground">ZIP {household.zip} · {household.homeType}</div>
              </div>
              <Badge tone="green">{household.subscriptionTier}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
