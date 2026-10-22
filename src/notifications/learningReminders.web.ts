import type { ReminderPreferences } from "../domain/reminders";
export async function synchronizeReminders(
  _preferences: ReminderPreferences,
  _hasLearner: boolean,
  _requestPermission = false,
  _context?: import("../domain/reminderContent").ReminderContext,
  _repair = false,
) {
  return "Automatic reminders work in the installed Android/iOS app. This browser preview saves your preference but does not schedule notifications.";
}
export async function observeLearningNotifications(_onLearn: () => void) {
  return () => {};
}
