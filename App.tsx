import { useLearningReminders } from "./src/hooks/useLearningReminders";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  View,
  Pressable,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import rawQuestions from "./assets/data/questions.json";
import type { Question } from "./src/domain/models";
import type { MainTab } from "./src/domain/navigation";
import { useLearningSession } from "./src/hooks/useLearningSession";
import { MotionPreferencesProvider } from "./src/hooks/useReducedMotion";
import {
  Button,
  Card,
  Icon,
  IconBadge,
  NavigationTab,
  type IconName,
} from "./src/ui/primitives";
import { ScreenHost } from "./src/ui/ScreenHost";
import { colors, styles as s, toneColors, type Tone } from "./src/ui/theme";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { ProgressScreen } from "./src/screens/ProgressScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { GoogleAccountButton } from "./src/components/GoogleAccountButton";
import { LibraryScreen } from "./src/screens/LibraryScreen";
import { QuizScreen } from "./src/screens/QuizScreen";
const bank = rawQuestions as Question[];
const tabs: { key: MainTab; label: string; icon: IconName; tone: Tone }[] = [
  { key: "practice", label: "Practice", icon: "book", tone: "forest" },
  { key: "library", label: "Library", icon: "image", tone: "gold" },
  { key: "progress", label: "Progress", icon: "progress", tone: "violet" },
  { key: "settings", label: "Settings", icon: "settings", tone: "teal" },
];
function Application() {
  const {
    profile,
    ready,
    initialError,
    name,
    setName,
    navigation,
    page,
    visits,
    position,
    mode,
    busy,
    current,
    voice,
    initialize,
    navigate,
    start,
    next,
    toggle,
    scroll,
    revealAfterSubmit,
    submit,
    exportBackup,
    importBackup,
    createProfile,
    connectGoogle,
    saveName,
    previous,
    selectTab,
    resetProgress,
    removeProfile,
  } = useLearningSession(bank);
  const reminders = useLearningReminders(
    profile,
    () => {
      if (current) navigate("quiz");
      else start("random");
    },
    bank.length,
  );
  if (!ready)
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.body}>
          <Text style={s.title}>Your learning space</Text>
          {initialError ? (
            <>
              <Text style={s.error}>{initialError}</Text>
              <Button
                title="Try again"
                icon="review"
                onPress={() => void initialize()}
              />
            </>
          ) : (
            <ActivityIndicator color={colors.forest} />
          )}
        </View>
      </SafeAreaView>
    );
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="dark" />
      <View style={s.header}>
        <Image
          source={require("./assets/app-icon.png")}
          accessibilityLabel="Book and sprout learning icon"
          style={{ width: 46, height: 46, borderRadius: 15 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={s.brand}>ADMIN PRACTICE</Text>
          <Text style={s.small}>A little progress, every day · 2026</Text>
        </View>
        <Icon name="leaf" color={colors.teal} />
      </View>
      {!profile ? (
        <View style={{ flex: 1 }}>
          <ScreenHost active>
            <Text style={s.eyebrow}>YOUR NEXT CHAPTER</Text>
            <Text style={s.title}>
              {"A little practice.\nA lot more confidence."}
            </Text>
            <Text style={s.description}>
              246 thoughtful questions, clear explanations and a learning rhythm
              that works for you.
            </Text>
            <Card>
              <IconBadge name="leaf" />
              <Text style={s.heading}>Make yourself at home</Text>
              <Text style={s.description}>
                Your progress stays on this device. Sign in with Google to use
                your account name, or continue with a local profile.
              </Text>
              <GoogleAccountButton busy={busy} onPress={connectGoogle} />
              <Text style={s.small}>
                Or use a local profile. We remember it on this device, too.
              </Text>
              <TextInput
                accessibilityLabel="Your name"
                placeholder="Your name"
                maxLength={80}
                value={name}
                onChangeText={setName}
                style={s.input}
              />
              <Button
                title="Start learning"
                icon="book"
                disabled={!name.trim() || busy}
                onPress={createProfile}
              />
              <Button
                title="Restore a backup"
                icon="upload"
                tone="teal"
                secondary
                disabled={busy}
                onPress={importBackup}
              />
            </Card>
          </ScreenHost>
        </View>
      ) : (
        <>
          <View style={{ flex: 1 }}>
            <ScreenHost active={page === "home"}>
              <DashboardScreen
                profile={profile}
                questionCount={bank.length}
                onStart={start}
                onResume={current ? () => navigate("quiz") : undefined}
              />
            </ScreenHost>
            <ScreenHost active={page === "quiz"} ref={scroll}>
              <QuizScreen
                visits={visits}
                position={position}
                mode={mode}
                profile={profile}
                busy={busy}
                active={page === "quiz"}
                voice={voice}
                onToggle={toggle}
                onSubmit={submit}
                onPrevious={previous}
                onNext={next}
                onHome={() => navigate("home")}
                scrollRef={scroll}
                revealAfterSubmit={revealAfterSubmit}
              />
            </ScreenHost>
            <ScreenHost active={page === "library"}>
              <LibraryScreen questions={bank} active={page === "library"} />
            </ScreenHost>
            <ScreenHost active={page === "progress"}>
              <ProgressScreen profile={profile} questions={bank} />
            </ScreenHost>
            <ScreenHost active={page === "settings"}>
              <SettingsScreen
                reminders={reminders}
                profile={profile}
                name={name}
                onNameChange={setName}
                busy={busy}
                onConnectGoogle={connectGoogle}
                onSave={saveName}
                onExport={exportBackup}
                onImport={importBackup}
                onReset={resetProgress}
                onDelete={removeProfile}
              />
            </ScreenHost>
          </View>
          <View style={s.tabs}>
            {tabs.map((tab) => (
              <NavigationTab
                key={tab.key}
                label={tab.label}
                icon={tab.icon}
                tone={tab.tone}
                selected={navigation.activeTab === tab.key}
                disabled={busy}
                onPress={() => selectTab(tab.key)}
              />
            ))}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <MotionPreferencesProvider>
        <Application />
      </MotionPreferencesProvider>
    </SafeAreaProvider>
  );
}
