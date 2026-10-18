# Run and recover

Use `npm run android:usb` to select JDK 17 and the local SDK on macOS. Connect an authorized tablet with USB debugging. Metro normally uses port 8081; `adb -s DEVICE_SERIAL reverse tcp:8081 tcp:8081` forwards USB traffic. The debug app requires Metro to remain running.

Native module/icon changes require a native rebuild. JavaScript/UI changes use Fast Refresh. Preview APKs work standalone. Debug and cloud signing keys differ; export progress before switching variants and never uninstall to resolve a signing conflict without user consent.

Rollback code by restoring the previous source revision and rebuilding with the same signing key. Preserve the SQLite database and stable question IDs. Do not roll back a schema to a version that cannot read current data. No remote release is performed without explicit authorization.
