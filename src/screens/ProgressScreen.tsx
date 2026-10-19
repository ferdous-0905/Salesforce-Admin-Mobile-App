import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import type { Question, UserProgress } from "../domain/models";
import { Button, Card, Icon, IconBadge } from "../ui/primitives";
import { styles as s, colors, toneColors } from "../ui/theme";
export function ProgressScreen({
  profile,
  questions,
}: {
  profile: UserProgress;
  questions: readonly Question[];
}) {
  const [filter, setFilter] = useState<
    "all" | "passed" | "failed" | "reviewed"
  >("all");
  const [search, setSearch] = useState("");
  const query = search.trim().replace(/^#/, "").toLowerCase();
  const rows = Object.values(profile.questions)
    .filter(
      (p) =>
        (filter === "all" || p.status === filter) &&
        (!query ||
          (/^\d+$/.test(query)
            ? String(p.questionNumber) === query
            : questions
                .find((q) => q.questionNumber === p.questionNumber)
                ?.question.toLowerCase()
                .includes(query))),
    )
    .sort((a, b) => b.lastAttemptAt.localeCompare(a.lastAttemptAt));
  return (
    <>
      <Text style={s.eyebrow}>YOUR LEARNING JOURNEY</Text>
      <Text style={s.title}>{"Small steps.\nGrowing confidence."}</Text>
      <Card tone="violet">
        <View style={s.sectionHeading}>
          <IconBadge name="progress" tone="violet" />
          <Text style={s.heading}>Look how far you’ve come</Text>
        </View>
        <Text style={s.description}>
          Progress comes from understanding, including the questions you
          revisit.
        </Text>
        <View
          style={{
            height: 10,
            borderRadius: 8,
            backgroundColor: "#DDD6EF",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: 10,
              borderRadius: 8,
              backgroundColor: colors.violet,
              width: `${Math.min(100, profile.statistics.score)}%`,
            }}
          />
        </View>
        {[
          ["Current understanding", `${profile.statistics.score}%`],
          ["Passed", profile.statistics.passed],
          ["Failed · Ready to revisit", profile.statistics.failed],
          ["Reviewed without scoring", profile.statistics.reviewed ?? 0],
          ["Graded attempts", profile.statistics.totalAttempts],
        ].map(([label, value]) => (
          <View key={label} style={s.progressRow}>
            <Text style={[s.description, { flex: 1 }]}>{label}</Text>
            <Text style={s.heading}>{value}</Text>
          </View>
        ))}
      </Card>
      <Text style={s.heading}>Your questions at a glance</Text>
      <Text style={s.small}>
        Green: Passed · Coral: Failed · Gold: Reviewed without scoring. Each
        card reflects your latest answer.
      </Text>
      <View style={s.row}>
        {(["all", "passed", "failed", "reviewed"] as const).map((value) => (
          <Button
            key={value}
            title={
              value === "all"
                ? "All results"
                : value === "passed"
                  ? "Passed"
                  : value === "failed"
                    ? "Failed"
                    : "Reviewed"
            }
            icon={
              value === "passed"
                ? "check"
                : value === "failed"
                  ? "close"
                  : "notes"
            }
            tone={
              value === "passed"
                ? "forest"
                : value === "failed"
                  ? "danger"
                  : value === "reviewed"
                    ? "gold"
                    : "teal"
            }
            secondary={filter !== value}
            onPress={() => setFilter(value)}
          />
        ))}
      </View>
      <TextInput
        accessibilityLabel="Search progress by question number or text"
        placeholder="Question number or keyword"
        value={search}
        onChangeText={setSearch}
        style={s.input}
      />
      <Text style={s.small} accessibilityLiveRegion="polite">
        {rows.length} matching questions
      </Text>
      {!Object.keys(profile.questions).length && (
        <Card>
          <IconBadge name="leaf" />
          <Text style={s.description}>
            Your journey starts with one question. Each answer is a chance to
            understand a little more.
          </Text>
        </Card>
      )}
      {!rows.length && Object.keys(profile.questions).length > 0 && (
        <Card>
          <Text style={s.description}>
            No questions match this filter. Try another status or search.
          </Text>
        </Card>
      )}
      {rows.map((p) => (
        <Card
          key={p.questionNumber}
          tone={
            p.status === "passed"
              ? "forest"
              : p.status === "failed"
                ? "danger"
                : "gold"
          }
        >
          <View style={s.sectionHeading}>
            <IconBadge
              name={
                p.status === "passed"
                  ? "check"
                  : p.status === "failed"
                    ? "close"
                    : "notes"
              }
              tone={
                p.status === "passed"
                  ? "forest"
                  : p.status === "failed"
                    ? "danger"
                    : "gold"
              }
            />
            <Text style={[s.label, { flex: 1 }]}>
              Question #{p.questionNumber} ·{" "}
              {p.status === "failed"
                ? "Failed · Ready to revisit"
                : p.status === "passed"
                  ? "Passed"
                  : "Reviewed · Not scored"}
            </Text>
          </View>
          <Text style={s.description}>
            {
              questions.find((q) => q.questionNumber === p.questionNumber)
                ?.question
            }
          </Text>
          <Text style={s.small}>
            {p.attempts} attempts · Last answer: {p.lastAnswer.join(", ")}
          </Text>
          {p.history
            .slice(-5)
            .reverse()
            .map((a, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "center",
                  padding: 10,
                  borderRadius: 10,
                  backgroundColor:
                    a.correct === null
                      ? colors.sun
                      : a.correct
                        ? colors.mint
                        : toneColors.danger.background,
                }}
              >
                <Icon
                  name={
                    a.correct === null ? "notes" : a.correct ? "check" : "close"
                  }
                  color={
                    a.correct === null
                      ? colors.gold
                      : a.correct
                        ? colors.forest
                        : colors.danger
                  }
                  size={18}
                />
                <Text
                  style={[
                    s.small,
                    {
                      flex: 1,
                      color:
                        a.correct === null
                          ? colors.gold
                          : a.correct
                            ? colors.forest
                            : colors.danger,
                    },
                  ]}
                >
                  {new Date(a.attemptedAt).toLocaleString()} ·{" "}
                  {a.correct === null
                    ? "Reviewed"
                    : a.correct
                      ? "Correct"
                      : "Incorrect"}{" "}
                  · {a.submittedAnswers.join(", ")}
                </Text>
              </View>
            ))}
        </Card>
      ))}
    </>
  );
}
