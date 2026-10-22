import React from "react";
import { Linking, Text, TextInput } from "react-native";
import { confirmAction, showMessage } from "../platform/dialogs";
import { ReminderSettings } from "../components/ReminderSettings";
import { GoogleAccountButton } from "../components/GoogleAccountButton";
import type { useLearningReminders } from "../hooks/useLearningReminders";
import type { UserProgress } from "../domain/models";
import { Button } from "../ui/primitives";
import { Disclosure } from "../ui/Disclosure";
import { styles as s } from "../ui/theme";

interface Props {
  reminders: ReturnType<typeof useLearningReminders>;
  onConnectGoogle: () => void;
  profile: UserProgress;
  name: string;
  onNameChange: (name: string) => void;
  busy: boolean;
  onSave: () => void;
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
  onDelete: () => void;
}

export function SettingsScreen({
  reminders,
  profile,
  name,
  onNameChange,
  busy,
  onSave,
  onConnectGoogle,
  onExport,
  onImport,
  onReset,
  onDelete,
}: Props) {
  return (
    <>
      <Text style={s.title}>Settings</Text>
      <ReminderSettings reminders={reminders} />
      <Disclosure title="Profile" icon="settings" summary={profile.name}>
        <Text style={s.small}>Your name</Text>
        <TextInput
          accessibilityLabel="Profile name"
          editable={!busy}
          value={name}
          onChangeText={onNameChange}
          maxLength={80}
          style={s.input}
        />
        <Button
          title="Save name"
          icon="save"
          disabled={!name.trim() || busy || name === profile.name}
          onPress={onSave}
        />
        <Text style={s.small} accessibilityLiveRegion="polite">
          {name === profile.name ? "Saved on this device." : "Unsaved changes"}
        </Text>
        <Disclosure title="Google account" icon="book">
          {profile.googleAccount ? (
            <Text style={s.description}>{profile.googleAccount.email}</Text>
          ) : (
            <GoogleAccountButton busy={busy} onPress={onConnectGoogle} />
          )}
          <Text style={s.small}>
            Google remembers your identity. Progress stays on this device.
          </Text>
        </Disclosure>
      </Disclosure>
      <Disclosure
        title="Backup & restore"
        icon="download"
        summary="Move or protect your progress"
      >
        <Text style={s.small}>
          Export before changing devices. Import replaces the current profile
          and progress.
        </Text>
        <Button
          title="Export progress"
          icon="download"
          tone="teal"
          disabled={busy}
          onPress={onExport}
        />
        <Button
          title="Import progress"
          icon="upload"
          tone="teal"
          secondary
          disabled={busy}
          onPress={onImport}
        />
      </Disclosure>
      <Disclosure title="Reset & delete" icon="delete">
        <Text style={s.small}>
          Export a backup first. These actions remove local data.
        </Text>
        <Button
          title="Reset quiz progress"
          secondary
          icon="review"
          tone="clay"
          disabled={busy}
          onPress={() =>
            confirmAction(
              "Reset all quiz progress?",
              "This removes saved attempts on this device. Export a backup first to keep them.",
              "Reset",
              onReset,
            )
          }
        />
        <Button
          title="Delete local profile"
          secondary
          icon="delete"
          tone="danger"
          disabled={busy}
          onPress={() =>
            confirmAction(
              "Delete local profile?",
              "Your name and quiz attempts will be removed from this device. Exported backups are not deleted.",
              "Delete",
              onDelete,
            )
          }
        />
      </Disclosure>
      <Disclosure
        title="About & privacy"
        icon="notes"
        summary="Salesforce Admin Quiz 2026 · 1.0.0"
      >
        <Text style={s.description}>Created by MD Ferdous AKhter</Text>
        <Button
          title="Find me on LinkedIn"
          icon="external"
          tone="teal"
          secondary
          onPress={() =>
            void Linking.openURL("https://www.linkedin.com/in/limu0905/").catch(
              () =>
                showMessage(
                  "Could not open LinkedIn",
                  "Visit https://www.linkedin.com/in/limu0905/",
                ),
            )
          }
        />
        <Text style={s.small}>
          Independent study app. Not affiliated with or endorsed by Salesforce.
          Source images belong to their respective owners.
        </Text>
        <Text style={s.small}>
          No analytics or hosted quiz service. Progress stays locally. Device
          speech services may process voice online; videos and links use
          third-party services. Microphone access is requested only for voice
          answers. Reminder location stays on this device.
        </Text>
      </Disclosure>
    </>
  );
}
