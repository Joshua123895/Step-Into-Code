import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { runPython } from "../utils/pythonRunner";
import { runPythonReal } from "../utils/pythonRunnerReal";
import { buildFileSetup, buildFileTeardown, parseFileCaptures, mergeFileStore } from "../utils/fileManager";
import { basicSetup } from "codemirror";
import { EditorView } from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { indentUnit, HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { useTheme } from "../context/ThemeContext";

const oneLightTheme = EditorView.theme({
  "&": {
    color: "#374151",
    backgroundColor: "#FAF9F5",
  },

  ".cm-content": {
    caretColor: "#6AAE6F",
  },

  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "#6AAE6F",
  },

  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
    backgroundColor: "#B3D4FC",
  },

  ".cm-panels": {
    backgroundColor: "#F5F4EF",
    color: "#374151",
  },

  ".cm-panels.cm-panels-top": {
    borderBottom: "1px solid #D8DDD3",
  },

  ".cm-panels.cm-panels-bottom": {
    borderTop: "1px solid #D8DDD3",
  },

  ".cm-searchMatch": {
    backgroundColor: "#B7D7FF55",
    outline: "1px solid #6AAE6F",
  },

  ".cm-searchMatch.cm-searchMatch-selected": {
    backgroundColor: "#D8ECD7",
  },

  ".cm-activeLine": {
    backgroundColor: "#F0F3ED",
  },

  ".cm-selectionMatch": {
    backgroundColor: "#D8ECD7",
  },

  "&.cm-focused .cm-matchingBracket": {
    backgroundColor: "#D8ECD7",
    color: "#2F3430",
    fontWeight: "600",
  },

  "&.cm-focused .cm-nonmatchingBracket": {
    backgroundColor: "#FAD2D2",
    color: "#C0392B",
  },

  ".cm-foldPlaceholder": {
    backgroundColor: "#EEF2EB",
    border: "1px solid #D8DDD3",
    color: "#7B8077",
    borderRadius: "4px",
  },

  ".cm-tooltip": {
    border: "1px solid #D8DDD3",
    backgroundColor: "#FAF9F5",
    borderRadius: "8px",
  },

  ".cm-tooltip .cm-tooltip-arrow:before": {
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },

  ".cm-tooltip .cm-tooltip-arrow:after": {
    borderTopColor: "#FAF9F5",
    borderBottomColor: "#FAF9F5",
  },

  ".cm-tooltip-autocomplete": {
    "& > ul > li[aria-selected]": {
      backgroundColor: "#D8ECD7",
      color: "#2F3430",
    },
  },
}, { dark: false });

const oneLightHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#8B3FA5" },

  {
    tag: [
      tags.name,
      tags.deleted,
      tags.character,
      tags.propertyName,
      tags.macroName,
    ],
    color: "#D65D4E",
  },

  {
    tag: [
      tags.function(tags.variableName),
      tags.labelName,
    ],
    color: "#4F7EF7",
  },

  {
    tag: [
      tags.color,
      tags.constant(tags.name),
      tags.standard(tags.name),
      tags.atom,
      tags.bool,
    ],
    color: "#B7791F",
  },

  {
    tag: [
      tags.typeName,
      tags.className,
      tags.number,
      tags.changed,
      tags.annotation,
      tags.modifier,
      tags.self,
      tags.namespace,
    ],
    color: "#D48A12",
  },

  {
    tag: [
      tags.operator,
      tags.operatorKeyword,
      tags.url,
      tags.escape,
      tags.regexp,
      tags.link,
      tags.special(tags.string),
    ],
    color: "#0F7FAE",
  },

  {
    tag: [
      tags.processingInstruction,
      tags.string,
      tags.inserted,
    ],
    color: "#5A9E58",
  },

  {
    tag: [
      tags.meta,
      tags.comment,
    ],
    color: "#98A29A",
    fontStyle: "italic",
  },

  {
    tag: [
      tags.definition(tags.name),
      tags.separator,
    ],
    color: "#374151",
  },

  {
    tag: tags.heading,
    color: "#6AAE6F",
    fontWeight: "bold",
  },

  {
    tag: tags.strong,
    fontWeight: "bold",
  },

  {
    tag: tags.emphasis,
    fontStyle: "italic",
  },

  {
    tag: tags.strikethrough,
    textDecoration: "line-through",
  },

  {
    tag: tags.invalid,
    color: "#E05252",
  },
]);

