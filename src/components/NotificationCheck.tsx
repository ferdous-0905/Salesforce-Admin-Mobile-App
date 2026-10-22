import React from "react";
import { Platform, Text } from "react-native";
import type { ReminderPreferences } from "../domain/reminders";
import { notificationIssues } from "../domain/notificationHealth";
import { openReminderDeviceSettings } from "../platform/reminderDevice";
import { useNotificationHealth } from "../hooks/useNotificationHealth";
import { Button } from "../ui/primitives";
import { Disclosure } from "../ui/Disclosure";
import { styles as s } from "../ui/theme";
interface Props {
  preferences: ReminderPreferences;
  ready: boolean;
  onRepair: () => Promise<unknown>;
}
export function NotificationCheck({ preferences, ready, onRepair }: Props) {
  const check = useNotificationHealth(preferences, ready);
  if (Platform.OS !== "android") return null;
  const health = check.health;
  const issues = health ? notificationIssues(health, preferences.enabled) : [];
  return (
    <Disclosure
      title="Notification check"
      icon="settings"
      summary={
        issues.length
          ? `${issues.length} things to review`
          : "Delivery, battery and background settings"
      }
    >
      {health && (
        <>
          <Text style={s.small}>
            Notification permission: {health.permission ? "Allowed" : "Blocked"}
          </Text>
          <Text style={s.small}>Reminder channel: {health.channel}</Text>
          <Text style={s.small}>
            Banner alerts: {health.bannerCapable ? "Channel supports banners · device settings still apply" : "Not enabled by channel importance"}
          </Text>
          <Text style={s.small}>
            Saved reminder requests: {health.scheduled}
            {preferences.enabled
              ? ` / ${health.expected} in the current plan`
              : " · Reminders off"}
          </Text>
          <Text style={s.small}>
            Next scheduled time:{" "}
            {health.nextAt ? new Date(health.nextAt).toLocaleString() : "None"}
          </Text>
          {health.expiresAt && (
            <Text style={s.small}>
              Queue ends {new Date(health.expiresAt).toLocaleString()}. Reopen
              the app before then to renew it. These reminders do not repeat
              forever.
            </Text>
          )}
          {health.device ? (
            <>
              <Text style={s.small}>
                Battery optimization:{" "}
                {health.device.batteryOptimizationEnabled
                  ? "On · may defer delivery"
                  : "Exempt"}
              </Text>
              <Text style={s.small}>
                Background activity:{" "}
                {health.device.backgroundRestricted
                  ? "Restricted"
                  : "Not restricted by Android"}
              </Text>
              <Text style={s.small}>
                Battery Saver: {health.device.batterySaver ? "On" : "Off"} · Do
                Not Disturb: {health.device.doNotDisturb ? "On" : "Off"}
              </Text>
              <Text style={s.small}>
                Alarm timing:{" "}
                {health.device.exactAlarmsAllowed
                  ? "Exact access available"
                  : "Approximate · Android may delay delivery"}
              </Text>
            </>
          ) : (
            Platform.OS === "android" && (
              <Text style={s.small}>
                Battery/background checks need an updated Android build. Other
                checks remain available.
              </Text>
            )
          )}
          {issues.map((issue) => (
            <Text key={issue} style={s.error}>
              {issue}
            </Text>
          ))}
        </>
      )}
      <Button
        title={check.busy ? "Checking…" : "Refresh notification check"}
        icon="review"
        secondary
        disabled={!ready || check.busy}
        onPress={() => void check.refresh()}
      />
      <Button
        title="Repair reminder schedule"
        icon="save"
        secondary
        disabled={!ready || check.busy}
        onPress={() => void check.repair(onRepair)}
      />
      <Button
        title="Send a test in one minute"
        icon="book"
        disabled={!ready || check.busy}
        onPress={() => void check.test()}
      />
      {Platform.OS === "android" && (
        <>
          <Button
            title="Notification settings"
            icon="settings"
            secondary
            onPress={() =>
              void check.settings(() =>
                openReminderDeviceSettings("notifications"),
              )
            }
          />
          <Button
            title="Reminder channel settings"
            icon="settings"
            secondary
            onPress={() =>
              void check.settings(() => openReminderDeviceSettings("channel"))
            }
          />
          <Button
            title="Battery optimization settings"
            icon="settings"
            secondary
            onPress={() => void check.settings(() => openReminderDeviceSettings("optimization"))}
          />
          <Button
            title="App settings for battery"
            icon="settings"
            secondary
            onPress={() =>
              void check.settings(() => openReminderDeviceSettings("battery"))
            }
          />
        </>
      )}
      <Text style={s.small} accessibilityLiveRegion="polite">
        {check.message}
      </Text>
      <Text style={s.small}>
        In app settings, allow background activity or choose Unrestricted
        battery use if offered. Some manufacturers also have sleeping-app or
        auto-start controls; Android cannot report all of them here. Menu names
        vary.
      </Text>
      <Text style={s.small}>
        After a normal reboot, Android's notification receiver restores saved
        reminders without opening the app screen. Restricted apps may not receive
        the boot event until opened. There is no separate Android Background App
        Refresh permission; manufacturer auto-start switches cannot be checked
        reliably here. In battery optimization settings, find this app and choose
        Not optimized if desired. Banner controls may be called Pop on screen or
        Floating notifications; high importance allows banners but cannot prove
        they will appear.
      </Text>
      <Text style={s.small}>
        Regular app closure does not require keeping this screen open. After
        Force stop, reopen the app to restore reminders. Battery saving, Do Not
        Disturb and manufacturer restrictions can still delay or silence them;
        delivery cannot be guaranteed on every phone. No internet is needed for
        local reminders.
      </Text>
    </Disclosure>
  );
}
