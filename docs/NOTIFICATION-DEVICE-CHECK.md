# Android notification verification — 19 October 2026

Tested on the owner's Honor NDL2_W09 tablet over authorized wireless ADB. Upgraded with `adb install -r`; existing Ferdous profile, 10 explored questions and 20% score remained present. No question was submitted during device tests.

| Check | Observed result |
|---|---|
| Notification permission | Tablet POST_NOTIFICATIONS granted. A fresh isolated Android emulator showed the system permission prompt; choosing Don't allow left the app usable, showed the not-allowed Settings message and registered zero learning alarms. |
| Background delivery | Temporarily changed tablet interval from 60 to 1 minute, saved All day, and pressed Home. Android delivered a learning notification; NotificationRecord tag `learning-reminder:1792388820000` was observed. |
| Content | Delivered notification invited a Salesforce learning question with the rotating friendly copy. |
| Tap behavior | Tapping the learning notification opened unsubmitted Question #159, Visit 1, with the same 20% score. |
| Disable | Turning reminders off resulted in zero active RTC_WAKEUP alarms for this package. |
| Restore | Saved 60 minutes, All day, enabled. UI confirmed On / 60 / All day; Android showed 24 future hourly alarm slots. |
| Device preservation | No uninstall, reset, backup replacement or learner attempt on the tablet. |

Window planning, overnight/solar boundaries, interval replacement, queue deduplication and content refresh pass automated tests. Actual overnight or sunrise/sunset delivery, iOS OS delivery, force-stop/reboot, extended battery-saving behavior and release-build cold-start taps are not verified by this session. Android may delay inexact alarms; a scheduled window cannot guarantee the OS displays a delayed alert before the window closes. Native permission and app processes differ from browser preview.

The existing emulator's installed app had another signing certificate, so it was preserved. A separate `QuizNotificationQA` AVD was created for clean permission testing.
