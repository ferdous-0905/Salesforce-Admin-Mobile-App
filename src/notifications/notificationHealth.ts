import { Platform } from "react-native";
import type { ReminderPreferences } from "../domain/reminders";
import {
  dailyWindowMinutes,
  upcomingWindowReminders,
} from "../domain/reminderWindows";
import type { NotificationHealth } from "../domain/notificationHealth";
import { readReminderDeviceStatus } from "../platform/reminderDevice";
const channelId = "learning-reminders";
const testId = "learning-reminder-test";

export async function readNotificationHealth(
  preferences: ReminderPreferences,
): Promise<NotificationHealth> {
  const api = await import("expo-notifications");
  const [permission, requests, channel, device] = await Promise.all([
    api.getPermissionsAsync(),
    api.getAllScheduledNotificationsAsync(),
    Platform.OS === "android"
      ? api.getNotificationChannelAsync(channelId)
      : null,
    readReminderDeviceStatus().catch(() => null),
  ]);
  const now = new Date();
  const times: number[] = [];
  let daily = false;
  for (const request of requests) {
    if (!(
      request.identifier === "learning-reminder" ||
      request.identifier.startsWith("learning-reminder:")
    ))
      continue;
    const trigger = request.trigger as {
      type?: string;
      hour?: number;
      minute?: number;
      date?: number | Date;
      value?: number;
    } | null;
    if (
      trigger?.type === "daily" &&
      Number.isInteger(trigger.hour) &&
      Number.isInteger(trigger.minute)
    ) {
      const next = new Date(now);
      next.setHours(trigger.hour!, trigger.minute!, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      times.push(next.getTime());
      daily = true;
    } else if (
      trigger?.type === "date" &&
      (trigger.date !== undefined || trigger.value !== undefined)
    ) {
      const date = new Date(trigger.date ?? trigger.value!).getTime();
      if (Number.isFinite(date) && date > now.getTime()) times.push(date);
    }
  }
  const expected = preferences.enabled
    ? (dailyWindowMinutes(preferences)?.length ??
      upcomingWindowReminders(preferences, now).length)
    : 0;
  return {
    permission: permission.granted,
    channel:
      Platform.OS !== "android"
        ? "not-applicable"
        : !channel
          ? "missing"
          : channel.importance === api.AndroidImportance.NONE
            ? "blocked"
            : "enabled",
    quietChannel:
      !!channel &&
      (channel.importance < api.AndroidImportance.DEFAULT ||
        channel.sound === null),
    scheduled: times.length,
    expected,
    nextAt: times.length ? Math.min(...times) : null,
    expiresAt: !daily && times.length ? Math.max(...times) : null,
    device,
  };
}

/** Separate ID keeps the one-off test out of normal reminder counts. */
export async function scheduleTestNotification() {
  const api = await import("expo-notifications");
  if (!(await api.getPermissionsAsync()).granted)
    throw new Error("Allow notifications first, then try the test again.");
  if (Platform.OS === "android") {
    const channel = await api.getNotificationChannelAsync(channelId);
    if (channel?.importance === api.AndroidImportance.NONE)
      throw new Error("Unblock the Learning reminders channel first.");
    await api.setNotificationChannelAsync(channelId, {
      name: "Learning reminders",
      importance: api.AndroidImportance.DEFAULT,
    });
  }
  await api.cancelScheduledNotificationAsync(testId);
  await api.scheduleNotificationAsync({
    identifier: testId,
    content: {
      title: "Your reminder test",
      body: "If you can see this, notification display is working. Tap to return to practice.",
      sound: "default",
      data: { kind: "learning-reminder", test: true },
    },
    trigger: {
      type: api.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60,
      channelId,
    },
  });
}
