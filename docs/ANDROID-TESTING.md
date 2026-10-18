# Android testing

The Expo project is linked to the personal account `ferdous0905`.

Latest redesigned standalone APK build:
https://expo.dev/accounts/ferdous0905/projects/salesforce-admin-quiz-2026/builds/f7c1e72d-191b-4ab2-9053-b26c9cdca7a3

Original standalone APK build:
https://expo.dev/accounts/ferdous0905/projects/salesforce-admin-quiz-2026/builds/34af7941-e8c5-4dc6-a0cd-8fae51fdb788

Open the build page on the Android phone/tablet. Once it reports Finished, download the APK, open it, and allow installation from the browser/file manager when Android asks. Both devices use the same APK but keep separate local profiles and progress.

The preview APK contains the application bundle and does not require Expo Go, a running Mac, USB debugging, or a development server. Core quizzes, explanations and screenshots work offline; external media and device speech providers may need a connection.

## USB install

With Android SDK Platform-Tools installed, USB debugging enabled and the Mac authorized:

```sh
~/Library/Android/sdk/platform-tools/adb devices
~/Library/Android/sdk/platform-tools/adb -s DEVICE_SERIAL install -r /absolute/path/to/app.apk
```

Replace DEVICE_SERIAL with the serial shown for the intended tablet or phone. `-r` updates an existing installation while keeping its app data; export a backup before updates during testing.

## Live development

A preview APK does not receive live code edits. For that, install a development build and start Metro:

```sh
npx eas-cli@latest build --platform android --profile development
npm start -- --localhost
~/Library/Android/sdk/platform-tools/adb -s DEVICE_SERIAL reverse tcp:8081 tcp:8081
```

Alternatively, with Android Studio/SDK and compatible Java installed, build and install locally with `npx expo run:android --device`.

## First device checks

Create a local profile; answer single/multiple-choice questions; reopen the app; check saved progress; practice failed questions; export/import a backup; turn on airplane mode and practice; test voice start/stop, denied permissions and unsupported speech services.
