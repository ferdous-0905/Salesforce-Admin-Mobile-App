# Mobile explanation parity correction

The first mobile version had basic screenshot cards and external video links, but lacked the source web app's screenshot inspection and embedded video features. Media appeared only on the specific mapped questions and had no explicit empty-state labels, making the feature difficult to discover.

## Changes

- Study notes, References, Screenshots and Videos tabs show resource counts.
- Submitting an answer scrolls to the explanation; a View full explanation button brings it back into view.
- Option reasoning includes complete option text, research provenance, source conflict warnings, unresolved answer information and the original PDF explanation when available.
- Reference cards include publisher, reviewed date, relevance and application to the scenario.
- All six bundled screenshots retain exact question mappings, captions, navigation paths, key points and source links. A modal supports fitted/enlarged inspection.
- Embedded YouTube playback loads only on explicit Play. An external YouTube fallback remains. Client identity Referer follows YouTube's WebView integration guidance. Network/player/provider errors may still require using the external fallback.
- No extra unrelated media is assigned: the existing catalog covers 17 questions with screenshots and 22 with videos. Question 1 includes two screenshots and one video.

## Validation

TypeScript passes. Seven automated tests pass, including a new test comparing screenshot/video IDs for every one of the 246 questions against the original imported catalog and checking that every image asset exists. Real-device player behavior and iOS playback require separate verification.

Android native rebuild passed (372 tasks), and the existing debug installation was updated over USB without uninstalling. Metro was restarted for the new native module. Final interactive screenshot/video verification is waiting for the tablet to be unlocked.
