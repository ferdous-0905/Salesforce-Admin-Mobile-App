# Confirmed product decisions — 18 October 2026

- App: Salesforce Admin Quiz 2026.
- Individual publisher display name: MD Ferdous AKhter. Store account identity will be determined by account enrollment.
- Android and iOS, one shared native React Native/Expo codebase.
- Free, all bundled content unlocked; no payments, ads, hosted quiz backend or analytics.
- One local profile; no email, DOB, password, server roles or login required.
- SQLite progress storage and user-controlled JSON backup export/import.
- Preserve the existing 246 questions, researched answer precedence, ungraded review questions, failed-question practice, statistics and previous/next session behavior.
- Bundled explanations and source screenshots available offline; articles and videos require internet.
- Native reading and recognition, explicit stop controls. Voice recognition may depend on OS services and connectivity.
- Publisher has not yet enrolled in Apple Developer or Google Play Console. Submission is pending enrollment and release verification.

## Implementation decisions

Question JSON is a read-only app asset. SQLite stores the local profile and full attempt history atomically in one row with schema version 1. New releases replace the bundled question bank without clearing the database. Question numbers remain stable identifiers; any future renumbering requires a migration.

Imports replace rather than merge. They are validated and statistics are reconstructed before confirmation. Local backup files contain the profile name and answers, so users choose where to save them.

No client-only app can enforce secure cross-device quotas or hide a bundled answer bank from someone inspecting its files. This release is a study tool with all content unlocked.
