import { answerFeedback } from "../domain/answerFeedback";
import {
  AnswerMarker,
  ResultBanner,
  answerPalette,
} from "../components/AnswerFeedback";
import React, { useState } from "react";
import type { QuizVisit } from "../domain/models";
import { Pressable, Text, View } from "react-native";
import type { PracticeMode } from "../domain/models";
import { isGradable, publicQuestion } from "../domain/questions";
import { Button, Card, Icon, Motion } from "../ui/primitives";
import { styles as s, colors } from "../ui/theme";
import { Disclosure } from "../ui/Disclosure";
import { QuestionExplanation } from "../components/QuestionExplanation";
import type { useVoice } from "../hooks/useVoice";
interface Props {
  visits: QuizVisit[];
  position: number;
  mode: PracticeMode;
  busy: boolean;
  active: boolean;
  voice: ReturnType<typeof useVoice>;
  onToggle: (id: string) => void;
  onSubmit: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onHome: () => void;
}
export function QuizScreen({
  visits,
  position,
  mode,
  busy,
  active,
  voice,
  onToggle,
  onSubmit,
  onPrevious,
  onNext,
  onHome,
}: Props) {
  const current = visits[position];
  if (!current) return null;
  const question = current.question;
  const requiredAnswers = publicQuestion(question).requiredAnswers;
  return (
    <View
      style={{
        gap: 20,
        borderRadius: 22,
        padding: current.submitted ? 12 : 0,
        backgroundColor: current.submitted
          ? current.correct === null
            ? colors.sun
            : current.correct
              ? colors.mint
              : "#FAE9E5"
          : "transparent",
      }}
    >
      <View style={s.row}>
        <Text style={s.eyebrow}>
          {mode === "failed" ? "Review practice" : "Practice"}
        </Text>
        <Button title="Back" icon="previous" secondary onPress={onHome} />
      </View>
      <Motion key={`${question.questionNumber}:${position}`}>
        <Card>
          <View style={s.row}>
            <View style={s.sectionHeading}>
              <Text style={s.label}>Question #{question.questionNumber}</Text>
            </View>
          </View>
          {question.verificationStatus === "document_conflict" && (
            <Text style={s.badge}>
              Source conflict · researched answer used
            </Text>
          )}
          {!isGradable(question) && (
            <Text style={s.badge}>
              Under review · this question is not scored
            </Text>
          )}
          <Text style={s.question}>{question.question}</Text>
          <Text style={s.small}>
            Select {requiredAnswers}{" "}
            {requiredAnswers === 1 ? "answer" : "answers"}.
          </Text>
          {question.options.map((option) => {
            const selected = current.selected.includes(option.id);
            const feedback = answerFeedback(
              question,
              option.id,
              current.selected,
              current.submitted,
            );
            const palette = answerPalette[feedback.state];
            return (
              <Pressable
                key={option.id}
                accessibilityRole={requiredAnswers === 1 ? "radio" : "checkbox"}
                aria-checked={selected}
                accessibilityState={{
                  checked: selected,
                  disabled: current.submitted || busy,
                }}
                disabled={current.submitted || busy}
                onPress={() => onToggle(option.id)}
                style={({ pressed }) => [
                  s.option,
                  selected && s.selected,
                  current.submitted && {
                    backgroundColor: palette.background,
                    borderColor: palette.ink,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={s.optionLetter}>{option.id}</Text>
                <View style={{ flex: 1, gap: 8 }}>
                  <Text style={s.optionText}>{option.text}</Text>
                  {current.submitted && <AnswerMarker {...feedback} />}
                </View>
                {selected && !current.submitted && (
                  <Icon name="target" color={colors.teal} />
                )}
              </Pressable>
            );
          })}
          <View style={s.row}>
            <Button
              title={
                voice.activity === "speaking" ? "Stop reading" : "Hear question"
              }
              icon={voice.activity === "speaking" ? "stop" : "speaker"}
              secondary
              tone="teal"
              disabled={busy}
              onPress={() =>
                voice.activity === "speaking"
                  ? voice.stop()
                  : void voice.read(
                      `${question.question}. ${question.options.map((o) => `Option ${o.id}. ${o.text}`).join(". ")}`,
                    )
              }
            />
            <Button
              title={
                voice.activity === "listening"
                  ? "Stop listening"
                  : "Answer with voice"
              }
              icon={voice.activity === "listening" ? "stop" : "mic"}
              secondary
              tone="violet"
              disabled={busy || current.submitted}
              onPress={() =>
                voice.activity === "listening"
                  ? voice.stop()
                  : void voice.listen()
              }
            />
          </View>
          {!!voice.message && (
            <Text accessibilityLiveRegion="polite" style={s.small}>
              {voice.message}
            </Text>
          )}
          {voice.activity === "listening" && (
            <Text accessibilityLiveRegion="polite" style={s.small}>
              Listening… Say “option A” or the answer text.
            </Text>
          )}
          {current.submitted && <ResultBanner correct={current.correct} />}
          {!current.submitted && (
            <Button
              title={busy ? "Saving…" : "Check answer"}
              icon="check"
              disabled={
                busy ||
                !current.selected.length ||
                (isGradable(question) &&
                  current.selected.length !== requiredAnswers)
              }
              onPress={onSubmit}
            />
          )}
        </Card>
      </Motion>
      {visits.map((visit, index) =>
        visit.submitted ? (
          <View
            key={`${visit.question.questionNumber}:${index}`}
            style={{ display: index === position ? "flex" : "none" }}
            accessibilityElementsHidden={index !== position}
            importantForAccessibility={
              index === position ? "auto" : "no-hide-descendants"
            }
          >
            <PracticeExplanation
              visit={visit}
              active={active && index === position}
            />
          </View>
        ) : null,
      )}
      <View style={s.row}>
        <Button
          title="Previous"
          icon="previous"
          secondary
          disabled={!position || busy}
          onPress={onPrevious}
        />
        <Button
          title="Next question"
          icon="next"
          disabled={busy}
          onPress={onNext}
        />
      </View>
    </View>
  );
}

function PracticeExplanation({
  visit,
  active,
}: {
  visit: QuizVisit;
  active: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Disclosure
      title="Explanation"
      icon="notes"
      open={open}
      onOpenChange={setOpen}
    >
      <QuestionExplanation
        question={visit.question}
        selected={visit.selected}
        correct={visit.correct}
        active={active && open}
      />
    </Disclosure>
  );
}
