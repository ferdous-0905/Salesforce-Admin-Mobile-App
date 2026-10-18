import type { UserProgress, Question } from "./models";
import { calculateStatistics } from "./progress";
export function decodeBackup(
  text: string,
  bank: readonly Question[],
): UserProgress {
  if (text.length > 20_000_000) throw new Error("Backup is too large.");
  const envelope = JSON.parse(text);
  if (envelope.format !== "salesforce-admin-quiz" || envelope.version !== 1)
    throw new Error("Unsupported backup format.");
  const user = envelope.profile;
  if (
    !user ||
    typeof user.name !== "string" ||
    !user.name.trim() ||
    user.name.length > 80 ||
    !user.questions ||
    Array.isArray(user.questions) ||
    typeof user.questions !== "object"
  )
    throw new Error("Invalid profile.");
  const questions: UserProgress["questions"] = {};
  for (const [key, value] of Object.entries(user.questions)) {
    const q = bank.find((q) => String(q.questionNumber) === key);
    const p = value as UserProgress["questions"][string];
    if (
      !q ||
      !p ||
      p.questionNumber !== q.questionNumber ||
      !Array.isArray(p.history) ||
      !p.history.length ||
      p.attempts !== p.history.length
    )
      throw new Error("Invalid question history.");
    const answersValid = (a: unknown): a is string[] =>
      Array.isArray(a) &&
      new Set(a).size === a.length &&
      a.every(
        (id) => typeof id === "string" && q.options.some((o) => o.id === id),
      );
    for (const a of p.history)
      if (
        !a ||
        !answersValid(a.submittedAnswers) ||
        ![true, false, null].includes(a.correct) ||
        typeof a.attemptedAt !== "string" ||
        !Number.isFinite(Date.parse(a.attemptedAt))
      )
        throw new Error("Invalid attempt.");
    const last = p.history.at(-1)!;
    questions[key] = {
      questionNumber: q.questionNumber,
      attempts: p.history.length,
      status:
        last.correct === null ? "reviewed" : last.correct ? "passed" : "failed",
      lastAnswer: last.submittedAnswers,
      lastResult:
        last.correct === null
          ? "ungraded"
          : last.correct
            ? "correct"
            : "incorrect",
      lastAttemptAt: last.attemptedAt,
      history: p.history.map((a) => ({
        submittedAnswers: a.submittedAnswers,
        correct: a.correct,
        attemptedAt: a.attemptedAt,
      })),
    };
  }
  const now = new Date().toISOString();
  return {
    name: user.name.trim(),
    storageKey: "local",
    createdAt:
      typeof user.createdAt === "string" &&
      Number.isFinite(Date.parse(user.createdAt))
        ? user.createdAt
        : now,
    updatedAt: now,
    questions,
    statistics: calculateStatistics(questions),
  };
}
export function encodeBackup(profile: UserProgress): string {
  const { googleAccount: _account, ...portableProfile } = profile;
  return JSON.stringify(
    {
      format: "salesforce-admin-quiz",
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: portableProfile,
    },
    null,
    2,
  );
}
