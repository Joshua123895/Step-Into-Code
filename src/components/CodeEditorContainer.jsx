import { useRef, useEffect } from "react";

export default function CodeEditorContainer({ code, setCode, language }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, [code]);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border: "2px solid #374151",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
      }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3"
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
          style={{ color: "#6B7280", fontFamily: "'Courier New', monospace" }}
        >
          main.py
        </div>
        <div
          className="text-xs px-2 py-0.5 rounded"
          style={{ background: "#6AAE6F20", color: "#6AAE6F" }}
        >
          {language}
        </div>
      </div>

      <div
        className="flex overflow-y-auto"
        style={{ background: "#1a1b2e", minHeight: 240, maxHeight: "calc(100vh - 16rem)" }}
      >
        <div
          className="px-3 pt-4 text-right select-none"
          style={{
            color: "#4B5563",
            fontFamily: "'Courier New', monospace",
            fontSize: 13,
            lineHeight: "1.6rem",
            background: "#16172b",
            minWidth: 40,
          }}
        >
          {code.split("\n").map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          className="flex-1 p-4 resize-none outline-none bg-transparent overflow-hidden"
          style={{
            color: "#CDD6F4",
            fontFamily: "'Courier New', monospace",
            fontSize: 14,
            lineHeight: "1.6rem",
            caretColor: "#6AAE6F",
          }}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
        />
      </div>

      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ background: "#13141f", borderTop: "1px solid #2a2b3d" }}
      >
        <span className="text-xs" style={{ color: "#6B7280" }}>
          Output:
        </span>
        <span
          className="text-xs font-mono"
          style={{ color: "#6AAE6F" }}
        >
          &gt; Ready to run
        </span>
      </div>
    </div>
  );
}
