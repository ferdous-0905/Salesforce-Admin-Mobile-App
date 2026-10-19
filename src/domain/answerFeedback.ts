import type { Question } from "./models";
import { acceptedAnswer, isGradable } from "./questions";
export type AnswerState =
  "correct" | "missed" | "incorrect" | "neutral" | "unverified";
export function answerFeedback(
  question: Question,
  optionId: string,
  selected: readonly string[],
  revealed: boolean,
): { state: AnswerState; label: string } {
  const chosen = selected.includes(optionId);
  if (!revealed)
    return { state: "neutral", label: chosen ? "Your selection" : "" };
  if (!isGradable(question))
    return {
      state: "unverified",
      label: chosen ? "Your answer · Not scored" : "Under review · Not scored",
    };
  const right = acceptedAnswer(question).includes(optionId);
  if (right)
    return {
      state: chosen ? "correct" : "missed",
      label: chosen ? "Your answer · Correct" : "Correct answer · Not selected",
    };
  return {
    state: chosen ? "incorrect" : "neutral",
    label: chosen ? "Your answer · Incorrect" : "Incorrect option",
  };
}