const oneLight = [
  oneLightTheme,
  syntaxHighlighting(oneLightHighlightStyle),
];

const themeCompartment = new Compartment();
const fileViewerThemeCompartment = new Compartment();

const tabHandler = EditorView.domEventHandlers({
  keydown: (event, view) => {
    if (event.key === "Tab" && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      const { from, to } = view.state.selection.main;
      view.dispatch({
        changes: { from, to, insert: "    " },
        selection: { anchor: from + 4 },
      });
    }
  },
});

function useColors() {
  const { dark } = useTheme();

  return {
    isDark: dark,

    outerBorder: dark ? "#374151" : "#D4D9CF",

    headerBg: dark ? "#1e1e2e" : "#F5F4EF",

    languageBg: "#6AAE6F20",

    languageText: "#6AAE6F",

    runDisabledBg: dark ? "#6B7280" : "#B7BDB2",

    tabBarBg: dark ? "#16162a" : "#ECEBE5",

    tabBorder: dark ? "#2a2b3d" : "#D8DDD3",

    tabActiveBg: dark ? "#1a1b2e" : "#FFFFFF",

    tabActiveText: dark ? "#CDD6F4" : "#2F3430",

    tabInactiveText: dark ? "#6B7280" : "#70766D",

    editorBg: dark ? "#1a1b2e" : "#FAF9F5",

    consoleBg: dark ? "#0d0e17" : "#EEF2EB",

    consoleText: dark ? "#CDD6F4" : "#374151",

    consoleLabel: dark ? "#6B7280" : "#7B8077",

    inputText: dark ? "#CDD6F4" : "#374151",

    selectionBg: dark ? "#334155" : "#B3D4FC",

    caretColor: "#6AAE6F",
  };
}

