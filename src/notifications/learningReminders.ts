import {
  dailyWindowMinutes,
  upcomingWindowReminders,
} from "../domain/reminderWindows";
import { Platform } from "react-native";
import type { ReminderPreferences } from "../domain/reminders";
import {
  reminderMessage,
  type ReminderContext,
} from "../domain/reminderContent";
const identifier = "learning-reminder";
const channelId = "learning-reminders";
async function notifications() {
  return import("expo-notifications");
}
export async function synchronizeReminders(
  preferences: ReminderPreferences,
  hasLearner: boolean,
  requestPermission = false,
  context?: ReminderContext,
  repair = false,
): Promise<string> {
  const api = await notifications();
  if (Platform.OS === "android")
    await api.setNotificationChannelAsync(channelId, {
      name: "Learning reminders",
      importance: api.AndroidImportance.DEFAULT,
    });
  const scheduled = await api.getAllScheduledNotificationsAsync();
  const ours = scheduled.filter(
    (item) =>
      item.identifier === identifier ||
      item.identifier.startsWith(identifier + ":"),
  );
  const cancelAll = async () => {
    for (const item of ours)
      await api.cancelScheduledNotificationAsync(item.identifier);
  };
  if (!preferences.enabled || !hasLearner) {
    await api.cancelScheduledNotificationAsync("learning-reminder-test");
    await cancelAll();
    return preferences.enabled
      ? "Reminders start after you create a learner profile."
      : "Learning reminders are off.";
  }
  let permission = await api.getPermissionsAsync();
  if (!permission.granted && requestPermission && permission.canAskAgain)
    permission = await api.requestPermissionsAsync();
  if (!permission.granted) {
    await cancelAll();
    return "Notifications are not allowed. Enable them in device settings, then return here.";
  }
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const signature = JSON.stringify([
    preferences,
    timezone,
    context,
    "friendly-v1",
  ]);
  const daily = dailyWindowMinutes(preferences);
  const dates = daily ? [] : upcomingWindowReminders(preferences, new Date());
  const plan = daily
    ? daily.map((minute, index) => ({
        id: identifier + ":daily:" + minute,
        slot: index,
        trigger: {
          type: api.SchedulableTriggerInputTypes.DAILY,
          hour: Math.floor(minute / 60),
          minute: minute % 60,
          channelId,
        },
      }))
    : dates.map((date) => ({
        id: identifier + ":" + date.getTime(),
        slot: Math.floor(
          date.getTime() / (preferences.intervalMinutes * 60000),
        ),
        trigger: {
          type: api.SchedulableTriggerInputTypes.DATE,
          date,
          channelId,
        },
      }));
  const desired = new Set(plan.map((item) => item.id));
  for (const item of ours)
    if (
      repair ||
      !desired.has(item.identifier) ||
      item.content.data?.windowSignature !== signature
    )
      await api.cancelScheduledNotificationAsync(item.identifier);
  const existing = new Set(
    ours
      .filter(
        (item) => !repair && item.content.data?.windowSignature === signature,
      )
      .map((item) => item.identifier),
  );
  for (const item of plan) {
    if (existing.has(item.id)) continue;
    await api.scheduleNotificationAsync({
      identifier: item.id,
      content: {
        ...reminderMessage(item.slot, context),
        sound: "default",
        data: { kind: identifier, windowSignature: signature },
      },
      trigger: item.trigger,
    });
  }
  if (daily)
    return "Friendly reminders rotate through your selected times each day. Device settings may delay delivery; reopen after changing time zone.";
  return dates.length
    ? "Fresh reminders queued through " +
        dates.at(-1)!.toLocaleString() +
        ". Open the app to refresh the queue; device settings may delay delivery."
    : "No reminder times match this window and interval in the next year. Try a shorter interval or another window.";
}
export async function observeLearningNotifications(onLearn: () => void) {
  const api = await notifications();
  api.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  const handle = (
    response: import("expo-notifications").NotificationResponse | null,
  ) => {
    if (response?.notification.request.content.data?.kind !== identifier)
      return;
    onLearn();
    void api.clearLastNotificationResponseAsync();
  };
  const listener = api.addNotificationResponseReceivedListener(handle);
  handle(await api.getLastNotificationResponseAsync());
  return () => listener.remove();
}
