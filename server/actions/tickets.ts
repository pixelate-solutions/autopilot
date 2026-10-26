"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { ticketMessages, tickets, users } from "@/db/schema";
import { ticketCreateSchema, ticketReplySchema } from "@/lib/validation";
import { assertSameHousehold, requireTenant } from "@/permissions/rbac";
import { sendOperationalEmail, supportInbox } from "@/server/services/email";
import { writeAuditLog } from "@/server/services/audit";

export async function createTicket(formData: FormData) {
  const ctx = await requireTenant("customer");
  const data = ticketCreateSchema.parse({
    householdId: formData.get("householdId"),
    subject: formData.get("subject"),
    category: formData.get("category"),
    body: formData.get("body"),
    customerAvailability: parseAvailability(formData.get("customerAvailability")?.toString() ?? ""),
  });
  assertSameHousehold(ctx, data.householdId);

  const db = getDb();
  const [creator] = await db.select().from(users).where(eq(users.id, ctx.userId)).limit(1);
  const [ticket] = await db
    .insert(tickets)
    .values({
      householdId: data.householdId,
      createdByUserId: ctx.userId,
      subject: data.subject,
      category: data.category,
      customerAvailability: data.customerAvailability,
      status: "waiting_on_team",
    })
    .returning();

  await db.insert(ticketMessages).values({
    ticketId: ticket.id,
    householdId: data.householdId,
    authorUserId: ctx.userId,
    authorType: "customer",
    body: data.body,
  });

  const email = await sendOperationalEmail({
    to: supportInbox(),
    replyTo: creator?.email,
    subject: `[Autopilot ticket] ${data.subject}`,
    text: `${creator?.name ?? "Customer"} submitted a ticket.\n\nCategory: ${data.category}\nTicket: ${ticket.id}\n\n${data.body}`,
  });

  if ("id" in email && email.id) {
    await db.update(tickets).set({ externalEmailId: email.id }).where(eq(tickets.id, ticket.id));
  }

  await writeAuditLog({
    householdId: data.householdId,
    actorUserId: ctx.userId,
    action: "ticket.created",
    entityType: "ticket",
    entityId: ticket.id,
    metadata: { category: data.category },
  });

  revalidatePath("/tickets");
  redirect(`/tickets/${ticket.id}`);
}

export async function replyToTicket(formData: FormData) {
  const ctx = await requireTenant("customer");
  const data = ticketReplySchema.parse({
    householdId: formData.get("householdId"),
    ticketId: formData.get("ticketId"),
    body: formData.get("body"),
    status: formData.get("status") || undefined,
  });
  assertSameHousehold(ctx, data.householdId);

  const db = getDb();
  const [ticket] = await db
    .select()
    .from(tickets)
    .where(and(eq(tickets.householdId, data.householdId), eq(tickets.id, data.ticketId)))
    .limit(1);
  if (!ticket) throw new Error("Ticket not found.");

  const authorType = ctx.role === "customer" ? "customer" : "team";
  await db.insert(ticketMessages).values({
    ticketId: data.ticketId,
    householdId: data.householdId,
    authorUserId: ctx.userId,
    authorType,
    body: data.body,
  });

  const nextStatus = data.status ?? (authorType === "team" ? "waiting_on_customer" : "waiting_on_team");
  await db
    .update(tickets)
    .set({ status: nextStatus, updatedAt: new Date() })
    .where(and(eq(tickets.householdId, data.householdId), eq(tickets.id, data.ticketId)));

  const [recipient] = ticket.createdByUserId
    ? await db.select().from(users).where(eq(users.id, ticket.createdByUserId)).limit(1)
    : [];
  const to = authorType === "team" ? recipient?.email : supportInbox();
  if (to) {
    await sendOperationalEmail({
      to,
      subject: `[Autopilot ticket] ${ticket.subject}`,
      text: data.body,
    });
  }

  await writeAuditLog({
    householdId: data.householdId,
    actorUserId: ctx.userId,
    action: "ticket.replied",
    entityType: "ticket",
    entityId: data.ticketId,
    metadata: { status: nextStatus },
  });

  revalidatePath("/tickets");
  revalidatePath(`/tickets/${data.ticketId}`);
}

function parseAvailability(input: string) {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [day, times] = line.split(/\s+/);
      const [start, end] = (times ?? "").split("-");
      return { day: day?.toLowerCase(), start, end };
    });
}