export default function CodeEditorContainer({ code, setCode, language, files, fileEntries = {}, fileStore: fileStoreRef, onFileUpdate, fileEntriesBefore = {} }) {
  const c = useColors();

  const baseEditorTheme = useMemo(() => EditorView.theme({
    "&": {
      height: "100%",
      fontSize: "14px",
      fontFamily: "'Consolas', monospace",
    },
    ".cm-scroller": {
      overflow: "auto",
      lineHeight: "1.6rem",
      overscrollBehavior: "none",
      WebkitOverflowScrolling: "touch",
    },
    ".cm-content": {
      padding: "16px 0",
    },
    ".cm-gutters": {
      fontFamily: "'Consolas', monospace",
      fontSize: "13px",
      paddingRight: "4px",
      borderRight: "none",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "transparent",
    },
    "&.cm-focused": {
      outline: "none",
    },
  }), []);

  const dynamicEditorTheme = useMemo(() => EditorView.theme({
    ".cm-content": {
      caretColor: c.caretColor,
    },
    ".cm-gutters": {
      backgroundColor: c.editorBg,
      color: c.tabInactiveText,
    },
    ".cm-selectionBackground": {
      backgroundColor: `${c.selectionBg} !important`,
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: c.caretColor,
    },
  }), [c.isDark]); // eslint-disable-line react-hooks/exhaustive-deps
  const inputRef = useRef(null);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [waitingInput, setWaitingInput] = useState(false);
  const [inputBuffer, setInputBuffer] = useState("");
  const [activeTab, setActiveTab] = useState("main.py");
  const pendingResolve = useRef(null);
  const outputRef = useRef(null);
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const fileViewerRef = useRef(null);
  const fileViewInstance = useRef(null);
  const setCodeRef = useRef(setCode);
  const rawOutputRef = useRef("");
  const onFileUpdateRef = useRef(onFileUpdate);
  const initialFileRef = useRef({ ...fileEntries });
  const beforeSnapshotRef = useRef({});

  useEffect(() => {
    onFileUpdateRef.current = onFileUpdate;
  });

  useEffect(() => {
    setCodeRef.current = setCode;
  });

  useEffect(() => {
    if (editorRef.current && !viewRef.current) {
      const updateListener = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          setCodeRef.current(update.state.doc.toString());
        }
      });

      const extensions = [
        basicSetup,
        tabHandler,
        python(),
        themeCompartment.of([c.isDark ? oneDark : oneLight, dynamicEditorTheme]),
        baseEditorTheme,
        indentUnit.of("    "),
        EditorState.tabSize.of(4),
        updateListener,
      ].flat();

      const view = new EditorView({
        state: EditorState.create({
          doc: code,
          extensions,
        }),
        parent: editorRef.current,
      });

      viewRef.current = view;
    }

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: themeCompartment.reconfigure([
          c.isDark ? oneDark : oneLight,
          dynamicEditorTheme,
        ]),
      });
    }
  }, [c.isDark, dynamicEditorTheme]);

  useEffect(() => {
    const view = viewRef.current;
    if (view) {
      const currentCode = view.state.doc.toString();
      if (currentCode !== code) {
        view.dispatch({
          changes: { from: 0, to: currentCode.length, insert: code },
        });
      }
    }
  }, [code]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    if (activeTab === "main.py" && viewRef.current) {
      viewRef.current.requestMeasure();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "main.py" && fileViewerRef.current) {
      function getContent(tabId) {
        if (tabId.endsWith(" (Before)")) {
          const realName = tabId.slice(0, -9);
          return fileEntriesBefore[realName] ?? beforeSnapshotRef.current[realName] ?? initialFileRef.current[realName] ?? "";
        }
        if (tabId.endsWith(" (After)")) {
          const realName = tabId.slice(0, -8);
          return fileEntries[realName] ?? fileEntriesBefore[realName] ?? "";
        }
        return fileEntries[tabId] ?? fileEntriesBefore[tabId] ?? "";
      }
      function getRealName(tabId) {
        if (tabId.endsWith(" (Before)")) return tabId.slice(0, -9);
        if (tabId.endsWith(" (After)")) return tabId.slice(0, -8);
        return tabId;
      }
      const content = getContent(activeTab);
      const isPy = getRealName(activeTab).endsWith(".py");

      if (!fileViewInstance.current) {
        fileViewInstance.current = new EditorView({
          state: EditorState.create({
            doc: content,
            extensions: [
              basicSetup,
              ...(isPy ? [python()] : []),
              fileViewerThemeCompartment.of([c.isDark ? oneDark : oneLight, dynamicEditorTheme]),
              baseEditorTheme,
              EditorView.editable.of(false),
              indentUnit.of("    "),
              EditorState.tabSize.of(4),
            ].flat(),
          }),
          parent: fileViewerRef.current,
        });
      } else {
        const currentDoc = fileViewInstance.current.state.doc.toString();
        if (currentDoc !== content) {
          fileViewInstance.current.dispatch({
            changes: { from: 0, to: currentDoc.length, insert: content },
          });
        }
      }
    }
  }, [activeTab, fileEntries, fileEntriesBefore]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (fileViewInstance.current) {
      fileViewInstance.current.dispatch({
        effects: fileViewerThemeCompartment.reconfigure([
          c.isDark ? oneDark : oneLight,
          dynamicEditorTheme,
        ]),
      });
    }
  }, [c.isDark, dynamicEditorTheme]);

  useEffect(() => {
    return () => {
      if (fileViewInstance.current) {
        fileViewInstance.current.destroy();
        fileViewInstance.current = null;
      }
    };
  }, []);

  const handleRun = useCallback(async () => {
    setRunning(true);
    setOutput("");
    rawOutputRef.current = "";

    const view = viewRef.current;
    if (!view) { setRunning(false); return; }

    const userCode = view.state.doc.toString();

    if (files) {
      const snap = {};
      for (const name of files.track || []) {
        const val = (fileStoreRef?.current || {})[name];
        if (val !== undefined) snap[name] = val;
      }
      beforeSnapshotRef.current = snap;
      const result = await runPythonReal(userCode, fileStoreRef?.current || {}, files.track || []);
      if (result.files && Object.keys(result.files).length > 0 && fileStoreRef) {
        fileStoreRef.current = mergeFileStore(fileStoreRef.current, null, result.files);
        onFileUpdateRef.current?.();
      }
      setOutput(result.stdout || "");
      if (result.error) {
        setOutput((prev) => prev + "\n" + result.error);
      }
    } else {
      const snap = {};
      for (const name of files?.track || []) {
        const val = (fileStoreRef?.current || {})[name];
        if (val !== undefined) snap[name] = val;
      }
      beforeSnapshotRef.current = snap;
      const onOutput = (text) => {
        rawOutputRef.current += text;
        const lines = rawOutputRef.current.split("\n");
        const display = lines.filter((l) => !l.startsWith("__FILE_SAVE__")).join("\n");
        setOutput(display);
      };

      const onInput = (resolve) => {
        pendingResolve.current = resolve;
        setWaitingInput(true);
      };

      const store = fileStoreRef?.current || {};
      const setup = buildFileSetup(store);
      const track = files?.track;
      const teardown = track && track.length > 0 ? buildFileTeardown(track) : "";
      const wrappedCode = setup + userCode + teardown;

      await runPython(wrappedCode, onInput, onOutput);

      const captures = parseFileCaptures(rawOutputRef.current);
      if (Object.keys(captures).length > 0 && fileStoreRef) {
        fileStoreRef.current = mergeFileStore(fileStoreRef.current, null, captures);
        onFileUpdateRef.current?.();
      }
    }

    setRunning(false);
  }, [files, fileStoreRef]);

  const handleInputChange = (e) => setInputBuffer(e.target.value);

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && pendingResolve.current) {
      pendingResolve.current(inputBuffer);
      pendingResolve.current = null;
      rawOutputRef.current += inputBuffer + "\n";
      const lines = rawOutputRef.current.split("\n");
      const display = lines.filter((l) => !l.startsWith("__FILE_SAVE__")).join("\n");
      setOutput(display);
      setInputBuffer("");
      setWaitingInput(false);
    }
  };

  useEffect(() => {
    if (waitingInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [waitingInput]);

  const trackedFiles = files?.track || [];
  const fileNames = [
    ...new Set([
      ...Object.keys(fileEntries).filter((n) => n !== "main.py"),
      ...trackedFiles.filter((n) => n !== "main.py"),
    ]),
  ];
  const allTabs = [];
  for (const name of fileNames) {
    allTabs.push(`${name} (Before)`, `${name} (After)`);
  }

  if (activeTab !== "main.py" && !allTabs.includes(activeTab)) {
    setActiveTab("main.py");
  }
  const showFileTabs = files && fileNames.length > 0;

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col editor-wrapper"
      style={{
        border: `2px solid ${c.outerBorder}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        minHeight: "40vh",
        maxHeight: "calc(100vh - 10rem)",
      }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3 shrink-0"
        style={{ background: c.headerBg }}
      >
        <div className="flex gap-1.5">
          {["#FF5F57", "#FFBD2E", "#28CA41"].map((dot, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full"
              style={{ background: dot }}
            />
          ))}
        </div>
        <div className="flex-1" />
        <div
          className="text-xs px-2 py-0.5 rounded mr-2"
          style={{ background: c.languageBg, color: c.languageText }}
        >
          {language}
        </div>
        <button
          onClick={handleRun}
          disabled={running}
          className="text-xs px-3 py-1 rounded font-bold hover:brightness-110"
          style={{
            background: running ? c.runDisabledBg : "#6AAE6F",
            color: "#fff",
          }}
        >
          {running ? "⏳" : "▶ Run"}
        </button>
      </div>

      {showFileTabs && (
        <div
          className="flex shrink-0 overflow-x-auto"
          style={{ background: c.tabBarBg, borderBottom: `1px solid ${c.tabBorder}` }}
        >
          <button
            onClick={() => setActiveTab("main.py")}
            className="text-xs px-4 py-2 font-mono border-r"
            style={{
              background: activeTab === "main.py" ? c.tabActiveBg : "transparent",
              color: activeTab === "main.py" ? c.tabActiveText : c.tabInactiveText,
              borderColor: c.tabBorder,
              borderBottom: activeTab === "main.py" ? "2px solid #6AAE6F" : "2px solid transparent",
            }}
          >
            main.py
          </button>
          {allTabs.map((name) => {
            const isBefore = name.endsWith(" (Before)");
            const isAfter = name.endsWith(" (After)");
            const accentColor = isBefore ? "#7AA2F7" : isAfter ? "#6AAE6F" : "#E9B44C";
            return (
              <button
                key={name}
                onClick={() => setActiveTab(name)}
                className="text-xs px-4 py-2 font-mono border-r"
                style={{
                  background: activeTab === name ? c.tabActiveBg : "transparent",
                  color: activeTab === name ? c.tabActiveText : c.tabInactiveText,
                  borderColor: c.tabBorder,
                  borderBottom: activeTab === name
                    ? `2px solid ${accentColor}`
                    : "2px solid transparent",
                }}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}

      <div
        className="flex min-h-0 flex-1"
        style={{ background: c.editorBg, touchAction: "manipulation" }}
      >
        <div
          ref={editorRef}
          className="flex-1"
          style={{ display: activeTab === "main.py" ? "" : "none", touchAction: "manipulation" }}
        />
        <div
          ref={fileViewerRef}
          className="flex-1"
          style={{ display: activeTab !== "main.py" ? "" : "none", touchAction: "manipulation" }}
        />
      </div>

      <div
        className="flex items-center gap-2 px-4 py-1.5 shrink-0"
        style={{ background: c.consoleBg, borderTop: `1px solid ${c.tabBorder}` }}
      >
        <span
          className="text-xs font-bold"
          style={{ color: c.consoleLabel, fontFamily: "'Consolas', monospace" }}
        >
          ■ CONSOLE
        </span>
      </div>
      <div
        className="flex flex-col shrink-0"
        style={{ background: c.consoleBg, minHeight: 80, maxHeight: 150 }}
      >
        <div
          ref={outputRef}
          className="px-4 py-3 font-mono text-xs leading-relaxed whitespace-pre-wrap overflow-y-auto flex-1"
          style={{ color: c.consoleText }}
        >
          {output || (waitingInput ? "" : running ? "Running..." : "> Ready to run")}
        </div>
        {waitingInput && (
          <div
            className="flex items-center gap-1 px-4 py-2 border-t shrink-0"
            style={{ borderColor: c.tabBorder, background: c.consoleBg }}
          >
            <span className="text-xs font-mono" style={{ color: c.consoleLabel }}>
              &gt;
            </span>
            <input
              ref={inputRef}
              className="flex-1 bg-transparent border-none outline-none font-mono text-xs"
              style={{
                color: c.inputText,
                caretColor: c.caretColor,
              }}
              value={inputBuffer}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
            />
          </div>
        )}
      </div>
    </div>
  );
}
