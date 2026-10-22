const fs = require("node:fs");
const Module = require("node:module");
const ts = require("typescript");
const test = require("node:test");
const assert = require("node:assert/strict");
const React = require("react");
const { create, act } = require("react-test-renderer");
global.IS_REACT_ACT_ENVIRONMENT = true;
for (const extension of [".ts", ".tsx"]) {
  require.extensions[extension] = (module, filename) =>
    module._compile(
      ts.transpileModule(fs.readFileSync(filename, "utf8"), {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          jsx: ts.JsxEmit.React,
          esModuleInterop: true,
          target: ts.ScriptTarget.ES2022,
        },
        fileName: filename,
      }).outputText,
      filename,
    );
}
require.extensions[".jpg"] = (module, filename) => {
  module.exports = filename;
};
const host = (name) => (props) =>
  React.createElement(name, props, props.children);
const native = Object.fromEntries(
  [
    "View",
    "Text",
    "Pressable",
    "TextInput",
    "Switch",
    "Image",
    "Modal",
    "ScrollView",
    "ActivityIndicator",
  ].map((name) => [name, name]),
);
native.StyleSheet = { create: (styles) => styles };
native.Platform = { OS: "web" };
native.Linking = { openURL: async () => {} };
const originalLoad = Module._load;
Module._load = function (name, parent, main) {
  if (name === "react-native") return native;
  if (name === "react-native-safe-area-context")
    return { SafeAreaView: host("SafeAreaView") };
  if (name.endsWith("/ui/primitives") || name === "./primitives")
    return {
      Icon: host("Icon"),
      IconBadge: host("IconBadge"),
      Button: host("Button"),
      Card: host("Card"),
      Motion: host("Motion"),
    };
  if (name === "./LearningVideo")
    return { LearningVideo: host("LearningVideo") };
  if (name === "./ReferenceViewer")
    return { ReferenceViewer: host("ReferenceViewer") };
  if (name.endsWith("/MediaViewer"))
    return { MediaViewer: host("MediaViewer") };
  if (name.endsWith("/GoogleAccountButton"))
    return { GoogleAccountButton: host("GoogleAccountButton") };
  return originalLoad.call(this, name, parent, main);
};
const { Disclosure } = require("../src/ui/Disclosure.tsx");
const { QuizScreen } = require("../src/screens/QuizScreen.tsx");
const { SettingsScreen } = require("../src/screens/SettingsScreen.tsx");
const bank = require("../assets/data/questions.json");
const newProfile = (name) => ({ name, questions: {}, statistics: {} });
function hidden(node) {
  for (let current = node; current; current = current.parent) {
    const styles = [current.props.style].flat(Infinity).filter(Boolean);
    if (styles.some((style) => style.display === "none")) return true;
  }
  return false;
}
function disclosure(root, label) {
  return root
    .findAllByType("Pressable")
    .find((node) => node.props.accessibilityLabel === label);
}
function tab(root, label) {
  return root
    .findAllByType("Pressable")
    .find(
      (node) =>
        node.props.accessibilityRole === "tab" &&
        node
          .findAllByType("Text")
          .some((text) => text.props.children === label),
    );
}
test("disclosure opens and closes while keeping child drafts mounted", async () => {
  let mounts = 0;
  function Draft() {
    const [value, setValue] = React.useState("");
    React.useEffect(() => {
      mounts++;
    }, []);
    return React.createElement("TextInput", { value, onChangeText: setValue });
  }
  let tree;
  await act(() => {
    tree = create(
      React.createElement(
        Disclosure,
        { title: "Profile" },
        React.createElement(Draft),
      ),
    );
  });
  assert.equal(
    disclosure(tree.root, "Profile").props.accessibilityState.expanded,
    false,
  );
  assert.equal(hidden(tree.root.findByType("TextInput")), true);
  await act(() => disclosure(tree.root, "Profile").props.onPress());
  await act(() =>
    tree.root.findByType("TextInput").props.onChangeText("Unsaved name"),
  );
  await act(() => disclosure(tree.root, "Profile").props.onPress());
  assert.equal(hidden(tree.root.findByType("TextInput")), true);
  await act(() => disclosure(tree.root, "Profile").props.onPress());
  assert.equal(tree.root.findByType("TextInput").props.value, "Unsaved name");
  assert.equal(mounts, 1);
  await act(() => tree.unmount());
});
test("practice has one result and closing explanation retains the resource tab and deactivates video", async () => {
  let submissions = 0;
  const question = bank.find((q) => q.questionNumber === 1);
  const props = {
    visits: [{ question, selected: ["A"], submitted: true, correct: true }],
    position: 0,
    mode: "random",
    active: true,
    busy: false,
    voice: { activity: "idle", message: "", stop() {}, read() {}, listen() {} },
    onToggle() {},
    onSubmit() {
      submissions++;
    },
    onPrevious() {},
    onNext() {},
    onHome() {},
  };
  let tree;
  await act(() => {
    tree = create(React.createElement(QuizScreen, props));
  });
  assert.equal(
    tree.root
      .findAllByType("Text")
      .filter((node) => node.props.children === "Correct").length,
    1,
  );
  assert.equal(
    disclosure(tree.root, "Explanation").props.accessibilityState.expanded,
    false,
  );
  await act(() => disclosure(tree.root, "Explanation").props.onPress());
  await act(() => tab(tree.root, "Videos (1)").props.onPress());
  assert.equal(tree.root.findByType("LearningVideo").props.active, true);
  await act(() => disclosure(tree.root, "Explanation").props.onPress());
  assert.equal(tree.root.findByType("LearningVideo").props.active, false);
  await act(() => disclosure(tree.root, "Explanation").props.onPress());
  assert.equal(
    tab(tree.root, "Videos (1)").props.accessibilityState.selected,
    true,
  );
  assert.equal(tree.root.findByType("LearningVideo").props.active, true);
  await act(() =>
    tree.update(React.createElement(QuizScreen, { ...props, active: false })),
  );
  assert.equal(tree.root.findByType("LearningVideo").props.active, false);
  await act(() => tree.update(React.createElement(QuizScreen, props)));
  assert.equal(
    tab(tree.root, "Videos (1)").props.accessibilityState.selected,
    true,
  );
  assert.equal(submissions, 0);
  await act(() => tree.unmount());
});
test("settings keeps secondary content collapsed and retains profile and reminder drafts on reopen", async () => {
  const profile = newProfile("QA learner");
  function Settings() {
    const [name, setName] = React.useState(profile.name);
    return React.createElement(SettingsScreen, {
      profile,
      name,
      onNameChange: setName,
      busy: false,
      reminders: {
        preferences: { enabled: true, intervalMinutes: 60 },
        ready: true,
        busy: false,
        message: "Native app required",
        update: async () => {},
        previews: [{ title: "Hello", body: "Learn one idea" }],
      },
      onSave() {},
      onConnectGoogle() {},
      onExport() {},
      onImport() {},
      onReset() {},
      onDelete() {},
    });
  }
  let tree;
  await act(() => {
    tree = create(React.createElement(Settings));
  });
  for (const title of [
    "Profile",
    "Backup & restore",
    "Reset & delete",
    "About & privacy",
    "Reminder schedule",
  ]) {
    assert.equal(
      disclosure(tree.root, title).props.accessibilityState.expanded,
      false,
    );
  }
  assert.equal(hidden(tree.root.findByType("Switch")), false);
  await act(() => disclosure(tree.root, "Profile").props.onPress());
  const nameInput = () =>
    tree.root
      .findAllByType("TextInput")
      .find((node) => node.props.accessibilityLabel === "Profile name");
  await act(() => nameInput().props.onChangeText("Draft learner"));
  await act(() => disclosure(tree.root, "Profile").props.onPress());
  await act(() => disclosure(tree.root, "Profile").props.onPress());
  assert.equal(nameInput().props.value, "Draft learner");
  await act(() => disclosure(tree.root, "Reminder schedule").props.onPress());
  const interval = () =>
    tree.root
      .findAllByType("TextInput")
      .find(
        (node) =>
          node.props.accessibilityLabel === "Reminder interval in minutes",
      );
  await act(() => interval().props.onChangeText("90"));
  await act(() => disclosure(tree.root, "Reminder schedule").props.onPress());
  await act(() => disclosure(tree.root, "Reminder schedule").props.onPress());
  assert.equal(interval().props.value, "90");
  await act(() => tree.unmount());
});

