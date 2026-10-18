# Verification evidence — 18 October 2026

## Implemented

- Persistent, equally sized native screen hosts retain native scroll offsets without timed scroll restoration. Practice resumes its previous dashboard/quiz view. Settings drafts are no longer overwritten on tab selection.
- Submitted explanation components remain mounted per quiz visit, retaining section choice and local expansion state. Leaving Practice stops speech and video playback.
- Separated session orchestration (`useLearningSession`), four named screens, shared theme, icon primitives, native-driver motion and navigation rules.
- Added an original generated book/sprout icon, configured standard/adaptive native assets and the app header.
- Added short screen/feedback entrances, tab emphasis and button press animation. One shared OS Reduce Motion subscription serves all animated controls. No continuous decorative motion or autoplay video.
- Added AI-DLC requirements M-01 through M-08, traceability, architecture, decisions, change templates, operational guidance and an executable structural validator.
- Learning media retains all source mappings. Screenshot cards now measure their actual available width to avoid clipping on phones.

## Automated and build checks

- `npm run check`: lifecycle validator, strict TypeScript and eight regression tests passed before final handoff; rerun after restoring the UI test fixture.
- Android native prebuild succeeded, including launcher assets, gradients and SVG icons.
- `:app:assembleDebug -PreactNativeArchitectures=arm64-v8a`: BUILD SUCCESSFUL; 388 tasks, 58 executed and 330 up to date.
- Android/iOS Metro/Hermes exports passed after switching to direct per-icon imports. Bundles are about 2.6 MB rather than the intermediate 4.8 MB barrel-import bundle.
- The temporary deterministic question-1 fixture was used only for emulator UI checks and removed before final verification. Normal randomized question selection is restored.

## Observed Android emulator checks

Used the installed API 37 arm64 phone emulator. Its first boot experienced a System UI wait dialog; the emulator subsequently loaded the app. Display rendering was reduced to 540×1200 at density 210, preserving roughly 411dp phone width.

- New onboarding, app header icon, Settings, quiz and explanation layouts were visually inspected.
- Created only a disposable `TestLearner` emulator profile; no tablet profile was reset or uninstalled.
- Settings draft `TestLearner Draft` survived Settings → Progress → Settings without saving.
- Settings scroll retention passed: Export progress bounds were `[56,287][484,356]` both before and after a Practice tab round trip.
- Quiz retention passed: question 1 option C remained checked after Practice → Progress → Practice. Option C bounds remained `[56,441][484,522]`; the submit button stayed `[56,824][484,893]`.
- Submitting the emulator test answer scrolled to feedback. The screen showed Study notes, References (1), Screenshots (2), Videos (1), complete answer text and option reasoning.
- Screenshots (2) remained the selected explanation section after leaving Practice and returning.
- The mapped source screenshot visibly loaded. Width measurement was subsequently refined; its final visual result remains to be checked.

Phone screenshots: `docs/evidence/settings-phone.png`, `docs/evidence/question-phone.png`, `docs/evidence/explanation-phone.png`.

## Remaining acceptance checks

- The physical tablet was not present in ADB during installation of this redesign, including after the owner reported reconnecting it. This redesign is installed in the emulator, not confirmed installed on the tablet.
- Final screenshot enlargement and YouTube playback checks were blocked when the automatic permission approval service hit its usage limit. The attempted ADB interaction was not executed; this was a review-service failure, not an unsafe-action determination. Do not bypass that review.
- Real-device video playback/fullscreen, screenshot zoom, screen reader, larger text, Reduce Motion toggle, tablet layout and iOS native execution remain unverified.
- Prior dependency audit advisories remain as recorded in `docs/VERIFICATION.md`.

## Operations

Metro remains available on port 8081. Install the updated debug APK with the same development signing key once the tablet is detected, using `adb -s DEVICE_SERIAL install -r android/app/build/outputs/apk/debug/app-debug.apk`. Preserve local progress. No new cloud build, deployment, release, or store submission occurred during this redesign.

## Owner-requested Expo upload

After local delivery, the owner explicitly requested uploading the latest version to Expo. Source upload and preview APK build creation succeeded: https://expo.dev/accounts/ferdous0905/projects/salesforce-admin-quiz-2026/builds/f7c1e72d-191b-4ab2-9053-b26c9cdca7a3. Build completion is not yet verified. The first attempt uploaded source but failed during a local Git fingerprint operation because Xcode setup is unfinished. The retry used the CLI-supported EAS_SKIP_AUTO_FINGERPRINT=1 option. No Play/App Store submission occurred.

## Wireless tablet installation

Owner enabled wireless debugging. ADB discovered the authorized Honor NDL2_W09 over mDNS. The latest local debug APK installed with `install -r` and returned Success. Port 8081 forwarding and the localhost development URL launched the app; Metro served the bundle. A screenshot confirmed the new book/sprout icon and redesigned onboarding on the physical tablet. The Expo developer menu was dismissed. This is a development installation requiring the Mac/Metro connection, not the standalone Expo preview build.

After closing the developer menu, the redesigned Practice dashboard, coloured cards, action icons and three bottom navigation icons were visually confirmed on the physical tablet.
