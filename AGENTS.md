# Working on this app

Read `aidlc-docs/README.md`, `aidlc-docs/aidlc-state.md`, `aidlc-docs/inception/requirements.md` and `ARCHITECTURE.md` before changing behavior. Read the active intent before continuing work.

## Product commitments

- This is a standalone, free Android/iOS learning app. All explanations are unlocked. Preserve the 246-question bank, source text, researched-answer precedence and ungraded review rules.
- Keep local profiles, progress and backups compatible. Do not reset or uninstall an app with user progress to test a change.
- Keep exact question-specific media mappings; do not invent related screenshots/videos for unmapped questions.
- Maintain tab, quiz, explanation and scroll state while navigating. Switching tabs must not record another attempt or overwrite an unsaved name.
- Use calm colour tokens, labelled icons, large touch targets and motion that respects Reduce Motion. Avoid endless decorative motion, flashing or pressure-driven learning rewards.

## Code ownership

Keep business rules in `src/domain`, persistence in `src/storage`, lifecycle/native effects in `src/hooks`, reusable UI in `src/ui`, and screens in `src/screens`. Use explicit prop types and descriptive names; comments should explain a real constraint or decision. Prefer small focused components over clever abstractions.

## AI-DLC workflow

For meaningful changes, create an intent using `aidlc-docs/templates/intent`: request and acceptance criteria, implementation plan, verification evidence and handoff state. Update requirement traceability for changed behavior. Use Inception → Construction → Operations proportionately; small changes can use a short intent. This is a documented repository adaptation, not an installed AWS runtime.

Proceed with authorized implementation and verification. Ask only for consequential missing decisions or actions outside scope. Never fabricate approvals or historical verification. Do not delegate to agents unless the user requests it.

Run `npm run check` and a relevant Android/iOS bundle/native build. Verify changed interactions on the connected device where possible. Record actual outcomes and gaps. No automatic deployment or store submission.
