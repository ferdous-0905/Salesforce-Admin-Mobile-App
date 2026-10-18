import type { UserProgress } from "./models";
export interface GoogleAccount {
  id: string;
  email: string;
  name: string;
}
export function isGoogleAccount(value: unknown): value is GoogleAccount {
  if (!value || typeof value !== "object") return false;
  const account = value as GoogleAccount;
  return (
    typeof account.id === "string" &&
    account.id.length > 0 &&
    account.id.length < 256 &&
    typeof account.email === "string" &&
    account.email.includes("@") &&
    typeof account.name === "string" &&
    account.name.trim().length > 0 &&
    account.name.length <= 160
  );
}
/** Linking a guest profile preserves its attempts; a different bound account needs an explicit profile change. */
export function linkGoogleAccount(
  profile: UserProgress,
  account: GoogleAccount,
): UserProgress {
  if (!isGoogleAccount(account))
    throw new Error("Google did not return a valid account. Please try again.");
  if (profile.googleAccount && profile.googleAccount.id !== account.id)
    throw new Error(
      "This local profile is linked to another Google account. Export its progress before deleting or changing profiles.",
    );
  return {
    ...profile,
    name: account.name.trim().slice(0, 80),
    googleAccount: { id: account.id, email: account.email, name: account.name },
    updatedAt: new Date().toISOString(),
  };
}
