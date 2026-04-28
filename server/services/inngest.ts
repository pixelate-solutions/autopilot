import { Inngest } from "inngest";
import { generateRecurringTasks } from "@/scheduling/recurring";
import { sendDueNotifications } from "@/notifications";

export const inngest = new Inngest({ id: "autopilot" });

const recurringTaskGeneration = inngest.createFunction(
  { id: "recurring-task-generation", triggers: [{ event: "autopilot/recurring.generate" }] },
  async ({ event }) => {
    const householdId = event.data?.householdId as string | undefined;
    if (!householdId) return { generated: 0 };
    const generated = await generateRecurringTasks(householdId);
    return { generated: generated.length };
  },
);

const notificationSending = inngest.createFunction(
  { id: "notification-sending", triggers: [{ event: "autopilot/notifications.send" }] },
  async ({ event }) => {
    const householdId = event.data?.householdId as string | undefined;
    if (!householdId) return { sent: 0 };
    const sent = await sendDueNotifications(householdId);
    return { sent };
  },
);

export const functions = [recurringTaskGeneration, notificationSending];
