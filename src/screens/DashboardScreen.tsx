import React from "react";
import { Text, View } from "react-native";
import type { PracticeMode, UserProgress } from "../domain/models";
import { Button, Card } from "../ui/primitives";
import { styles as s } from "../ui/theme";
interface Props {
  profile: UserProgress;
  questionCount: number;
  onStart: (mode: PracticeMode) => void;
  onResume?: () => void;
}
export function DashboardScreen({
  profile,
  questionCount,
  onStart,
  onResume,
}: Props) {
  return (
    <>
      <Text style={s.title}>Practice</Text>
      <Text style={s.description}>Welcome back, {profile.name}.</Text>
      <Card>
        <Text style={s.heading}>Ready for your next question?</Text>
        <Button
          title={onResume ? "Continue practice" : "Start practice"}
          icon="book"
          onPress={onResume ?? (() => onStart("random"))}
        />
        {onResume && (
          <Button
            title="Start new practice"
            icon="next"
            secondary
            onPress={() => onStart("random")}
          />
        )}
        <Button
          title={`Review missed questions · ${profile.statistics.failed}`}
          icon="review"
          secondary
          disabled={!profile.statistics.failed}
          tone="clay"
          onPress={() => onStart("failed")}
        />
      </Card>
      <View style={s.row}>
        <Text style={s.small}>
          {profile.statistics.attempted}/{questionCount} explored
        </Text>
        <Text style={s.small}>{profile.statistics.score}% correct</Text>
      </View>
    </>
  );
}
