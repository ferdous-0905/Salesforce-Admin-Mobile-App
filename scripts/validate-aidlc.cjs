const fs = require("node:fs");
const assert = require("node:assert/strict");
const required = [
  "AGENTS.md",
  "ARCHITECTURE.md",
  "aidlc-docs/README.md",
  "aidlc-docs/aidlc-state.md",
  "aidlc-docs/inception/requirements.md",
  "aidlc-docs/decisions/README.md",
  "aidlc-docs/construction/verification.md",
  "aidlc-docs/operations/runbook.md",
];
for (const file of required)
  assert.ok(
    fs.existsSync(file) && fs.readFileSync(file, "utf8").trim(),
    `Missing lifecycle document: ${file}`,
  );
const requirements = fs.readFileSync(
  "aidlc-docs/inception/requirements.md",
  "utf8",
);
const ids = [...requirements.matchAll(/^- (M-\d+):/gm)].map((x) => x[1]);
const mapping = JSON.parse(
  fs.readFileSync("aidlc-docs/traceability.json", "utf8"),
);
assert.equal(
  new Set(mapping.map((x) => x.id)).size,
  mapping.length,
  "Duplicate requirement mapping",
);
const tests = fs.readdirSync("tests")
  .filter((file) => file.endsWith(".test.cjs"))
  .map((file) => fs.readFileSync(`tests/${file}`, "utf8"))
  .join("\n");
for (const id of ids) {
  const entry = mapping.find((x) => x.id === id);
  assert.ok(entry, `No traceability: ${id}`);
  for (const file of entry.sources)
    assert.ok(fs.existsSync(file), `Missing source ${file}`);
  for (const test of entry.tests)
    assert.ok(tests.includes(test), `Missing named test: ${test}`);
  assert.ok(
    entry.tests.length || entry.manual,
    `No verification planned: ${id}`,
  );
}
const state = fs.readFileSync("aidlc-docs/aidlc-state.md", "utf8");
const intent = state.match(/`(intents\/[^`]+\/intent.md)`/);
assert.ok(intent, "No current intent");
const directory = "aidlc-docs/" + intent[1].replace("/intent.md", "");
for (const file of ["intent.md", "plan.md", "evidence.md", "state.md"])
  assert.ok(
    fs.existsSync(directory + "/" + file),
    `Incomplete intent: ${file}`,
  );
console.log(
  `AI-DLC structure valid: ${ids.length} requirements, active intent and source/test mappings.`,
);
