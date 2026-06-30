import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TRACKS } from "../data/tracks";
import { useProgress } from "../hooks/useProgress";
import { runPythonWithIO } from "../utils/pythonRunner";
import CompletionModal from "../components/CompletionModal";
import CodeEditorContainer from "../components/CodeEditorContainer";
import ProgressBar from "../components/ProgressBar";
import PixelButton from "../components/PixelButton";
import Icon from "../components/Icon";
import StarIcon from "../components/StarIcon";
import completeSound from "../assets/sounds/complete.mp3";
import wrongSound from "../assets/sounds/wrong.mp3";

export default function LevelPage() {
  const { trackName, chapterId, levelId } = useParams();

  const completeAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);

  useEffect(() => {
    completeAudioRef.current = new Audio(completeSound);
    wrongAudioRef.current = new Audio(wrongSound);
  }, []);
  const navigate = useNavigate();
  const { getLevelStatus, getStars, completeLevel, getTotalStars } = useProgress();

  const track = TRACKS.find((t) => t.slug === trackName);
  const chapter = track?.chapters.find((c) => c.id === Number(chapterId));
  const level = chapter?.levels.find((l) => l.id === Number(levelId));
  const status = level ? getLevelStatus(trackName, level.id) : null;

  const [code, setCode] = useState(level?.startingCode ?? "x = ");
  const [showModal, setShowModal] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testFailure, setTestFailure] = useState(null);
  const [resultInfo, setResultInfo] = useState(null);

  const handleRun = async () => {
    if (!level) return;
    setTestFailure(null);

    const lineCount = code
      .replace(/\r\n/g, "\n")
      .split("\n")
      .filter((l) => l.trim()).length;

    const maxLines = level.maxLines ?? lineCount + 1;
    const maxTime = level.maxTime ?? 1;

    const startTime = performance.now();
    let execTime = 0;

    const hasTests = level.tests && level.tests.length > 0;

    if (hasTests) {
      setTesting(true);

      for (const test of level.tests) {
        const inputs = test.input ? (Array.isArray(test.input) ? test.input : [test.input]) : [];
        const output = await runPythonWithIO(code, inputs);
        if (output !== test.expected) {
          wrongAudioRef.current?.play();
          setTestFailure({ input: test.input, expected: test.expected, actual: output });
          setTesting(false);
          return;
        }
      }

      execTime = (performance.now() - startTime) / 1000;
      setTesting(false);
      completeAudioRef.current?.play();
      let stars = 1;
      if (lineCount <= maxLines) stars++;
      if (execTime <= maxTime) stars++;
      completeLevel(trackName, level.id, stars);
      setEarnedStars(stars);
      setResultInfo({ lineCount, maxLines, execTime, maxTime });
      setShowModal(true);
    } else {
      const solutionHasPrint = level.solution.includes("print(");

      if (solutionHasPrint) {
        const fullSolution = (level.startingCode || "") + level.solution;
        const [actualOutput, expectedOutput] = await Promise.all([
          runPythonWithIO(code, []),
          runPythonWithIO(fullSolution, []),
        ]);

        execTime = (performance.now() - startTime) / 1000;

        if (actualOutput === expectedOutput) {
          completeAudioRef.current?.play();
          let stars = 1;
          if (lineCount <= maxLines) stars++;
          if (execTime <= maxTime) stars++;
          completeLevel(trackName, level.id, stars);
          setEarnedStars(stars);
          setResultInfo({ lineCount, maxLines, execTime, maxTime });
          setShowModal(true);
        } else {
          wrongAudioRef.current?.play();
          setTestFailure({ input: "", expected: expectedOutput, actual: actualOutput });
        }
        return;
      }

      const varMatch = level.solution.match(/^\s*(\w+)\s*=\s*/m);
      if (varMatch) {
        const varName = varMatch[1];
        const needsInput = code.includes("input(") || code.includes("input (");
        const inputs = needsInput ? ["test"] : [];
        const inputDisplay = needsInput ? "test" : "";

        const solutionCode = (level.startingCode || "") + level.solution;
        const actualOutput = await runPythonWithIO(code + "\nprint(" + varName + ")", inputs);
        const expectedOutput = await runPythonWithIO(solutionCode + "\nprint(" + varName + ")", inputs);

        execTime = (performance.now() - startTime) / 1000;

        if (actualOutput === expectedOutput) {
          completeAudioRef.current?.play();
          let stars = 1;
          if (lineCount <= maxLines) stars++;
          if (execTime <= maxTime) stars++;
          completeLevel(trackName, level.id, stars);
          setEarnedStars(stars);
          setResultInfo({ lineCount, maxLines, execTime, maxTime });
          setShowModal(true);
        } else {
          wrongAudioRef.current?.play();
          setTestFailure({ input: inputDisplay, expected: expectedOutput, actual: actualOutput });
        }
        return;
      }

      const fullSolution = (level.startingCode || "") + level.solution;
      const [actualOutput, expectedOutput] = await Promise.all([
        runPythonWithIO(code, []),
        runPythonWithIO(fullSolution, []),
      ]);

      execTime = (performance.now() - startTime) / 1000;

      if (actualOutput === expectedOutput) {
        completeAudioRef.current?.play();
        let stars = 1;
        if (lineCount <= maxLines) stars++;
        if (execTime <= maxTime) stars++;
        completeLevel(trackName, level.id, stars);
        setEarnedStars(stars);
        setResultInfo({ lineCount, maxLines, execTime, maxTime });
        setShowModal(true);
      } else {
        wrongAudioRef.current?.play();
        setTestFailure({ input: "", expected: expectedOutput, actual: actualOutput });
      }
    }
  };

  const handleHintToggle = () => {
    setShowHint((prev) => {
      if (!prev) setHintUsed(true);
      return !prev;
    });
  };

  if (!track || !chapter || !level) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 max-w-4xl mx-auto relative z-10">
        <h1 className="text-2xl font-bold" style={{ color: "#2F2F2F" }}>
          Level not found
        </h1>
        <button onClick={() => navigate("/tracks")} style={{ color: "#6AAE6F" }}>
          ← Back to tracks
        </button>
      </div>
    );
  }

  const completedCount = chapter.levels.filter(
    (l) => getLevelStatus(track.slug, l.id) === "completed"
  ).length;
  const progress = Math.round((completedCount / chapter.levels.length) * 100);
  const isCompleted = status === "completed";
  const currentStars = getStars(track.slug, level.id);
  const totalStars = getTotalStars(track.slug);
  const levelIndex = chapter.levels.findIndex((l) => l.id === level.id);
  const hasNextLevel = levelIndex < chapter.levels.length - 1;

  return (
    <>
      {showModal && (
        <CompletionModal
          level={level}
          stars={earnedStars}
          resultInfo={resultInfo}
          onRetry={() => {
            setShowModal(false);
            setHintUsed(false);
            setShowHint(false);
          }}
          onContinue={() => {
            setShowModal(false);
            navigate(`/tracks/${trackName}/chapters/${chapterId}`);
          }}
        />
      )}

      {testing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.5)" }} />
          <div
            className="relative rounded-2xl p-8 text-center max-w-sm w-full"
            style={{ background: "#F7F3E9", border: "3px solid #7AA2F7", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
          >
            <div className="text-4xl mb-4 animate-pulse">⏳</div>
            <h2 className="text-xl font-bold" style={{ color: "#2F2F2F", fontFamily: "'Courier New', monospace" }}>
              Checking solution...
            </h2>
            <p className="text-sm mt-2" style={{ color: "#6B7280" }}>
              Running your code against test cases
            </p>
          </div>
        </div>
      )}

      {testFailure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setTestFailure(null)}
          />
          <div
            className="relative rounded-2xl p-8 text-center max-w-md w-full"
            style={{ background: "#F7F3E9", border: "3px solid #FF5F57", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
          >
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold mb-4" style={{ color: "#2F2F2F", fontFamily: "'Courier New', monospace" }}>
              Test Failed
            </h2>

            {testFailure.input !== undefined && testFailure.input !== "" && (
              <div className="rounded-xl p-3 mb-3 text-left" style={{ background: "#1e1e2e" }}>
                <div className="text-xs font-bold mb-1" style={{ color: "#9CA3AF" }}>INPUT</div>
                <pre className="text-xs font-mono m-0" style={{ color: "#CDD6F4", whiteSpace: "pre-wrap" }}>{testFailure.input}</pre>
              </div>
            )}

            <div className="rounded-xl p-3 mb-3 text-left" style={{ background: "#1e1e2e" }}>
              <div className="text-xs font-bold mb-1" style={{ color: "#28CA41" }}>EXPECTED</div>
              <pre className="text-xs font-mono m-0" style={{ color: "#CDD6F4", whiteSpace: "pre-wrap" }}>{testFailure.expected}</pre>
            </div>

            <div className="rounded-xl p-3 mb-5 text-left" style={{ background: "#1e1e2e" }}>
              <div className="text-xs font-bold mb-1" style={{ color: "#FF5F57" }}>ACTUAL</div>
              <pre className="text-xs font-mono m-0" style={{ color: "#CDD6F4", whiteSpace: "pre-wrap" }}>{testFailure.actual || "(no output)"}</pre>
            </div>

            <PixelButton onClick={() => setTestFailure(null)} size="md" variant="primary">
              Try Again
            </PixelButton>
          </div>
        </div>
      )}

      <div key={levelId} className="h-screen pt-24 pb-8 px-4 relative z-10 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(`/tracks/${trackName}/chapters/${chapterId}`)}
            className="text-sm mb-6 flex items-center gap-1 hover:gap-2 transition-all"
            style={{ color: "#9CA3AF" }}
          >
            ← {chapter.name}
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3">
              <div
                className="rounded-2xl p-5 overflow-y-auto"
                style={{ background: "#fff", border: "2px solid #E5E7EB", maxHeight: "calc(100vh - 10rem)" }}
              >
                <div
                  className="text-xs font-bold uppercase tracking-wider mb-3"
                  style={{ color: "#9CA3AF" }}
                >
                  Level {level.id}
                </div>
                <h2
                  className="text-xl font-black mb-3"
                  style={{ color: "#2F2F2F", fontFamily: "'Courier New', monospace" }}
                >
                  {level.name}
                </h2>

                {isCompleted && currentStars > 0 && (
                  <div
                    className="rounded-xl p-3 mb-4 flex items-center justify-center gap-1"
                    style={{ background: "#E9B44C10", border: "1.5px solid #E9B44C40" }}
                  >
                    {[1, 2, 3].map((s) => (
                      <StarIcon key={s} filled={s <= currentStars} className="text-xl" />
                    ))}
                  </div>
                )}

                <div
                  className="rounded-xl p-4 mb-4"
                  style={{ background: "#6AAE6F10", border: "1.5px solid #6AAE6F30" }}
                >
                  <div
                    className="text-xs font-bold mb-2 uppercase tracking-wider"
                    style={{ color: "#6AAE6F" }}
                  >
                    🎯 Objective
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>
                    {level.objective.map((seg, i) =>
                      seg.type === "code" ? (
                        <code
                          key={i}
                          className="px-1.5 py-0.5 rounded text-xs font-mono"
                          style={{ background: "#E5E7EB", color: "#2F2F2F" }}
                        >
                          {seg.value}
                        </code>
                      ) : (
                        <span key={i}>{seg.value}</span>
                      )
                    )}
                  </p>
                </div>

                {level.explanation ? (
                  <div
                    className="rounded-xl p-4 mb-4"
                    style={{ background: "#7AA2F710", border: "1.5px solid #7AA2F740" }}
                  >
                    <div
                      className="text-xs font-bold mb-2"
                      style={{ color: "#7AA2F7" }}
                    >
                      📖 EXPLANATION
                    </div>
                    <p className="text-sm" style={{ color: "#374151" }}>
                      {level.explanation.map((seg, i) =>
                        seg.type === "code" ? (
<code
                          key={i}
                          className="px-1.5 py-0.5 rounded text-xs font-mono"
                          style={{ background: "#E5E7EB", color: "#2F2F2F" }}
                        >
                          {seg.value}
                        </code>
                      ) : (
                        <span key={i}>{seg.value}</span>
                      )
                    )}
                    </p>
                  </div>
                ) : null}

                {showHint ? (
                  <div
                    className="rounded-xl p-4 mb-4"
                    style={{ background: "#E9B44C10", border: "1.5px solid #E9B44C40" }}
                  >
                    <div
                      className="text-xs font-bold mb-2"
                      style={{ color: "#E9B44C" }}
                    >
                      💡 HINT
                    </div>
                    <p className="text-sm" style={{ color: "#374151" }}>
                      {level.hint.map((seg, i) =>
                        seg.type === "code" ? (
<code
                          key={i}
                          className="px-1.5 py-0.5 rounded text-xs font-mono"
                          style={{ background: "#E5E7EB", color: "#2F2F2F" }}
                        >
                          {seg.value}
                        </code>
                      ) : (
                        <span key={i}>{seg.value}</span>
                      )
                    )}
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-col gap-2">
                  <PixelButton onClick={handleRun} size="md" variant="primary">
                    Submit Code
                  </PixelButton>

                  <PixelButton
                    onClick={handleHintToggle}
                    size="md"
                    variant="accent"
                  >
                    {showHint ? "Hide Hint" : "💡 Hint"}
                  </PixelButton>
                  {hasNextLevel && (
                    <PixelButton
                      onClick={() => navigate(`/tracks/${trackName}/chapters/${chapterId}`)}
                      size="md"
                      variant="ghost"
                      disabled={!isCompleted}
                    >
                      Next Level →
                    </PixelButton>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <CodeEditorContainer code={code} setCode={setCode} language={track.name.split(" ")[0]} />

              <p className="text-xs mt-2 text-center" style={{ color: "#D1D5DB" }}>
                Write your code above, then click Run to test or Submit to check your answer.
              </p>
            </div>

            <div className="lg:col-span-3">
              <div
                className="overflow-y-auto space-y-4"
                style={{ maxHeight: "calc(100vh - 10rem)" }}
              >
                <div
                  className="rounded-2xl p-5"
                  style={{ background: "#fff", border: "2px solid #E5E7EB" }}
                >
                  <div
                    className="text-xs font-bold uppercase tracking-wider mb-3"
                    style={{ color: "#9CA3AF" }}
                  >
                    Chapter Progress
                  </div>
                  <ProgressBar value={progress} showLabel={false} />
                  <p className="text-xs mt-2" style={{ color: "#9CA3AF" }}>
                    {completedCount} of {chapter.levels.length} levels complete
                  </p>

                  <div
                    className="mt-4 pt-4"
                    style={{ borderTop: "1px solid #F3F4F6" }}
                  >
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-1"
                      style={{ color: "#9CA3AF" }}
                    >
                      Current Chapter
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon src={chapter.icon} alt={chapter.name} size={28} />
                      <span
                        className="text-sm font-bold"
                        style={{ color: "#2F2F2F", fontFamily: "'Courier New', monospace" }}
                      >
                        {chapter.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-2xl p-5"
                  style={{ background: "#fff", border: "2px solid #E5E7EB" }}
                >
                  <div
                    className="text-xs font-bold uppercase tracking-wider mb-3"
                    style={{ color: "#9CA3AF" }}
                  >
                    Total Stars
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-2xl font-black"
                      style={{ color: "#E9B44C", fontFamily: "'Courier New', monospace" }}
                    >
                      {totalStars}
                    </span>
                    <StarIcon filled className="text-lg" />
                  </div>
                  <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>
                    across {completedCount} completed levels
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
