# AI-DLC for the mobile app

Adopted at the owner's explicit request on 18 October 2026. This repository uses a lightweight Inception → Construction → Operations workflow, consistent with the prior web project's documented approach. No AWS runtime or cloud orchestration is installed.

Read state, requirements, architecture, decisions and the active intent. For meaningful changes, copy the four intent templates, record the real request and acceptance criteria, implement focused changes, and record commands, device checks and remaining gaps. Use proportionate documentation for small changes.

`npm run validate:aidlc` checks required documents, requirement IDs, mapped source paths and named test references. It validates structure, not the semantic correctness of the implementation. `npm run check` also runs strict TypeScript and regression tests.

Earlier code predates adoption. Its prior verification remains in `docs/VERIFICATION.md`; no earlier methodology gates or approvals are asserted.
