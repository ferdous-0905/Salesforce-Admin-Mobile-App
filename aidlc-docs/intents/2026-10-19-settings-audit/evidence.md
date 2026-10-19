# Settings audit evidence — 19 October 2026

## Fixes
- Native/web dialog adapters: browser reset/delete and error dialogs previously used unsupported React Native Alert APIs.
- Platform backup transfer: browser downloads a JSON Blob and imports the selected File; native retains share sheet and cached file picker behavior. Reject files over 20 MB before parsing.
- Backup replacement awaits explicit confirmation within one guarded operation; cancel/dismiss leaves profile intact.
- Save name trims the draft, shows saved/unsaved feedback and prevents edits during persistence.
- All day/solar saves ignore invalid hidden daytime drafts; day/night still validate their active inputs.
- Google SDK load failure reports an actionable message instead of a permanent spinner.
- Location lookup has a 20-second deadline and always releases the busy state; denial and timeout offer manual coordinates.

## Interactive evidence
No physical Android device connected. Used isolated QuizNotificationQA emulator (emulator-5556), profile NotificationQA / NotificationQA Audit. Real tablet progress was untouched.

| Control | Actual outcome |
| --- | --- |
| Reminder toggle | Turned off; status changed to Learning reminders are off |
| Reminder example | Advanced from Tiny quiz. Big ambitions. to Hello, future problem-solver |
| Interval save | Browser rejects 0 with 1–10080 message; valid 60 saves |
| Daytime | Invalid 5:00 rejected with 24-hour format message |
| All day | Saves after switching away from invalid daytime draft; error clears |
| Nighttime | Selector displays clock inputs; boundary rules covered by regression suite |
| Both solar selectors | Correct panels; browser saves sample 23.81 / 90.41 coordinates in both directions |
| Current location | Browser exposed stalled lookup; fixed with deadline. Denied/stalled paths regression tested. Final browser build visibly recovers after 20 seconds: location and Save buttons re-enable with manual-coordinate guidance. Screenshot: /private/tmp/settings-qa-verified.png. Actual GPS fix on physical Android remains unverified |
| OS notification permissions | Android opens this app's system App info with Notifications row |
| Google | Disabled with truthful configuration message; successful OAuth unverified without owner credentials |
| Save name | Android trims NotificationQA Audit draft and shows Saved as NotificationQA Audit |
| Export | Android share sheet contains JSON; browser downloads JSON |
| Import | Android picks exported JSON from Downloads, shows named Replace confirmation and restores dashboard/profile; browser export/import also returns to dashboard |
| Reset | Android Cancel retains Settings/profile; Reset returns to dashboard with profile and zero explored questions (QA began with zero attempts); nonempty-history clearing covered by domain/storage tests |
| Delete | Android confirmation and Cancel retain profile. Confirmed deletion covered by existing SQLite persistence regression, not repeated interactively |
| LinkedIn | Android launches Chrome; first-run Chrome setup blocks full page load. Configured URL checked in source |

## Automated checks
- npm run check: 22 tests, TypeScript and AI-DLC validation pass.
- Android and web production exports: pass, exported to /private/tmp/settings-android-export and /private/tmp/settings-web-export.
- New tests exercise native confirmation cancel/dismiss/replace, web confirmation/download/import cleanup and oversize rejection, location denial/deadline.

## Limits
No iOS testing, store submission, GitHub push or new Expo upload in this task. Browser/native adapters were exercised without altering the real user's profile. OAuth success and physical GPS require configured credentials/device. Native module load-failure fallback is source-reviewed, not forced on device.
