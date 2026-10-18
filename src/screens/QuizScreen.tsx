import React, { useRef, useState } from "react";
import type { QuizVisit } from "../domain/models";
import { Pressable, Text, View, type ScrollView } from "react-native";
import type { PracticeMode, Question, UserProgress } from "../domain/models";
import {
  acceptedAnswer,
  isGradable,
  publicQuestion,
} from "../domain/questions";
import { Button, Card, Icon, IconBadge, Motion } from "../ui/primitives";
import { styles as s, colors } from "../ui/theme";
import { QuestionExplanation } from "../components/QuestionExplanation";
import type { useVoice } from "../hooks/useVoice";
import { mediaAvailability } from "../domain/resources";
import { MediaViewer, type MediaSection } from "../components/MediaViewer";
interface Props {
  visits: QuizVisit[];
  position: number;
  mode: PracticeMode;
  profile: UserProgress;
  busy: boolean;
  active: boolean;
  voice: ReturnType<typeof useVoice>;
  onToggle: (id: string) => void;
  onSubmit: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onHome: () => void;
  scrollRef: React.RefObject<ScrollView | null>;
  revealAfterSubmit: React.MutableRefObject<boolean>;
}
export function QuizScreen({
  visits,
  position,
  mode,
  profile,
  busy,
  active,
  voice,
  onToggle,
  onSubmit,
  onPrevious,
  onNext,
  onHome,
  scrollRef,
  revealAfterSubmit,
}: Props) {
  const feedbackY = useRef(0);
  const [mediaSection, setMediaSection] = useState<MediaSection | null>(null);
  const current = visits[position];
  if (!current) return null;
  const question = current.question;
  const availability = mediaAvailability(question);
  function reveal() {
    scrollRef.current?.scrollTo({ y: feedbackY.current, animated: true });
  }
  return (
    <>
      <View style={s.row}>
        <Text style={s.eyebrow}>
          {mode === "failed" ? "REVISIT & GROW" : "EXPLORE & UNDERSTAND"}
        </Text>
        <Button title="Practice home" icon="home" secondary onPress={onHome} />
      </View>
      <Motion key={`${question.questionNumber}:${position}`} active={active}>
        <Card>
          <View style={s.row}>
            <View style={s.sectionHeading}>
              <IconBadge name="book" />
              <Text style={s.label}>Question #{question.questionNumber}</Text>
            </View>
            <Text style={s.small}>
              Visit {position + 1} · {profile.statistics.score}%
            </Text>
          </View>
          <View style={s.row}>
            <Button
              title={availability.screenshotCount + " screenshots"}
              icon="image"
              tone="gold"
              secondary
              disabled={!availability.screenshotCount}
              onPress={() => setMediaSection("screenshot")}
            />
            <Button
              title={availability.videoCount + " videos"}
              icon="play"
              tone="clay"
              secondary
              disabled={!availability.videoCount}
              onPress={() => setMediaSection("video")}
            />
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
            Select {publicQuestion(question).requiredAnswers} answer(s). Take
            your time.
          </Text>
          {question.options.map((option) => {
            const selected = current.selected.includes(option.id);
            const correct =
              current.submitted && acceptedAnswer(question).includes(option.id);
            return (
              <Pressable
                key={option.id}
                accessibilityRole={
                  publicQuestion(question).requiredAnswers === 1
                    ? "radio"
                    : "checkbox"
                }
                accessibilityState={{
                  checked: selected,
                  disabled: current.submitted || busy,
                }}
                disabled={current.submitted || busy}
                onPress={() => onToggle(option.id)}
                style={({ pressed }) => [
                  s.option,
                  selected && s.selected,
                  correct && s.correct,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={s.optionLetter}>{option.id}</Text>
                <Text style={s.optionText}>{option.text}</Text>
                {(selected || correct) && (
                  <Icon
                    name={correct ? "check" : "target"}
                    color={correct ? colors.forest : colors.teal}
                  />
                )}
              </Pressable>
            );
          })}
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
          {!current.submitted && (
            <Button
              title={busy ? "Saving…" : "Check my understanding"}
              icon="check"
              disabled={
                busy ||
                !current.selected.length ||
                (isGradable(question) &&
                  current.selected.length !==
                    publicQuestion(question).requiredAnswers)
              }
              onPress={onSubmit}
            />
          )}
        </Card>
      </Motion>
      {current.submitted && (
        <Button
          title="Explore explanation & learning resources"
          icon="down"
          tone="violet"
          secondary
          onPress={reveal}
        />
      )}
      {visits.map((visit, index) =>
        visit.submitted ? (
          <View
            key={`${visit.question.questionNumber}:${index}`}
            style={{ display: index === position ? "flex" : "none" }}
            accessibilityElementsHidden={index !== position}
            importantForAccessibility={
              index === position ? "auto" : "no-hide-descendants"
            }
            onLayout={(event) => {
              if (index !== position) return;
              feedbackY.current = event.nativeEvent.layout.y;
              if (revealAfterSubmit.current) {
                revealAfterSubmit.current = false;
                reveal();
              }
            }}
          >
            <Motion active={active && index === position}>
              <Card>
                <QuestionExplanation
                  question={visit.question}
                  selected={visit.selected}
                  correct={visit.correct}
                  active={active && index === position}
                />
              </Card>
            </Motion>
          </View>
        ) : null,
      )}
      <MediaViewer
        question={active && mediaSection ? question : null}
        section={mediaSection ?? "screenshot"}
        onClose={() => setMediaSection(null)}
      />
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
    </>
  );
}
