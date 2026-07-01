import { useRef, useEffect, useState, useCallback } from "react";
import { runPython } from "../utils/pythonRunner";
import { runPythonReal } from "../utils/pythonRunnerReal";
import { buildFileSetup, buildFileTeardown, parseFileCaptures, mergeFileStore } from "../utils/fileManager";
import { basicSetup } from "codemirror";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { indentUnit } from "@codemirror/language";

const editorTheme = EditorView.theme({
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
    caretColor: "#6AAE6F",
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
  ".cm-selectionBackground": {
    backgroundColor: "#334155 !important",
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "#6AAE6F",
  },
  "&.cm-focused": {
    outline: "none",
  },
});

export default function CodeEditorContainer({ code, setCode, language, files, fileEntries = {}, fileStore: fileStoreRef, onFileUpdate, fileEntriesBefore = {}, comparisonMode = "tabs" }) {
  const inputRef = useRef(null);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [waitingInput, setWaitingInput] = useState(false);
  const [inputBuffer, setInputBuffer] = useState("");
  const [activeTab, setActiveTab] = useState("main.py");
  const [comparisonView, setComparisonView] = useState("after");
  const pendingResolve = useRef(null);
  const outputRef = useRef(null);
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const fileViewerRef = useRef(null);
  const fileViewInstance = useRef(null);
  const setCodeRef = useRef(setCode);
  const rawOutputRef = useRef("");
  const onFileUpdateRef = useRef(onFileUpdate);

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

      const view = new EditorView({
        state: EditorState.create({
          doc: code,
          extensions: [
            basicSetup,
            python(),
            oneDark,
            editorTheme,
            indentUnit.of("    "),
            EditorState.tabSize.of(4),
            updateListener,
          ],
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
      const beforeContent = fileEntriesBefore[activeTab];
      const afterContent = fileEntries[activeTab];
      const hasBefore = beforeContent !== undefined;
      const hasAfter = afterContent !== undefined;
      const showToggle = hasBefore && hasAfter;
      const content = showToggle
        ? (comparisonView === "before" ? beforeContent : afterContent)
        : (hasAfter ? afterContent : (hasBefore ? beforeContent : "(No file)"));
      const isPy = activeTab.endsWith(".py");

      if (!fileViewInstance.current) {
        fileViewInstance.current = new EditorView({
          state: EditorState.create({
            doc: content,
            extensions: [
              basicSetup,
              ...(isPy ? [python()] : []),
              oneDark,
              editorTheme,
              EditorView.editable.of(false),
              indentUnit.of("    "),
              EditorState.tabSize.of(4),
            ],
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
  }, [activeTab, fileEntries, fileEntriesBefore, comparisonView]);

  useEffect(() => {
    setComparisonView("after");
  }, [fileEntries]);

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
      setOutput((prev) => prev + inputBuffer + "\n");
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

  if (activeTab !== "main.py" && !fileNames.includes(activeTab)) {
    setActiveTab("main.py");
  }
  const showFileTabs = files && fileNames.length > 0;

  const beforeContent = fileEntriesBefore?.[activeTab];
  const afterContent = fileEntries[activeTab];
  const hasBefore = beforeContent !== undefined;
  const hasAfter = afterContent !== undefined;
  const showComparisonToggle = hasBefore && hasAfter && comparisonMode === "tabs";

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{
        border: "2px solid #374151",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        minHeight: "40vh",
        maxHeight: "calc(100vh - 10rem)",
      }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3 shrink-0"
        style={{ background: "#1e1e2e" }}
      >
        <div className="flex gap-1.5">
          {["#FF5F57", "#FFBD2E", "#28CA41"].map((c, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full"
              style={{ background: c }}
            />
          ))}
        </div>
        <div className="flex-1" />
        <div
          className="text-xs px-2 py-0.5 rounded mr-2"
          style={{ background: "#6AAE6F20", color: "#6AAE6F" }}
        >
          {language}
        </div>
        <button
          onClick={handleRun}
          disabled={running}
          className="text-xs px-3 py-1 rounded font-bold transition-all hover:brightness-110"
          style={{
            background: running ? "#6B7280" : "#28CA41",
            color: "#fff",
          }}
        >
          {running ? "⏳" : "▶ Run"}
        </button>
      </div>

      {showFileTabs && (
        <div
          className="flex shrink-0 overflow-x-auto"
          style={{ background: "#16162a", borderBottom: "1px solid #2a2b3d" }}
        >
          <button
            onClick={() => setActiveTab("main.py")}
            className="text-xs px-4 py-2 font-mono border-r transition-all"
            style={{
              background: activeTab === "main.py" ? "#1a1b2e" : "transparent",
              color: activeTab === "main.py" ? "#CDD6F4" : "#6B7280",
              borderColor: "#2a2b3d",
              borderBottom: activeTab === "main.py" ? "2px solid #6AAE6F" : "2px solid transparent",
            }}
          >
            main.py
          </button>
          {fileNames.map((name) => (
            <button
              key={name}
              onClick={() => setActiveTab(name)}
              className="text-xs px-4 py-2 font-mono border-r transition-all"
              style={{
                background: activeTab === name ? "#1a1b2e" : "transparent",
                color: activeTab === name ? "#CDD6F4" : "#6B7280",
                borderColor: "#2a2b3d",
                borderBottom: activeTab === name ? "2px solid #E9B44C" : "2px solid transparent",
              }}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {activeTab !== "main.py" && showComparisonToggle && (
        <div
          className="flex shrink-0"
          style={{ background: "#16162a", borderBottom: "1px solid #2a2b3d" }}
        >
          <button
            onClick={() => setComparisonView("before")}
            className="text-xs px-4 py-1.5 font-mono border-r transition-all"
            style={{
              background: comparisonView === "before" ? "#1a1b2e" : "transparent",
              color: comparisonView === "before" ? "#CDD6F4" : "#6B7280",
              borderColor: "#2a2b3d",
              borderBottom: comparisonView === "before" ? "2px solid #7AA2F7" : "2px solid transparent",
            }}
          >
            Before
          </button>
          <button
            onClick={() => setComparisonView("after")}
            className="text-xs px-4 py-1.5 font-mono border-r transition-all"
            style={{
              background: comparisonView === "after" ? "#1a1b2e" : "transparent",
              color: comparisonView === "after" ? "#CDD6F4" : "#6B7280",
              borderColor: "#2a2b3d",
              borderBottom: comparisonView === "after" ? "2px solid #6AAE6F" : "2px solid transparent",
            }}
          >
            After
          </button>
        </div>
      )}

      <div
        className="flex min-h-0 flex-1"
        style={{ background: "#1a1b2e", touchAction: "manipulation" }}
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
        style={{ background: "#0d0e17", borderTop: "1px solid #2a2b3d" }}
      >
        <span
          className="text-xs font-bold"
          style={{ color: "#6B7280", fontFamily: "'Consolas', monospace" }}
        >
          ■ CONSOLE
        </span>
      </div>
      <div
        className="flex flex-col shrink-0"
        style={{ background: "#0d0e17", minHeight: 80, maxHeight: 150 }}
      >
        <div
          ref={outputRef}
          className="px-4 py-3 font-mono text-xs leading-relaxed whitespace-pre-wrap overflow-y-auto flex-1"
          style={{ color: "#CDD6F4" }}
        >
          {output || (waitingInput ? "" : running ? "Running..." : "> Ready to run")}
        </div>
        {waitingInput && (
          <div
            className="flex items-center gap-1 px-4 py-2 border-t shrink-0"
            style={{ borderColor: "#2a2b3d", background: "#0d0e17" }}
          >
            <span className="text-xs font-mono" style={{ color: "#6B7280" }}>
              &gt;
            </span>
            <input
              ref={inputRef}
              className="flex-1 bg-transparent border-none outline-none font-mono text-xs"
              style={{
                color: "#CDD6F4",
                caretColor: "#6AAE6F",
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
