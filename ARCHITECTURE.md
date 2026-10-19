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
