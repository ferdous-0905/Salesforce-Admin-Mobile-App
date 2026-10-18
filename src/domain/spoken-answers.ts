import type { PublicQuestion } from "./models";

const ORDINAL_OPTIONS = ["first", "second", "third", "fourth", "fifth"];

export function parseSpokenAnswers(
  transcript: string,
  question: PublicQuestion,
): string[] {
  const spoken = transcript.toLowerCase();
  const selected = question.options
    .filter((option) => {
      const letter = new RegExp(
        `\\b(?:option|answer)?\\s*${option.id.toLowerCase()}\\b`,
      );
      return letter.test(spoken) || spoken.includes(option.text.toLowerCase());
    })
    .map((option) => option.id);

  ORDINAL_OPTIONS.forEach((ordinal, index) => {
    const option = question.options.find(
      (candidate) => candidate.id === String.fromCharCode(65 + index),
    );
    if (option && spoken.includes(ordinal) && !selected.includes(option.id))
      selected.push(option.id);
  });
  return question.requiredAnswers === 1 ? selected.slice(0, 1) : selected;
}
