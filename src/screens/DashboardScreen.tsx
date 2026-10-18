import React from "react";
import { Image, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { PracticeMode, UserProgress } from "../domain/models";
import { Button, Card, IconBadge } from "../ui/primitives";
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
      <LinearGradient
        colors={["#E7F3E9", "#F4F0DF", "#F9EEE6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.hero}
      >
        <View style={s.row}>
          <Text style={s.eyebrow}>A LITTLE EVERY DAY</Text>
          <IconBadge name="leaf" tone="forest" />
        </View>
        <Text style={s.title}>{"A calmer way to\nfind your confidence."}</Text>
        <Text style={s.description}>
          Welcome back, {profile.name}. A few thoughtful questions can make a
          meaningful difference.
        </Text>
        {onResume && (
          <Button
            title="Continue where I left off"
            icon="book"
            onPress={onResume}
          />
        )}
      </LinearGradient>
      <View style={s.stats}>
        <Card tone="forest" style={{ flex: 1, minWidth: 135 }}>
          <IconBadge name="target" />
          <Text style={s.stat}>{profile.statistics.score}%</Text>
          <Text style={s.small}>Current understanding</Text>
        </Card>
        <Card tone="violet" style={{ flex: 1, minWidth: 135 }}>
          <IconBadge name="book" tone="violet" />
          <Text style={s.stat}>
            {profile.statistics.attempted}/{questionCount}
          </Text>
          <Text style={s.small}>Questions explored</Text>
        </Card>
      </View>
      <Card>
        <View style={s.sectionHeading}>
          <IconBadge name="spark" tone="gold" />
          <Text style={[s.heading, { flex: 1 }]}>
            Find your learning rhythm
          </Text>
        </View>
        <Text style={s.description}>
          Meet a new idea, understand the why, and keep growing at your own
          pace.
        </Text>
        <Button
          title="Start a new practice"
          icon="next"
          onPress={() => onStart("random")}
        />
        <Button
          title={`Revisit tricky questions · ${profile.statistics.failed}`}
          secondary
          tone="clay"
          icon="review"
          onPress={() => onStart("failed")}
        />
      </Card>
      <Card tone="teal">
        <View style={s.sectionHeading}>
          <IconBadge name="leaf" tone="teal" />
          <Text style={s.heading}>Space to learn. Room to grow.</Text>
        </View>
        <Text style={s.description}>
          All questions, explanations and local screenshots are unlocked and
          available offline. No timer. No pressure.
        </Text>
        <Text style={s.small}>
          Videos and official articles open when you have internet.
        </Text>
      </Card>
    </>
  );
}
