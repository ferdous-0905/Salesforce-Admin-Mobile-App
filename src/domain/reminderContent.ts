export interface ReminderContext {
  explored: number;
  total: number;
  passed: number;
  reviewCount: number;
}
export interface ReminderMessage {
  title: string;
  body: string;
}
const invitations: ReminderMessage[] = [
  {
    title: "Tiny quiz. Big ambitions. 🚀",
    body: "Your next Salesforce idea is waiting. Take one question toward the admin you want to become.",
  },
  {
    title: "Got a curious minute? 💡",
    body: "Give your brain a little Salesforce adventure. Open a question and discover the why.",
  },
  {
    title: "Hello, future problem-solver 👋",
    body: "Build a little more admin confidence today. One question is a lovely place to start.",
  },
  {
    title: "A little brain snack? 🧠",
    body: "Trade a short break for a fresh Salesforce idea. Tap to pick up your practice.",
  },
  {
    title: "Big goals grow in small moments 🌱",
    body: "You do not need a perfect study day. A thoughtful question can be your next step.",
  },
  {
    title: "Your next “aha!” is calling ✨",
    body: "Record types, permissions, flows… there is always something to connect. Come explore a question.",
  },
  {
    title: "Bring your curiosity. We have the quiz.",
    body: "Make room for a small discovery. Try a Salesforce question at your own pace.",
  },
  {
    title: "Future you might enjoy this 🚀",
    body: "A little practice now can build useful understanding for later. Ready for a question?",
  },
  {
    title: "Coffee break meets Salesforce ☕",
    body: "If you have a moment, make it a curious one. Open your next learning question.",
  },
  {
    title: "Let’s make a tricky idea click 💡",
    body: "No timer, no pressure. Explore a question and learn what makes the answer work.",
  },
  {
    title: "A small win for your learning day 🌟",
    body: "Show up with curiosity and see what you discover. Your practice is ready when you are.",
  },
  {
    title: "Dream big. Practise a little.",
    body: "Turn your Salesforce ambition into one practical learning moment. Tap to continue.",
  },
];
/** Deterministic slot rotation keeps queued messages stable across app reopenings. */
export function reminderMessage(
  slot: number,
  context?: ReminderContext,
): ReminderMessage {
  const index =
    ((Math.trunc(slot) % invitations.length) + invitations.length) %
    invitations.length;
  const base = invitations[index];
  if (index === 2 && context && context.explored > 0)
    return {
      title: "Look at your growing knowledge 🌱",
      body: `You have explored ${context.explored} of ${context.total} questions. Keep building your understanding, one idea at a time.`,
    };
  if (index === 6 && context && context.reviewCount > 0)
    return {
      title: "Another look, a new “aha!” 💡",
      body: "Some ideas become clearer on a second visit. Open practice or revisit a tricky question when you have a moment.",
    };
  if (index === 10 && context && context.passed > 0)
    return {
      title: "Build on what you already know 🌟",
      body: `Your latest answers are correct on ${context.passed} question${context.passed === 1 ? "" : "s"}. Bring that curiosity to your next learning moment.`,
    };
  return { ...base };
}
