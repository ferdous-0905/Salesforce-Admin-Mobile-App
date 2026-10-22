
## Settings audit — 19 October 2026

Platform-specific confirmations and backup transfers repair browser Settings actions while preserving Android sharing/picker behavior. Import awaits confirmation in one guarded operation. Name saving trims the draft and shows saved/unsaved feedback; hidden clock drafts no longer block all-day/solar saves. Location lookup has a 20-second deadline. Google SDK import errors show a message. See `aidlc-docs/intents/2026-10-19-settings-audit/evidence.md` for control-level checks, 22 passing tests, Android/web bundle passes and physical GPS/OAuth verification limits. Real tablet data untouched. Changes are local and not included in the prior Expo build.

## Responsive navigation — 19 October 2026

Library and Progress use bounded FlatLists with their own scroll containers. ScreenHost retains hidden child state and skips parent updates until activation (with one hide update for media cleanup); tab content appears without a full-page fade. Explanation views are memoized, new-question animation lasts 140 ms and submission keeps the viewport at the answer with feedback near the former submit button. Browser QA preserved Library scroll at 1894, search, unsaved name, selection, explanation section and single attempt count after question/tab round trips. 22 tests and Android/web bundles pass. Physical-device speed not measured; no automatic push/upload. See responsive-navigation intent evidence.

## Simple learning UI — 22 October 2026

Practice now has a compact dashboard, one result banner, available-media buttons only and a per-visit Explanation disclosure. Settings groups secondary controls behind disclosures; reminder toggle remains visible. Child state survives collapse; closed explanation deactivates video/viewers. Option-specific rationale and provenance remain accessible. 25 checks and Android/web exports pass. Browser URL-policy gate blocked live preview access; native layout/taps and keyboard behavior remain unverified. React host-shim tests exercise disclosure, draft/section retention and media active propagation. No push or Expo upload in this task.

Practice resource availability and shortcuts now appear only within the submitted explanation; quiz cards no longer show media counts/buttons. Library remains unchanged.

## Question overview — 22 October 2026

Library and Progress show complete options with researched correct-answer labels; under-review questions remain ungraded. Progress defaults to all 246 questions in serial order, including untouched questions; Filter & sort contains participation/result filters and recent ordering. Latest selection and attempt history retained. Views do not write attempts. 29 checks and Android/web exports pass; live visual/device checks remain unavailable due to the recorded browser-policy block. No push/upload in this task.

Progress filters now show search-aware live counts. Counts use metadata only; cards remain virtualized (4 initially and per batch). 30 regression/component tests and Android export pass. No data migrations or attempt writes.

## Generic Android reminder health — 22 October 2026

Resume/launch and explicit Repair re-register native reminder requests even if Expo records survived OS cancellation. Notification check shows permission/channel, saved future schedules, next/expiry and generic battery/background/DND/timing status. One-minute tests use the same channel; settings actions do not grant exemptions. modules/reminder-device is a passive Android Expo module and requires a new APK. 33 checks, native assembleDebug and Android/web exports pass. No physical Doze/reboot/OEM delivery claim. Finite solar/non-clock queues still require reopening before expiry. Original push/build request remains authorized after these fixes.
