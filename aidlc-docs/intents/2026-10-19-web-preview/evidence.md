# Evidence

- Added Expo-compatible react-dom, react-native-web and Metro runtime dependencies.
- Added browser-only localStorage persistence and iframe media adapters. Native SQLite and WebView implementations are unchanged. Inactive screen hosts expose aria-hidden for browser accessibility.
- `npm run check`: lifecycle validation, TypeScript and all 10 regression tests passed.
- Browser at localhost:8082: created separate Web Preview profile, opened Practice, searched Library for #1 and rendered both bundled screenshots inside the modal.
- Native Google OAuth remains pending. Native file backup actions are not adapted for web. Browser speech and all remote embeds are not fully verified.
