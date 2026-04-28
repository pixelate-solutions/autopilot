import { addDays, addMonths, addWeeks, isBefore } from "date-fns";
import type { WeatherSignal } from "@/server/services/external-data";

export function nextDueDate(input: {
  cadence: string;
  from?: Date;
  season?: string;
  weather?: WeatherSignal | null;
  completedRecently?: boolean;
}) {
  const from = input.from ?? new Date();
  let due =
    input.cadence === "weekly" ? addWeeks(from, 1)
    : input.cadence === "monthly" ? addMonths(from, 1)
    : input.cadence === "quarterly" ? addMonths(from, 3)
    : input.cadence === "annual" ? addMonths(from, 12)
    : input.cadence === "seasonal" ? addMonths(from, 3)
    : addDays(from, 7);

  if (input.weather?.severeWeather || (input.weather?.precipitationChance ?? 0) > 0.7) {
    due = addDays(due, 3);
  }

  if (input.completedRecently && isBefore(due, addDays(from, 14))) {
    due = addDays(from, 14);
  }

  return due;
}

export function notificationWindows(dueAt: Date) {
  return [addDays(dueAt, -7), addDays(dueAt, -1)];
}
