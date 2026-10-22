# Mobile architecture

The app contains its question bank and quiz engine. SQLite owns one local learner profile and attempt history. No quiz backend or account service is required.

- `App.tsx`: screen composition, persistent screen hosts and labelled navigation.
- `src/hooks/useLearningSession.ts`: quiz session state, guarded persistence actions, profile and backup orchestration.
- `src/screens`: dashboard, quiz, progress and settings presentation, with explicit props.
- `src/ui`: shared colours, typography, icons, cards, buttons and motion primitives.
- `src/domain`: pure grading, progress, question selection, navigation rules, resource mapping and backup validation.
- `src/hooks`: speech and operating-system integrations; Reduce Motion subscription.
- `src/storage`: SQLite adapter, atomic profile updates and schema guard.
- `src/components/QuestionExplanation.tsx`: persistent explanation sections, screenshot inspection and on-demand YouTube WebView.
- `assets/data`: read-only 246-question bank and source-specific media catalogs.
- `scripts`: local development and AI-DLC validation.

## Navigation state

Practice, Progress and Settings are persistent screen hosts. Hiding a host does not unmount its children or discard its scroll offset. Practice retains both the dashboard and active quiz; reselecting Practice resumes the last practice view. Starting a new session is explicit. Question navigation keeps visited selections and feedback; returning to a submitted question does not write another attempt. Explanation sections are retained per visit.

Durable profile/progress survives process restarts. In-memory navigation and unsubmitted selections are session state and reset when the OS terminates the app. Backup imports and explicit reset/delete operations are deliberate exceptions.

## Motion

Use native-driver opacity/translation/scale for short entrances, tab changes, pressed controls and feedback. No ongoing background animation or autoplay video. OS Reduce Motion disables nonessential transitions. Hidden screens do not play media; switching away from Practice stops speech and unmounts active video playback while keeping its section selection.

## Build assets

`app.json` owns the launcher icon and Android adaptive icon configuration. Native changes require a new build. Expo preview builds are standalone; local development builds use Metro through USB forwarding.

## Local learning reminders

Reminder preferences are device settings stored separately from quiz profiles/backups. `useLearningReminders` serializes storage and OS scheduling, reconciles existing schedules on launch/resume, and listens for taps. The native notification adapter owns one recurring learning schedule; the web adapter reports native-only delivery. Removing a learner cancels its schedule, and linking Google preserves the same preferences.

## Responsive rendering

ScreenHost updates a subtree when it becomes hidden so media stops, then memoizes parent-driven changes until activation. The subtree stays mounted, preserving local edits and scroll. Library and Progress own FlatLists (no nested vertical ScrollView); each renders a small window with stable question keys. Resource rows and explanation components are memoized. Tabs reveal immediately; only newly entered questions use a short entrance. Submission renders feedback beside the answer controls; explanation scrolling is an explicit action.

## Collapsible learner controls

Disclosure keeps child components mounted while hiding their layout and accessibility subtree. Practice explanation owns its open state per visited question and passes active=false when closed so video/reference/image viewers stop or hide; closing does not discard the resource tab. Settings uses the same disclosure for secondary controls and keeps the reminder switch visible. Result feedback appears once beside answer controls; rationale retains option-level markers and source provenance under Source details.

## Question study and participation overview

QuestionAnswers is a read-only study component shared by Library and Progress. It uses acceptedAnswer/isGradable; source-conflict research wins and ungraded questions never claim a correct answer. ProgressView joins the immutable bank with saved results, preserving missing entries as Not attempted. Sorting/filtering create view data only; no attempts or statistics are written. Progress defaults to serial order and keeps a bounded FlatList, with filter/sort controls under a disclosure.

## Android reminder recovery and health

Expo schedules native alarms and persists requests; request persistence alone does not prove that Android still has the corresponding PendingIntent. Launch/resume and explicit repair re-register owned schedules even when signatures match. A passive local Android Expo module reports platform battery optimization, battery saver, background restriction, DND and exact-alarm capability; it only opens settings on user action and requests no exemptions or new alarm permissions. Notification health reads permission/channel and saved future requests, reports finite queue expiry, and provides a separately identified one-minute test using the same channel. No JS keepalive or foreground service is added. The local module is under modules/reminder-device; .gitignore excludes only root generated Android/iOS projects and nested build artifacts so EAS includes module source.

Reminder channels are created with HIGH importance only when absent; existing learner channel settings are preserved. Health distinguishes banner capability from sound and permission; Android/OEM controls still determine actual banners. Battery optimization settings opens the standard system list with app-details fallback. Expo owns boot restoration; no foreground activity is launched on boot.
