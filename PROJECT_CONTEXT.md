
## Settings audit — 19 October 2026

Platform-specific confirmations and backup transfers repair browser Settings actions while preserving Android sharing/picker behavior. Import awaits confirmation in one guarded operation. Name saving trims the draft and shows saved/unsaved feedback; hidden clock drafts no longer block all-day/solar saves. Location lookup has a 20-second deadline. Google SDK import errors show a message. See `aidlc-docs/intents/2026-10-19-settings-audit/evidence.md` for control-level checks, 22 passing tests, Android/web bundle passes and physical GPS/OAuth verification limits. Real tablet data untouched. Changes are local and not included in the prior Expo build.

## Responsive navigation — 19 October 2026

Library and Progress use bounded FlatLists with their own scroll containers. ScreenHost retains hidden child state and skips parent updates until activation (with one hide update for media cleanup); tab content appears without a full-page fade. Explanation views are memoized, new-question animation lasts 140 ms and submission keeps the viewport at the answer with feedback near the former submit button. Browser QA preserved Library scroll at 1894, search, unsaved name, selection, explanation section and single attempt count after question/tab round trips. 22 tests and Android/web bundles pass. Physical-device speed not measured; no automatic push/upload. See responsive-navigation intent evidence.
