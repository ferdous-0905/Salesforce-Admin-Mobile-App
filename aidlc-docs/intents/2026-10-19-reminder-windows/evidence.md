# Evidence

- npm run check: 14 tests pass, TypeScript and lifecycle validation pass. Coverage includes local clock boundaries, overnight windows, solar times across three seasons, legacy preference migration, daily schedule replacement/deduplication, bounded date queues and cancellation.
- Android arm64 assembleDebug successful with expo-location linked. iOS Metro export successful. No connected physical device; location permission, background OS delivery and native window behavior remain device-unverified.
- Browser: all five choices visible; saved 08:00–18:00 daytime and verified persistence after reload. Solar mode refuses saving without coordinates. Browser does not deliver notifications.
- Fixed windows use daily repeats for compatible intervals. Solar and other intervals use at most 60 queued notifications refreshed on reopening. Saved location is approximate/local; no background tracking. OS delays and timezone/travel changes remain documented limits.
