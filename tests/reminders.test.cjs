const ts = require("typescript");
const fs = require("node:fs");
const Module = require("node:module");
const test = require("node:test");
const assert = require("node:assert/strict");
require.extensions[".ts"] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    filename,
  );
let scheduled = [],
  allowed = true,
  requests = 0,
  writes = 0;
const api = {
  AndroidImportance: { DEFAULT: 3 },
  SchedulableTriggerInputTypes: {
    TIME_INTERVAL: "timeInterval",
    DATE: "date",
    DAILY: "daily",
  },
  setNotificationChannelAsync: async () => {},
  getAllScheduledNotificationsAsync: async () => scheduled,
  cancelScheduledNotificationAsync: async (id) => {
    scheduled = scheduled.filter((item) => item.identifier !== id);
  },
  getPermissionsAsync: async () => ({ granted: allowed, canAskAgain: true }),
  requestPermissionsAsync: async () => {
    requests++;
    return { granted: allowed, canAskAgain: true };
  },
  scheduleNotificationAsync: async (request) => {
    writes++;
    scheduled.push(request);
    return request.identifier;
  },
};
const original = Module._load;
Module._load = function (id, ...args) {
  if (id === "react-native") return { Platform: { OS: "android" } };
  if (id === "expo-notifications") return api;
  return original.call(this, id, ...args);
};
const {
  synchronizeReminders,
} = require("../src/notifications/learningReminders.ts");
test("native reminder scheduler avoids duplicates, replaces intervals and cancels on disable or denied permission", async () => {
  await synchronizeReminders({ enabled: true, intervalMinutes: 60 }, true);
  assert.equal(scheduled.length, 24);
  assert.equal(scheduled[0].trigger.type, "daily");
  await synchronizeReminders({ enabled: true, intervalMinutes: 60 }, true);
  assert.equal(writes, 24);
  await synchronizeReminders({ enabled: true, intervalMinutes: 90 }, true);
  assert.equal(scheduled.length, 16);
  assert.equal(scheduled[1].trigger.minute, 30);
  await synchronizeReminders({ enabled: false, intervalMinutes: 90 }, true);
  assert.equal(scheduled.length, 0);
  await synchronizeReminders({ enabled: true, intervalMinutes: 60 }, true);
  allowed = false;
  await synchronizeReminders(
    { enabled: true, intervalMinutes: 60 },
    true,
    true,
  );
  assert.equal(requests, 1);
  assert.equal(scheduled.length, 0);
  allowed = true;
  await synchronizeReminders({ enabled: true, intervalMinutes: 60 }, true);
  await synchronizeReminders({ enabled: true, intervalMinutes: 60 }, false);
  assert.equal(scheduled.length, 0);
});

test("restricted schedules replace all-day repeats, refresh without duplicates and cancel fully", async () => {
  allowed = true;
  scheduled = [];
  await synchronizeReminders({ enabled: true, intervalMinutes: 60 }, true);
  const preferences = {
    enabled: true,
    intervalMinutes: 60,
    window: "day",
    dayStart: "07:00",
    dayEnd: "19:00",
  };
  await synchronizeReminders(preferences, true);
  assert.equal(scheduled.length, 12);
  assert.ok(
    scheduled.every((item) => item.identifier.startsWith("learning-reminder:")),
  );
  const oldWrites = writes;
  await synchronizeReminders(preferences, true);
  assert.equal(writes, oldWrites);
  await synchronizeReminders({ ...preferences, window: "night" }, true);
  assert.equal(scheduled.length, 12);
  assert.ok(
    scheduled.every(
      (item) =>
        JSON.parse(item.content.data.windowSignature)[0].window === "night",
    ),
  );
  await synchronizeReminders({ ...preferences, intervalMinutes: 75 }, true);
  assert.equal(scheduled.length, 60);
  assert.ok(scheduled.every((item) => item.trigger.type === "date"));
  await synchronizeReminders({ ...preferences, enabled: false }, true);
  assert.equal(scheduled.length, 0);
  await synchronizeReminders({ enabled: true, intervalMinutes: 60 }, true);
  assert.equal(scheduled.length, 24);
  assert.ok(
    scheduled.every((item) =>
      item.identifier.startsWith("learning-reminder:daily:"),
    ),
  );
});

test("notification messages vary between slots and refresh with progress", async () => {
  scheduled = [];
  allowed = true;
  const preferences = { enabled: true, intervalMinutes: 60 };
  await synchronizeReminders(preferences, true, false, {
    explored: 0,
    total: 246,
    passed: 0,
    reviewCount: 0,
  });
  assert.equal(scheduled.length, 24);
  assert.equal(new Set(scheduled.map((item) => item.content.title)).size, 12);
  assert.notEqual(scheduled[0].content.body, scheduled[1].content.body);
  await synchronizeReminders(preferences, true, false, {
    explored: 6,
    total: 246,
    passed: 1,
    reviewCount: 5,
  });
  assert.equal(scheduled.length, 24);
  assert.ok(scheduled.some((item) => item.content.body.includes("6 of 246")));
  assert.ok(
    scheduled.every((item) => item.content.data.kind === "learning-reminder"),
  );
});
