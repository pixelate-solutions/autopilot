import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ticketMessages, tickets } from "@/db/schema";
import { requirePageContext } from "@/permissions/page-context";
import { replyToTicket } from "@/server/actions/tickets";

export default async function TicketDetailPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  const { db, householdId, user } = await requirePageContext();
  const [ticket] = await db
    .select()
    .from(tickets)
    .where(and(eq(tickets.householdId, householdId), eq(tickets.id, ticketId)))
    .limit(1);
  if (!ticket) notFound();

  const messages = await db
    .select()
    .from(ticketMessages)
    .where(and(eq(ticketMessages.householdId, householdId), eq(ticketMessages.ticketId, ticketId)))
    .orderBy(asc(ticketMessages.createdAt));
  const isTeam = user.role !== "customer";

  return (
    <AppShell section="Tickets">
      <div className="mx-auto max-w-3xl space-y-4">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>{ticket.subject}</CardTitle>
              <Badge tone={ticket.status === "resolved" || ticket.status === "closed" ? "green" : "amber"}>
                {ticket.status.replaceAll("_", " ")}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{ticket.category} · {ticket.createdAt.toLocaleString()}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className="rounded-lg border p-3"
                style={{
                  borderColor: "var(--border)",
                  background: message.authorType === "team" ? "var(--muted)" : "var(--card)",
                }}
              >
                <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                  {message.authorType} · {message.createdAt.toLocaleString()}
                </div>
                <p className="whitespace-pre-wrap text-sm">{message.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isTeam ? "Reply to customer" : "Add a reply"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={replyToTicket} className="space-y-3">
              <input type="hidden" name="householdId" value={householdId} />
              <input type="hidden" name="ticketId" value={ticket.id} />
              <textarea name="body" required rows={5} className="w-full rounded-md border border-border bg-white px-3 py-2" />
              {isTeam && (
                <select name="status" defaultValue="waiting_on_customer" className="h-10 rounded-md border border-border bg-white px-3">
                  <option value="waiting_on_customer">Waiting on customer</option>
                  <option value="waiting_on_team">Waiting on team</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              )}
              <Button type="submit">Send reply</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
