import type { Question, UserProgress, UserQuestionProgress } from "./models";

export type ProgressFilter =
  "all" | "attempted" | "unattempted" | "passed" | "failed" | "reviewed";
export type ProgressOrder = "serial" | "recent";
export interface ProgressQuestion {
  question: Question;
  progress?: UserQuestionProgress;
  status: UserQuestionProgress["status"] | "unattempted";
}

export function matchesProgressFilter(
  row: ProgressQuestion,
  filter: ProgressFilter,
): boolean {
  return (
    filter === "all" ||
    (filter === "attempted" ? !!row.progress : row.status === filter)
  );
}

/** Count matching metadata without mounting any question cards. */
export function progressFilterCounts(
  rows: readonly ProgressQuestion[],
): Record<ProgressFilter, number> {
  const counts = {
    all: rows.length,
    attempted: 0,
    unattempted: 0,
    passed: 0,
    failed: 0,
    reviewed: 0,
  };
  for (const row of rows) {
    counts[row.status]++;
    if (row.progress) counts.attempted++;
  }
  return counts;
}

/** Join the bank to saved results so untouched questions remain visible. Read-only. */
export function progressQuestions(
  bank: readonly Question[],
  profile: UserProgress,
  filter: ProgressFilter = "all",
  search = "",
  order: ProgressOrder = "serial",
): ProgressQuestion[] {
  const query = search.trim().replace(/^#/, "").toLowerCase();
  return bank
    .map((question) => {
      const progress = profile.questions[String(question.questionNumber)];
      return { question, progress, status: progress?.status ?? "unattempted" };
    })
    .filter(
      (row) =>
        matchesProgressFilter(row, filter) &&
        (!query ||
          (/^\d+$/.test(query)
            ? String(row.question.questionNumber) === query
            : row.question.question.toLowerCase().includes(query))),
    )
    .sort((a, b) => {
      if (order === "recent") {
        if (!!a.progress !== !!b.progress) return a.progress ? -1 : 1;
        const time = (b.progress?.lastAttemptAt ?? "").localeCompare(
          a.progress?.lastAttemptAt ?? "",
        );
        if (time) return time;
      }
      return a.question.questionNumber - b.question.questionNumber;
    });
}
