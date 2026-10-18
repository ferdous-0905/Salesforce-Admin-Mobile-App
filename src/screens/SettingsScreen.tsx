import React from "react";
import { Alert, Text, TextInput, View } from "react-native";
import type { UserProgress } from "../domain/models";
import { Button, Card, IconBadge } from "../ui/primitives";
import { styles as s } from "../ui/theme";
import { GoogleAccountButton } from "../components/GoogleAccountButton";
interface Props {
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
      <Text style={s.eyebrow}>MAKE IT YOURS</Text>
      <Text style={s.title}>Your practice space.</Text>
      <Card>
        {profile.googleAccount ? (
          <>
            <Text style={s.heading}>Google account connected</Text>
            <Text style={s.small}>{profile.googleAccount.email}</Text>
            <Text style={s.small}>
              Your account name is remembered here. Progress remains on this
              device; Google sign-in does not sync it between devices.
            </Text>
          </>
        ) : (
          <GoogleAccountButton busy={busy} onPress={onConnectGoogle} />
        )}
        <View style={s.sectionHeading}>
          <IconBadge name="settings" tone="teal" />
          <Text style={s.heading}>A little more you</Text>
        </View>
        <Text style={s.description}>
          Your name and learning progress stay on this device.
        </Text>
        <TextInput
          accessibilityLabel="Profile name"
          value={name}
          onChangeText={onNameChange}
          placeholder={profile.name}
          maxLength={80}
          style={s.input}
        />
        <Button
          title="Save name"
          icon="save"
          disabled={!name.trim() || busy}
          onPress={onSave}
        />
        <Text style={s.small}>
          You can leave this tab and return to your unfinished edit.
        </Text>
      </Card>
      <Card tone="teal">
        <View style={s.sectionHeading}>
          <IconBadge name="download" tone="teal" />
          <Text style={s.heading}>Keep your progress safe</Text>
        </View>
        <Text style={s.description}>
          Export a backup before changing phones or uninstalling. Import
          replaces the local profile and progress.
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
      </Card>
      <Card>
        <Text style={s.heading}>A fresh start, when you choose</Text>
        <Button
          title="Reset quiz progress"
          secondary
          icon="review"
          tone="clay"
          disabled={busy}
          onPress={() =>
            Alert.alert(
              "Reset all quiz progress?",
              "This removes saved attempts on this device. Export a backup first to keep them.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Reset", style: "destructive", onPress: onReset },
              ],
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
            Alert.alert(
              "Delete local profile?",
              "Your name and quiz attempts will be removed from this device. Exported backups are not deleted.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: onDelete },
              ],
            )
          }
        />
      </Card>
      <Card tone="gold">
        <IconBadge name="book" tone="gold" />
        <Text style={s.heading}>Salesforce Admin Quiz 2026</Text>
        <Text style={s.description}>MD Ferdous AKhter · Version 1.0.0</Text>
        <Text style={s.small}>
          Independent study app. Not affiliated with or endorsed by Salesforce.
          Source images belong to their respective owners.
        </Text>
        <Text style={s.small}>
          No hosted quiz service or analytics. Device speech services may
          process voice online; videos and external links use third-party
          services. Microphone access is requested only for voice answering.
        </Text>
      </Card>
    </>
  );
}
