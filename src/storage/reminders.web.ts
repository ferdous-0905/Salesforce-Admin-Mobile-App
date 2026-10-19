import { decodeReminders, type ReminderPreferences } from "../domain/reminders";
const key = "learning-reminders-v1";
export async function loadReminders() {
  return decodeReminders(localStorage.getItem(key));
}
export async function saveReminders(value: ReminderPreferences) {
  localStorage.setItem(key, JSON.stringify(value));
}
