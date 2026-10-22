# Verification — 22 October 2026

## Implemented
- Compact Practice dashboard: one primary start/continue action, missed-question review, two small progress figures. Removed promotional cards and repeated encouragement.
- Quiz: question/options first, one compact result banner, no zero-count media controls. Voice controls remain labelled with immediate Stop reading/Stop listening actions. Back preserves resumable practice.
- Explanation now has a real accessible open/close control, initially closed per visit. Removed the duplicate banner and repeated pre-rationale option comparison. Correct/wrong markers remain on options and option-specific rationale. Source conflicts, ungraded rules and provenance remain available; source metadata is under Source details.
- Settings: visible reminder toggle and concise schedule summary; Profile, Backup & restore, Reset & delete and About & privacy collapsed initially. Advanced schedule details and message previews remain accessible inside Reminder schedule. Backup and delete confirmation contracts unchanged.
- Disclosure keeps children mounted, hides layout/accessibility subtree on collapse, and reports expanded state. Practice passes active=false while explanation is closed so native video stops and viewers hide without losing selected section.

## Automated evidence
- npm run check: 25 passing tests, TypeScript and lifecycle validation pass.
- New React component tests (native host shims, no browser automation): disclosure opens/closes and keeps child mounted/draft; settings defaults are collapsed, reminder switch remains visible and profile/interval drafts survive close/reopen; practice renders exactly one result banner, retains video tab across collapse/reopen and active-tab changes, passes active=false to video on collapse, and does not call submit while navigating explanation.
- Android production bundle: /private/tmp/simple-ui-android; web export: /private/tmp/simple-ui-web. Both pass.
- React component/performance review: controlled explanation visibility, unconditional hooks, retained children, stable visit keys, no new ongoing motion or runtime native dependency. react-test-renderer is development-only and emits its upstream deprecation notice; these host-shim checks do not prove native layout or device playback.

## Verification limits
Browser security rejected acquisition of http://localhost:8082/ (URL-policy gate). No alternate browser surface or protocol was used to bypass it. Visual layout, physical-device taps and keyboard interaction were not verified in this turn. No real learner data was edited. iOS remains deferred. No GitHub push, Expo upload or store submission in this task.

## Follow-up: explanation-only resources

Removed screenshot/video availability shortcuts, local media-selection state and MediaViewer from QuizScreen. Explanation resource tabs and exact mappings remain unchanged. M-10 updated to reflect the owner's new direction. Live visual verification remains blocked as recorded above.
