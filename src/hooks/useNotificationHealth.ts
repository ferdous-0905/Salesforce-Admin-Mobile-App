import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import type { ReminderPreferences } from "../domain/reminders";
import type { NotificationHealth } from "../domain/notificationHealth";
import {
  readNotificationHealth,
  scheduleTestNotification,
} from "../notifications/notificationHealth";

export function useNotificationHealth(
  preferences: ReminderPreferences,
  ready: boolean,
) {
  const [health, setHealth] = useState<NotificationHealth | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    if (!ready || Platform.OS !== "android") return;
    const token = ++generation.current;
    setBusy(true);
    try {
      const result = await readNotificationHealth(preferences);
      if (token === generation.current) {
        setHealth(result);
        setMessage("");
      }
    } catch (error) {
      if (token === generation.current)
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not read notification settings.",
        );
    } finally {
      if (token === generation.current) setBusy(false);
    }
  }, [preferences, ready]);
  useEffect(() => {
    if (Platform.OS === "web") return;
    void refresh();
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh();
    });
    return () => {
      generation.current++;
      listener.remove();
    };
  }, [refresh]);
  async function run(action: () => Promise<unknown>, result: string) {
    setBusy(true);
    try {
      await action();
      await refresh();
      setMessage(result);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not complete notification check.",
      );
    } finally {
      setBusy(false);
    }
  }
  return {
    health,
    busy,
    message,
    refresh,
    test: () =>
      run(
        scheduleTestNotification,
        "Test queued for about one minute. Put the app in the background and lock the screen. Android may delay it; seeing one test does not prove overnight delivery.",
      ),
    settings: (action: () => Promise<unknown>) =>
      run(action, "Return here after changing settings; refresh this check."),
    repair: (action: () => Promise<unknown>) =>
      run(
        action,
        "Repair requested. Review the schedule status below; test notification delivery separately.",
      ),
  };
}
