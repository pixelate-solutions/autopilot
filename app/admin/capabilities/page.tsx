import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { serviceCapabilities } from "@/db/schema";
import { requirePageContext } from "@/permissions/page-context";

export default async function AdminCapabilitiesPage() {
  const { db, householdId, user } = await requirePageContext();
  if (user.role !== "owner" && user.role !== "admin") redirect("/dashboard");

  const rows = await db.select().from(serviceCapabilities).where(eq(serviceCapabilities.householdId, householdId));

  return (
    <AppShell section="Admin">
      <div className="space-y-3">
        {rows.length === 0 && (
          <Card><CardContent className="p-4 text-sm text-muted-foreground">No service capabilities configured yet.</CardContent></Card>
        )}
        {rows.map((capability) => (
          <Card key={capability.id}>
            <CardContent className="grid gap-3 p-4 sm:grid-cols-4 sm:items-center">
              <div className="font-medium">{capability.serviceType}</div>
              <div className="text-sm text-muted-foreground">Coverage: {capability.coverageZipPrefixes.join(", ") || "None"}</div>
              <div className="text-sm text-muted-foreground">Technicians: {capability.technicianIds.length}</div>
              <Badge tone={capability.available ? "green" : "red"}>{capability.available ? "available" : "disabled"}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
