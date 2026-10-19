const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(path, dependencies = {}, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports, require: name => dependencies[name], ...globals });
  return exports;
}
test('backup replacement waits for native confirmation and cancellation preserves data', async () => {
  let buttons, options;
  const dialogs = load('src/platform/dialogs.ts', { 'react-native': {
    Alert: { alert: (_title, _message, actions, config) => { buttons = actions; options = config; } },
  } });
  const canceled = dialogs.confirmReplacement('Replace?', 'QA');
  buttons[0].onPress();
  assert.equal(await canceled, false);
  const dismissed = dialogs.confirmReplacement('Replace?', 'QA');
  options.onDismiss();
  assert.equal(await dismissed, false);
  const confirmed = dialogs.confirmReplacement('Replace?', 'QA');
  buttons[1].onPress();
  assert.equal(await confirmed, true);
});
test('web confirmations and backup transfer support cancel import download and cleanup', async () => {
  let accepted = false, calls = 0;
  const dialogs = load('src/platform/dialogs.web.ts', {}, { window: { confirm: () => accepted } });
  dialogs.confirmAction('Reset?', 'QA', 'Reset', () => calls++);
  assert.equal(calls, 0);
  accepted = true;
  assert.equal(await dialogs.confirmReplacement('Replace?', 'QA'), true);
  dialogs.confirmAction('Reset?', 'QA', 'Reset', () => calls++);
  assert.equal(calls, 1);
  let result = { canceled: true }, revoked = [], clicked = false, removed = false;
  const anchor = { click: () => { clicked = true; }, remove: () => { removed = true; } };
  const transfer = load('src/platform/backupTransfer.web.ts', {
    'expo-document-picker': { getDocumentAsync: async () => result },
  }, {
    Blob, URL: { createObjectURL: () => 'blob:qa', revokeObjectURL: url => revoked.push(url) },
    document: { createElement: () => anchor, body: { appendChild() {} } },
    setTimeout: callback => callback(),
  });
  assert.equal(await transfer.pickBackupText(), null);
  result = { canceled: false, assets: [{ uri: 'blob:import', file: { size: 2, text: async () => '{}' } }] };
  assert.equal(await transfer.pickBackupText(), '{}');
  assert.deepEqual(revoked, ['blob:import']);
  result.assets[0].file.size = 20_000_001;
  await assert.rejects(transfer.pickBackupText(), /too large/);
  await transfer.exportBackupFile('{}');
  assert.equal(clicked && removed, true);
  assert.equal(anchor.download, 'salesforce-admin-quiz-backup.json');
  assert.equal(revoked.at(-1), 'blob:qa');
});
test('location lookup handles permission denial and releases a stalled GPS request', async () => {
  let granted = false, timeout, cleared = 0, resolvePosition;
  const location = load('src/hooks/readApproximateLocation.ts', { 'expo-location': {
    Accuracy: { Low: 4 }, requestForegroundPermissionsAsync: async () => ({ granted }),
    getCurrentPositionAsync: () => new Promise(resolve => { resolvePosition = resolve; }),
  } }, { setTimeout: callback => { timeout = callback; return 1; }, clearTimeout: () => cleared++ });
  await assert.rejects(location.readApproximateLocation(), /not allowed/);
  granted = true;
  const stalled = location.readApproximateLocation();
  await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  timeout();
  await assert.rejects(stalled, /too long/);
  resolvePosition({ coords: { latitude: 23.81, longitude: 90.41 } });
  assert.equal(cleared, 2);
});
