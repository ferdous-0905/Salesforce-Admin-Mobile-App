# Google sign-in setup

The native integration is implemented, but real login requires your Google OAuth clients. A saved local profile already opens without asking for the name again. Google linking fills the name and email and keeps existing attempts; it does not synchronize progress across devices. Backups exclude Google identity and tokens are not stored in the quiz database.

1. In a Google Cloud project, configure the OAuth consent screen and add your account as a test user while the app is in testing.
2. Create a **Web application** OAuth client. Supply its public client ID as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
3. Create an **Android** OAuth client in the same project using package `com.mdferdousakhter.salesforceadminquiz2026` and the certificate SHA-1 for the installed build. The current local debug certificate SHA-1 is `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` (verified October 18, 2026). Expo cloud, Play App Signing and local debug builds can use different certificates; register each relevant package/certificate pair. Never send a private key or client secret.
4. For iOS, create an iOS OAuth client with bundle ID `com.mdferdousakhter.salesforceadminquiz2026`; supply its public ID as `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`. The dynamic Expo config derives the required URL scheme.
5. Put the public IDs in `.env.local` for local builds (see `.env.example`). For EAS builds configure the same public environment variables in the selected EAS environment. Rebuild the native app after changing IDs or URL scheme. Google login requires a development/production build, rather than Expo Go, and Android requires Google Play Services.
6. Verify account selection, cancel, linking an existing learner, reopening offline, and a failed network request using the real clients before release. A different Google account cannot silently inherit an already-linked learner's progress.

No Google client IDs have been supplied yet. The Google button explains that configuration is pending; local learning remains available. iOS device login is unverified. Before App Store submission, review Apple's current login-services requirements and provide any required equivalent sign-in option.

Official setup: https://react-native-google-signin.github.io/docs/setting-up/expo
