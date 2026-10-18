# Verification — 18 October 2026

## Passed

- TypeScript strict type check.
- Six regression tests: all 246 question IDs/grading, researched-answer precedence and ungraded scoring, failed review/latest-result statistics, backup round trip and corrupt-input rejection, spoken-answer parsing, real SQLite save/reload/replace/delete and newer-schema rejection.
- Expo dependency compatibility check using the SDK's bundled compatibility data (offline; not a live version lookup).
- Android and iOS Metro/Hermes JavaScript bundle exports. Six local learning screenshots are included. These are application bundles, not installable APK/AAB/IPA artifacts.
- Native configuration introspection confirms microphone/speech usage descriptions and Android record-audio permission.

## Remaining verification and release work

- Native compilation and simulator/device installation: full Xcode and Android SDK are absent on this machine.
- Visual comparisons with the web app, screen-reader/large-text behavior, device SQLite persistence after force-close, native backup dialogs and real speech services.
- Device checks for permission denial, rapid speech stop/restart, OS interruption and offline voice availability.
- Store assets, support/privacy URLs, developer enrollment, signing and final store listing.
- Superseded by the explanation parity correction: videos now have an embedded WebView player and an external fallback. Real-device playback still needs verification.

## Dependency audit

A compatible `npm audit fix --ignore-scripts` was applied. The audit still reports 33 dependency advisories (12 moderate, 21 high), including transitive Metro/Jest tooling, node-forge, sprintf-js and xcode/uuid. Suggested forced fixes include an incompatible Expo downgrade and a React Native major upgrade, so they were not applied. These findings need compatibility-aware review before public release. Passing tests and bundle export do not establish their resolution.

## Environment

Node 24.22.0; Expo SDK 55 with compatible React Native 0.83.10. Expo telemetry disabled during local export. No remote build, deployment, publication or store submission was performed.

## USB development setup completed — 18 October 2026

- Verified Android SDK Command-line Tools, JDK 17.0.12 and authorized Honor NDL2_W09 tablet connection.
- Local Gradle build installed Android SDK 36, NDK 27.1.12297006 and required build dependencies using existing accepted SDK licenses.
- `expo run:android --device --no-bundler` completed successfully: 350 actionable tasks; debug APK installed on the tablet.
- Metro runs on port 8081; ADB reverse maps the tablet's port 8081 to the Mac. App opened with a localhost development URL and Metro served the Android JavaScript bundle.
- Device screen was locked during final visual inspection. Onboarding and interactive quiz behavior are not yet visually verified on the device.
- Added `npm run android:usb` to select JDK 17 and the local Android SDK on macOS.
- The previous Expo preview build also reports FINISHED. Cloud preview and local debug APKs use different signing keys; do not uninstall an app with real progress merely to switch variants. Export a backup before changing installations.
