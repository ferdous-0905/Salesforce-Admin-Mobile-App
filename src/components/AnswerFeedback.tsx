import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { AnswerState } from "../domain/answerFeedback";
import { Icon, type IconName } from "../ui/primitives";
import { colors, toneColors } from "../ui/theme";
export const answerPalette = {
  correct: { ink: colors.forest, background: colors.mint, icon: "check" },
  missed: { ink: colors.forest, background: colors.mint, icon: "check" },
  incorrect: {
    ink: colors.danger,
    background: toneColors.danger.background,
    icon: "close",
  },
  neutral: { ink: colors.muted, background: colors.surface, icon: "close" },
  unverified: { ink: colors.gold, background: colors.sun, icon: "notes" },
} satisfies Record<
  AnswerState,
  { ink: string; background: string; icon: IconName }
>;
export function AnswerMarker({
  state,
  label,
}: {
  state: AnswerState;
  label: string;
}) {
  const palette = answerPalette[state];
  if (!label) return null;
  return (
    <View style={f.marker}>
      <Icon name={palette.icon} color={palette.ink} size={18} />
      <Text style={[f.markerText, { color: palette.ink }]}>{label}</Text>
    </View>
  );
}
export function ResultBanner({ correct }: { correct: boolean | null }) {
  const palette =
    correct === null
      ? answerPalette.unverified
      : correct
        ? answerPalette.correct
        : answerPalette.incorrect;
  return (
    <View
      style={[
        f.banner,
        { backgroundColor: palette.background, borderColor: palette.ink },
      ]}
      accessibilityLiveRegion="polite"
    >
      <View style={f.icon}>
        <Icon
          name={correct === true ? "spark" : palette.icon}
          size={20}
          color={palette.ink}
        />
      </View>
      <View style={{ flex: 1, gap: 6 }}>
        <Text
          accessibilityRole="header"
          style={[f.title, { color: palette.ink }]}
        >
          {correct === null
            ? "Not scored · Under review"
            : correct
              ? "Correct"
              : "Not quite"}
        </Text>
      </View>
    </View>
  );
}
const f = StyleSheet.create({
  marker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexWrap: "wrap",
  },
  markerText: { fontSize: 13, fontWeight: "700", flexShrink: 1 },
  banner: {
    borderWidth: 1,
    borderLeftWidth: 5,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  icon: { paddingTop: 3 },
  title: { fontSize: 18, lineHeight: 24, fontWeight: "800" },
  body: { color: colors.ink, fontSize: 15, lineHeight: 23 },
});
