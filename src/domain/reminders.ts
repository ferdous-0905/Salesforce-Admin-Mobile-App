export interface ReminderPreferences {
  window?: ReminderWindow;
  dayStart?: string;
  dayEnd?: string;
  location?: { latitude: number; longitude: number };
  enabled: boolean;
  intervalMinutes: number;
}
export const defaultReminders: ReminderPreferences = {
  enabled: true,
  intervalMinutes: 60,
};
export function parseReminderMinutes(value: string): number {
  if (!/^\d+$/.test(value.trim()))
    throw new Error("Enter a whole number of minutes.");
  const minutes = Number(value);
  if (!Number.isSafeInteger(minutes) || minutes < 1 || minutes > 10080)
    throw new Error("Choose between 1 and 10080 minutes (7 days).");
  return minutes;
}
export function decodeReminders(text: string | null): ReminderPreferences {
  if (!text) return { ...defaultReminders };
  const value = JSON.parse(text);
  if (typeof value.enabled !== "boolean")
    throw new Error("Invalid reminder preference.");
  return validateWindow({
    enabled: value.enabled,
    intervalMinutes: parseReminderMinutes(String(value.intervalMinutes)),
    ...(value.window !== undefined ? { window: value.window } : {}),
    ...(value.dayStart !== undefined ? { dayStart: value.dayStart } : {}),
    ...(value.dayEnd !== undefined ? { dayEnd: value.dayEnd } : {}),
    ...(value.location !== undefined ? { location: value.location } : {}),
  });
}
export function reminderNeedsUpdate(
  scheduledSeconds: number | null,
  minutes: number,
) {
  return scheduledSeconds !== minutes * 60;
}

export type ReminderWindow =
  "all" | "day" | "night" | "sunrise-sunset" | "sunset-sunrise";
export const reminderWindows: { value: ReminderWindow; label: string }[] = [
  { value: "all", label: "All day" },
  { value: "day", label: "Daytime" },
  { value: "night", label: "Nighttime" },
  { value: "sunrise-sunset", label: "Sunrise to sunset" },
  { value: "sunset-sunrise", label: "Sunset to sunrise" },
];
export function parseClock(value: string): number {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value))
    throw new Error("Use a 24-hour time such as 07:00 or 19:00.");
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}
export function isSolarWindow(value: ReminderWindow | undefined) {
  return value === "sunrise-sunset" || value === "sunset-sunrise";
}
export function validateWindow(
  value: ReminderPreferences,
): ReminderPreferences {
  if (!reminderWindows.some((item) => item.value === (value.window ?? "all")))
    throw new Error("Choose a valid reminder window.");
  const start = parseClock(value.dayStart ?? "07:00"),
    end = parseClock(value.dayEnd ?? "19:00");
  if (start === end)
    throw new Error(
      "Daytime start and end must be different. Choose All day for 24-hour reminders.",
    );
  if (
    value.location &&
    (!Number.isFinite(value.location.latitude) ||
      Math.abs(value.location.latitude) > 90 ||
      !Number.isFinite(value.location.longitude) ||
      Math.abs(value.location.longitude) > 180)
  )
    throw new Error(
      "Enter latitude from -90 to 90 and longitude from -180 to 180.",
    );
  if (isSolarWindow(value.window) && !value.location)
    throw new Error(
      "Add your approximate latitude and longitude for sunrise/sunset reminders.",
    );
  return value;
}
