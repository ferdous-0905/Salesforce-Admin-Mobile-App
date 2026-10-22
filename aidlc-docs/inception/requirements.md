# Mobile product requirements

- M-01: All 246 source questions, researched grading and ungraded questions remain correct. The app runs offline with one local profile and SQLite progress.
- M-02: Practice, Progress and Settings retain their exact view, scroll position and local input while switching tabs. Quiz selections, visit position and explanation section survive a round trip. Starting a new practice session is explicit.
- M-03: The explanation includes option reasoning, research references, exact mapped offline screenshots with enlargement, and on-demand YouTube playback with in-app errors and retry. Unmapped questions show honest empty states.
- M-04: Calm, cheerful visual tokens and labelled icons communicate purpose. Primary actions, learning, progress, media and destructive actions have meaningful colour treatment; colour is never the only signal.
- M-05: Short entrance, tab, press and feedback animations support learning without flashing, endless distraction or autoplay. Respect OS Reduce Motion; preserve 48dp controls, text scaling and accessibility labels.
- M-06: An original book/sprout learning icon appears in native app configuration and the dashboard. It must remain legible after platform cropping.
- M-07: Export/import, local profile deletion, reset and device speech controls preserve their existing contracts. No analytics or hosted quiz backend. Google identity is an explicitly authorized addition under M-09.
- M-08: Human-readable architecture, focused components, explicit props and an AI-DLC change record support maintenance. Verification evidence distinguishes unit tests, native installation and actual interactive checks.
- M-09: Google native sign-in may supply the learner's name and account identity. Remember the local profile for offline reopening; do not request name entry again on normal relaunch. Preserve guest progress when linking, never merge progress silently between different Google accounts, and never treat imported identity metadata as authenticated. Real sign-in requires the owner's OAuth registration.
- M-10: A searchable/filterable Library lists every question with mapped screenshots/videos and their counts. Practice shows media availability and opens resources only inside the explanation, after submission. Reading media records no quiz attempt. Video and image views remain in the app, including player errors and retry actions.

- M-11: Device-local learning reminders default to enabled every 60 minutes after notification permission. Settings can disable/cancel or set a validated interval. Changes persist across restarts without duplicate schedules; taps resume/open practice. Browser preview clearly reports native-only delivery.

- M-12: Reminder windows include all day, editable daytime, its nighttime complement and both solar directions. Approximate optional location stays local. Old reminders retain defaults. Only permitted times are queued; Settings discloses finite queue renewal and OS delays.

- M-13: Reminders rotate friendly, playful and aspirational copy with optional real saved-progress context. Never invent achievements or expose answers. Update queued context after learning; show examples in Settings. Daily copy repeats its rotation across days; bounded queues retain renewal limits.

- M-14: Practice shows labelled positive/alert feedback for graded submissions and neutral review for ungraded questions. Mark selected correct/incorrect and missed correct options in question and rationale without revealing grading before submission. Respect reduced motion and researched answer precedence.

- M-15: Library includes references-only questions and a References filter, accurate counts and in-app reading access. Progress colours latest passed/failed/reviewed results distinctly with labels, legend, status filtering and search. Android is the active verification platform; iOS testing deferred by owner.

- M-16: Tab navigation reveals retained content immediately without replaying full-screen entrance motion. Library renders a bounded window of resource cards, hidden screen parent updates do not redraw their retained content, and practice submission keeps the answer viewport stable with explicit explanation access. No grading, progress or media-state regression.

- M-17: Practice prioritizes the question and answer actions, shows one result message, and offers collapsible explanation with retained resource section. Settings groups secondary actions behind accessible open/close controls; reminder toggle stays visible, edits survive collapse and navigation, and essential warnings/privacy/backup actions remain available. Closing explanation hides/stops active media.

- M-18: Library and Progress show all options with researched correct-answer labels, or explicit under-review status with no asserted correct answer for ungraded questions. Progress joins all 246 questions to saved results, defaults to question-number order and distinguishes not attempted, passed, failed and reviewed. Participation/status filters show live counts matching the current search. Counts use metadata without eagerly mounting cards; lists load bounded batches. Search and recent order remain read-only and preserve history.

- M-19: Android reminders re-register on launch/resume and explicit repair, rather than trusting saved requests as proof of OS alarms. A generic Notification check reports permission, channel, saved future schedules, next time, finite expiry and available platform battery/background/DND/timing status. Test and settings actions are explicit, no protection is silently disabled, and force-stop/OEM/delivery limits remain clear. No cross-device delivery guarantee.
