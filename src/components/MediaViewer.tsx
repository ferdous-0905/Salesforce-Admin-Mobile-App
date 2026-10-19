import React from "react";
import { Modal, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Question } from "../domain/models";
import { Button, Card } from "../ui/primitives";
import { styles as s } from "../ui/theme";
import { QuestionExplanation } from "./QuestionExplanation";
export type MediaSection = "reading" | "screenshot" | "video";
export function MediaViewer({
  question,
  section,
  onClose,
}: {
  question: Question | null;
  section: MediaSection;
  onClose: () => void;
}) {
  return (
    <Modal visible={!!question} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.safe} accessibilityViewIsModal>
        <View style={s.header}>
          <Text style={[s.heading, { flex: 1 }]}>
            Question #{question?.questionNumber} · Learning resources
          </Text>
          <Button title="Close" icon="close" secondary onPress={onClose} />
        </View>
        <ScrollView contentContainerStyle={s.body}>
          {question && (
            <>
              <Text style={s.description}>{question.question}</Text>
              <Card>
                <QuestionExplanation
                  key={`${question.questionNumber}:${section}`}
                  question={question}
                  selected={[]}
                  correct={null}
                  initialSection={section}
                  studyOnly
                  active
                />
              </Card>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
