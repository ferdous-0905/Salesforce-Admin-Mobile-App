import Storage from "expo-sqlite/kv-store";
import { decodeReminders, type ReminderPreferences } from "../domain/reminders";
const key = "learning-reminders-v1";
export async function loadReminders() {
  return decodeReminders(await Storage.getItem(key));
}
export async function saveReminders(value: ReminderPreferences) {
  await Storage.setItem(key, JSON.stringify(value));
}
