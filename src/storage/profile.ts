import * as SQLite from "expo-sqlite";
import type { UserProgress } from "../domain/models";
import { calculateStatistics } from "../domain/progress";
let database: ReturnType<typeof SQLite.openDatabaseAsync> | null = null;
function getDatabase() {
  database ??= SQLite.openDatabaseAsync("salesforce-admin-quiz.db").catch(
    (error) => {
      database = null;
      throw error;
    },
  );
  return database;
}
export async function loadProfile(): Promise<UserProgress | null> {
  const db = await getDatabase();
  const version = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  if ((version?.user_version ?? 0) > 1)
    throw new Error("This data needs a newer version of the app.");
  await db.execAsync(
    "PRAGMA journal_mode = WAL; CREATE TABLE IF NOT EXISTS profile (id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL); PRAGMA user_version = 1;",
  );
  const row = await db.getFirstAsync<{ data: string }>(
    "SELECT data FROM profile WHERE id=1",
  );
  return row ? JSON.parse(row.data) : null;
}
export async function saveProfile(profile: UserProgress) {
  const db = await getDatabase();
  await db.runAsync(
    "INSERT INTO profile(id,data) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data",
    JSON.stringify(profile),
  );
}
export function newProfile(name: string): UserProgress {
  const now = new Date().toISOString();
  return {
    name: name.trim(),
    storageKey: "local",
    createdAt: now,
    updatedAt: now,
    questions: {},
    statistics: calculateStatistics({}),
  };
}
export async function deleteProfile() {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM profile WHERE id=1");
}
