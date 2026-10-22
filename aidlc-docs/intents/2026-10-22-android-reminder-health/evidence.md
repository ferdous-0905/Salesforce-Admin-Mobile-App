# Android reminder health — 22 October 2026

## Findings
1. Installed SDK55 Expo scheduling already uses setExactAndAllowWhileIdle when available, otherwise setAndAllowWhileIdle. It persists native requests, restores them on normal boot/package replacement and reschedules daily triggers natively; ordinary app closure does not require a JS timer.
2. Existing JS synchronization deduplicated against persisted requests. After OS alarms are cancelled, those records alone cannot prove alarms remain active. Launch/resume and Repair now cancel/re-register owned requests even if signatures match. Queue failure propagates to explicit Repair while preserving later queued operations.
3. Fixed-clock compatible plans repeat daily (default hourly All day: 24). Other plans use a finite 60-request queue. Health now exposes the next time and expiry, warns when ending within a day, and states reopening is needed. No claim of infinite arbitrary solar/short-interval delivery.
4. App notification permission, channel block/silence, Battery Saver, background restriction, DND, inexact timing, force-stop, reboot restrictions and OEM private sleep/autostart rules can affect delivery. OEM-private controls are explicitly not all observable.

## Implementation
- Standard Android APIs in a local Expo module; no manufacturer-specific intents or extra permissions. No automatic battery exemption, exact-alarm permission request, persistent foreground service or network backend.
- Settings → Learning reminders → Notification check: refresh, saved request count and next/expiry, generic restriction status, explicit Repair and one-minute test, app/channel/battery-settings entry points with app-details fallback.
- Test uses the learning-reminders channel and a separate identifier, is excluded from regular counts, rejects denied permission/blocked channel and cancels on reminders off.
- Reads raw native DATE trigger value, not only JS DATE input date; past requests do not count as future delivery.
- Partial/expired state is surfaced, not treated as delivery proof. Missing module on an old build is reported honestly; the new APK is needed for battery checks.

## Verification
- Autolinking resolves reminder-device from modules/reminder-device.
- Native :app:assembleDebug succeeds in 1m48s; local module Kotlin compiled. Log: /private/tmp/reminder-native-build.log.
- npm run check: 33 tests, TypeScript and lifecycle validation pass.
- New regressions: forced re-registration with stale records/no duplicates; native date-value parsing and past/foreign request exclusion; daily vs finite next/expiry; blocked channel, battery restriction and DND warnings; test channel/permission behavior and disable cancellation.
- Android and web production exports pass: /private/tmp/reminder-health-android and /private/tmp/reminder-health-web.
- No physical-device delivery, Doze, reboot, force-stop or OEM-specific delivery verified. Owner requested generic Android support rather than a connected-device investigation. No user profile/reset/attempt modified. Browser remains subject to the earlier URL-policy block. iOS deferred.

## Primary references checked
- https://developer.android.com/training/monitoring-device-state/doze-standby
- https://developer.android.com/develop/background-work/services/alarms
- https://developer.android.com/about/versions/15/behavior-changes-all (force-stop cancels PendingIntents)
- https://developer.android.com/topic/performance/background-optimization (restricted apps may not receive boot until started)
- https://docs.expo.dev/versions/v55.0.0/sdk/notifications/
- Installed expo-notifications Android ExpoSchedulingDelegate.kt, NotificationsService and library manifest (boot/package receiver).

## Handoff
Awaiting authorized GitHub push and Expo Android preview submission including earlier UI/Progress changes. Delivery cannot be guaranteed across all Android system/vendor states; final build status will be reported separately.
