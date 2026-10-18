# Decisions

## ADR-001: Persistent native screen hosts

Keep the three main tab hosts mounted and hide inactive hosts. Each owns a ScrollView, so content position is retained without timing-sensitive scroll restoration. A pure navigation helper maps Practice to its most recent dashboard/quiz view. Retain explanation state per quiz visit. This trades modest view memory for predictable state preservation in this small offline app.

## ADR-002: Mindful motion

Short native-driver transitions, pressed states and feedback provide delight. Respect system Reduce Motion and avoid continuous animations, flashing, autoplay, punitive streaks and celebratory overlays that obstruct answers. This interprets the owner's request for animation throughout the app in a way that supports calm learning.

## ADR-003: Shared UI and proportional AI-DLC

Use reusable icon/button/card/motion primitives and descriptive screen props. Adopt repository lifecycle documents and executable validation; do not add an external runtime or claim previous code passed historical gates.
