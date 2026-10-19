import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import type { Question } from "../domain/models";
import { mediaQuestions, type MediaFilter } from "../domain/resources";
import { Button, Card, IconBadge } from "../ui/primitives";
import { styles as s } from "../ui/theme";
import { MediaViewer, type MediaSection } from "../components/MediaViewer";
export function LibraryScreen({
  questions,
  active,
}: {
  questions: readonly Question[];
  active: boolean;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [selected, setSelected] = useState<{
    question: Question;
    section: MediaSection;
  } | null>(null);
  const rows = mediaQuestions(questions, filter, search);
  const referenceQuestionCount = questions.filter(question => question.sources.length > 0).length;
  return (
    <>
      <Text style={s.eyebrow}>YOUR RESOURCE SHELF</Text>
      <Text style={s.title}>Your learning library.</Text>
      <Text style={s.description}>
        Find question-specific references, screenshots and videos. Open them
        here without recording a quiz attempt.
      </Text>
      <TextInput
        accessibilityLabel="Search learning media by question number or text"
        value={search}
        onChangeText={setSearch}
        placeholder="Question number or keyword"
        style={s.input}
      />
      <View style={s.row}>
        {(["all", "references", "screenshots", "videos"] as const).map(
          (value) => (
            <Button
              key={value}
              title={
                value === "all"
                  ? "All resources"
                  : value === "references"
                    ? "References"
                    : value === "screenshots"
                      ? "Screenshots"
                      : "Videos"
              }
              icon={
                value === "videos"
                  ? "play"
                  : value === "screenshots"
                    ? "image"
                    : "book"
              }
              tone={
                value === "videos"
                  ? "clay"
                  : value === "screenshots"
                    ? "gold"
                    : "teal"
              }
              secondary={filter !== value}
              onPress={() => setFilter(value)}
            />
          ),
        )}
      </View>
      <Text accessibilityLiveRegion="polite" style={s.small}>
        {rows.length} matching question{rows.length === 1 ? "" : "s"} · Source
        catalog: {referenceQuestionCount} with references, 17 with screenshots, 22 with videos.
      </Text>
      {rows.map(({ question, referenceCount, screenshotCount, videoCount }) => (
        <Card key={question.questionNumber}>
          <View style={s.sectionHeading}>
            <IconBadge name="book" tone="teal" />
            <Text style={s.heading}>Question #{question.questionNumber}</Text>
          </View>
          <Text style={s.description}>{question.question}</Text>
          <Text style={s.small}>
            {referenceCount} reference{referenceCount === 1 ? "" : "s"} ·{" "}
            {screenshotCount} screenshot{screenshotCount === 1 ? "" : "s"} ·{" "}
            {videoCount} video{videoCount === 1 ? "" : "s"}
          </Text>
          {referenceCount > 0 && (
            <Button
              title={`View ${referenceCount} reference${referenceCount === 1 ? "" : "s"}`}
              icon="book"
              tone="teal"
              secondary
              onPress={() => setSelected({ question, section: "reading" })}
            />
          )}
          {screenshotCount > 0 && (
            <Button
              title={`View ${screenshotCount} screenshot${screenshotCount === 1 ? "" : "s"}`}
              icon="image"
              tone="gold"
              secondary
              onPress={() => setSelected({ question, section: "screenshot" })}
            />
          )}
          {videoCount > 0 && (
            <Button
              title={`View ${videoCount} video${videoCount === 1 ? "" : "s"}`}
              icon="play"
              tone="clay"
              secondary
              onPress={() => setSelected({ question, section: "video" })}
            />
          )}
        </Card>
      ))}
      {!rows.length && (
        <Card>
          <Text style={s.description}>
            No learning resources match this search. Try another question number
            or keyword.
          </Text>
        </Card>
      )}
      <MediaViewer
        question={active ? (selected?.question ?? null) : null}
        section={selected?.section ?? "screenshot"}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
