import React from "react";
import { Text, View } from "react-native";
import type { Question, UserProgress } from "../domain/models";
import { Card, IconBadge } from "../ui/primitives";
import { styles as s, colors } from "../ui/theme";
export function ProgressScreen({
  profile,
  questions,
}: {
  profile: UserProgress;
  questions: readonly Question[];
}) {
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
          ["Ready to revisit", profile.statistics.failed],
          ["Reviewed without scoring", profile.statistics.reviewed ?? 0],
          ["Graded attempts", profile.statistics.totalAttempts],
        ].map(([label, value]) => (
          <View key={label} style={s.progressRow}>
            <Text style={[s.description, { flex: 1 }]}>{label}</Text>
            <Text style={s.heading}>{value}</Text>
          </View>
        ))}
      </Card>
      <Text style={s.heading}>Your recent learning</Text>
      {!Object.keys(profile.questions).length && (
        <Card>
          <IconBadge name="leaf" />
          <Text style={s.description}>
            Your journey starts with one question. Each answer is a chance to
            understand a little more.
          </Text>
        </Card>
      )}
      {Object.values(profile.questions)
        .sort((a, b) => b.lastAttemptAt.localeCompare(a.lastAttemptAt))
        .map((p) => (
          <Card key={p.questionNumber}>
            <View style={s.sectionHeading}>
              <IconBadge
                name={p.status === "passed" ? "check" : "review"}
                tone={p.status === "passed" ? "forest" : "clay"}
              />
              <Text style={[s.label, { flex: 1 }]}>
                Question #{p.questionNumber} ·{" "}
                {p.status === "failed" ? "Ready to revisit" : p.status}
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
                <Text key={i} style={s.small}>
                  {new Date(a.attemptedAt).toLocaleString()} ·{" "}
                  {a.correct === null
                    ? "Reviewed"
                    : a.correct
                      ? "Correct"
                      : "Revisit"}{" "}
                  · {a.submittedAnswers.join(", ")}
                </Text>
              ))}
          </Card>
        ))}
    </>
  );
}
