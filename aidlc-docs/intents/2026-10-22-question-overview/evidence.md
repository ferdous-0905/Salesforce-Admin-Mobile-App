# Verification — 22 October 2026

## Implementation
- Library cards show every option and mark accepted answers. Exact resource mapping/actions remain unchanged.
- Shared QuestionAnswers displays researched answers for conflicts, correct answers in green with text/icon labels and latest wrong selections in coral. Ungraded questions explicitly say Answer under review / Not scored and never label a correct answer.
- Progress joins all 246 bank questions to saved entries; missing entries remain Not attempted. Default order is ascending question number. Filter & sort provides All questions, Attempted, Not attempted, Passed, Failed, Reviewed, Question order and Recent attempts. Recent order puts untouched questions last. Search and recent-five history retained.
- Card tones distinguish passed/failed/reviewed/untouched; viewing options is read-only. Lists retain bounded FlatList rendering and stable question keys.

## Evidence
- npm run check: TypeScript, lifecycle validation and 29 regression/component tests pass.
- Domain test reverses bank input, asserts exact 1–246 order, empty-profile untouched rows, participation/status counts, exact-number search, recent sorting and unchanged profile JSON.
- Component tests verify researched correct markers, all option text, incorrect latest selection, ungraded honesty, Library screen wiring and Progress filter/order controls without profile mutation. Native host shims exercise React behavior, not device layout.
- Android export: /private/tmp/question-overview-android; web export: /private/tmp/question-overview-web. Both pass.
- React review: pure domain join, memoized view data and study cards, stable item keys/callbacks, preserved disclosure/filter state, labelled status/answer markers and no new effects or runtime dependencies.

## Limits
Live browser interaction remains blocked by the previously recorded URL-policy gate; no alternate surface was used to bypass it. Visual/native device checks remain unverified. No real profile was reset or modified, and no new quiz attempts were recorded on the user's device. iOS remains deferred. No GitHub push or Expo upload requested in this turn.

## Filter counts and lazy rendering follow-up

Every filter label and collapsed filter summary now includes its current count. Counts are derived in one pass from memoized search-matching metadata; changing filters does not mount all cards or rejoin the bank. FlatList retains 4 initial cards, 4 per batch and a bounded window. Counts include ungraded submissions as Attempted/Reviewed and update after search/profile changes. Domain tests cover empty search, exact match, no match and immutable profile; component tests assert initial/batch limits and changed counts for search and a passed-to-failed update. npm run check passes 30 tests; Android export passes at /private/tmp/progress-counts-android. Visual/device verification remains unavailable as recorded above.
