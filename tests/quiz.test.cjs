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

test("learning reminders default hourly and reject invalid intervals", () => {
  const {
    decodeReminders,
    parseReminderMinutes,
    reminderNeedsUpdate,
  } = require("../src/domain/reminders.ts");
  assert.deepEqual(decodeReminders(null), {
    enabled: true,
    intervalMinutes: 60,
  });
  assert.deepEqual(decodeReminders('{"enabled":false,"intervalMinutes":120}'), {
    enabled: false,
    intervalMinutes: 120,
  });
  for (const value of ["0", "-1", "1.5", "abc", "", "10081", "Infinity"])
    assert.throws(() => parseReminderMinutes(value));
  assert.equal(parseReminderMinutes(" 90 "), 90);
  assert.equal(reminderNeedsUpdate(3600, 60), false);
  assert.equal(reminderNeedsUpdate(3600, 120), true);
  assert.equal(reminderNeedsUpdate(null, 60), true);
});

test("reminder windows honor day night boundaries, overnight ranges and changing solar times", () => {
  const {
    isReminderTimeAllowed,
    upcomingWindowReminders,
  } = require("../src/domain/reminderWindows.ts");
  const {
    decodeReminders,
    validateWindow,
  } = require("../src/domain/reminders.ts");
  const base = {
    enabled: true,
    intervalMinutes: 60,
    window: "day",
    dayStart: "07:00",
    dayEnd: "19:00",
  };
  const local = (hour, minute = 0) => new Date(2026, 9, 19, hour, minute);
  assert.equal(isReminderTimeAllowed(local(7), base), true);
  assert.equal(isReminderTimeAllowed(local(19), base), false);
  assert.equal(
    isReminderTimeAllowed(local(19), { ...base, window: "night" }),
    true,
  );
  assert.equal(
    isReminderTimeAllowed(local(6, 59), { ...base, window: "night" }),
    true,
  );
  assert.equal(
    isReminderTimeAllowed(local(23), {
      ...base,
      dayStart: "22:00",
      dayEnd: "06:00",
    }),
    true,
  );
  assert.equal(
    isReminderTimeAllowed(local(7), {
      ...base,
      dayStart: "22:00",
      dayEnd: "06:00",
    }),
    false,
  );
  const dates = upcomingWindowReminders(base, local(18, 30), 60);
  assert.equal(dates.length, 60);
  assert.ok(
    dates.every(
      (date) => date > local(18, 30) && isReminderTimeAllowed(date, base),
    ),
  );
  assert.equal(new Set(dates.map(Number)).size, dates.length);
  assert.throws(() => validateWindow({ ...base, dayStart: "24:00" }));
  assert.throws(() => validateWindow({ ...base, dayEnd: "07:00" }));
  assert.throws(() => validateWindow({ ...base, window: "sunrise-sunset" }));
  assert.throws(() =>
    validateWindow({ ...base, location: { latitude: 91, longitude: 0 } }),
  );
  const solar = {
    ...base,
    window: "sunrise-sunset",
    location: { latitude: 23.81, longitude: 90.41 },
  };
  const SunCalc = require("suncalc");
  for (const month of [0, 5, 9]) {
    const times = SunCalc.getTimes(new Date(2026, month, 19, 12), 23.81, 90.41);
    assert.equal(
      isReminderTimeAllowed(new Date(+times.sunrise + 300000), solar),
      true,
    );
    assert.equal(
      isReminderTimeAllowed(new Date(+times.sunset + 300000), solar),
      false,
    );
    assert.equal(
      isReminderTimeAllowed(new Date(+times.sunset + 300000), {
        ...solar,
        window: "sunset-sunrise",
      }),
      true,
    );
  }
  assert.equal(
    decodeReminders('{"enabled":true,"intervalMinutes":60}').window,
    undefined,
  );
});

