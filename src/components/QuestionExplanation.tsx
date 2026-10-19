import { answerFeedback } from "../domain/answerFeedback";
import { AnswerMarker, ResultBanner, answerPalette } from "./AnswerFeedback";
import React, { memo, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ReferenceViewer } from "./ReferenceViewer";
import { LearningVideo } from "./LearningVideo";
import { Button, Icon, Motion, type IconName } from "../ui/primitives";
import { toneColors, type Tone } from "../ui/theme";
import type {
  LearningResource,
  LearningScreenshot,
  Question,
} from "../domain/models";
import { resourcesFor, videoEmbedUrl } from "../domain/resources";
const images: Record<string, number> = {
  "/learning/screenshots/field-permissions.jpg": require("../../assets/learning/screenshots/field-permissions.jpg"),
  "/learning/screenshots/flow-get-records.jpg": require("../../assets/learning/screenshots/flow-get-records.jpg"),
  "/learning/screenshots/flow-store-records.jpg": require("../../assets/learning/screenshots/flow-store-records.jpg"),
  "/learning/screenshots/picklist-selected.jpg": require("../../assets/learning/screenshots/picklist-selected.jpg"),
  "/learning/screenshots/picklist-subset.jpg": require("../../assets/learning/screenshots/picklist-subset.jpg"),
  "/learning/screenshots/validation-rule.jpg": require("../../assets/learning/screenshots/validation-rule.jpg"),
};
/** Measure the actual card width so source images fit phones and tablets without clipping. */
function ScreenshotImage({ image }: { image: LearningScreenshot }) {
  const [width, setWidth] = useState(0);
  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{
        width: "100%",
        aspectRatio: image.width / image.height,
        overflow: "hidden",
      }}
    >
      <Image
        source={images[image.imagePath]}
        accessibilityLabel={image.alt}
        resizeMode="contain"
        style={{ width, height: (width * image.height) / image.width }}
      />
    </View>
  );
}
function Action({
  title,
  onPress,
  icon = "external",
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
}) {
  return (
    <Button
      title={title}
      onPress={onPress}
      icon={icon}
      secondary
      tone={icon === "play" ? "clay" : "teal"}
    />
  );
}
function QuestionExplanationContent({
  question,
  selected,
  correct,
  active = true,
  initialSection = "notes",
  studyOnly = false,
}: {
  question: Question;
  selected: string[];
  correct: boolean | null;
  active?: boolean;
  initialSection?: "notes" | "reading" | "screenshot" | "video";
  studyOnly?: boolean;
}) {
  const [tab, setTab] = useState<"notes" | "reading" | "screenshot" | "video">(
    initialSection,
  );
  const [referenceUrl, setReferenceUrl] = useState<string | null>(null);
  function open(url: string) {
    if (url.startsWith("https://")) setReferenceUrl(url);
  }
  const [enlarged, setEnlarged] = useState<LearningResource | null>(null);
  const [zoom, setZoom] = useState(false);
  const [original, setOriginal] = useState(false);
  const resources = resourcesFor(question);
  const readings = resources.filter((r) => r.kind === "reading");
  const shots = resources.filter((r) => r.kind === "screenshot");
  const clips = resources.filter((r) => r.kind === "video");
  const tabs = [
    ["notes", "Study notes", "notes", "violet"],
    ["reading", `References (${readings.length})`, "book", "teal"],
    ["screenshot", `Screenshots (${shots.length})`, "image", "gold"],
    ["video", `Videos (${clips.length})`, "play", "clay"],
  ] as const;
  return (
    <View style={s.panel}>
      {studyOnly ? (
        <Text accessibilityRole="header" style={s.heading}>
          Learning resources
        </Text>
      ) : (
        <>
          <ResultBanner correct={correct} />
          <Text style={s.heading}>Your answer, compared</Text>
          {question.options.map((option) => {
            const feedback = answerFeedback(
              question,
              option.id,
              selected,
              true,
            );
            const palette = answerPalette[feedback.state];
            return (
              <View
                key={option.id}
                style={[
                  s.resource,
                  {
                    borderLeftWidth: 4,
                    borderColor: palette.ink,
                    backgroundColor: palette.background,
                    padding: 14,
                    borderRadius: 12,
                  },
                ]}
              >
                <Text style={s.label}>
                  {option.id}. {option.text}
                </Text>
                <AnswerMarker {...feedback} />
              </View>
            );
          })}
        </>
      )}
      <Text style={s.small}>
        All explanations are unlocked. Select a section below.
      </Text>
      <View style={s.tabs}>
        {tabs.map(([value, label, icon, tone]) => (
          <Pressable
            key={value}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === value }}
            onPress={() => setTab(value)}
            style={[
              s.tab,
              { flexDirection: "row", alignItems: "center", gap: 8 },
              tab === value && {
                backgroundColor: toneColors[tone].background,
                borderColor: toneColors[tone].ink,
              },
            ]}
          >
            <Icon name={icon} color={toneColors[tone].ink} size={18} />
            <Text style={[s.buttonText, { color: toneColors[tone].ink }]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Motion active={active} key={tab} style={{ gap: 16 }}>
        {tab === "notes" && (
          <>
            <Text style={s.heading}>Study notes</Text>
            <Text style={s.text}>
              {question.explanation?.summary ||
                question.documentExplanation ||
                question.reviewNotes ||
                "Explanation is not available yet."}
            </Text>
            {question.verificationStatus === "document_conflict" && (
              <Text style={s.warning}>
                The original document lists {question.documentAnswer.join(", ")}
                . The researched answer {question.verifiedAnswer?.join(", ")}{" "}
                takes priority for scoring.
              </Text>
            )}
            {question.verificationStatus === "needs_review" && (
              <Text style={s.warning}>
                Original document answer (unverified):{" "}
                {question.documentAnswer.join(", ")}. This question does not
                affect your score.
              </Text>
            )}
            <Text style={s.small}>
              Documentation reviewed: {question.reviewedAt || "Not recorded"}.
              Study notes apply the documentation to this scenario; they are not
              official exam answers.
            </Text>
            {!!question.reviewNotes && (
              <Text style={s.small}>{question.reviewNotes}</Text>
            )}
            <Text style={s.heading}>Why each option is right or wrong</Text>
            {question.explanation?.optionExplanations?.map((o) => {
              const feedback = answerFeedback(
                question,
                o.optionId,
                studyOnly ? [] : selected,
                true,
              );
              const palette = answerPalette[feedback.state];
              const label = studyOnly
                ? feedback.state === "missed"
                  ? "Correct option"
                  : feedback.state === "unverified"
                    ? "Under review · Not scored"
                    : "Incorrect option"
                : feedback.label;
              return (
                <View
                  key={o.optionId}
                  style={[
                    s.resource,
                    {
                      borderLeftWidth: 4,
                      borderColor: palette.ink,
                      backgroundColor: palette.background,
                      padding: 14,
                      borderRadius: 12,
                    },
                  ]}
                >
                  <Text style={s.label}>
                    {o.optionId}.{" "}
                    {
                      question.options.find(
                        (option) => option.id === o.optionId,
                      )?.text
                    }
                  </Text>
                  <AnswerMarker state={feedback.state} label={label} />
                  <Text style={s.text}>{o.reason}</Text>
                  <Action
                    title="Compare with documentation"
                    icon="book"
                    onPress={() => setTab("reading")}
                  />
                </View>
              );
            })}
            {!!question.documentExplanation && (
              <>
                <Action
                  title={
                    original
                      ? "Hide original PDF explanation"
                      : "Show original PDF explanation"
                  }
                  onPress={() => setOriginal(!original)}
                />
                {original && (
                  <Text style={s.text}>{question.documentExplanation}</Text>
                )}
              </>
            )}
          </>
        )}
        {tab === "reading" && (
          <>
            <Text style={s.heading}>References for this answer</Text>
            {!readings.length && (
              <Text style={s.text}>
                No question-specific documentation is attached yet.
              </Text>
            )}
            {readings.map((r) => (
              <View key={r.id} style={s.resource}>
                <Text style={s.label}>{r.title}</Text>
                <Text style={s.text}>
                  How we applied the documentation: {r.description}
                </Text>
                <Text style={s.text}>{r.relevance}</Text>
                <Text style={s.small}>
                  {r.publisher} · Reviewed {r.reviewedAt || "Not recorded"}
                </Text>
                <Text style={s.small}>{r.reviewNote}</Text>
                <Action
                  title="Read official source online ↗"
                  onPress={() => void open(r.url)}
                />
              </View>
            ))}
          </>
        )}
        {tab === "screenshot" && (
          <>
            <Text style={s.heading}>See it in Salesforce</Text>
            {!shots.length && (
              <Text style={s.text}>
                No reviewed screenshot is attached to question #
                {question.questionNumber}. Screenshots are mapped to 17
                questions in the original question bank; we do not substitute
                unrelated examples.
              </Text>
            )}
            {shots.map((r) => (
              <View key={r.id} style={s.resource}>
                <Text style={s.label}>{r.title}</Text>
                {r.screenshot && (
                  <>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Enlarge screenshot: ${r.title}`}
                      onPress={() => {
                        setZoom(false);
                        setEnlarged(r);
                      }}
                    >
                      <ScreenshotImage image={r.screenshot} />
                      <Text style={s.buttonText}>Tap to enlarge ↗</Text>
                    </Pressable>
                    <Text style={s.text}>{r.screenshot.caption}</Text>
                    <Text style={s.label}>{r.screenshot.navigationPath}</Text>
                    {r.screenshot.keyPoints.map((p) => (
                      <Text key={p} style={s.text}>
                        • {p}
                      </Text>
                    ))}
                  </>
                )}
                <Text style={s.text}>{r.relevance}</Text>
                <Text style={s.small}>
                  {r.publisher} · Reviewed {r.reviewedAt}
                </Text>
                <Action
                  title="Open screenshot source ↗"
                  onPress={() => void open(r.url)}
                />
              </View>
            ))}
          </>
        )}
        {tab === "video" && (
          <>
            <Text style={s.heading}>Understand it with a short video</Text>
            <Text style={s.small}>
              Videos need internet. Press Play to load YouTube. Videos explain
              the concept and do not determine scoring.
            </Text>
            {!clips.length && (
              <Text style={s.text}>
                No reviewed video is attached to question #
                {question.questionNumber}. Videos are mapped to 22 questions in
                the original question bank.
              </Text>
            )}
            {clips.map((r) => (
              <LearningVideo key={r.id} resource={r} active={active} />
            ))}
          </>
        )}
      </Motion>
      <ReferenceViewer
        url={active ? referenceUrl : null}
        onClose={() => setReferenceUrl(null)}
      />
      <Modal
        visible={active && !!enlarged}
        animationType="slide"
        onRequestClose={() => setEnlarged(null)}
      >
        <SafeAreaView style={s.modal} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }}>
            <Text style={s.heading}>{enlarged?.title}</Text>
            <Action
              title="Close screenshot"
              icon="close"
              onPress={() => setEnlarged(null)}
            />
            <Action
              title={zoom ? "Fit image" : "Enlarge image 2×"}
              onPress={() => setZoom(!zoom)}
            />
            {enlarged?.screenshot && (
              <>
                <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
                  <Image
                    source={images[enlarged.screenshot.imagePath]}
                    accessibilityLabel={enlarged.screenshot.alt}
                    resizeMode="contain"
                    style={
                      zoom
                        ? {
                            width: enlarged.screenshot.width * 2,
                            height: enlarged.screenshot.height * 2,
                          }
                        : {
                            width: Math.min(enlarged.screenshot.width, 320),
                            height:
                              (Math.min(enlarged.screenshot.width, 320) *
                                enlarged.screenshot.height) /
                              enlarged.screenshot.width,
                          }
                    }
                  />
                </ScrollView>
                <Text style={s.text}>{enlarged.screenshot.caption}</Text>
                <Text style={s.small}>
                  Documentation example. Your Salesforce release, fields and
                  values may differ.
                </Text>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
const s = StyleSheet.create({
  panel: { gap: 16 },
  heading: { fontSize: 20, fontWeight: "700", color: "#243e35" },
  label: { fontSize: 16, fontWeight: "700", lineHeight: 24, color: "#243e35" },
  text: { fontSize: 16, lineHeight: 25, color: "#69796f" },
  small: { fontSize: 13, lineHeight: 21, color: "#69796f" },
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tab: {
    padding: 12,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dfe6dc",
  },
  active: { backgroundColor: "#eaf0e1", borderColor: "#38654e" },
  button: {
    padding: 14,
    minHeight: 48,
    backgroundColor: "#eaf0e1",
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { fontSize: 14, fontWeight: "700", color: "#38654e" },
  resource: {
    gap: 12,
    borderTopWidth: 1,
    borderColor: "#dfe6dc",
    paddingTop: 16,
  },
  warning: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f9eee3",
    color: "#895c33",
    lineHeight: 24,
  },
  player: {
    width: "100%",
    aspectRatio: 16 / 9,
    minHeight: 210,
    backgroundColor: "#101813",
  },
  loading: { position: "absolute", top: "45%", left: "45%" },
  modal: { flex: 1, backgroundColor: "#f7f8f3" },
});

export const QuestionExplanation = memo(QuestionExplanationContent);
