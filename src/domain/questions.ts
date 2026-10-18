import type {
  PracticeMode,
  PublicQuestion,
  Question,
  UserProgress,
} from "./models";

export function isGradable(question: Question): boolean {
  const optionIds = new Set(question.options.map((option) => option.id));
  if (
    question.verificationStatus === "needs_review" ||
    optionIds.size !== question.options.length
  ) {
    return false;
  }

  const requiresResearch =
    question.verificationStatus === "verified" ||
    question.verificationStatus === "document_conflict";
  if (requiresResearch) {
    return (
      !!question.verifiedAnswer?.length &&
      question.verifiedAnswer.every((id) => optionIds.has(id))
    );
  }

  return true;
}

export function acceptedAnswer(question: Question): string[] {
  if (!isGradable(question)) return [];

  const hasReviewedAnswer =
    question.verificationStatus === "verified" ||
    question.verificationStatus === "document_conflict";
  return hasReviewedAnswer && question.verifiedAnswer?.length
    ? question.verifiedAnswer
    : question.documentAnswer;
}

export function normalizeAnswers(answers: string[]): string[] {
  return [
    ...new Set(
      answers.map((answer) => answer.trim().toUpperCase()).filter(Boolean),
    ),
  ].sort();
}

export function isCorrect(question: Question, answers: string[]): boolean {
  if (!isGradable(question))
    throw new Error("Question is not eligible for grading");

  const submitted = normalizeAnswers(answers);
  const accepted = normalizeAnswers(acceptedAnswer(question));
  return (
    submitted.length === accepted.length &&
    submitted.every((answer, index) => answer === accepted[index])
  );
}

/** Prefer unseen questions, then failed questions, then the full bank. */
export function selectQuestion(
  questions: readonly Question[],
  user: UserProgress,
  mode: PracticeMode = "random",
  random: () => number = Math.random,
): Question | null {
  const failed = questions.filter(
    (question) =>
      user.questions[String(question.questionNumber)]?.status === "failed",
  );
  const unseen = questions.filter(
    (question) => !user.questions[String(question.questionNumber)],
  );
  const candidates =
    mode === "failed"
      ? failed
      : unseen.length
        ? unseen
        : failed.length
          ? failed
          : questions;
  return candidates[Math.floor(random() * candidates.length)] ?? null;
}

export function publicQuestion(question: Question): PublicQuestion {
  return {
    questionNumber: question.questionNumber,
    type: question.type,
    requiredAnswers:
      question.verifiedAnswer?.length || question.requiredAnswers,
    question: question.question,
    options: question.options,
    verificationStatus: question.verificationStatus,
    reviewRequired: !isGradable(question),
  };
}
