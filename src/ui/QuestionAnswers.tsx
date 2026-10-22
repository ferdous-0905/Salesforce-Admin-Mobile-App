import React, { memo } from "react";
import { Text, View } from "react-native";
import type { Question } from "../domain/models";
import { acceptedAnswer, isGradable } from "../domain/questions";
import { AnswerMarker } from "../components/AnswerFeedback";
import { colors, styles as s, toneColors } from "./theme";

/** Study view only: displaying answers never records an attempt. */
export const QuestionAnswers = memo(function QuestionAnswers({
  question,
  selected = [],
}: {
  question: Question;
  selected?: readonly string[];
}) {
  const gradable = isGradable(question);
  const correct = acceptedAnswer(question);
  return (
    <View style={{ gap: 10 }}>
      {!gradable && (
        <Text style={s.small}>Answer under review · Not scored</Text>
      )}
      {question.verificationStatus === "document_conflict" && (
        <Text style={s.small}>Researched answer shown · Source conflict</Text>
      )}
      {question.options.map((option) => {
        const right = gradable && correct.includes(option.id);
        const chosen = selected.includes(option.id);
        const wrong = gradable && chosen && !right;
        return (
          <View
            key={option.id}
            style={{
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: right
                ? colors.forest
                : wrong
                  ? colors.danger
                  : colors.line,
              backgroundColor: right
                ? colors.mint
                : wrong
                  ? toneColors.danger.background
                  : colors.surface,
              gap: 6,
            }}
          >
            <Text style={s.optionText}>
              {option.id}. {option.text}
            </Text>
            {right && (
              <AnswerMarker
                state="correct"
                label={chosen ? "Your answer · Correct" : "Correct answer"}
              />
            )}
            {wrong && (
              <AnswerMarker state="incorrect" label="Your answer · Incorrect" />
            )}
            {!gradable && chosen && (
              <AnswerMarker
                state="unverified"
                label="Your answer · Not scored"
              />
            )}
          </View>
        );
      })}
    </View>
  );
});
