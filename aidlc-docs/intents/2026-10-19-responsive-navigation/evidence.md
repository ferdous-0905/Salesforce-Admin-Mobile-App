# Responsiveness verification — 19 October 2026

## Changes and evidence
- Source before: Library mapped all 246 resource cards in a persistent ScrollView; every tab replayed a 240 ms full-page fade.
- Library and Progress now own FlatLists with stable question keys, initial 4 rows, batch size 4 and windowSize 5. No nested vertical ScrollView. Resource/result cards memoize unchanged props; Library filtering is memoized; Progress question text uses a Map.
- RetainedContent updates on hide to stop media, then skips parent-driven hidden updates. Activation receives current props. No unmount/reset of local screen state.
- QuestionExplanation memoizes unchanged visits; tab content is immediately visible. New-question motion is 140 ms; Reduced Motion path retained. Buttons show immediate pressed opacity.
- Submission keeps the learner at the answer. Result banner replaces submit area; explicit explanation button retains scrolling and media access.

## Actual UI checks
Isolated browser origin http://127.0.0.1:8092, synthetic Settings Web QA profile. Real learner progress untouched.
- Library displayed all 246 matches while initially mounting 4 Question cards (DOM count). Scrolling rendered later rows. Searching 165 found the exact reference-only question.
- Library search 165 survived Settings/Practice round trips.
- Unsaved QA Draft stayed unsaved after navigating to Practice, submitting, and returning to Settings; stored profile name remained Settings Web QA.
- Practice #38: selected B, switched Library/Practice; B remained selected. Submission showed correct result and option markers. Screenshots (2) section remained selected after Settings/Practice round trip.
- Next to #217 and Previous to #38 preserved submission; Progress showed 1 graded attempt and 1 attempt on #38, so navigation added no attempt.
- Final build Progress rendered persisted passed card/history; Failed filter action exercised.
- Library scroll offset was 1894 before and after Progress/Library round trip (read-only DOM observation). Screenshot /private/tmp/responsive-library-verified.png.
- Hidden dashboard remained inside aria-hidden=true host, checked via DOM.

## Validation and limits
npm run check passes: TypeScript, lifecycle mapping and all 22 regression tests. Android production export and web production export pass. React performance checklist applied: stable row render callbacks, stable keys, pure memo boundaries, hooks unconditional, accessibility and reduced-motion behavior retained.
No measured frame-rate or percentage speedup claim. ADB reported no connected devices. Physical Android timing/profiling and long-session native memory behavior have not been measured; iOS deferred. No native install, GitHub push, Expo upload or store submission in this task.
