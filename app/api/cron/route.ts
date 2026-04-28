import { NextRequest, NextResponse } from "next/server";
import { sendDueNotifications } from "@/notifications";
import { generateRecurringTasks } from "@/scheduling/recurring";

export async function POST(request: NextRequest) {
  if (process.env.CRON_SECRET && request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const householdId = body.householdId as string | undefined;
  if (!householdId) {
    return NextResponse.json({ error: "householdId required" }, { status: 400 });
  }

  const recurring = await generateRecurringTasks(householdId);
  const sent = await sendDueNotifications(householdId);
  return NextResponse.json({ recurring: recurring.length, notifications: sent });
}
