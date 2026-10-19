import React, { useState } from "react";
import { Linking, Platform, Switch, Text, TextInput, View } from "react-native";
import {
  parseClock,
  validateWindow,
  reminderWindows,
  isSolarWindow,
  type ReminderWindow,
  parseReminderMinutes,
} from "../domain/reminders";
import type { useLearningReminders } from "../hooks/useLearningReminders";
import { Button, Card, IconBadge } from "../ui/primitives";
import { styles as s, colors } from "../ui/theme";
export function ReminderSettings({
  reminders,
}: {
  reminders: ReturnType<typeof useLearningReminders>;
}) {
  const [previewIndex, setPreviewIndex] = useState(0);
  const [draft, setDraft] = useState<string | null>(null);
  const [windowDraft, setWindowDraft] = useState<ReminderWindow | null>(null);
  const [startDraft, setStartDraft] = useState<string | null>(null);
  const [endDraft, setEndDraft] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<string | null>(null);
  const [longitude, setLongitude] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const { preferences, ready, busy, message, update } = reminders;
  const selectedWindow = windowDraft ?? preferences.window ?? "all";
  return (
    <Card tone="teal">
      <View style={s.sectionHeading}>
        <IconBadge name="book" tone="teal" />
        <Text style={s.heading}>Learning reminders</Text>
      </View>
      <Text style={s.description}>
        A gentle invitation to open a question and learn. Reminders default to
        on, every hour, once you allow notifications.
      </Text>
      <View style={s.row}>
        <Text style={s.description}>
          {preferences.enabled ? "Reminders on" : "Reminders off"}
        </Text>
        <Switch
          accessibilityLabel="Learning reminders"
          value={preferences.enabled}
          disabled={!ready || busy}
          trackColor={{ true: colors.teal }}
          onValueChange={(enabled) => void update({ ...preferences, enabled })}
        />
      </View>
      <Text style={s.heading}>A little encouragement, a different message</Text>
      <Text style={s.small}>
        Reminders rotate playful invitations and encouragement. Progress details
        refresh when you use the app. Answers stay inside practice.
      </Text>
      <View style={s.rationale}>
        <Text style={s.heading}>{reminders.previews[previewIndex].title}</Text>
        <Text style={s.description}>
          {reminders.previews[previewIndex].body}
        </Text>
        <Button
          title="Show another reminder example"
          icon="review"
          secondary
          onPress={() =>
            setPreviewIndex((index) => (index + 1) % reminders.previews.length)
          }
        />
      </View>
      <Text style={s.small}>Remind me every (minutes)</Text>
      <TextInput
        accessibilityLabel="Reminder interval in minutes"
        keyboardType="number-pad"
        value={draft ?? String(preferences.intervalMinutes)}
        onChangeText={setDraft}
        editable={ready && !busy}
        style={s.input}
      />
      <Text style={s.small}>
        60 minutes = 1 hour. Choose 1–10080 minutes. Times follow your selected interval
        and delivery window.
      </Text>
      <Text style={s.heading}>When should reminders arrive?</Text>
      <View style={s.row}>
        {reminderWindows.map((item) => (
          <Button
            key={item.value}
            title={item.label}
            icon="book"
            secondary={selectedWindow !== item.value}
            disabled={!ready || busy}
            onPress={() => setWindowDraft(item.value)}
          />
        ))}
      </View>
      <Text style={s.small}>
        Selected:{" "}
        {reminderWindows.find((item) => item.value === selectedWindow)?.label}.
        Save to apply window changes.
      </Text>
      {(selectedWindow === "day" || selectedWindow === "night") && (
        <>
          <Text style={s.small}>
            Daytime hours (24-hour local time). Nighttime uses the hours outside
            this range.
          </Text>
          <TextInput
            accessibilityLabel="Daytime starts"
            placeholder="07:00"
            value={startDraft ?? preferences.dayStart ?? "07:00"}
            onChangeText={setStartDraft}
            style={s.input}
          />
          <TextInput
            accessibilityLabel="Daytime ends"
            placeholder="19:00"
            value={endDraft ?? preferences.dayEnd ?? "19:00"}
            onChangeText={setEndDraft}
            style={s.input}
          />
        </>
      )}
      {isSolarWindow(selectedWindow) && (
        <>
          <Text style={s.small}>
            Use an approximate location for offline sun calculations. It stays
            on this device; no background tracking. Refresh it after travelling.
          </Text>
          <Button
            title={locating ? "Finding location…" : "Use my current location"}
            icon="settings"
            secondary
            disabled={busy || locating}
            onPress={() => {
              setLocating(true);
              setError("");
              void (async () => {
                const location = await import("expo-location");
                const permission =
                  await location.requestForegroundPermissionsAsync();
                if (!permission.granted)
                  throw new Error(
                    "Location was not allowed. Enter approximate coordinates below or choose daytime hours.",
                  );
                const position = await location.getCurrentPositionAsync({
                  accuracy: location.Accuracy.Low,
                });
                setLatitude(position.coords.latitude.toFixed(2));
                setLongitude(position.coords.longitude.toFixed(2));
              })()
                .catch((e) =>
                  setError(
                    e instanceof Error
                      ? e.message
                      : "Could not find location. Enter approximate coordinates below.",
                  ),
                )
                .finally(() => setLocating(false));
            }}
          />
          <TextInput
            accessibilityLabel="Approximate latitude"
            placeholder="Latitude (-90 to 90)"
            value={
              latitude ??
              (preferences.location
                ? String(preferences.location.latitude)
                : "")
            }
            onChangeText={setLatitude}
            style={s.input}
          />
          <TextInput
            accessibilityLabel="Approximate longitude"
            placeholder="Longitude (-180 to 180)"
            value={
              longitude ??
              (preferences.location
                ? String(preferences.location.longitude)
                : "")
            }
            onChangeText={setLongitude}
            style={s.input}
          />
        </>
      )}
      {selectedWindow !== "all" && (
        <Text style={s.small}>
          Solar windows and intervals that cannot repeat daily use up to 60
          queued notifications. Open the app periodically to renew them. Phone
          time zone is used; delayed OS delivery may occur after a window ends.
        </Text>
      )}
      {!!error && (
        <Text style={s.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
      <Button
        title="Save reminder settings"
        icon="save"
        disabled={!ready || busy || locating}
        onPress={() => {
          try {
            const intervalMinutes = parseReminderMinutes(
              draft ?? String(preferences.intervalMinutes),
            );
            setError("");
            const next = {
              ...preferences,
              intervalMinutes,
              window: selectedWindow,
              dayStart: startDraft ?? preferences.dayStart ?? "07:00",
              dayEnd: endDraft ?? preferences.dayEnd ?? "19:00",
            };
            parseClock(next.dayStart);
            parseClock(next.dayEnd);
            if (isSolarWindow(selectedWindow)) {
              const lat =
                latitude ??
                (preferences.location
                  ? String(preferences.location.latitude)
                  : "");
              const lon =
                longitude ??
                (preferences.location
                  ? String(preferences.location.longitude)
                  : "");
              if (!lat.trim() || !lon.trim())
                throw new Error(
                  "Add a location or enter both coordinates for sunrise/sunset reminders.",
                );
              next.location = { latitude: Number(lat), longitude: Number(lon) };
            }
            void update(validateWindow(next));
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      />
      <Text style={s.small} accessibilityLiveRegion="polite">
        {message}
      </Text>
      {Platform.OS !== "web" && (
        <Button
          title="Open notification permissions"
          icon="settings"
          secondary
          onPress={() => {
            void Linking.openSettings().catch(() =>
              setError(
                "Open this app in your device settings to allow notifications.",
              ),
            );
          }}
        />
      )}
    </Card>
  );
}
