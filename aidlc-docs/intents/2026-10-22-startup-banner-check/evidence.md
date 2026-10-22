# Verification evidence

- Installed Expo notification manifest and generated merged debug manifest include RECEIVE_BOOT_COMPLETED and NotificationsService BOOT_COMPLETED receiver. Native onSetupScheduledNotifications delegates to saved schedule restoration. No visible activity launch on boot is needed or added.
- Existing checks cover notification permission, blocked/quiet channel, saved schedule, finite expiry, battery optimization, background restriction, battery saver, DND and exact timing access. Launch/resume repair and refresh remain in place.
- Added separate banner-capable channel check and warning; HIGH importance for absent channels only. Existing low/silent/blocked channels are preserved, including during repair/test. Banner delivery remains subject to system/OEM settings. Battery optimization now appears as a review item and has an explicit standard settings-list shortcut; background app-details shortcut retained and corrected to use settings feedback rather than repair feedback.
- No generic auto-start permission or Background App Refresh runtime permission exists for this Android alarm design. OEM private switches cannot be universally read. No silent exemption or force-start bypass added.
- npm run check passes: 34 tests, strict TypeScript and AI-DLC validation. New regression covers new channel HIGH default, banner health and preservation of existing learner choices during repair/test.
- :app:assembleDebug BUILD SUCCESSFUL in 20s; native module compiled. Log /private/tmp/startup-banner-native.log. Initial sandbox attempt could not access Gradle cache; approved build succeeded.
- Physical reboot/locked-screen/banner/settings interactions unverified; no device connected or learner data changed. Existing browser URL-policy block was not bypassed. iOS deferred.

References: https://developer.android.com/topic/performance/background-optimization.html ; https://developer.android.com/guide/components/activities/background-starts ; https://developer.android.com/reference/android/provider/Settings#ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS ; https://developer.android.com/develop/ui/compose/notifications/channels
