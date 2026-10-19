import type { UserProgress } from '../domain/models';
import { calculateStatistics } from '../domain/progress';
const profileKey = 'salesforce-admin-quiz-preview-v1';
/** Browser previews have their own profile; native SQLite data is untouched. */
export async function loadProfile(): Promise<UserProgress | null> {
  const stored = localStorage.getItem(profileKey);
  return stored ? JSON.parse(stored) : null;
}
export async function saveProfile(profile: UserProgress) {
  localStorage.setItem(profileKey, JSON.stringify(profile));
}
export async function deleteProfile() { localStorage.removeItem(profileKey); }
export function newProfile(name: string): UserProgress {
  const now = new Date().toISOString();
  return { name: name.trim(), storageKey: 'local', createdAt: now, updatedAt: now, questions: {}, statistics: calculateStatistics({}) };
}
