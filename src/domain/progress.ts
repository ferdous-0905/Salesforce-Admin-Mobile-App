import type {
  Attempt,
  ProgressStatistics,
  Question,
  UserProgress,
  UserQuestionProgress,
} from "./models";

export function calculateStatistics(
  questions: UserProgress["questions"],
): ProgressStatistics {
  const progress = Object.values(questions);
  const passed = progress.filter((entry) => entry.status === "passed").length;
  const failed = progress.filter((entry) => entry.status === "failed").length;
  const attempts = progress.flatMap((entry) => entry.history ?? []);
  const gradedCount = passed + failed;

  return {
    attempted: gradedCount,
    reviewed: progress.filter((entry) => entry.status === "reviewed").length,
    passed,
    failed,
    totalAttempts: attempts.filter((attempt) => attempt.correct !== null)
      .length,
    correctSubmissions: attempts.filter((attempt) => attempt.correct === true)
      .length,
    incorrectSubmissions: attempts.filter(
      (attempt) => attempt.correct === false,
    ).length,
    score: gradedCount ? Math.round((passed / gradedCount) * 1000) / 10 : 0,
  };
}

export function recordAttempt(
  user: UserProgress,
  question: Question,
  attempt: Attempt,
): UserProgress {
  const key = String(question.questionNumber);
  const previous = user.questions[key];
  const reviewed = attempt.correct === null;
  const questionProgress: UserQuestionProgress = {
    questionNumber: question.questionNumber,
    attempts: (previous?.attempts ?? 0) + 1,
    status: reviewed ? "reviewed" : attempt.correct ? "passed" : "failed",
    lastAnswer: attempt.submittedAnswers,
    lastResult: reviewed
      ? "ungraded"
      : attempt.correct
        ? "correct"
        : "incorrect",
    lastAttemptAt: attempt.attemptedAt,
    history: [...(previous?.history ?? []), attempt],
  };
  const questions = { ...user.questions, [key]: questionProgress };
  return { ...user, questions, statistics: calculateStatistics(questions) };
}

export function clearProgress(user: UserProgress): UserProgress {
  return { ...user, questions: {}, statistics: calculateStatistics({}) };
}