const { QuestionAnswers } = require("../src/ui/QuestionAnswers.tsx");
const { acceptedAnswer, isGradable } = require("../src/domain/questions.ts");
test("study options show researched correct answers and latest selection but never assert an ungraded answer", async () => {
  const conflict = bank.find(
    (q) => q.verificationStatus === "document_conflict" && isGradable(q),
  );
  const wrong = conflict.options.find(
    (option) => !acceptedAnswer(conflict).includes(option.id),
  );
  let tree;
  await act(() => {
    tree = create(
      React.createElement(QuestionAnswers, {
        question: conflict,
        selected: [wrong.id],
      }),
    );
  });
  const texts = () =>
    tree.root
      .findAllByType("Text")
      .map((node) => [node.props.children].flat(Infinity).join(""));
  for (const option of conflict.options)
    assert.ok(texts().includes(`${option.id}. ${option.text}`));
  assert.equal(
    texts().filter((text) => text === "Correct answer").length,
    acceptedAnswer(conflict).length,
  );
  assert.ok(texts().includes("Your answer · Incorrect"));
  assert.ok(texts().includes("Researched answer shown · Source conflict"));
  const review = bank.find((q) => !isGradable(q));
  await act(() =>
    tree.update(
      React.createElement(QuestionAnswers, {
        question: review,
        selected: review.documentAnswer,
      }),
    ),
  );
  assert.ok(texts().includes("Answer under review · Not scored"));
  assert.equal(texts().includes("Correct answer"), false);
  await act(() => tree.unmount());
});

