# Google identity and discoverable in-app media

Owner request: use Google accounts to avoid repeated name entry; identify which questions have screenshots/videos; show both inside the app.

Affected: M-01, M-03, M-07; add M-09 (Google identity and remembered local profile), M-10 (searchable media catalog and pre-answer media counts). Existing quiz rules, data, progress and tab state must remain intact.

Acceptance: Google sign-in integration uses native account selection and public OAuth client IDs, preserves compatible progress and remembers the learner locally; credentials are never fabricated; a media library lists exact source question mappings with counts/search/filter; media can be opened without recording an attempt; screenshots fit and enlarge in-app; video never opens an external browser/app. Real OAuth completion depends on the owner's Google project configuration.
