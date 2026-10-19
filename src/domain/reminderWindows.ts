import * as SunCalc from "suncalc";
import {
  isSolarWindow,
  parseClock,
  validateWindow,
  type ReminderPreferences,
} from "./reminders";
/** Half-open local-time windows avoid double delivery at the day/night boundary. */
export function isReminderTimeAllowed(
  date: Date,
  preferences: ReminderPreferences,
): boolean {
  const mode = preferences.window ?? "all";
  if (mode === "all") return true;
  if (isSolarWindow(mode)) {
    if (!preferences.location) return false;
    const { latitude, longitude } = preferences.location;
    // The standard sunrise altitude also handles polar day/night without invalid event dates.
    const daylight =
      SunCalc.getPosition(date, latitude, longitude).altitude >
      (-0.833 * Math.PI) / 180;
    return mode === "sunrise-sunset" ? daylight : !daylight;
  }
  const start = parseClock(preferences.dayStart ?? "07:00"),
    end = parseClock(preferences.dayEnd ?? "19:00");
  const minute = date.getHours() * 60 + date.getMinutes();
  const daytime =
    start < end
      ? minute >= start && minute < end
      : minute >= start || minute < end;
  return mode === "day" ? daytime : !daytime;
}
/** A bounded native queue keeps changing solar windows accurate, without background location. */
export function upcomingWindowReminders(
  preferences: ReminderPreferences,
  now: Date,
  limit = 60,
): Date[] {
  validateWindow(preferences);
  const interval = preferences.intervalMinutes * 60000;
  // A stable clock grid preserves already queued times when reopening the app.
  const first = (Math.floor(now.getTime() / interval) + 1) * interval;
  const end = now.getTime() + 366 * 86400000;
  const dates: Date[] = [];
  for (let time = first; time < end && dates.length < limit; time += interval) {
    const date = new Date(time);
    if (isReminderTimeAllowed(date, preferences)) dates.push(date);
  }
  return dates;
}

/** Fixed clock windows can repeat indefinitely when their interval fits a 24-hour cycle. */
export function dailyWindowMinutes(
  preferences: ReminderPreferences,
): number[] | null {
  if (
    !["all", "day", "night"].includes(preferences.window ?? "all") ||
    1440 % preferences.intervalMinutes !== 0
  )
    return null;
  const start = parseClock(preferences.dayStart ?? "07:00");
  const end = parseClock(preferences.dayEnd ?? "19:00");
  const result: number[] = [];
  for (let minute = 0; minute < 1440; minute += preferences.intervalMinutes) {
    const inDay =
      start < end
        ? minute >= start && minute < end
        : minute >= start || minute < end;
    if (
      (preferences.window ?? "all") === "all" ||
      (preferences.window === "day" ? inDay : !inDay)
    )
      result.push(minute);
  }
  return result.length && result.length <= 60 ? result : null;
}
