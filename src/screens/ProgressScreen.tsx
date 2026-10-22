import React, { useState, useMemo, useCallback, memo } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import type { Question, UserProgress } from "../domain/models";
import {
  progressQuestions,
  progressFilterCounts,
  matchesProgressFilter,
  type ProgressQuestion,
  type ProgressFilter,
  type ProgressOrder,
} from "../domain/progressView";
import { Button, Card } from "../ui/primitives";
import { Disclosure } from "../ui/Disclosure";
import { QuestionAnswers } from "../ui/QuestionAnswers";
import { styles as s, type Tone } from "../ui/theme";

const filters: { value: ProgressFilter; label: string }[] = [
  { value: "all", label: "All questions" },
  { value: "attempted", label: "Attempted" },
  { value: "unattempted", label: "Not attempted" },
  { value: "passed", label: "Passed" },
  { value: "failed", label: "Failed" },
  { value: "reviewed", label: "Reviewed" },
];
const statusLabels = {
  passed: "Passed",
  failed: "Failed",
  reviewed: "Reviewed · Not scored",
  unattempted: "Not attempted",
};
const statusTones: Record<ProgressQuestion["status"], Tone | undefined> = {
  passed: "forest",
  failed: "danger",
  reviewed: "gold",
  unattempted: undefined,
};
export function ProgressScreen({
  profile,
  questions,
}: {
  profile: UserProgress;
  questions: readonly Question[];
}) {
  const [filter, setFilter] = useState<ProgressFilter>("all");
  const [order, setOrder] = useState<ProgressOrder>("serial");
  const [search, setSearch] = useState("");
  const matchingQuestions = useMemo(
    () => progressQuestions(questions, profile, "all", search, order),
    [questions, profile, search, order],
  );
  const counts = useMemo(
    () => progressFilterCounts(matchingQuestions),
    [matchingQuestions],
  );
  const rows = useMemo(
    () => matchingQuestions.filter((row) => matchesProgressFilter(row, filter)),
    [matchingQuestions, filter],
  );
  const attempted = useMemo(
    () =>
      questions.filter((q) => profile.questions[String(q.questionNumber)])
        .length,
    [questions, profile],
  );
  const renderResult = useCallback(
    ({ item }: { item: ProgressQuestion }) => <ProgressCard item={item} />,
    [],
  );
  return (
    <FlatList
      data={rows}
      keyExtractor={resultKey}
      renderItem={renderResult}
      initialNumToRender={4}
      maxToRenderPerBatch={4}
      windowSize={5}
      contentContainerStyle={s.body}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={{ gap: 20 }}>
          <Text style={s.title}>Progress</Text>
          <Card tone="violet">
            <Text style={s.heading}>
              {attempted}/{questions.length} attempted
            </Text>
            <Text style={s.small}>
              Score {profile.statistics.score}% · {questions.length - attempted}{" "}
              not attempted · {profile.statistics.totalAttempts} graded attempts
            </Text>
            <Text style={s.description}>
              {profile.statistics.passed} passed · {profile.statistics.failed}{" "}
              failed · {profile.statistics.reviewed ?? 0} reviewed without
              scoring
            </Text>
          </Card>
          <Text style={s.small}>
            Green: Passed · Coral: Failed · Gold: Reviewed · White: Not
            attempted. Results reflect your latest attempt.
          </Text>
          <Disclosure
            title="Filter & sort"
            icon="settings"
            summary={`${filters.find((item) => item.value === filter)?.label} (${counts[filter]}) · ${order === "serial" ? "Question order" : "Recent attempts"}`}
          >
            <View style={s.row}>
              {filters.map((item) => (
                <Button
                  key={item.value}
                  title={`${item.label} (${counts[item.value]})`}
                  icon="notes"
                  secondary={filter !== item.value}
                  tone={
                    item.value === "passed"
                      ? "forest"
                      : item.value === "failed"
                        ? "danger"
                        : item.value === "reviewed"
                          ? "gold"
                          : "teal"
                  }
                  onPress={() => setFilter(item.value)}
                />
              ))}
            </View>
            <View style={s.row}>
              <Button
                title="Question order"
                icon="book"
                secondary={order !== "serial"}
                onPress={() => setOrder("serial")}
              />
              <Button
                title="Recent attempts"
                icon="review"
                secondary={order !== "recent"}
                onPress={() => setOrder("recent")}
              />
            </View>
          </Disclosure>
          <TextInput
            accessibilityLabel="Search progress by question number or text"
            placeholder="Question number or keyword"
            value={search}
            onChangeText={setSearch}
            style={s.input}
          />
          <Text style={s.small} accessibilityLiveRegion="polite">
            {rows.length} matching questions ·{" "}
            {order === "serial"
              ? "Question number order"
              : "Latest attempts first"}
          </Text>
        </View>
      }
      ListEmptyComponent={
        <Card>
          <Text style={s.description}>
            No questions match this filter or search.
          </Text>
        </Card>
      }
    />
  );
}
function resultKey(item: ProgressQuestion) {
  return String(item.question.questionNumber);
}
const ProgressCard = memo(function ProgressCard({
  item,
}: {
  item: ProgressQuestion;
}) {
  const { question, progress, status } = item;
  return (
    <Card tone={statusTones[status]}>
      <Text style={s.heading}>
        Question #{question.questionNumber} · {statusLabels[status]}
      </Text>
      {progress && (
        <Text style={s.small}>
          Attempted · {progress.attempts}{" "}
          {progress.attempts === 1 ? "attempt" : "attempts"}
        </Text>
      )}
      <Text style={s.description}>{question.question}</Text>
      <QuestionAnswers question={question} selected={progress?.lastAnswer} />
      {progress && (
        <Disclosure
          title={`Attempt history (${progress.history.length})`}
          icon="review"
        >
          {progress.history
            .slice(-5)
            .reverse()
            .map((attempt, index) => (
              <Text key={`${attempt.attemptedAt}:${index}`} style={s.small}>
                {new Date(attempt.attemptedAt).toLocaleString()} ·{" "}
                {attempt.correct === null
                  ? "Not scored"
                  : attempt.correct
                    ? "Correct"
                    : "Incorrect"}{" "}
                · Answer: {attempt.submittedAnswers.join(", ") || "None"}
              </Text>
            ))}
          {progress.history.length > 5 && (
            <Text style={s.small}>Showing the latest 5 attempts.</Text>
          )}
        </Disclosure>
      )}
    </Card>
  );
});
