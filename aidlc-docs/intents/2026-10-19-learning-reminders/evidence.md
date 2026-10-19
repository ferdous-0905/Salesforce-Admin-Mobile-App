# Evidence

- npm run check: 12 tests passed, strict TypeScript and lifecycle validation passed. Scheduler mocked-native test covers deduplication, interval replacement, disabled cancellation, denied permission and removed learner cancellation.
- Native Android arm64 assembleDebug: BUILD SUCCESSFUL. iOS Metro export passed; native iOS execution unverified.
- Browser Settings verified: initial on/60 minutes, changed to off/90, reload retained preferences; zero interval rejected; restored on/60. Browser adapter clearly states notification delivery is native-only.
- adb devices: no connected devices. Actual OS permission prompt, background delivery, reboot behavior and notification-tap navigation remain unverified on a device. Native rebuild/install required.
