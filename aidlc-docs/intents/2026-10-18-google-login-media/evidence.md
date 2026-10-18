# Evidence

- `npm run check`: passed lifecycle validation, strict TypeScript and all 10 regression tests. Covers exact 17 screenshot / 22 video mappings, numeric searches, profile linking without losing attempts, account-mixing rejection and identity-free backups.
- Native Android `:app:assembleDebug` (arm64-v8a): successful with Google native module compiled. Installed using `adb install -r` on the authorized Honor NDL2_W09 wireless tablet; existing Ferdous profile and six explored questions were present after upgrade.
- iOS Metro export: successful (853 modules, bundled source screenshots). Native iOS build/device/authentication remain unverified.
- Tablet Library visually verified: 34 mapped questions total, Question 1 with two screenshots and one video, filter/search controls and in-app media actions. Screenshot: `docs/evidence/tablet-media-library.png`.
- Question 1 YouTube playback observed inside the native app with video content and subtitles; no external YouTube launch. Screenshot: `docs/evidence/tablet-in-app-video.png`. Its official Trailhead reference also loaded inside the new reference modal. This does not verify every remote video or region.
- Google Play Services package exists on the tablet. No real OAuth client IDs supplied, so the configuration-dependent Google button remains unavailable. No actual Google login/account selection has been verified. Setup and public local debug SHA-1 are in `docs/GOOGLE-SIGN-IN.md`; no client secrets or private signing material added.
- Existing screenshot fit/enlarge implementation retained; all six bundled image assets resolved in the iOS export. New screenshot interaction verification is still pending.