// Render a bounded first batch, as native FlatList does; this tests screen wiring, not layout.
native.FlatList = ({
  data,
  renderItem,
  ListHeaderComponent,
  ListEmptyComponent,
  ...props
}) =>
  React.createElement(
    "FlatList",
    { ...props, data },
    ListHeaderComponent,
    data.length
      ? data.slice(0, 4).map((item) =>
          React.cloneElement(renderItem({ item }), {
            key: props.keyExtractor(item),
          }),
        )
      : ListEmptyComponent,
  );
const { ProgressScreen } = require("../src/screens/ProgressScreen.tsx");
const { LibraryScreen } = require("../src/screens/LibraryScreen.tsx");
const { recordAttempt } = require("../src/domain/progress.ts");
test("progress screen defaults to serial overview and wires participation filters without recording attempts", async () => {
  const question = bank.find((q) => q.questionNumber === 38);
  const profile = recordAttempt(newProfile("QA"), question, {
    submittedAnswers: acceptedAnswer(question),
    correct: true,
    attemptedAt: "2026-10-22T12:00:00Z",
  });
  const before = JSON.stringify(profile);
  let tree;
  await act(() => {
    tree = create(
      React.createElement(ProgressScreen, { profile, questions: bank }),
    );
  });
  const data = () => tree.root.findByType("FlatList").props.data;
  const button = (title) =>
    tree.root
      .findAllByType("Button")
      .find(
        (node) =>
          node.props.title === title ||
          node.props.title?.startsWith(`${title} (`),
      );
  assert.ok(button("All questions").props.title.endsWith("(246)"));
  assert.ok(button("Attempted").props.title.endsWith("(1)"));
  assert.ok(button("Not attempted").props.title.endsWith("(245)"));
  assert.equal(tree.root.findByType("FlatList").props.initialNumToRender, 4);
  assert.equal(tree.root.findByType("FlatList").props.maxToRenderPerBatch, 4);
  assert.equal(data().length, 246);
  assert.equal(data()[0].question.questionNumber, 1);
  assert.equal(data()[0].status, "unattempted");
  await act(() => disclosure(tree.root, "Filter & sort").props.onPress());
  await act(() => button("Attempted").props.onPress());
  assert.equal(data().length, 1);
  assert.equal(data()[0].question.questionNumber, 38);
  await act(() => button("Not attempted").props.onPress());
  assert.equal(data().length, 245);
  await act(() => button("Passed").props.onPress());
  assert.equal(data()[0].status, "passed");
  await act(() => button("All questions").props.onPress());
  await act(() => button("Recent attempts").props.onPress());
  assert.equal(data()[0].question.questionNumber, 38);
  const search = tree.root
    .findAllByType("TextInput")
    .find(
      (node) =>
        node.props.accessibilityLabel ===
        "Search progress by question number or text",
    );
  await act(() => search.props.onChangeText("38"));
  assert.equal(button("All questions").props.title, "All questions (1)");
  assert.equal(button("Not attempted").props.title, "Not attempted (0)");
  const updated = recordAttempt(profile, question, {
    submittedAnswers: ["A"],
    correct: false,
    attemptedAt: "2026-10-22T13:00:00Z",
  });
  await act(() =>
    tree.update(
      React.createElement(ProgressScreen, {
        profile: updated,
        questions: bank,
      }),
    ),
  );
  assert.equal(button("Failed").props.title, "Failed (1)");
  assert.equal(button("Passed").props.title, "Passed (0)");
  assert.equal(JSON.stringify(profile), before);
  await act(() => tree.unmount());
});
test("library cards display the full options and correct-answer markers", async () => {
  const question = bank.find((q) => q.questionNumber === 1);
  let tree;
  await act(() => {
    tree = create(
      React.createElement(LibraryScreen, {
        questions: [question],
        active: true,
      }),
    );
  });
  const texts = tree.root
    .findAllByType("Text")
    .map((node) => [node.props.children].flat(Infinity).join(""));
  for (const option of question.options)
    assert.ok(texts.includes(`${option.id}. ${option.text}`));
  assert.equal(
    texts.filter((text) => text === "Correct answer").length,
    acceptedAnswer(question).length,
  );
  await act(() => tree.unmount());
});
