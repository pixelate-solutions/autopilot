import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { technicians, users } from "@/db/schema";
import { requirePageContext } from "@/permissions/page-context";
import { updateEmployeeRole, upsertTechnician } from "@/server/actions/admin";

export default async function AdminTechniciansPage() {
  const { db, householdId, user } = await requirePageContext();
  if (user.role !== "owner" && user.role !== "admin") redirect("/dashboard");

  const techRows = await db.select().from(technicians).where(eq(technicians.householdId, householdId));
  const userRows = await db.select().from(users).where(eq(users.householdId, householdId));

  return (
    <AppShell section="Admin">
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="grid gap-3 md:grid-cols-2">
          {techRows.map((tech) => (
            <Card key={tech.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{tech.name}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{tech.email} · {tech.geoRadiusMiles} mile radius</div>
                  </div>
                  <Badge tone={tech.active ? "green" : "red"}>{tech.active ? "active" : "inactive"}</Badge>
                </div>
                <div className="my-3 flex flex-wrap gap-2">{tech.serviceTypes.map((type) => <Badge key={type}>{type}</Badge>)}</div>
                <pre className="whitespace-pre-wrap rounded bg-muted p-2 text-xs">{formatAvailability(tech.availability)}</pre>
              </CardContent>
            </Card>
          ))}
        </section>

        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Add Technician</CardTitle></CardHeader>
            <CardContent>
              <form action={upsertTechnician} className="space-y-3">
                <input type="hidden" name="householdId" value={householdId} />
                <input name="name" required placeholder="Name" className="h-10 w-full rounded-md border border-border bg-white px-3" />
                <input name="email" required type="email" placeholder="email@example.com" className="h-10 w-full rounded-md border border-border bg-white px-3" />
                <input name="serviceTypes" required placeholder="hvac, plumbing" className="h-10 w-full rounded-md border border-border bg-white px-3" />
                <div className="grid grid-cols-2 gap-3">
                  <input name="homeBaseZip" required placeholder="48226" className="h-10 rounded-md border border-border bg-white px-3" />
                  <input name="geoRadiusMiles" required type="number" min="1" defaultValue="25" className="h-10 rounded-md border border-border bg-white px-3" />
                </div>
                <select name="userId" className="h-10 w-full rounded-md border border-border bg-white px-3">
                  <option value="">No linked app user</option>
                  {userRows.map((row) => <option key={row.id} value={row.id}>{row.name} · {row.email}</option>)}
                </select>
                <textarea
                  name="availability"
                  required
                  rows={5}
                  placeholder={"mon 09:00-17:00\ntue 09:00-17:00"}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 font-mono text-xs"
                />
                <Button type="submit" className="w-full">Save technician</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Employee Roles</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {userRows.map((row) => (
                <form key={row.id} action={updateEmployeeRole} className="grid grid-cols-[1fr_130px_auto] items-center gap-2">
                  <input type="hidden" name="householdId" value={householdId} />
                  <input type="hidden" name="userId" value={row.id} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{row.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{row.email}</div>
                  </div>
                  <select name="role" defaultValue={row.role === "owner" ? "admin" : row.role} disabled={row.role === "owner"} className="h-9 rounded-md border border-border bg-white px-2 text-sm">
                    <option value="customer">Customer</option>
                    <option value="technician">Technician</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button type="submit" size="sm" disabled={row.role === "owner"}>Set</Button>
                </form>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function formatAvailability(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => `${item.day} ${item.start}-${item.end}`).join("\n")
    : "";
}
