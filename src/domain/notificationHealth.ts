import type { ReminderDeviceStatus } from "../platform/reminderDevice";
export interface NotificationHealth {
  permission: boolean;
  channel: "enabled" | "blocked" | "missing" | "not-applicable";
  quietChannel: boolean;
  bannerCapable: boolean;
  scheduled: number;
  expected: number;
  nextAt: number | null;
  expiresAt: number | null;
  device: ReminderDeviceStatus | null;
}
/** A queued request is evidence of a saved schedule, not proof of OS delivery. */
export function notificationIssues(
  health: NotificationHealth,
  enabled: boolean,
): string[] {
  const issues: string[] = [];
  if (!health.permission)
    issues.push(
      "Notifications are blocked. Allow them in notification settings.",
    );
  if (health.channel === "blocked")
    issues.push("The Learning reminders channel is blocked.");
  if (health.channel === "missing")
    issues.push("The reminder channel is missing. Repair the schedule.");
  if (health.channel === "enabled" && !health.bannerCapable)
    issues.push("Banner alerts are not enabled by channel importance. Open Reminder channel settings and enable Pop on screen / banners if offered.");
  if (health.device?.batteryOptimizationEnabled)
    issues.push("Battery optimization is on. Review battery settings if reminders are delayed; the learner must choose any exemption.");
  if (health.quietChannel)
    issues.push("The reminder channel is quiet; alerts may have no sound.");
  if (
    enabled &&
    health.expiresAt === null &&
    health.scheduled < health.expected
  )
    issues.push(
      "The saved schedule is missing or incomplete. Repair it below.",
    );
  if (enabled && !health.expected)
    issues.push(
      "No times match the selected window. Try another window or interval.",
    );
  if (
    enabled &&
    health.expiresAt !== null &&
    health.expiresAt - Date.now() < 86_400_000
  )
    issues.push(
      "This reminder queue ends within a day. Reopen to renew it, or choose a repeating clock interval such as 60 minutes with All day.",
    );
  if (health.device?.backgroundRestricted)
    issues.push(
      "Android restricts background activity for this app. Review its battery settings.",
    );
  if (health.device?.batterySaver)
    issues.push("Battery Saver is on and can delay reminders.");
  if (health.device?.doNotDisturb)
    issues.push("Do Not Disturb is on and can silence alerts.");
  return issues;
}
