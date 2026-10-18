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
- M-10: A searchable/filterable Library lists every question with mapped screenshots/videos and their counts. Quiz cards show media availability before submission. Reading media records no quiz attempt. Video and image views remain in the app, including player errors and retry actions.