test("friendly reminder content rotates deterministically and uses only real progress", () => {
  const { reminderMessage } = require("../src/domain/reminderContent.ts");
  const messages = Array.from({ length: 12 }, (_, i) => reminderMessage(i));
  assert.equal(new Set(messages.map((m) => m.title)).size, 12);
  assert.deepEqual(reminderMessage(0), reminderMessage(12));
  assert.ok(messages.every((m) => m.title.length < 65 && m.body.length < 200));
  const context = { explored: 6, total: 246, passed: 1, reviewCount: 5 };
  assert.match(reminderMessage(2, context).body, /6 of 246/);
  assert.match(reminderMessage(10, context).body, /correct on 1 question\./);
  assert.doesNotMatch(
    reminderMessage(2, { ...context, explored: 0 }).body,
    /explored 0/,
  );
  assert.doesNotMatch(
    JSON.stringify(messages),
    /guaranteed|falling behind|lose your streak|correct answer is/i,
  );
});

test("answer feedback labels correct wrong missed and ungraded options without pre-submit spoilers", () => {
  const { answerFeedback } = require("../src/domain/answerFeedback.ts");
  const q = bank.find((q) => isGradable(q) && acceptedAnswer(q).length === 1);
  const right = acceptedAnswer(q)[0],
    wrong = q.options.find((o) => !acceptedAnswer(q).includes(o.id)).id;
  assert.deepEqual(answerFeedback(q, right, [right], false), {
    state: "neutral",
    label: "Your selection",
  });
  assert.deepEqual(answerFeedback(q, right, [], false), {
    state: "neutral",
    label: "",
  });
  assert.equal(answerFeedback(q, right, [right], true).state, "correct");
  assert.equal(answerFeedback(q, right, [wrong], true).state, "missed");
  assert.equal(answerFeedback(q, wrong, [wrong], true).state, "incorrect");
  assert.equal(
    answerFeedback(q, wrong, [right], true).label,
    "Incorrect option",
  );
  const multi = bank.find((q) => isGradable(q) && acceptedAnswer(q).length > 1);
  const choices = acceptedAnswer(multi);
  assert.equal(
    answerFeedback(multi, choices[0], [choices[0]], true).state,
    "correct",
  );
  assert.equal(
    answerFeedback(multi, choices[1], [choices[0]], true).state,
    "missed",
  );
  const review = bank.find((q) => !isGradable(q));
  assert.equal(
    answerFeedback(review, review.options[0].id, [review.options[0].id], true)
      .state,
    "unverified",
  );
  const conflict = bank.find(
    (q) => q.verificationStatus === "document_conflict" && isGradable(q),
  );
  assert.equal(
    answerFeedback(
      conflict,
      acceptedAnswer(conflict)[0],
      acceptedAnswer(conflict),
      true,
    ).state,
    "correct",
  );
});

test("under-review source defects remain ungraded and field-history explanation follows current documentation", () => {
  const pending = bank.filter((q) => q.verificationStatus === "needs_review");
  assert.equal(pending.length, 46);
  for (const q of pending) assert.equal(isGradable(q), false);
  for (const number of [86, 221, 224, 246])
    assert.equal(
      bank.find((q) => q.questionNumber === number).verificationStatus,
      "needs_review",
    );
  const restored = bank.find((q) => q.questionNumber === 165);
  assert.match(restored.explanation.summary, /restores its field-history data/);
  assert.match(
    restored.explanation.optionExplanations.find((o) => o.optionId === "B")
      .reason,
    /field-history data is restored/,
  );
  assert.deepEqual(restored.documentAnswer, ["A"]);
  assert.equal(restored.verifiedAnswer, null);
});

