const ts = require("typescript");
const fs = require("node:fs");
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
const test = require("node:test");
const assert = require("node:assert/strict");
const bank = require("../assets/data/questions.json");
const {
  acceptedAnswer,
  isCorrect,
  isGradable,
  selectQuestion,
  publicQuestion,
} = require("../src/domain/questions.ts");
const {
  recordAttempt,
  calculateStatistics,
  clearProgress,
} = require("../src/domain/progress.ts");
const { encodeBackup, decodeBackup } = require("../src/domain/backup.ts");
const { parseSpokenAnswers } = require("../src/domain/spoken-answers.ts");
const blank = () => ({
  name: "Test Learner",
  storageKey: "local",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  statistics: calculateStatistics({}),
  questions: {},
});
test("all 246 source questions preserve valid IDs and answer grading", () => {
  assert.equal(bank.length, 246);
  assert.equal(new Set(bank.map((q) => q.questionNumber)).size, 246);
  for (const q of bank) {
    if (isGradable(q)) {
      assert.ok(acceptedAnswer(q).length);
      assert.equal(isCorrect(q, acceptedAnswer(q)), true);
      assert.equal(isCorrect(q, []), false);
    }
  }
});
test("research answer takes precedence and unresolved questions do not count in score", () => {
  const source = bank[0];
  const conflict = {
    ...source,
    verificationStatus: "document_conflict",
    documentAnswer: ["A"],
    verifiedAnswer: ["C"],
  };
  assert.equal(isCorrect(conflict, ["C"]), true);
  assert.equal(isCorrect(conflict, ["A"]), false);
  const u = recordAttempt(blank(), source, {
    submittedAnswers: ["A"],
    correct: null,
    attemptedAt: new Date().toISOString(),
  });
  assert.equal(u.statistics.attempted, 0);
  assert.equal(u.statistics.reviewed, 1);
  assert.equal(u.statistics.totalAttempts, 0);
});
test("failed review and latest result statistics", () => {
  let user = recordAttempt(blank(), bank[0], {
    submittedAnswers: ["A"],
    correct: false,
    attemptedAt: new Date().toISOString(),
  });
  assert.equal(selectQuestion(bank, user, "failed").questionNumber, 1);
  user = recordAttempt(user, bank[0], {
    submittedAnswers: acceptedAnswer(bank[0]),
    correct: true,
    attemptedAt: new Date().toISOString(),
  });
  assert.equal(user.statistics.passed, 1);
  assert.equal(user.statistics.totalAttempts, 2);
  assert.equal(selectQuestion(bank, user, "failed"), null);
  assert.equal(clearProgress(user).statistics.totalAttempts, 0);
});
test("backup round trip reconstructs statistics and rejects malformed histories", () => {
  const user = recordAttempt(blank(), bank[0], {
    submittedAnswers: acceptedAnswer(bank[0]),
    correct: true,
    attemptedAt: new Date().toISOString(),
  });
  assert.deepEqual(
    decodeBackup(encodeBackup(user), bank).questions,
    user.questions,
  );
  const altered = JSON.parse(encodeBackup(user));
  altered.profile.statistics.score = 999;
  assert.equal(
    decodeBackup(JSON.stringify(altered), bank).statistics.score,
    100,
  );
  altered.profile.questions["1"].history[0].submittedAnswers = ["INVALID"];
  assert.throws(() => decodeBackup(JSON.stringify(altered), bank));
  assert.throws(() => decodeBackup("{oops", bank));
  assert.throws(() => decodeBackup('{"version":2}', bank));
});
test("spoken answers map letters and ordinals to actual options", () => {
  const q = publicQuestion(bank[0]);
  assert.deepEqual(parseSpokenAnswers("option C", q), ["C"]);
  assert.deepEqual(parseSpokenAnswers("third option", q), ["C"]);
});
test("SQLite persistence saves, reloads, replaces and deletes a profile", async () => {
  const { DatabaseSync } = require("node:sqlite");
  const Module = require("node:module");
  const original = Module._load;
  const sqlite = new DatabaseSync(":memory:");
  Module._load = function (id, ...args) {
    if (id === "expo-sqlite")
      return {
        openDatabaseAsync: async () => ({
          execAsync: async (sql) => sqlite.exec(sql),
          getFirstAsync: async (sql, ...params) =>
            sqlite.prepare(sql).get(...params),
          runAsync: async (sql, ...params) =>
            sqlite.prepare(sql).run(...params),
        }),
      };
    return original.call(this, id, ...args);
  };
  const storage = require("../src/storage/profile.ts");
  Module._load = original;
  try {
    assert.equal(await storage.loadProfile(), null);
    const profile = storage.newProfile(" Test Learner ");
    await storage.saveProfile(profile);
    assert.deepEqual(await storage.loadProfile(), profile);
    const updated = recordAttempt(profile, bank[0], {
      submittedAnswers: acceptedAnswer(bank[0]),
      correct: true,
      attemptedAt: new Date().toISOString(),
    });
    await storage.saveProfile(updated);
    assert.equal((await storage.loadProfile()).statistics.passed, 1);
    await storage.deleteProfile();
    assert.equal(await storage.loadProfile(), null);
    sqlite.exec("PRAGMA user_version = 2");
    await assert.rejects(storage.loadProfile(), /newer version/);
  } finally {
    sqlite.close();
  }
});
test("mobile learning resources preserve every source screenshot/video mapping", () => {
  const { resourcesFor, videoEmbedUrl } = require("../src/domain/resources.ts");
  const screenshots = require("../assets/data/screenshots.json");
  const videos = require("../assets/data/videos.json");
  for (const question of bank) {
    const resources = resourcesFor(question);
    const key = String(question.questionNumber);
    assert.deepEqual(
      resources
        .filter((r) => r.kind === "screenshot")
        .map((r) => r.id)
        .sort(),
      [...(screenshots.questionScreenshots[key]?.resourceIds ?? [])].sort(),
    );
    assert.deepEqual(
      resources
        .filter((r) => r.kind === "video")
        .map((r) => r.id)
        .sort(),
      [...(videos.questionResources[key]?.resourceIds ?? [])].sort(),
    );
    for (const video of resources.filter((r) => r.kind === "video"))
      assert.ok(videoEmbedUrl(video));
    for (const shot of resources.filter((r) => r.kind === "screenshot"))
      assert.ok(
        fs.existsSync(
          require("node:path").join(
            __dirname,
            "../assets",
            shot.screenshot.imagePath.replace(/^\//, ""),
          ),
        ),
      );
  }
  const first = resourcesFor(bank[0]);
  assert.equal(first.filter((r) => r.kind === "screenshot").length, 2);
  assert.equal(first.filter((r) => r.kind === "video").length, 1);
  assert.equal(
    videoEmbedUrl({
      ...first.find((r) => r.kind === "video"),
      youtubeId: "invalid",
    }),
    null,
  );
});
test("main tab round trips resume the previous Practice view", () => {
  const {
    navigationReducer,
    initialNavigation,
    visiblePage,
  } = require("../src/domain/navigation.ts");
  let nav = navigationReducer(initialNavigation, {
    type: "page",
    page: "quiz",
  });
  nav = navigationReducer(nav, { type: "tab", tab: "progress" });
  assert.equal(visiblePage(nav), "progress");
  assert.equal(nav.practicePage, "quiz");
  nav = navigationReducer(nav, { type: "tab", tab: "settings" });
  assert.equal(visiblePage(nav), "settings");
  nav = navigationReducer(nav, { type: "tab", tab: "practice" });
  assert.equal(visiblePage(nav), "quiz");
  nav = navigationReducer(nav, { type: "page", page: "home" });
  nav = navigationReducer(nav, { type: "tab", tab: "settings" });
  nav = navigationReducer(nav, { type: "tab", tab: "practice" });
  assert.equal(visiblePage(nav), "home");
});
test("media library filters expose only mapped questions and support exact question search", () => {
  const {
    mediaQuestions,
    mediaAvailability,
  } = require("../src/domain/resources.ts");
  assert.equal(mediaQuestions(bank, "screenshots").length, 17);
  assert.equal(mediaQuestions(bank, "videos").length, 22);
  assert.equal(mediaQuestions(bank, "all", "#1").length, 1);
  assert.equal(mediaQuestions(bank, "all", "#1")[0].question.questionNumber, 1);
  assert.deepEqual(
    {
      shots: mediaAvailability(bank[0]).screenshotCount,
      videos: mediaAvailability(bank[0]).videoCount,
    },
    { shots: 2, videos: 1 },
  );
  assert.equal(
    mediaQuestions(bank, "videos", "no-such-question-xyz").length,
    0,
  );
});
test("Google linking preserves guest progress, blocks silent account mixing and excludes identity from backups", () => {
  const {
    linkGoogleAccount,
    isGoogleAccount,
  } = require("../src/domain/identity.ts");
  const guest = recordAttempt(blank(), bank[0], {
    submittedAnswers: ["C"],
    correct: true,
    attemptedAt: new Date().toISOString(),
  });
  const account = {
    id: "google-user-1",
    email: "learner@example.com",
    name: "Google Learner",
  };
  const linked = linkGoogleAccount(guest, account);
  assert.equal(linked.name, "Google Learner");
  assert.deepEqual(linked.questions, guest.questions);
  assert.equal(linked.statistics.score, 100);
  assert.equal(isGoogleAccount(linked.googleAccount), true);
  assert.throws(
    () => linkGoogleAccount(linked, { ...account, id: "another-account" }),
    /another Google account/,
  );
  const exported = encodeBackup(linked);
  assert.equal(JSON.parse(exported).profile.googleAccount, undefined);
  assert.equal(decodeBackup(exported, bank).googleAccount, undefined);
  assert.equal(decodeBackup(exported, bank).statistics.score, 100);
});
