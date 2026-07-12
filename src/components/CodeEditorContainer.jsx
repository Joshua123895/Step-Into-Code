import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { runPython } from "../utils/pythonRunner";
import { runPythonReal } from "../utils/pythonRunnerReal";
import { buildFileSetup, buildFileTeardown, parseFileCaptures, mergeFileStore } from "../utils/fileManager";
import { useTheme } from "../context/ThemeContext";
import useCodeMirror, { makeDynamicEditorTheme } from "../editor/useCodeMirror";
import FilePanel from "../editor/FilePanel";

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

export default function CodeEditorContainer({ code, setCode, language, files, fileEntries = {}, fileStore: fileStoreRef, onFileUpdate, fileEntriesBefore = {}, initialFileSnapshot = {} }) {
  const c = useColors();
  const dynamicTheme = useMemo(() => makeDynamicEditorTheme(c), [c.isDark]);

  const inputRef = useRef(null);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [waitingInput, setWaitingInput] = useState(false);
  const [inputBuffer, setInputBuffer] = useState("");
  const [activeTab, setActiveTab] = useState("main.py");
  const pendingResolve = useRef(null);
  const outputRef = useRef(null);
  const rawOutputRef = useRef("");
  const onFileUpdateRef = useRef(onFileUpdate);
  const beforeSnapshotRef = useRef({});

  const { editorRef, viewRef } = useCodeMirror({ code, setCode, isDark: c.isDark, dynamicTheme });

  useEffect(() => {
    onFileUpdateRef.current = onFileUpdate;
  });

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

  return (
    <div
      className="rounded-xl flex flex-col editor-wrapper"
      style={{
        border: `2px solid ${c.outerBorder}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        minHeight: "40vh",
        maxHeight: "calc(100vh - 10rem)",
      }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3 shrink-0 overflow-hidden"
        style={{ background: c.headerBg, borderTopLeftRadius: "0.75rem", borderTopRightRadius: "0.75rem" }}
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

      <FilePanel
        files={files}
        fileEntries={fileEntries}
        fileEntriesBefore={fileEntriesBefore}
        beforeSnapshot={beforeSnapshotRef.current}
        initialSnapshot={initialFileSnapshot}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDark={c.isDark}
        dynamicTheme={dynamicTheme}
        c={c}
      />

      <div
        className="flex min-h-0 flex-1 overflow-hidden"
        style={{ display: activeTab === "main.py" ? "" : "none", background: c.editorBg, touchAction: "manipulation" }}
      >
        <div
          ref={editorRef}
          className="flex-1"
          style={{ touchAction: "manipulation" }}
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
        className="flex flex-col shrink-0 overflow-hidden"
        style={{ background: c.consoleBg, minHeight: 80, maxHeight: 150, borderBottomLeftRadius: "0.75rem", borderBottomRightRadius: "0.75rem" }}
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
