import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tickets } from "@/db/schema";
import { requirePageContext } from "@/permissions/page-context";
import { createTicket } from "@/server/actions/tickets";

export default async function TicketsPage() {
  const { db, household, householdId } = await requirePageContext();
  const rows = await db
    .select()
    .from(tickets)
    .where(eq(tickets.householdId, householdId))
    .orderBy(desc(tickets.createdAt));

  const defaultAvailability = formatAvailability(household.customerAvailability);

  return (
    <AppShell section="Tickets">
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Customer requests</h2>
            <p className="text-sm text-muted-foreground">Submit a request. The team receives an email and replies through this ticket.</p>
          </div>
          {rows.length === 0 && (
            <Card>
              <CardContent className="p-5 text-sm text-muted-foreground">No tickets yet.</CardContent>
            </Card>
          )}
          {rows.map((ticket) => (
            <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
              <Card className="transition-colors hover:bg-muted">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <div className="font-medium">{ticket.subject}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {ticket.category} · {ticket.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                  <Badge tone={ticket.status === "resolved" || ticket.status === "closed" ? "green" : "amber"}>
                    {ticket.status.replaceAll("_", " ")}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Submit Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createTicket} className="space-y-4">
              <input type="hidden" name="householdId" value={householdId} />
              <label className="block text-sm font-medium">
                Subject
                <input name="subject" required className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3" />
              </label>
              <label className="block text-sm font-medium">
                Category
                <select name="category" required className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3">
                  <option value="maintenance">Maintenance</option>
                  <option value="repair">Repair</option>
                  <option value="billing">Billing</option>
                  <option value="general">General</option>
                </select>
              </label>
              <label className="block text-sm font-medium">
                Details
                <textarea name="body" required rows={7} className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2" />
              </label>
              <label className="block text-sm font-medium">
                Availability
                <textarea
                  name="customerAvailability"
                  rows={4}
                  defaultValue={defaultAvailability}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 font-mono text-xs"
                  placeholder="mon 09:00-12:00"
                />
                <span className="mt-1 block text-xs text-muted-foreground">One window per line, for example: mon 09:00-12:00</span>
              </label>
              <Button type="submit" className="w-full">Send request</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function formatAvailability(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => `${item.day} ${item.start}-${item.end}`).join("\n")
    : "";
}
