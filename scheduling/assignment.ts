import { and, eq, gte, lte, or } from "drizzle-orm";
import { addDays, addHours, setHours, setMinutes, setSeconds, setMilliseconds } from "date-fns";
import { getDb } from "@/db";
import { households, jobs, technicians } from "@/db/schema";

export type AvailabilityWindow = {
  day: "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
  start: string;
  end: string;
};

const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export async function findAutomaticAssignment(input: {
  householdId: string;
  serviceType: string;
  requestedWindowStart?: Date;
  requestedWindowEnd?: Date;
  durationHours?: number;
}) {
  const db = getDb();
  const [household] = await db.select().from(households).where(eq(households.id, input.householdId)).limit(1);
  if (!household) throw new Error("Household not found.");

  const customerAvailability = normalizeAvailability(household.customerAvailability);
  const candidates = await db
    .select()
    .from(technicians)
    .where(eq(technicians.active, true));

  const compatible = candidates.filter((tech) => tech.serviceTypes.includes(input.serviceType));
  const searchStart = input.requestedWindowStart ?? addHours(new Date(), 24);
  const searchEnd = input.requestedWindowEnd ?? addDays(searchStart, 21);

  for (let dayOffset = 0; dayOffset <= 30; dayOffset += 1) {
    const day = addDays(startOfHour(searchStart), dayOffset);
    if (day > searchEnd) break;

    for (const technician of compatible) {
      const techAvailability = normalizeAvailability(technician.availability);
      const slot = await findSlotForDay({
        householdId: input.householdId,
        technicianId: technician.id,
        day,
        customerAvailability,
        technicianAvailability: techAvailability,
        durationHours: input.durationHours ?? 2,
      });
      if (slot) {
        return { technician, scheduledStart: slot.start, scheduledEnd: slot.end };
      }
    }
  }

  return null;
}

function normalizeAvailability(value: unknown): AvailabilityWindow[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is AvailabilityWindow => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as Partial<AvailabilityWindow>;
    return Boolean(candidate.day && dayKeys.includes(candidate.day) && candidate.start && candidate.end);
  });
}

async function findSlotForDay(input: {
  householdId: string;
  technicianId: string;
  day: Date;
  customerAvailability: AvailabilityWindow[];
  technicianAvailability: AvailabilityWindow[];
  durationHours: number;
}) {
  const dayKey = dayKeys[input.day.getDay()];
  const customerWindows = input.customerAvailability.filter((window) => window.day === dayKey);
  const techWindows = input.technicianAvailability.filter((window) => window.day === dayKey);
  if (!customerWindows.length || !techWindows.length) return null;

  const dayStart = setMilliseconds(setSeconds(setMinutes(setHours(input.day, 0), 0), 0), 0);
  const dayEnd = addDays(dayStart, 1);
  const db = getDb();
  const conflicts = await db
    .select()
    .from(jobs)
    .where(and(
      eq(jobs.assignedTechnicianId, input.technicianId),
      or(
        and(gte(jobs.scheduledStart, dayStart), lte(jobs.scheduledStart, dayEnd)),
        and(gte(jobs.scheduledEnd, dayStart), lte(jobs.scheduledEnd, dayEnd)),
      ),
    ));

  for (const customerWindow of customerWindows) {
    for (const techWindow of techWindows) {
      const start = maxDate(timeOnDay(dayStart, customerWindow.start), timeOnDay(dayStart, techWindow.start), new Date());
      const latestEnd = minDate(timeOnDay(dayStart, customerWindow.end), timeOnDay(dayStart, techWindow.end));
      let cursor = startOfHour(start);

      while (addHours(cursor, input.durationHours) <= latestEnd) {
        const end = addHours(cursor, input.durationHours);
        const overlaps = conflicts.some((job) =>
          job.scheduledStart && job.scheduledEnd && cursor < job.scheduledEnd && end > job.scheduledStart,
        );
        if (!overlaps) return { start: cursor, end };
        cursor = addHours(cursor, 1);
      }
    }
  }

  return null;
}

function timeOnDay(day: Date, value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return setMilliseconds(setSeconds(setMinutes(setHours(day, hours), minutes), 0), 0);
}

function startOfHour(date: Date) {
  return setMilliseconds(setSeconds(setMinutes(date, 0), 0), 0);
}

function maxDate(...dates: Date[]) {
  return new Date(Math.max(...dates.map((date) => date.getTime())));
}

function minDate(...dates: Date[]) {
  return new Date(Math.min(...dates.map((date) => date.getTime())));
}
