import type { UserProgress } from "../domain/models";
import {
  reminderMessage,
  type ReminderContext,
} from "../domain/reminderContent";
import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import {
  defaultReminders,
  type ReminderPreferences,
} from "../domain/reminders";
import { loadReminders, saveReminders } from "../storage/reminders";
import {
  observeLearningNotifications,
  synchronizeReminders,
} from "../notifications/learningReminders";
/** Serial native operations prevent rapid edits from leaving duplicate or stale schedules. */
export function useLearningReminders(
  profile: UserProgress | null,
  onLearn: () => void,
  totalQuestions: number,
) {
  const hasLearner = !!profile;
  const context: ReminderContext = {
    explored: Object.keys(profile?.questions ?? {}).length,
    total: totalQuestions,
    passed: Object.values(profile?.questions ?? {}).filter(
      (q) => q.status === "passed",
    ).length,
    reviewCount: Object.values(profile?.questions ?? {}).filter(
      (q) => q.status === "failed",
    ).length,
  };
  const contentKey = JSON.stringify(context);
  const latestContext = useRef(context);
  latestContext.current = context;
  const [preferences, setPreferences] =
    useState<ReminderPreferences>(defaultReminders);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Loading reminder settings…");
  const permissionRequested = useRef(false);
  const callback = useRef(onLearn);
  callback.current = onLearn;
  const queue = useRef(Promise.resolve());
  const operation = useRef(false);
  const current = useRef(preferences);
  current.current = preferences;
  function enqueue(action: () => Promise<void>) {
    queue.current = queue.current
      .then(action)
      .catch(() =>
        setMessage(
          "Could not configure reminders. Retry here; a native app rebuild may be required.",
        ),
      );
    return queue.current;
  }
  useEffect(() => {
    let mounted = true;
    void loadReminders()
      .then((value) => {
        if (mounted) {
          setPreferences(value);
          setReady(true);
        }
      })
      .catch(() =>
        setMessage(
          "Could not read reminder settings. Reopen the app to retry.",
        ),
      );
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    const askPermission = hasLearner && !permissionRequested.current;
    if (hasLearner) permissionRequested.current = true;
    void enqueue(async () => {
      setMessage(
        await synchronizeReminders(
          preferences,
          hasLearner,
          askPermission,
          latestContext.current,
        ),
      );
    });
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active")
        void enqueue(async () => {
          setMessage(
            await synchronizeReminders(
              current.current,
              hasLearner,
              false,
              latestContext.current,
            ),
          );
        });
    });
    return () => subscription.remove();
  }, [ready, hasLearner, contentKey]);
  useEffect(() => {
    if (!hasLearner) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void observeLearningNotifications(() => callback.current())
      .then((stop) => {
        if (disposed) stop();
        else cleanup = stop;
      })
      .catch(() => {});
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [hasLearner]);
  async function update(next: ReminderPreferences) {
    if (operation.current || !ready) return;
    operation.current = true;
    setBusy(true);
    await enqueue(async () => {
      await saveReminders(next);
      current.current = next;
      setPreferences(next);
      setMessage(
        await synchronizeReminders(
          next,
          hasLearner,
          next.enabled,
          latestContext.current,
        ),
      );
    });
    operation.current = false;
    setBusy(false);
  }
  return {
    preferences,
    ready,
    busy,
    message,
    update,
    previews: [
      reminderMessage(0, context),
      reminderMessage(2, context),
      reminderMessage(3, context),
    ],
  };
}