test("library includes reference-only questions without changing exact screenshot or video mappings", () => {
  const {
    mediaQuestions,
    mediaAvailability,
    resourcesFor,
  } = require("../src/domain/resources.ts");
  const referenceOnly = bank.find(
    (q) =>
      q.sources.length &&
      mediaAvailability(q).screenshotCount === 0 &&
      mediaAvailability(q).videoCount === 0,
  );
  assert.ok(referenceOnly);
  const row = mediaQuestions(
    bank,
    "references",
    String(referenceOnly.questionNumber),
  );
  assert.equal(row.length, 1);
  assert.equal(
    row[0].referenceCount,
    resourcesFor(referenceOnly).filter((r) => r.kind === "reading").length,
  );
  assert.ok(
    mediaQuestions(bank, "all").some(
      (row) => row.question.questionNumber === referenceOnly.questionNumber,
    ),
  );
  assert.equal(mediaQuestions(bank, "screenshots").length, 17);
  assert.equal(mediaQuestions(bank, "videos").length, 22);
  assert.ok(
    mediaQuestions(bank, "references").every((row) => row.referenceCount > 0),
  );
});

test("progress overview includes all questions in serial order and filters participation without changing results", () => {
  const { progressQuestions } = require("../src/domain/progressView.ts");
  const [passed, failed] = bank.filter(isGradable);
  const reviewed = bank.find((q) => !isGradable(q));
  let profile = blank();
  for (const [question, correct, time] of [
    [passed, true, "2026-10-20T10:00:00Z"],
    [failed, false, "2026-10-21T10:00:00Z"],
    [reviewed, null, "2026-10-22T10:00:00Z"],
  ]) {
    profile = recordAttempt(profile, question, {
      correct,
      submittedAnswers: question.options.slice(0, 1).map((o) => o.id),
      attemptedAt: time,
    });
  }
  const before = JSON.stringify(profile);
  const rows = progressQuestions([...bank].reverse(), profile);
  assert.equal(rows.length, 246);
  assert.deepEqual(
    rows.map((row) => row.question.questionNumber),
    Array.from({ length: 246 }, (_, i) => i + 1),
  );
  assert.equal(progressQuestions(bank, profile, "attempted").length, 3);
  assert.equal(progressQuestions(bank, profile, "unattempted").length, 243);
  for (const status of ["passed", "failed", "reviewed"]) {
    const matching = progressQuestions(bank, profile, status);
    assert.equal(matching.length, 1);
    assert.equal(matching[0].status, status);
  }
  assert.equal(
    progressQuestions(bank, profile, "all", `#${reviewed.questionNumber}`)[0]
      .status,
    "reviewed",
  );
  const recent = progressQuestions(bank, profile, "all", "", "recent");
  assert.deepEqual(
    recent.slice(0, 3).map((row) => row.status),
    ["reviewed", "failed", "passed"],
  );
  assert.equal(recent[3].status, "unattempted");
  assert.equal(JSON.stringify(profile), before);
  assert.equal(
    progressQuestions(bank, blank(), "all").every(
      (row) => row.status === "unattempted",
    ),
    true,
  );
});

test("progress filter counts include untouched and ungraded questions and respect search", () => {
  const {
    progressQuestions,
    progressFilterCounts,
  } = require("../src/domain/progressView.ts");
  let profile = blank();
  const graded = bank.find(isGradable),
    review = bank.find((q) => !isGradable(q));
  profile = recordAttempt(profile, graded, {
    submittedAnswers: acceptedAnswer(graded),
    correct: true,
    attemptedAt: "2026-10-22T10:00:00Z",
  });
  profile = recordAttempt(profile, review, {
    submittedAnswers: [],
    correct: null,
    attemptedAt: "2026-10-22T11:00:00Z",
  });
  const before = JSON.stringify(profile);
  assert.deepEqual(progressFilterCounts(progressQuestions(bank, profile)), {
    all: 246,
    attempted: 2,
    unattempted: 244,
    passed: 1,
    failed: 0,
    reviewed: 1,
  });
  assert.deepEqual(
    progressFilterCounts(
      progressQuestions(bank, profile, "all", `#${review.questionNumber}`),
    ),
    { all: 1, attempted: 1, unattempted: 0, passed: 0, failed: 0, reviewed: 1 },
  );
  assert.equal(
    progressFilterCounts(
      progressQuestions(bank, profile, "all", "no-matching-question-xyz"),
    ).all,
    0,
  );
  assert.equal(JSON.stringify(profile), before);
});
