import { useRef, useEffect, useState, useCallback } from "react";
import { runPython } from "../utils/pythonRunner";
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

export default function CodeEditorContainer({ code, setCode, language }) {
  const inputRef = useRef(null);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [waitingInput, setWaitingInput] = useState(false);
  const [inputBuffer, setInputBuffer] = useState("");
  const pendingResolve = useRef(null);
  const outputRef = useRef(null);
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const setCodeRef = useRef(setCode);

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

  const handleRun = useCallback(async () => {
    setRunning(true);
    setOutput("");

    const onOutput = (text) => setOutput((prev) => prev + text);
    const onInput = (resolve) => {
      pendingResolve.current = resolve;
      setWaitingInput(true);
    };

    const view = viewRef.current;
    if (view) {
      await runPython(view.state.doc.toString(), onInput, onOutput);
    }

    setRunning(false);
  }, []);

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

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{
        border: "2px solid #374151",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        minHeight: "60vh",
        maxHeight: "calc(100vh - 8rem)",
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
        <div
          className="flex-1 text-center text-xs"
          style={{ color: "#6B7280", fontFamily: "'Consolas', monospace" }}
        >
          main.py
        </div>
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

      <div
        className="flex min-h-0 flex-1 overflow-hidden"
        style={{ background: "#1a1b2e" }}
      >
        <div ref={editorRef} className="flex-1 overflow-hidden" />
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
        style={{ background: "#0d0e17", minHeight: 120, maxHeight: 200 }}
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
