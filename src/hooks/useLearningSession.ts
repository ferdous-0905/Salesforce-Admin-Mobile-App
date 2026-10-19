import { useEffect, useReducer, useRef, useState } from "react";
import { BackHandler, Keyboard, ScrollView } from "react-native";
import { showMessage, confirmReplacement } from "../platform/dialogs";
import { exportBackupFile, pickBackupText } from "../platform/backupTransfer";
import type { Question, UserProgress, PracticeMode } from "../domain/models";
import {
  isCorrect,
  isGradable,
  publicQuestion,
  selectQuestion,
} from "../domain/questions";
import { clearProgress, recordAttempt } from "../domain/progress";
import { decodeBackup, encodeBackup } from "../domain/backup";
import { parseSpokenAnswers } from "../domain/spoken-answers";
import {
  initialNavigation,
  navigationReducer,
  visiblePage,
  type Page,
  type MainTab,
} from "../domain/navigation";
import {
  loadProfile,
  newProfile,
  saveProfile,
  deleteProfile,
} from "../storage/profile";
import { isGoogleAccount, linkGoogleAccount } from "../domain/identity";
import { signInWithGoogle } from "../auth/google";
import { useVoice } from "./useVoice";
import type { QuizVisit } from "../domain/models";
export function useLearningSession(bank: readonly Question[]) {
  const scroll = useRef<ScrollView>(null);
  const [profile, setProfile] = useState<UserProgress | null>(null);
  const [ready, setReady] = useState(false);
  const [initialError, setInitialError] = useState("");
  const [name, setName] = useState("");
  const [navigation, dispatchNavigation] = useReducer(
    navigationReducer,
    initialNavigation,
  );
  const page = visiblePage(navigation);
  const [visits, setVisits] = useState<QuizVisit[]>([]);
  const [position, setPosition] = useState(0);
  const [mode, setMode] = useState<PracticeMode>("random");
  const [busy, setBusy] = useState(false);
  const operation = useRef(false);
  const current = visits[position];
  const voice = useVoice((text) => {
    if (!current || current.submitted || operation.current) return;
    const selected = parseSpokenAnswers(text, publicQuestion(current.question));
    if (selected.length) updateVisit({ ...current, selected });
  });
  async function initialize() {
    setInitialError("");
    try {
      const stored = await loadProfile();
      const saved = stored ? decodeBackup(encodeBackup(stored), bank) : null;
      if (saved && isGoogleAccount(stored?.googleAccount))
        saved.googleAccount = stored.googleAccount;
      setProfile(saved);
      setName(saved?.name ?? "");
      setReady(true);
    } catch {
      setInitialError(
        "Could not open saved progress. Your data has not been reset.",
      );
    }
  }
  useEffect(() => {
    void initialize();
  }, []);
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (page !== "home") {
        navigate("home");
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [page]);
  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [position]);
  function navigate(next: Page) {
    Keyboard.dismiss();
    voice.stop();
    dispatchNavigation({ type: "page", page: next });
  }
  function updateVisit(visit: QuizVisit) {
    setVisits((all) => all.map((v, i) => (i === position ? visit : v)));
  }
  async function persist(next: UserProgress) {
    next = { ...next, updatedAt: new Date().toISOString() };
    await saveProfile(next);
    setProfile(next);
  }
  async function guarded(action: () => Promise<void>) {
    if (operation.current) return;
    operation.current = true;
    setBusy(true);
    try {
      await action();
    } catch (e) {
      showMessage(
        "Could not complete action",
        e instanceof Error ? e.message : "Please try again.",
      );
    } finally {
      operation.current = false;
      setBusy(false);
    }
  }
  function start(nextMode: PracticeMode) {
    if (!profile) return;
    voice.stop();
    const question = selectQuestion(bank, profile, nextMode);
    if (!question) {
      showMessage("All caught up", "There are no failed questions to review.");
      return;
    }
    setMode(nextMode);
    setVisits([{ question, selected: [], submitted: false, correct: null }]);
    setPosition(0);
    scroll.current?.scrollTo({ y: 0, animated: false });
    navigate("quiz");
  }
  function next() {
    if (!profile) return;
    voice.stop();
    if (position < visits.length - 1) {
      setPosition(position + 1);
      return;
    }
    const question = selectQuestion(bank, profile, mode);
    if (!question) {
      showMessage("Review complete", "No failed questions remain.");
      navigate("home");
      return;
    }
    setVisits([
      ...visits,
      { question, selected: [], submitted: false, correct: null },
    ]);
    setPosition(position + 1);
  }
  async function submit() {
    if (!profile || !current || current.submitted) return;
    voice.stop();
    const question = current.question;
    const correct = isGradable(question)
      ? isCorrect(question, current.selected)
      : null;
    await persist(
      recordAttempt(profile, question, {
        submittedAnswers: current.selected,
        correct,
        attemptedAt: new Date().toISOString(),
      }),
    );
    updateVisit({ ...current, submitted: true, correct });
  }
  function toggle(id: string) {
    if (!current || current.submitted || busy) return;
    const required = publicQuestion(current.question).requiredAnswers;
    updateVisit({
      ...current,
      selected:
        required === 1
          ? [id]
          : current.selected.includes(id)
            ? current.selected.filter((x) => x !== id)
            : [...current.selected, id],
    });
  }
  async function exportBackup() {
    if (profile) await exportBackupFile(encodeBackup(profile));
  }
  async function importBackup() {
    const text = await pickBackupText();
    if (text === null) return;
    const imported = decodeBackup(text, bank);
    if (await confirmReplacement(
      "Replace current progress?",
      `Import ${imported.name} with ${imported.statistics.totalAttempts} graded attempts? Export your current progress first if you want to keep it.`,
    )) {
      await persist(imported);
      setName(imported.name);
      setVisits([]);
      navigate("home");
    }
  }

  return {
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
    submit: () => void guarded(submit),
    exportBackup: () => void guarded(exportBackup),
    importBackup: () => void guarded(importBackup),
    connectGoogle: () =>
      void guarded(async () => {
        const account = await signInWithGoogle();
        if (!account) return;
        const base = profile ?? newProfile(account.name);
        await persist(linkGoogleAccount(base, account));
        setName(account.name);
      }),
    createProfile: () => void guarded(() => persist(newProfile(name))),
    saveName: () =>
      void guarded(async () => {
        const savedName = name.trim();
        if (!savedName || savedName.length > 80) {
          throw new Error("Use a name between 1 and 80 characters.");
        }
        await persist({ ...profile!, name: savedName });
        setName(savedName);
      }),
    previous: () => {
      voice.stop();
      setPosition((value) => Math.max(0, value - 1));
    },
    selectTab: (tab: MainTab) => {
      Keyboard.dismiss();
      voice.stop();
      dispatchNavigation({ type: "tab", tab });
    },
    resetProgress: () =>
      void guarded(async () => {
        await persist(clearProgress(profile!));
        setVisits([]);
        navigate("home");
      }),
    removeProfile: () =>
      void guarded(async () => {
        await deleteProfile();
        setProfile(null);
        setName("");
        setVisits([]);
        navigate("home");
      }),
  };
}
